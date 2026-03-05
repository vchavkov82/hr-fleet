import { agent, tool } from "@an-sdk/agent"
import { z } from "zod"

export default agent({
  model: "claude-sonnet-4-6",
  systemPrompt: `You are a helpful HR assistant for a human resources platform. You help employees and HR teams with:
- HR policies and procedures
- Employee onboarding
- Benefits information
- Leave and time-off management
- Performance reviews
- Career development
- Company culture and events

Be friendly, professional, and helpful. Always prioritize employee wellbeing and company policies.`,
  tools: {
    getEmployeeInfo: tool({
      description: "Get basic employee information (name, department, role, start date)",
      inputSchema: z.object({
        employeeId: z.string().describe("The employee ID"),
      }),
      execute: async ({ employeeId }) => {
        // Mock implementation - would connect to actual HR system
        return {
          content: [
            {
              type: "text",
              text: `Employee information for ID ${employeeId}:\n- Name: John Doe\n- Department: Engineering\n- Role: Senior Software Engineer\n- Start Date: 2022-01-15`,
            },
          ],
        }
      },
    }),

    getHRPolicies: tool({
      description: "Get information about HR policies",
      inputSchema: z.object({
        category: z
          .enum([
            "remote-work",
            "time-off",
            "benefits",
            "code-of-conduct",
            "expenses",
          ])
          .describe("The policy category"),
      }),
      execute: async ({ category }) => {
        const policies: Record<string, string> = {
          "remote-work":
            "Remote Work Policy:\n- Up to 3 days per week remote\n- Must be approved by manager\n- Core hours 10am-3pm",
          "time-off":
            "Time Off Policy:\n- 20 days annual leave\n- 5 days sick leave\n- 2 days personal leave\n- Approval needed 2 weeks in advance",
          benefits:
            "Benefits Package:\n- Health insurance (medical, dental, vision)\n- 401(k) with 4% match\n- Life insurance\n- Gym membership",
          "code-of-conduct":
            "Code of Conduct:\n- Treat colleagues with respect\n- Maintain professional standards\n- No discrimination or harassment\n- Report violations to HR",
          expenses:
            "Expense Policy:\n- Submit receipts within 30 days\n- Manager approval required\n- Budget limits by category",
        }
        return {
          content: [
            {
              type: "text",
              text: policies[category],
            },
          ],
        }
      },
    }),

    submitTimeOff: tool({
      description: "Submit a time-off request",
      inputSchema: z.object({
        startDate: z.string().describe("Start date (YYYY-MM-DD)"),
        endDate: z.string().describe("End date (YYYY-MM-DD)"),
        type: z
          .enum(["vacation", "sick", "personal"])
          .describe("Type of time off"),
        reason: z
          .string()
          .optional()
          .describe("Optional reason for the request"),
      }),
      execute: async ({ startDate, endDate, type, reason }) => {
        return {
          content: [
            {
              type: "text",
              text: `Time-off request submitted successfully!\n- Type: ${type}\n- From: ${startDate}\n- To: ${endDate}\n- Status: Pending manager approval\nYour manager will review and respond within 2 business days.`,
            },
          ],
        }
      },
    }),
  },
})
