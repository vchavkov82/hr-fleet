package odoo

import "encoding/json"

// JSONRPCRequest represents a JSON-RPC 2.0 request to Odoo.
type JSONRPCRequest struct {
	JSONRPC string      `json:"jsonrpc"`
	Method  string      `json:"method"`
	Params  any `json:"params"`
	ID      int         `json:"id"`
}

// JSONRPCResponse represents a JSON-RPC 2.0 response from Odoo.
type JSONRPCResponse struct {
	JSONRPC string          `json:"jsonrpc"`
	ID      int             `json:"id"`
	Result  json.RawMessage `json:"result,omitempty"`
	Error   *RPCError       `json:"error,omitempty"`
}

// RPCError represents an error returned by Odoo's JSON-RPC endpoint.
type RPCError struct {
	Code    int         `json:"code"`
	Message string      `json:"message"`
	Data    any `json:"data,omitempty"`
}

func (e *RPCError) Error() string {
	return e.Message
}

// Many2One represents an Odoo many2one field value [id, name].
type Many2One struct {
	ID   int64
	Name string
}

// Employee represents an hr.employee record from Odoo.
type Employee struct {
	ID           int64   `json:"id"`
	Name         string  `json:"name"`
	WorkEmail    string  `json:"work_email"`
	JobTitle     string  `json:"job_title"`
	DepartmentID Many2One `json:"department_id"`
	JobID        Many2One `json:"job_id"`
	ParentID     Many2One `json:"parent_id"`
	WorkPhone    string  `json:"work_phone"`
	MobilePhone  string  `json:"mobile_phone"`
	EmployeeType string  `json:"employee_type"`
	Active       bool    `json:"active"`
	CreateDate   string  `json:"create_date"`
	WriteDate    string  `json:"write_date"`
}

// EmployeeCreateRequest contains fields for creating a new hr.employee record.
type EmployeeCreateRequest struct {
	Name         string `json:"name"`
	WorkEmail    string `json:"work_email"`
	JobTitle     string `json:"job_title"`
	DepartmentID int64  `json:"department_id"`
	EmployeeType string `json:"employee_type"`
}

// Contract represents an hr.contract record from Odoo.
type Contract struct {
	ID            int64    `json:"id"`
	EmployeeID    Many2One `json:"employee_id"`
	Name          string   `json:"name"`
	DateStart     string   `json:"date_start"`
	DateEnd       string   `json:"date_end,omitempty"`
	Wage          float64  `json:"wage"`
	State         string   `json:"state"`
	StructureType Many2One `json:"structure_type_id"`
	Department    Many2One `json:"department_id"`
}

// ContractCreateRequest contains fields for creating a new hr.contract record.
type ContractCreateRequest struct {
	EmployeeID    int64   `json:"employee_id"`
	Name          string  `json:"name"`
	DateStart     string  `json:"date_start"`
	DateEnd       string  `json:"date_end,omitempty"`
	Wage          float64 `json:"wage"`
	StructureType int64   `json:"structure_type_id,omitempty"`
	DepartmentID  int64   `json:"department_id,omitempty"`
}

// contractFields lists the field names to request from Odoo for hr.contract records.
var contractFields = []string{
	"id",
	"employee_id",
	"name",
	"date_start",
	"date_end",
	"wage",
	"state",
	"structure_type_id",
	"department_id",
}

// LeaveAllocation represents an hr.leave.allocation record from Odoo.
type LeaveAllocation struct {
	ID              int64    `json:"id"`
	EmployeeID      Many2One `json:"employee_id"`
	HolidayStatusID Many2One `json:"holiday_status_id"`
	NumberOfDays    float64  `json:"number_of_days"`
	State           string   `json:"state"`
}

// leaveAllocationFields lists the field names for hr.leave.allocation.
var leaveAllocationFields = []string{
	"id",
	"employee_id",
	"holiday_status_id",
	"number_of_days",
	"state",
}

// LeaveRequest represents an hr.leave record from Odoo.
type LeaveRequest struct {
	ID              int64    `json:"id"`
	EmployeeID      Many2One `json:"employee_id"`
	HolidayStatusID Many2One `json:"holiday_status_id"`
	DateFrom        string   `json:"date_from"`
	DateTo          string   `json:"date_to"`
	NumberOfDays    float64  `json:"number_of_days"`
	State           string   `json:"state"`
	Name            string   `json:"name"`
}

// LeaveCreateRequest contains fields for creating a new hr.leave record.
type LeaveCreateRequest struct {
	EmployeeID      int64  `json:"employee_id"`
	HolidayStatusID int64  `json:"holiday_status_id"`
	DateFrom        string `json:"date_from"`
	DateTo          string `json:"date_to"`
	Name            string `json:"name"`
}

