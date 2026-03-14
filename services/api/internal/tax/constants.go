package tax

// BG 2026 tax constants. All rates as float64, monetary values in stotinki (int64).
// Source: apps/web/src/lib/bulgarian-tax.ts

const (
	IncomeTaxRate = 0.10

	// Social security - Category III workers, 60/40 split
	PensionEmployer   = 0.0888
	PensionEmployee   = 0.0592
	IllnessEmployer   = 0.021
	IllnessEmployee   = 0.014
	UnemployEmployer  = 0.006
	UnemployEmployee  = 0.004
	AccidentEmployer  = 0.005 // employer only, low-risk office

	// Universal pension (born after Dec 31, 1959)
	UniversalPensionEmployer = 0.028
	UniversalPensionEmployee = 0.022

	// Health insurance 8% total
	HealthEmployer = 0.048
	HealthEmployee = 0.032

	// Insurable income bounds (stotinki)
	MinInsurableIncomeStotinki int64 = 121_300 // 1213 BGN
	MaxInsurableIncomeStotinki int64 = 385_000 // 3850 BGN
)

// Derived totals for convenience
const (
	TotalEmployerSocialRate = PensionEmployer + IllnessEmployer + UnemployEmployer + AccidentEmployer + UniversalPensionEmployer
	TotalEmployeeSocialRate = PensionEmployee + IllnessEmployee + UnemployEmployee + UniversalPensionEmployee
)
