package tax

// CalculationInput holds the input for Bulgarian tax calculation.
type CalculationInput struct {
	GrossSalaryStotinki int64
}

// CalculationResult holds the complete breakdown of a salary calculation.
// All monetary values are in stotinki (1/100 BGN) as int64.
type CalculationResult struct {
	GrossSalaryStotinki int64            `json:"gross_salary_stotinki"`
	EmployerSocial      int64            `json:"employer_social_stotinki"`
	EmployeeSocial      int64            `json:"employee_social_stotinki"`
	EmployerHealth      int64            `json:"employer_health_stotinki"`
	EmployeeHealth      int64            `json:"employee_health_stotinki"`
	IncomeTax           int64            `json:"income_tax_stotinki"`
	NetSalaryStotinki   int64            `json:"net_salary_stotinki"`
	Details             map[string]int64 `json:"details"`
}

// Calculate performs Bulgarian tax and social security calculation for 2026.
// Stub — returns zero values.
func Calculate(input CalculationInput) CalculationResult {
	return CalculationResult{}
}
