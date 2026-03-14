package tax

import (
	"testing"
)

func TestCalculate_3000BGN(t *testing.T) {
	result := Calculate(CalculationInput{GrossSalaryStotinki: 300_000})

	// Employer social: (0.0888 + 0.021 + 0.006 + 0.005 + 0.028) * 300000 = 44640
	if result.EmployerSocial != 44_640 {
		t.Errorf("EmployerSocial = %d, want 44640", result.EmployerSocial)
	}
	// Employee social: (0.0592 + 0.014 + 0.004 + 0.022) * 300000 = 29760
	if result.EmployeeSocial != 29_760 {
		t.Errorf("EmployeeSocial = %d, want 29760", result.EmployeeSocial)
	}
	// Employer health: 0.048 * 300000 = 14400
	if result.EmployerHealth != 14_400 {
		t.Errorf("EmployerHealth = %d, want 14400", result.EmployerHealth)
	}
	// Employee health: 0.032 * 300000 = 9600
	if result.EmployeeHealth != 9_600 {
		t.Errorf("EmployeeHealth = %d, want 9600", result.EmployeeHealth)
	}
	// Taxable = 300000 - 29760 - 9600 = 260640; tax = 26064
	if result.IncomeTax != 26_064 {
		t.Errorf("IncomeTax = %d, want 26064", result.IncomeTax)
	}
	// Net = 300000 - 29760 - 9600 - 26064 = 234576
	if result.NetSalaryStotinki != 234_576 {
		t.Errorf("NetSalaryStotinki = %d, want 234576", result.NetSalaryStotinki)
	}
	if result.GrossSalaryStotinki != 300_000 {
		t.Errorf("GrossSalaryStotinki = %d, want 300000", result.GrossSalaryStotinki)
	}
}

func TestCalculate_BelowMinInsurable(t *testing.T) {
	// 1000 BGN = 100000 stotinki, below min insurable 1213 BGN = 121300
	// Social/health contributions should be calculated on min insurable (121300)
	result := Calculate(CalculationInput{GrossSalaryStotinki: 100_000})

	// Employee social on min insurable: 0.0992 * 121300 = 12032.96 -> 12033
	if result.EmployeeSocial != 12_033 {
		t.Errorf("EmployeeSocial = %d, want 12033 (based on min insurable)", result.EmployeeSocial)
	}
	// Employee health on min insurable: 0.032 * 121300 = 3881.6 -> 3882
	if result.EmployeeHealth != 3_882 {
		t.Errorf("EmployeeHealth = %d, want 3882 (based on min insurable)", result.EmployeeHealth)
	}
	// Taxable = 100000 - 12033 - 3882 = 84085; tax = 8409 (round)
	if result.IncomeTax != 8_409 {
		t.Errorf("IncomeTax = %d, want 8409", result.IncomeTax)
	}
	// Net = 100000 - 12033 - 3882 - 8409 = 75676
	if result.NetSalaryStotinki != 75_676 {
		t.Errorf("NetSalaryStotinki = %d, want 75676", result.NetSalaryStotinki)
	}
}

func TestCalculate_AboveMaxInsurable(t *testing.T) {
	// 5000 BGN = 500000 stotinki, above max insurable 3850 BGN = 385000
	// Social/health contributions capped at max insurable
	result := Calculate(CalculationInput{GrossSalaryStotinki: 500_000})

	// Employee social on max: 0.0992 * 385000 = 38192
	if result.EmployeeSocial != 38_192 {
		t.Errorf("EmployeeSocial = %d, want 38192 (capped at max insurable)", result.EmployeeSocial)
	}
	// Employee health on max: 0.032 * 385000 = 12320
	if result.EmployeeHealth != 12_320 {
		t.Errorf("EmployeeHealth = %d, want 12320 (capped at max insurable)", result.EmployeeHealth)
	}
	// Taxable = 500000 - 38192 - 12320 = 449488; tax = 44949 (round)
	if result.IncomeTax != 44_949 {
		t.Errorf("IncomeTax = %d, want 44949", result.IncomeTax)
	}
	// Net = 500000 - 38192 - 12320 - 44949 = 404539
	if result.NetSalaryStotinki != 404_539 {
		t.Errorf("NetSalaryStotinki = %d, want 404539", result.NetSalaryStotinki)
	}
}

func TestCalculate_NoFloat64InResult(t *testing.T) {
	// Verify all result fields are int64 (compile-time check via type assertion)
	result := Calculate(CalculationInput{GrossSalaryStotinki: 300_000})
	var _ int64 = result.GrossSalaryStotinki
	var _ int64 = result.EmployerSocial
	var _ int64 = result.EmployeeSocial
	var _ int64 = result.EmployerHealth
	var _ int64 = result.EmployeeHealth
	var _ int64 = result.IncomeTax
	var _ int64 = result.NetSalaryStotinki
}

func TestCalculate_DetailsBreakdown(t *testing.T) {
	result := Calculate(CalculationInput{GrossSalaryStotinki: 300_000})

	checks := map[string]int64{
		"insurable_income":   300_000,
		"employer_pension":   26_640,
		"employee_pension":   17_760,
		"employer_illness":   6_300,
		"employee_illness":   4_200,
		"employer_unemployment": 1_800,
		"employee_unemployment": 1_200,
		"employer_accident":  1_500,
		"employer_universal_pension": 8_400,
		"employee_universal_pension": 6_600,
	}

	for key, want := range checks {
		got, ok := result.Details[key]
		if !ok {
			t.Errorf("Details missing key %q", key)
			continue
		}
		if got != want {
			t.Errorf("Details[%q] = %d, want %d", key, got, want)
		}
	}
}