// leaveRequestFields lists the field names for hr.leave.
var leaveRequestFields = []string{
	"id",
	"employee_id",
	"holiday_status_id",
	"date_from",
	"date_to",
	"number_of_days",
	"state",
	"name",
}

// employeeFields lists the field names to request from Odoo for hr.employee records.
var employeeFields = []string{
	"id",
	"name",
	"work_email",
	"job_title",
	"job_id",
	"department_id",
	"parent_id",
	"work_phone",
	"mobile_phone",
	"employee_type",
	"active",
	"create_date",
	"write_date",
}

// PayrollStructure represents an hr.payroll.structure record from Odoo (OCA payroll).
type PayrollStructure struct {
	ID      int64    `json:"id"`
	Name    string   `json:"name"`
	Code    string   `json:"code"`
	TypeID  Many2One `json:"type_id"`
	RuleIDs []int64  `json:"rule_ids"`
	Active  bool     `json:"active"`
}

var payrollStructureFields = []string{
	"id", "name", "code", "type_id", "rule_ids", "active",
}

// SalaryRule represents an hr.salary.rule record from Odoo (OCA payroll).
type SalaryRule struct {
	ID           int64    `json:"id"`
	Name         string   `json:"name"`
	Code         string   `json:"code"`
	CategoryID   Many2One `json:"category_id"`
	StructID     Many2One `json:"struct_id"`
	Sequence     int64    `json:"sequence"`
	Amount       float64  `json:"amount_fix"`
	AmountPython string   `json:"amount_python_compute"`
	Active       bool     `json:"active"`
}

var salaryRuleFields = []string{
	"id", "name", "code", "category_id", "struct_id", "sequence",
	"amount_fix", "amount_python_compute", "active",
}

// PayslipOCA represents an hr.payslip record from OCA payroll (richer than base).
type PayslipOCA struct {
	ID           int64    `json:"id"`
	EmployeeID   Many2One `json:"employee_id"`
	StructID     Many2One `json:"struct_id"`
	Name         string   `json:"name"`
	Number       string   `json:"number"`
	DateFrom     string   `json:"date_from"`
	DateTo       string   `json:"date_to"`
	State        string   `json:"state"`
	NetWage      float64  `json:"net_wage"`
	GrossWage    float64  `json:"gross_wage"`
	ContractID   Many2One `json:"contract_id"`
	PayslipRunID Many2One `json:"payslip_run_id"`
}

var payslipOCAFields = []string{
	"id", "employee_id", "struct_id", "name", "number",
	"date_from", "date_to", "state", "net_wage", "gross_wage",
	"contract_id", "payslip_run_id",
}

// PayslipRun represents an hr.payslip.run record from OCA payroll.
type PayslipRun struct {
	ID       int64  `json:"id"`
	Name     string `json:"name"`
	DateFrom string `json:"date_start"`
	DateTo   string `json:"date_end"`
	State    string `json:"state"`
}

var payslipRunFields = []string{
	"id", "name", "date_start", "date_end", "state",
}

// TimesheetEntry represents an account.analytic.line (timesheet) record.
type TimesheetEntry struct {
	ID         int64    `json:"id"`
	EmployeeID Many2One `json:"employee_id"`
	ProjectID  Many2One `json:"project_id"`
	TaskID     Many2One `json:"task_id"`
	Date       string   `json:"date"`
	UnitAmount float64  `json:"unit_amount"`
	Name       string   `json:"name"`
}

var timesheetFields = []string{
	"id", "employee_id", "project_id", "task_id", "date", "unit_amount", "name",
}

// AttendanceRecord represents an hr.attendance record.
type AttendanceRecord struct {
	ID          int64    `json:"id"`
	EmployeeID  Many2One `json:"employee_id"`
	CheckIn     string   `json:"check_in"`
	CheckOut    string   `json:"check_out"`
	WorkedHours float64  `json:"worked_hours"`
}

var attendanceFields = []string{
	"id", "employee_id", "check_in", "check_out", "worked_hours",
}

// ExpenseReport represents an hr.expense record.
type ExpenseReport struct {
	ID          int64    `json:"id"`
	EmployeeID  Many2One `json:"employee_id"`
	Name        string   `json:"name"`
	Date        string   `json:"date"`
	TotalAmount float64  `json:"total_amount"`
	State       string   `json:"state"`
	ProductID   Many2One `json:"product_id"`
}

