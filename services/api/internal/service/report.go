package service

import (
	"context"
	"fmt"

	"github.com/jackc/pgx/v5/pgtype"
	"github.com/vchavkov/hr/services/api/internal/db"
)

// PayrollSummaryReport contains aggregated payroll data for a period.
type PayrollSummaryReport struct {
	PeriodStart              string `json:"period_start"`
	PeriodEnd                string `json:"period_end"`
	EmployeeCount            int    `json:"employee_count"`
	TotalGrossStotinki       int64  `json:"total_gross_stotinki"`
	TotalNetStotinki         int64  `json:"total_net_stotinki"`
	TotalEmployerSocial      int64  `json:"total_employer_social_stotinki"`
	TotalEmployeeSocial      int64  `json:"total_employee_social_stotinki"`
	TotalEmployerHealth      int64  `json:"total_employer_health_stotinki"`
	TotalEmployeeHealth      int64  `json:"total_employee_health_stotinki"`
	TotalIncomeTaxStotinki   int64  `json:"total_income_tax_stotinki"`
}

// TaxLiabilityReport contains tax breakdown for a period.
type TaxLiabilityReport struct {
	PeriodStart       string              `json:"period_start"`
	PeriodEnd         string              `json:"period_end"`
	EmployeeCount     int                 `json:"employee_count"`
	Liabilities       []TaxLiabilityItem  `json:"liabilities"`
	TotalStotinki     int64               `json:"total_stotinki"`
}

// TaxLiabilityItem represents a single tax/contribution line.
type TaxLiabilityItem struct {
	Category       string `json:"category"`
	EmployerShare  int64  `json:"employer_share_stotinki"`
	EmployeeShare  int64  `json:"employee_share_stotinki"`
	TotalStotinki  int64  `json:"total_stotinki"`
}

// ReportService provides payroll reporting functionality.
type ReportService struct {
	queries *db.Queries
}

// NewReportService creates a new ReportService.
func NewReportService(queries *db.Queries) *ReportService {
	return &ReportService{queries: queries}
}

// PayrollSummary aggregates payroll data across all completed runs in a period.
func (s *ReportService) PayrollSummary(ctx context.Context, periodStart, periodEnd pgtype.Date) (*PayrollSummaryReport, error) {
	runs, err := s.queries.ListPayrollRuns(ctx, db.ListPayrollRunsParams{
		Limit:  1000,
		Offset: 0,
		Status: pgtype.Text{String: "completed", Valid: true},
	})
	if err != nil {
		return nil, fmt.Errorf("list payroll runs: %w", err)
	}

	report := &PayrollSummaryReport{
		PeriodStart: formatDate(periodStart),
		PeriodEnd:   formatDate(periodEnd),
	}

	seen := make(map[int32]bool)

	for _, run := range runs {
		if !dateInRange(run.PeriodStart, periodStart, periodEnd) {
			continue
		}

		payslips, err := s.queries.ListPayslipsByRun(ctx, run.ID)
		if err != nil {
			return nil, fmt.Errorf("list payslips for run: %w", err)
		}

		for _, p := range payslips {
			report.TotalGrossStotinki += p.GrossSalaryStotinki
			report.TotalNetStotinki += p.NetSalaryStotinki
			report.TotalEmployerSocial += p.EmployerSocialStotinki
			report.TotalEmployeeSocial += p.EmployeeSocialStotinki
			report.TotalEmployerHealth += p.EmployerHealthStotinki
			report.TotalEmployeeHealth += p.EmployeeHealthStotinki
			report.TotalIncomeTaxStotinki += p.IncomeTaxStotinki
			seen[p.EmployeeOdooID] = true
		}
	}

	report.EmployeeCount = len(seen)
	return report, nil
}

// TaxLiabilities returns a breakdown of tax obligations for a period.
func (s *ReportService) TaxLiabilities(ctx context.Context, periodStart, periodEnd pgtype.Date) (*TaxLiabilityReport, error) {
	runs, err := s.queries.ListPayrollRuns(ctx, db.ListPayrollRunsParams{
		Limit:  1000,
		Offset: 0,
		Status: pgtype.Text{String: "completed", Valid: true},
	})
	if err != nil {
		return nil, fmt.Errorf("list payroll runs: %w", err)
	}

	var (
		totalEmployerSocial int64
		totalEmployeeSocial int64
		totalEmployerHealth int64
		totalEmployeeHealth int64
		totalIncomeTax      int64
	)
	seen := make(map[int32]bool)

	for _, run := range runs {
		if !dateInRange(run.PeriodStart, periodStart, periodEnd) {
			continue
		}

		payslips, err := s.queries.ListPayslipsByRun(ctx, run.ID)
		if err != nil {
			return nil, fmt.Errorf("list payslips for run: %w", err)
		}

		for _, p := range payslips {
			totalEmployerSocial += p.EmployerSocialStotinki
			totalEmployeeSocial += p.EmployeeSocialStotinki
			totalEmployerHealth += p.EmployerHealthStotinki
			totalEmployeeHealth += p.EmployeeHealthStotinki
			totalIncomeTax += p.IncomeTaxStotinki
			seen[p.EmployeeOdooID] = true
		}
	}

	pension := TaxLiabilityItem{
		Category:      "pension_social",
		EmployerShare: totalEmployerSocial,
		EmployeeShare: totalEmployeeSocial,
		TotalStotinki: totalEmployerSocial + totalEmployeeSocial,
	}

	health := TaxLiabilityItem{
		Category:      "health_insurance",
		EmployerShare: totalEmployerHealth,
		EmployeeShare: totalEmployeeHealth,
		TotalStotinki: totalEmployerHealth + totalEmployeeHealth,
	}

	incomeTax := TaxLiabilityItem{
		Category:      "income_tax",
		EmployerShare: 0,
		EmployeeShare: totalIncomeTax,
		TotalStotinki: totalIncomeTax,
	}

	total := pension.TotalStotinki + health.TotalStotinki + incomeTax.TotalStotinki

	return &TaxLiabilityReport{
		PeriodStart:   formatDate(periodStart),
		PeriodEnd:     formatDate(periodEnd),
		EmployeeCount: len(seen),
		Liabilities:   []TaxLiabilityItem{pension, health, incomeTax},
		TotalStotinki: total,
	}, nil
}

// dateInRange checks if a date falls within a range (inclusive).
func dateInRange(d, start, end pgtype.Date) bool {
	if !d.Valid || !start.Valid || !end.Valid {
		return false
	}
	t := d.Time
	return !t.Before(start.Time) && !t.After(end.Time)
}

// formatDate formats a pgtype.Date as YYYY-MM-DD.
func formatDate(d pgtype.Date) string {
	if !d.Valid {
		return ""
	}
	return d.Time.Format("2006-01-02")
}
