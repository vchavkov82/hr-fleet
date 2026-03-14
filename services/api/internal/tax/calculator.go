package tax

import "math"

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

// round converts a float64 to int64 with standard rounding.
func round(v float64) int64 {
	return int64(math.Round(v))
}

// Calculate performs Bulgarian tax and social security calculation for 2026.
// All arithmetic uses integer stotinki; intermediate rounding uses math.Round.
func Calculate(input CalculationInput) CalculationResult {
	gross := input.GrossSalaryStotinki

	// Step 1: Clamp insurable income between min and max
	insurable := gross
	if insurable < MinInsurableIncomeStotinki {
		insurable = MinInsurableIncomeStotinki
	}
	if insurable > MaxInsurableIncomeStotinki {
		insurable = MaxInsurableIncomeStotinki
	}

	fi := float64(insurable)

	// Step 2: Employer social contributions
	employerPension := round(fi * PensionEmployer)
	employerIllness := round(fi * IllnessEmployer)
	employerUnemploy := round(fi * UnemployEmployer)
	employerAccident := round(fi * AccidentEmployer)
	employerUniversal := round(fi * UniversalPensionEmployer)
	employerSocial := employerPension + employerIllness + employerUnemploy + employerAccident + employerUniversal

	// Step 3: Employee social contributions
	employeePension := round(fi * PensionEmployee)
	employeeIllness := round(fi * IllnessEmployee)
	employeeUnemploy := round(fi * UnemployEmployee)
	employeeUniversal := round(fi * UniversalPensionEmployee)
	employeeSocial := employeePension + employeeIllness + employeeUnemploy + employeeUniversal

	// Step 4: Health insurance
	employerHealth := round(fi * HealthEmployer)
	employeeHealth := round(fi * HealthEmployee)

	// Step 5: Taxable income = gross - employee_social - employee_health
	taxable := gross - employeeSocial - employeeHealth

	// Step 6: Income tax = 10% flat
	incomeTax := round(float64(taxable) * IncomeTaxRate)

	// Step 7: Net salary
	net := gross - employeeSocial - employeeHealth - incomeTax

	return CalculationResult{
		GrossSalaryStotinki: gross,
		EmployerSocial:      employerSocial,
		EmployeeSocial:      employeeSocial,
		EmployerHealth:      employerHealth,
		EmployeeHealth:      employeeHealth,
		IncomeTax:           incomeTax,
		NetSalaryStotinki:   net,
		Details: map[string]int64{
			"insurable_income":         insurable,
			"employer_pension":         employerPension,
			"employee_pension":         employeePension,
			"employer_illness":         employerIllness,
			"employee_illness":         employeeIllness,
			"employer_unemployment":    employerUnemploy,
			"employee_unemployment":    employeeUnemploy,
			"employer_accident":        employerAccident,
			"employer_universal_pension": employerUniversal,
			"employee_universal_pension": employeeUniversal,
			"employer_health":          employerHealth,
			"employee_health":          employeeHealth,
			"taxable_income":           taxable,
		},
	}
}