var expenseFields = []string{
	"id", "employee_id", "name", "date", "total_amount", "state", "product_id",
}

// Department represents an hr.department record from Odoo.
type Department struct {
	ID        int64    `json:"id"`
	Name      string   `json:"name"`
	ParentID  Many2One `json:"parent_id"`
	ManagerID Many2One `json:"manager_id"`
	CompanyID Many2One `json:"company_id"`
	Active    bool     `json:"active"`
	ChildIDs  []int64  `json:"child_ids"`
}

var departmentFields = []string{
	"id", "name", "parent_id", "manager_id", "company_id", "active", "child_ids",
}

// EmployeeSkill represents an hr.employee.skill record from OCA hr.
type EmployeeSkill struct {
	ID          int64    `json:"id"`
	EmployeeID  Many2One `json:"employee_id"`
	SkillID     Many2One `json:"skill_id"`
	SkillTypeID Many2One `json:"skill_type_id"`
	SkillLevel  Many2One `json:"skill_level_id"`
}

var employeeSkillFields = []string{
	"id", "employee_id", "skill_id", "skill_type_id", "skill_level_id",
}

// Skill represents an hr.skill record from OCA hr.
type Skill struct {
	ID          int64    `json:"id"`
	Name        string   `json:"name"`
	SkillTypeID Many2One `json:"skill_type_id"`
}

var skillFields = []string{
	"id", "name", "skill_type_id",
}

// Appraisal represents an hr.appraisal record from OCA hr_appraisal_oca.
type Appraisal struct {
	ID                        int64    `json:"id"`
	EmployeeID                Many2One `json:"employee_id"`
	ManagerIDs                []int64  `json:"manager_ids"`
	DateClose                 string   `json:"date_close"`
	State                     string   `json:"state"` // 1_new, 2_pending, 3_done
	EmployeeFeedback          string   `json:"employee_feedback"`
	ManagerFeedback           string   `json:"manager_feedback"`
	EmployeeFeedbackPublished bool     `json:"employee_feedback_published"`
	ManagerFeedbackPublished  bool     `json:"manager_feedback_published"`
	DepartmentID              Many2One `json:"department_id"`
	JobID                     Many2One `json:"job_id"`
	TemplateID                Many2One `json:"appraisal_template_id"`
	Note                      string   `json:"note"`
	CreateDate                string   `json:"create_date"`
	WriteDate                 string   `json:"write_date"`
}

var appraisalFields = []string{
	"id", "employee_id", "manager_ids", "date_close", "state",
	"employee_feedback", "manager_feedback",
	"employee_feedback_published", "manager_feedback_published",
	"department_id", "job_id", "appraisal_template_id", "note",
	"create_date", "write_date",
}

// AppraisalCreateRequest contains fields for creating a new hr.appraisal record.
type AppraisalCreateRequest struct {
	EmployeeID int64  `json:"employee_id"`
	DateClose  string `json:"date_close"`
	TemplateID int64  `json:"appraisal_template_id,omitempty"`
}

// AppraisalTemplate represents an hr.appraisal.template record.
type AppraisalTemplate struct {
	ID                     int64    `json:"id"`
	Description            string   `json:"description"`
	CompanyID              Many2One `json:"company_id"`
	EmployeeFeedbackTmpl   string   `json:"appraisal_employee_feedback_template"`
	ManagerFeedbackTmpl    string   `json:"appraisal_manager_feedback_template"`
}

var appraisalTemplateFields = []string{
	"id", "description", "company_id",
	"appraisal_employee_feedback_template", "appraisal_manager_feedback_template",
}

// Course represents an hr.course record from OCA hr_course.
type Course struct {
	ID              int64    `json:"id"`
	Name            string   `json:"name"`
	CategoryID      Many2One `json:"category_id"`
	Permanence      bool     `json:"permanence"`
	PermanenceTime  string   `json:"permanence_time"`
	Content         string   `json:"content"`
	Objective       string   `json:"objective"`
}

var courseFields = []string{
	"id", "name", "category_id", "permanence", "permanence_time", "content", "objective",
}

// CourseCategory represents an hr.course.category record.
type CourseCategory struct {
	ID   int64  `json:"id"`
	Name string `json:"name"`
}

var courseCategoryFields = []string{"id", "name"}

// CourseSchedule represents an hr.course.schedule record.
type CourseSchedule struct {
	ID            int64    `json:"id"`
	Name          string   `json:"name"`
	CourseID      Many2One `json:"course_id"`
	StartDate     string   `json:"start_date"`
	EndDate       string   `json:"end_date"`
	Cost          float64  `json:"cost"`
	AuthorizedBy  Many2One `json:"authorized_by"`
	State         string   `json:"state"` // draft, waiting_attendees, in_progress, in_validation, completed, cancelled
	AttendantIDs  []int64  `json:"attendant_ids"`
	Place         string   `json:"place"`
}

var courseScheduleFields = []string{
	"id", "name", "course_id", "start_date", "end_date", "cost",
	"authorized_by", "state", "attendant_ids", "place",
}

// CourseAttendee represents an hr.course.attendee record.
type CourseAttendee struct {
	ID               int64    `json:"id"`
	CourseScheduleID Many2One `json:"course_schedule_id"`
	EmployeeID       Many2One `json:"employee_id"`
	Result           string   `json:"result"` // passed, failed, absent, pending
	Active           bool     `json:"active"`
}

var courseAttendeeFields = []string{
	"id", "course_schedule_id", "employee_id", "result", "active",
}

// CourseCreateRequest contains fields for creating a new hr.course record.
type CourseCreateRequest struct {
	Name       string `json:"name"`
	CategoryID int64  `json:"category_id"`
	Permanence bool   `json:"permanence"`
	Content    string `json:"content,omitempty"`
	Objective  string `json:"objective,omitempty"`
}

// CourseScheduleCreateRequest contains fields for creating a new hr.course.schedule record.
type CourseScheduleCreateRequest struct {
	Name         string  `json:"name"`
	CourseID     int64   `json:"course_id"`
	StartDate    string  `json:"start_date"`
	EndDate      string  `json:"end_date"`
	Cost         float64 `json:"cost"`
	AuthorizedBy int64   `json:"authorized_by"`
	AttendantIDs []int64 `json:"attendant_ids,omitempty"`
	Place        string  `json:"place,omitempty"`
}

// Project represents a project.project record from OCA project.
type Project struct {
	ID           int64    `json:"id"`
	Name         string   `json:"name"`
	Active       bool     `json:"active"`
	PartnerID    Many2One `json:"partner_id"`
	UserID       Many2One `json:"user_id"`
	DateStart    string   `json:"date_start"`
	Date         string   `json:"date"`
	Description  string   `json:"description"`
	TaskCount    int64    `json:"task_count"`
	CompanyID    Many2One `json:"company_id"`
}

var projectFields = []string{
	"id", "name", "active", "partner_id", "user_id",
	"date_start", "date", "description", "task_count", "company_id",
}

// ProjectTask represents a project.task record.
type ProjectTask struct {
	ID            int64    `json:"id"`
	Name          string   `json:"name"`
	ProjectID     Many2One `json:"project_id"`
	UserIDs       []int64  `json:"user_ids"`
	StageID       Many2One `json:"stage_id"`
	DateDeadline  string   `json:"date_deadline"`
	Description   string   `json:"description"`
	Priority      string   `json:"priority"`
	State         string   `json:"state"`
	PlannedHours  float64  `json:"planned_hours"`
	EffectiveHours float64 `json:"effective_hours"`
}

var projectTaskFields = []string{
	"id", "name", "project_id", "user_ids", "stage_id",
	"date_deadline", "description", "priority", "state",
	"planned_hours", "effective_hours",
}

// FleetVehicle represents a fleet.vehicle record from OCA fleet.
type FleetVehicle struct {
	ID              int64    `json:"id"`
	Name            string   `json:"name"`
	LicensePlate    string   `json:"license_plate"`
	ModelID         Many2One `json:"model_id"`
	DriverID        Many2One `json:"driver_id"`
	FuelType        string   `json:"fuel_type"`
	Odometer        float64  `json:"odometer"`
	State           Many2One `json:"state_id"`
	CompanyID       Many2One `json:"company_id"`
	AcquisitionDate string   `json:"acquisition_date"`
	Active          bool     `json:"active"`
}

var fleetVehicleFields = []string{
	"id", "name", "license_plate", "model_id", "driver_id",
	"fuel_type", "odometer", "state_id", "company_id",
	"acquisition_date", "active",
}

// FleetVehicleLog represents a fleet.vehicle.log.services record.
type FleetVehicleLog struct {
	ID          int64    `json:"id"`
	VehicleID   Many2One `json:"vehicle_id"`
	ServiceType Many2One `json:"service_type_id"`
	Date        string   `json:"date"`
	Description string   `json:"description"`
	Cost        float64  `json:"amount"`
	Odometer    float64  `json:"odometer"`
	State       string   `json:"state"`
}

var fleetVehicleLogFields = []string{
	"id", "vehicle_id", "service_type_id", "date",
	"description", "amount", "odometer", "state",
}
