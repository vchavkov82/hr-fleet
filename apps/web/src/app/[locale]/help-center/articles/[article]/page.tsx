import { setRequestLocale } from 'next-intl/server'
import { getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'
import { routing } from '@/i18n/routing'
import { SearchBar } from '@/components/help/search-bar'
import { HelpCenterBreadcrumbs } from '@/components/help/breadcrumbs'
import { ArticleFeedback } from '@/components/help/article-feedback'
import { SectionReveal } from '@/components/ui/section-reveal'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export function generateStaticParams() {
    return routing.locales.map((locale) =>
        [
            'getting-started', 'dashboard-overview', 'company-setup', 'notification-settings',
            'employee-directory', 'employee-data', 'employee-documents',
            'salary-calculator', 'freelancer-comparison', 'hr-document-templates',
            'tax-social-security', 'labor-code-basics', 'data-protection',
            'user-permissions', 'account-settings', 'two-factor-auth', 'data-export'
        ].map((article) => ({
            locale,
            article
        }))
    ).flat()
}

export async function generateMetadata({
    params,
}: {
    params: Promise<{ locale: string; article: string }>
}): Promise<Metadata> {
    const { locale, article } = await params

    const articleData = getArticleData(article)
    if (!articleData) {
        return { title: 'Article Not Found | HR Help Center' }
    }

    return {
        title: `${articleData.title} | HR Help Center`,
        description: articleData.description
    }
}

// Mock article data - in a real app, this would come from a CMS or database
function getArticleData(articleId: string) {
    const articles: Record<string, any> = {
        'getting-started': {
            id: 'getting-started',
            title: 'Getting Started with HR',
            description: 'A complete guide to setting up your account and posting your first job.',
            category: 'getting-started',
            categoryName: 'Getting Started',
            readTime: '5 min',
            lastUpdated: '2024-02-15',
            content: `
# Getting Started with HR

Welcome to HR! This comprehensive guide will help you set up your account and get started with our HR platform.

## What You'll Learn

- How to create and configure your company profile
- Setting up departments and roles
- Posting your first job opening
- Inviting team members
- Basic platform navigation

## Step 1: Create Your Account

When you first sign up for HR, you'll need to provide some basic information about your company:

1. **Company Details**: Enter your company name, size, and industry
2. **Contact Information**: Add your primary contact details
3. **Billing Information**: Set up your subscription plan

## Step 2: Configure Company Profile

Once your account is created, take time to set up your company profile:

### Basic Information

- Company logo and branding
- Business address and contact details
- Working hours and time zones
- Company policies and documents

### Organizational Structure

- Create departments that match your company structure
- Define job roles and positions
- Set up reporting relationships
- Configure approval workflows

## Step 3: Set Up Departments

Departments help organize your workforce and manage access controls:

1. **Create Departments**: Add all departments in your organization
2. **Assign Managers**: Designate department heads and managers
3. **Set Permissions**: Configure access levels for each department
4. **Add Team Members**: Start building your organizational structure

## Step 4: Post Your First Job

Now you're ready to start recruiting:

### Job Details

- **Position Title**: Be specific and clear
- **Job Description**: Include responsibilities and requirements
- **Salary Range**: Provide a competitive salary range
- **Location**: Specify work location (remote, office, hybrid)

### Application Settings

- Application form fields
- Screening questions
- Interview stages
- Notification preferences

## Step 5: Invite Team Members

Bring your team on board:

1. **Send Invitations**: Invite team members via email
2. **Assign Roles**: Give appropriate access levels
3. **Set Up Permissions**: Configure what each user can access
4. **Provide Training**: Share this guide with new users

## Next Steps

Congratulations! You've set up your HR account. Here's what to explore next:

- [Managing Employee Information](/en/help-center/articles/employee-data)
- [Setting Up Leave Policies](/en/help-center/articles/leave-policies)
- [Configuring Payroll](/en/help-center/articles/payroll-setup)
- [Integrating with Other Tools](/en/help-center/articles/slack-integration)

## Need Help?

If you run into any issues or have questions:

- 📧 Email us at support@hr.bg
- 💬 Start a live chat from your dashboard
- 📞 Call us at +359 2 123 4567

Our support team is available Monday-Friday, 9 AM - 6 PM EET.
      `,
            tags: ['setup', 'account', 'first-job', 'onboarding']
        },
        'company-setup': {
            id: 'company-setup',
            title: 'Company Profile Configuration',
            description: 'Configure your company settings, departments, and organizational structure.',
            category: 'getting-started',
            categoryName: 'Getting Started',
            readTime: '8 min',
            lastUpdated: '2024-02-10',
            content: `
# Company Profile Configuration

Setting up your company profile correctly is essential for getting the most out of HR. This guide covers all the important settings and configurations.

## Company Information

### Basic Details

Navigate to **Settings > Company Profile** to update:

- **Company Name**: Your official business name
- **Legal Entity**: Legal registration information
- **Tax ID**: Company identification numbers
- **Industry**: Select your industry sector
- **Company Size**: Number of employees

### Contact Information

- **Primary Address**: Main business location
- **Contact Phone**: Main company phone number
- **Email Address**: General contact email
- **Website**: Company website URL

## Branding Settings

### Visual Identity

Customize how HR looks for your team:

1. **Company Logo**: Upload your logo (recommended: 200x200px, PNG format)
2. **Brand Colors**: Set primary and secondary colors
3. **Email Templates**: Customize email signatures and headers
4. **Login Page**: Add your company branding to the login screen

## Organizational Structure

### Departments

Create departments to mirror your company structure:

1. **Add Department**: Go to **Settings > Departments**
2. **Department Name**: Choose clear, descriptive names
3. **Department Head**: Assign a manager
4. **Parent Department**: Create sub-departments if needed
5. **Budget**: Set department budgets (optional)

### Locations

If you have multiple offices:

1. **Add Location**: **Settings > Locations**
2. **Address**: Full address for each location
3. **Time Zone**: Set local time zone
4. **Working Hours**: Define office hours
5. **Holiday Calendar**: Set location-specific holidays

## Working Hours and Policies

### Standard Working Hours

Set your company's standard working schedule:

- **Start Time**: When the workday begins
- **End Time**: When the workday ends
- **Break Duration**: Standard lunch break length
- **Work Week**: Which days are considered working days

### Leave Policies

Configure basic leave settings:

- **Annual Leave**: Default annual leave allowance
- **Sick Leave**: Sick leave policy
- **Public Holidays**: Official holidays
- **Probation Period**: New employee probation length

## Security Settings

### Access Controls

Protect your sensitive HR data:

1. **Two-Factor Authentication**: Require 2FA for all users
2. **Session Timeout**: Auto-logout after inactivity
3. **Password Policy**: Set password requirements
4. **IP Restrictions**: Limit access to specific IP ranges

### Data Privacy

Configure privacy settings:

- **Data Retention**: How long to keep employee data
- **Export Permissions**: Who can export data
- **Audit Log**: Track all system changes
- **GDPR Compliance**: Enable GDPR features

## Integration Settings

### Email Configuration

Set up email sending:

1. **SMTP Settings**: Configure your email server
2. **Email Templates**: Customize notification emails
3. **Sending Limits**: Set daily email limits
4. **Bounce Handling**: Manage bounced emails

### Calendar Integration

Connect with external calendars:

- **Google Calendar**: Sync with Google Workspace
- **Outlook Calendar**: Connect with Microsoft 365
- **CalDAV**: Use other calendar services

## Notification Preferences

### System Notifications

Choose what notifications to send:

- **Job Applications**: New application alerts
- **Leave Requests**: Leave request notifications
- **Payroll**: Payroll processing alerts
- **System Updates**: Platform maintenance notices

### Email Frequency

Control how often emails are sent:

- **Immediate**: Real-time notifications
- **Daily Digest**: Summary emails
- **Weekly**: Weekly summaries
- **Never**: Disable specific notifications

## Best Practices

### Regular Maintenance

Keep your profile up to date:

- Review company details quarterly
- Update employee information monthly
- Check security settings regularly
- Backup important data

### Compliance

Stay compliant with local regulations:

- Keep tax information current
- Update labor law settings
- Maintain accurate employee records
- Follow data protection laws

## Troubleshooting

### Common Issues

**Can't save company profile:**
- Check all required fields are filled
- Verify email format is correct
- Ensure logo meets size requirements

**Departments not showing:**
- Check user permissions
- Verify department is active
- Clear browser cache

**Emails not sending:**
- Verify SMTP settings
- Check email templates
- Review sending limits

## Next Steps

After configuring your company profile:

- [Invite team members](/en/help-center/articles/team-invitation)
- [Set up payroll](/en/help-center/articles/payroll-setup)
- [Configure leave policies](/en/help-center/articles/leave-policies)
- [Create job postings](/en/help-center/articles/getting-started)
      `,
            tags: ['company', 'profile', 'settings', 'departments']
        },
        'team-invitation': {
            id: 'team-invitation',
            title: 'Inviting Team Members',
            description: 'How to add users, assign roles, and manage team permissions.',
            category: 'getting-started',
            categoryName: 'Getting Started',
            readTime: '6 min',
            lastUpdated: '2024-02-12',
            content: `
# Inviting Team Members

Learn how to add users to your HR account, assign appropriate roles, and manage permissions effectively.

## User Roles Overview

HR uses a role-based access control system. Here are the main roles:

### Admin
- Full access to all features
- Can manage company settings
- Can add/remove users
- Can handle billing and subscriptions

### HR Manager
- Access to all HR features
- Can manage employee data
- Can process payroll
- Can approve leave requests

### Hiring Manager
- Access to recruitment features
- Can post jobs and review candidates
- Can conduct interviews
- Limited access to employee data

### Employee
- Self-service access to own data
- Can request leave
- Can view payslips
- Can update personal information

## Inviting New Users

### Step 1: Navigate to User Management

Go to **Settings > Users** and click **"Invite User"**.

### Step 2: Enter User Details

Fill in the required information:

- **Email Address**: Must be a valid work email
- **First Name**: User's given name
- **Last Name**: User's family name
- **Department**: Assign to appropriate department
- **Role**: Select the user's role
- **Manager**: Assign direct manager (if applicable)

### Step 3: Set Permissions

Configure access based on the selected role:

- **Custom Permissions**: Override default role permissions
- **Department Access**: Limit access to specific departments
- **Feature Access**: Enable/disable specific features
- **Data Access**: Set data viewing permissions

### Step 4: Send Invitation

Click **"Send Invitation"**. The user will receive:

- Email invitation with signup link
- Temporary password (if applicable)
- Welcome message with getting started guide
- Deadline to accept invitation (default: 7 days)

## Managing Pending Invitations

### View Invitations

From **Settings > Users**, you can see:

- **Pending**: Invitations not yet accepted
- **Accepted**: Users who have joined
- **Expired**: Invitations that have timed out
- **Failed**: Invitations that couldn't be delivered

### Resend Invitations

For pending invitations:

1. Select the invitation
2. Click **"Resend"**
3. Optionally add a personal message
4. Confirm to resend

### Cancel Invitations

To cancel an invitation:

1. Select the invitation
2. Click **"Cancel"**
3. Confirm cancellation
4. User will not be able to join with that link

## Managing Existing Users

### Editing User Information

Update user details:

1. Go to **Settings > Users**
2. Select the user
3. Click **"Edit"**
4. Update information
5. Save changes

### Changing User Roles

Promote or demote users:

1. Select the user
2. Click **"Change Role"**
3. Select new role
4. Confirm role change
5. User receives notification of change

### Deactivating Users

When someone leaves the company:

1. Select the user
2. Click **"Deactivate"**
3. Choose deactivation date
4. Assign replacement (if applicable)
5. Confirm deactivation

## Permission Management

### Custom Permissions

Create custom permission sets:

1. Go to **Settings > Permissions**
2. Click **"Create Permission Set"**
3. Select features to allow/deny
4. Save with descriptive name
5. Assign to users or roles

### Department Access

Control department-level access:

- **Full Access**: Can view/edit all department data
- **Read Only**: Can view but not edit
- **No Access**: Cannot access department data
- **Own Data Only**: Can only access own records

### Feature Restrictions

Limit access to specific features:

- **Recruitment**: Job posting, candidate management
- **Employee Data**: Personal information, documents
- **Payroll**: Salary information, payslips
- **Reports**: Analytics and reporting
- **Settings**: System configuration

## Best Practices

### Security

- Use the principle of least privilege
- Review permissions regularly
- Remove access for departed employees immediately
- Enable two-factor authentication for all users

### Onboarding

- Send welcome emails with role-specific guides
- Schedule training sessions for new users
- Assign a mentor for complex roles
- Provide documentation and resources

### Compliance

- Document all access permissions
- Regular audit of user access
- Maintain access logs
- Follow data protection regulations

## Troubleshooting

### Common Issues

**User didn't receive invitation:**
- Check email address spelling
- Verify email isn't in spam folder
- Resend the invitation
- Check email delivery settings

**Can't assign role:**
- Verify you have admin permissions
- Check if role limit is reached
- Ensure user is not already assigned
- Try refreshing the page

**User can't access features:**
- Verify role permissions
- Check department access settings
- Review custom permissions
- Ensure user account is active

## Integration with Directory Services

### LDAP/Active Directory

Connect with your existing directory:

1. Go to **Settings > Integrations**
2. Select **LDAP/Active Directory**
3. Enter server details
4. Configure sync settings
5. Test connection

### Google Workspace

Sync with Google accounts:

1. Enable Google Workspace integration
2. Authenticate with Google
3. Select user groups to sync
4. Configure role mapping
5. Start synchronization

## Next Steps

After inviting your team:

- [Configure department settings](/en/help-center/articles/company-setup)
- [Set up leave policies](/en/help-center/articles/leave-policies)
- [Create job postings](/en/help-center/articles/getting-started)
- [Train your team](/en/help-center/categories/getting-started)
      `,
            tags: ['team', 'users', 'permissions', 'roles']
        },
        'mobile-app-setup': {
            id: 'mobile-app-setup',
            title: 'Mobile App Setup',
            description: 'Install the HR mobile app, sign in securely, and enable notifications.',
            category: 'getting-started',
            categoryName: 'Getting Started',
            readTime: '4 min',
            lastUpdated: '2024-02-22',
            content: `
# Mobile App Setup

Get your team using the HR mobile app to manage leave, approvals, and notifications on the go. This guide covers installation, secure sign-in, and notification best practices.

## Requirements

- iOS 15+ or Android 10+
- Company account on HR
- An active user login with email and password or SSO (Google / Microsoft)

## Install the App

1. Open the **App Store** (iOS) or **Google Play** (Android).
2. Search for **"HR Platform"**.
3. Tap **Install** and wait for the download to complete.
4. Open the app once installed.

## Sign In Securely

1. Enter your **work email**.
2. Choose **Password** or **Sign in with Google / Microsoft** if SSO is enabled.
3. If prompted, complete **Two-Factor Authentication** (email or authenticator app).
4. Stay signed in on trusted devices only.

## Enable Push Notifications

- Allow notifications on first launch to receive leave approvals, payslip availability, and system alerts.
- To adjust later, go to **Profile > Notifications** and toggle **Push** on for the events you need.
- Managers should enable **Approvals** to action requests quickly.

## Biometrics & Device Security

- Enable **Face ID / Touch ID / Fingerprint** in **Profile > Security** for faster unlock.
- Keep your device lock screen enabled; the app respects OS-level security.
- Lost device? Ask an admin to **invalidate sessions** under **Settings > Users > [Your Name]**.

## Offline & Sync Behavior

- Key actions (view balances, submit leave) queue offline and sync when back online.
- Pending actions show a small **sync** badge; leave the app open briefly after reconnecting.

## Troubleshooting

- **Can't find the app**: Ensure you're searching the correct store region.
- **SSO fails**: Confirm your HR email matches your Google/Microsoft account.
- **No push alerts**: Check OS notification permissions and in-app notification toggles.
- **Stuck login**: Force close the app and retry; if it persists, reset password via the email link.

## Next Steps

- [Manage leave requests](/en/help-center/articles/leave-requests)
- [Use the team calendar](/en/help-center/articles/team-calendar)
- [Configure user permissions](/en/help-center/articles/user-permissions)
            `,
            tags: ['mobile', 'app', 'notifications', 'security']
        },
        'candidate-screening': {
            id: 'candidate-screening',
            title: 'Candidate Screening Best Practices',
            description: 'Design structured screening, configure scorecards, and keep hiring decisions consistent.',
            category: 'getting-started',
            categoryName: 'Getting Started',
            readTime: '7 min',
            lastUpdated: '2024-02-21',
            content: `
# Candidate Screening Best Practices

Build a consistent, fair screening process so every candidate is evaluated the same way and decisions are well documented.

## Define Screening Criteria

- Align on 4–6 core criteria (e.g., role experience, problem-solving, communication, culture add).
- Convert each criterion into a **scorecard** with clear 1–5 descriptions.
- Avoid vague labels like "strong"—write objective anchors ("Can independently design X").

## Configure Scorecards in HR

1. Go to **Recruiting > Scorecards**.
2. Create a **new scorecard** for the role.
3. Add criteria with short evidence notes (what good looks like).
4. Toggle **Mandatory notes** to require justification for strong/weak scores.

## Screen Efficiently

- Use the **Quick Screen** view to scan resumes and cover letters side-by-side.
- Apply **knock-out questions** in the application form (e.g., work eligibility, language level).
- Filter by **source**, **tags**, and **score** to prioritize.

## Reduce Bias

- Hide personal fields (photo, age, address) during initial review when possible.
- Use paired reviewers for critical roles; compare scorecards before deciding.
- Track **source-to-offer** conversions to spot biased drop-off points.

## Communicate with Candidates

- Set **auto-replies** per stage: application received, passed screen, rejected.
- Use templates with personalized merge fields (name, role, next step).
- Keep response times under 48 hours to protect employer brand.

## Handoff to Interviews

- Move qualified candidates to **Phone Screen** or **Interview** stages.
- Include **scorecard summaries** and links to uploaded assessments.
- Add **internal notes** about red flags or follow-up questions.

## Reporting

- Monitor **time-in-stage**; aim for <5 days in Screening.
- Check **conversion rates** from Applied → Screened → Interview.
- Export screening data for compliance and calibration sessions.

## Next Steps

- [Schedule interviews](/en/help-center/articles/interview-scheduling)
- [Use the ATS pipeline](/en/help-center/articles/ats-pipeline)
- [Post your first job](/en/help-center/articles/first-job-posting)
            `,
            tags: ['recruiting', 'screening', 'scorecards', 'bias']
        },
        'employee-data': {
            id: 'employee-data',
            title: 'Managing Employee Information',
            description: 'How to add, update, and manage employee records and personal data.',
            category: 'getting-started',
            categoryName: 'Getting Started',
            readTime: '7 min',
            lastUpdated: '2024-02-14',
            content: `
# Managing Employee Information

HR centralizes all employee data in a secure, GDPR-compliant employee directory. This guide explains how to add, update, and manage employee records.

## Employee Profiles

Each employee has a comprehensive profile containing:

- **Personal Information**: Name, date of birth, contact details
- **Employment Details**: Start date, job title, department, employment type
- **Compensation**: Salary, bonus structure, benefits
- **Documents**: Contracts, certifications, ID copies

## Adding a New Employee

### Step 1: Create Employee Record

Navigate to **Employees > Add Employee** and fill in:

1. **First & Last Name**
2. **Personal Email** (for the invitation)
3. **Job Title**
4. **Department**
5. **Start Date**
6. **Employment Type**: Full-time, Part-time, Contractor

### Step 2: Set Compensation

Under the **Compensation** tab:

- Base salary and currency
- Pay frequency (monthly, bi-weekly)
- Bonus eligibility
- Benefits package

### Step 3: Assign Equipment & Access

- Assign company equipment (laptop, phone)
- Grant system access and software licences
- Set up onboarding tasks

## Updating Employee Records

### Editing Basic Details

1. Go to **Employees** and select the employee
2. Click **Edit Profile**
3. Update the required fields
4. Click **Save Changes** — all edits are logged in the audit trail

### Recording Role Changes

When an employee is promoted or changes department:

1. Open the employee record
2. Go to **Employment History**
3. Click **Add Change**
4. Select: Promotion, Transfer, Title Change
5. Enter effective date and new details

## Bulk Import

Import multiple employees at once:

1. Go to **Employees > Import**
2. Download the CSV template
3. Fill in employee data
4. Upload the file
5. Review and confirm import

## Data Access Controls

Control who can see employee data:

- **HR Managers**: Full access to all records
- **Department Managers**: Access to their team's data
- **Employees**: Own record only (self-service)

## Troubleshooting

**Duplicate employee records:**
- Merge duplicates from **Employees > Merge Records**
- Always search before creating a new record

**Missing fields:**
- Check your company's required field configuration under **Settings > Employee Fields**

## Next Steps

- [Set up the org chart](/en/help-center/articles/org-chart)
- [Manage employee documents](/en/help-center/articles/employee-documents)
- [Configure leave policies](/en/help-center/articles/leave-policies)
            `,
            tags: ['employees', 'records', 'data', 'profiles']
        },
        'org-chart': {
            id: 'org-chart',
            title: 'Using the Organizational Chart',
            description: 'Visualize your company structure, manage reporting lines, and navigate the org chart.',
            category: 'getting-started',
            categoryName: 'Getting Started',
            readTime: '5 min',
            lastUpdated: '2024-02-18',
            content: `
# Using the Organizational Chart

The org chart gives you a live, visual overview of your company's structure — departments, teams, and reporting relationships — all automatically kept in sync with your employee data.

## Accessing the Org Chart

Go to **Company > Org Chart** in the left sidebar. The chart loads automatically based on your current employee and department data.

## Navigating the Chart

### Pan and Zoom

- **Scroll** to zoom in and out
- **Click and drag** the background to pan
- **Double-click** a node to focus on that person's subtree
- Use the **mini-map** in the bottom-right corner for quick navigation

### Search

Use the search bar at the top to find any employee by name, title, or department. The chart highlights and centres on the matched node.

### Expand / Collapse

Click the **▶ / ▼** arrow on any manager node to expand or collapse their direct reports. This is useful for exploring large organisations.

## Reading the Chart

Each card in the org chart shows:

- **Employee photo** (or initials if no photo is set)
- **Full name**
- **Job title**
- **Department**
- A **link icon** to open the full employee profile

Solid lines represent **direct reporting** relationships. Dotted lines indicate **dotted-line** or matrix reporting relationships.

## Setting Reporting Lines

### Assigning a Manager

1. Open the employee's profile (**Employees > [Name]**)
2. Click **Edit Profile**
3. Find the **Reports To** field
4. Search and select the manager
5. Save — the org chart updates immediately

### Changing a Manager

Follow the same steps. The previous reporting line is recorded in the employee's **Employment History** for audit purposes.

### Matrix / Dotted-Line Reporting

For employees with secondary managers (common in matrix organisations):

1. Open the employee profile
2. Go to the **Reporting** tab
3. Click **Add Dotted-Line Manager**
4. Select the secondary manager
5. Save

## Exporting the Org Chart

Export a snapshot of your org chart:

1. Click the **Export** button (top-right)
2. Choose format: **PDF**, **PNG**, or **SVG**
3. Select layout: Portrait or Landscape
4. Click **Download**

The exported file includes all visible nodes at the current zoom level.

## Org Chart Settings

Customise the display under **Settings > Org Chart**:

- **Show / hide photos**
- **Display fields**: choose which fields appear on each card (title, department, location, etc.)
- **Colour coding**: colour nodes by department or location
- **Layout direction**: top-down or left-right

## Troubleshooting

**Employee not appearing in the chart:**
- Check that the employee's record is **Active**
- Verify the **Reports To** field is set correctly
- Refresh the page — the chart updates in real time but may need a manual refresh after bulk imports

**Reporting line shows incorrectly:**
- Review the **Reports To** field on the employee's profile
- Check for circular reporting (A reports to B, B reports to A) — the system will flag this as an error

## Next Steps

- [Manage employee documents](/en/help-center/articles/employee-documents)
- [Set up leave policies](/en/help-center/articles/leave-policies)
- [Configure user permissions](/en/help-center/articles/user-permissions)
            `,
            tags: ['org-chart', 'structure', 'reporting', 'hierarchy', 'departments']
        },
        'employee-documents': {
            id: 'employee-documents',
            title: 'Managing Employee Documents',
            description: 'Upload, organise, and control access to employee contracts, certificates, and other documents.',
            category: 'getting-started',
            categoryName: 'Getting Started',
            readTime: '6 min',
            lastUpdated: '2024-02-16',
            content: `
# Managing Employee Documents

HR provides a secure document management system for storing, organising, and sharing employee documents such as contracts, certificates, and ID documents.

## Document Storage

All documents are stored with:

- **256-bit AES encryption** at rest
- **TLS 1.3** in transit
- **Role-based access control**
- A full **audit trail** of every view, download, or change

## Uploading Documents

### For a Single Employee

1. Go to **Employees > [Employee Name]**
2. Click the **Documents** tab
3. Click **Upload Document**
4. Select document type (Contract, ID, Certificate, etc.)
5. Choose the file (PDF, DOCX, or image — max 20 MB)
6. Set an optional **expiry date** (useful for certifications)
7. Click **Upload**

### Bulk Upload

1. Go to **Documents > Bulk Upload**
2. Prepare a ZIP file with documents named after employee IDs
3. Upload the ZIP and map document types
4. Confirm to process

## Document Types

Standard document categories:

| Type | Examples |
|------|---------|
| Contract | Employment agreement, amendments |
| Identity | Passport, national ID |
| Certification | Professional licences, training certificates |
| Performance | Appraisal forms, PIPs |
| Payroll | Tax forms, bank details |
| Other | Any miscellaneous document |

## Access Control

### Who Can See What

- **HR Managers**: All documents for all employees
- **Department Managers**: Contracts and certificates for their team (configurable)
- **Employees**: Their own documents only

### Restricting Sensitive Documents

For highly sensitive documents (e.g., disciplinary records):

1. Upload the document
2. Under **Access**, select **Restricted**
3. Choose specific users or roles who can access it

## Document Expiry Alerts

Set expiry dates on certifications and licences. HR will:

- Send an email reminder **30 days before** expiry
- Send a second reminder **7 days before**
- Mark the document as **Expired** on the due date
- Optionally notify the employee's manager

Configure alert timing under **Settings > Document Alerts**.

## E-Signatures

Request digital signatures directly from HR:

1. Upload the document
2. Click **Request Signature**
3. Add signatories (employee, manager, HR)
4. Set a deadline
5. Click **Send** — signatories receive an email with a secure signing link

Completed documents are stored automatically with a timestamped audit trail.

## Troubleshooting

**Upload fails:**
- Check file size (max 20 MB)
- Ensure format is PDF, DOCX, PNG, or JPG
- Try a different browser

**Employee can't see their document:**
- Check the document's access settings
- Confirm the employee's account is active

## Next Steps

- [Manage leave requests](/en/help-center/articles/leave-requests)
- [Set up payroll](/en/help-center/articles/payroll-setup)
- [GDPR compliance settings](/en/help-center/articles/gdpr-compliance)
            `,
            tags: ['documents', 'contracts', 'storage', 'e-signature']
        },
        'leave-requests': {
            id: 'leave-requests',
            title: 'Managing Leave Requests',
            description: 'How employees submit leave requests and how managers review and approve them.',
            category: 'time-off',
            categoryName: 'Time Off',
            readTime: '6 min',
            lastUpdated: '2024-02-20',
            content: `
# Managing Leave Requests

HR streamlines the leave request process for both employees and managers, with automated balance tracking and calendar integration.

## Submitting a Leave Request (Employee)

1. Go to **Time Off > New Request**
2. Select **Leave Type** (Annual, Sick, Parental, etc.)
3. Choose **Start Date** and **End Date**
4. Add an optional **Note** for your manager
5. Click **Submit Request**

You'll receive an email confirmation, and your manager is notified immediately.

## Reviewing Requests (Manager)

### Viewing Pending Requests

Go to **Time Off > Approvals**. All pending requests from your direct reports appear here, showing:

- Employee name
- Leave type and dates
- Remaining balance
- Team calendar conflicts (if any)

### Approving or Declining

1. Click a request to open it
2. Review the details and team calendar
3. Click **Approve** or **Decline**
4. Optionally add a message
5. The employee is notified immediately

### Delegating Approval

When you're away:

1. Go to **Settings > Approval Delegation**
2. Select a delegate
3. Set the delegation period
4. Save — the delegate receives approval authority for that period

## Leave Balances

Employees and managers can view leave balances under **Time Off > Balances**:

- Available days
- Used days (this year)
- Pending (awaiting approval)
- Carried over from last year

Balances update automatically when a request is approved.

## Leave Calendar

The **Team Calendar** shows all approved leave across your team in a shared view, making it easy to plan cover. See [Team Calendar](/en/help-center/articles/team-calendar) for details.

## Cancelling a Request

Employees can cancel a **pending** request themselves:

1. Go to **Time Off > My Requests**
2. Select the request
3. Click **Cancel Request**

For **approved** leave, the employee must contact HR or their manager to cancel.

## Troubleshooting

**Request shows wrong balance:**
- Check that the leave type is configured correctly in **Leave Policies**
- Verify the employee's start date is correct

**Manager not receiving notifications:**
- Check notification settings under **Settings > Notifications**
- Verify the manager is correctly set in the employee's profile

## Next Steps

- [Configure leave policies](/en/help-center/articles/leave-policies)
- [View the team calendar](/en/help-center/articles/team-calendar)
            `,
            tags: ['leave', 'time-off', 'requests', 'approval']
        },
        'leave-policies': {
            id: 'leave-policies',
            title: 'Configuring Leave Policies',
            description: 'Set up leave types, accrual rules, carry-over limits, and approval workflows.',
            category: 'time-off',
            categoryName: 'Time Off',
            readTime: '8 min',
            lastUpdated: '2024-02-19',
            content: `
# Configuring Leave Policies

Leave policies define the types of time off available to your employees, how they accrue, carry-over limits, and who needs to approve them.

## Leave Types

### Default Leave Types

HR comes with standard leave types pre-configured:

| Type | Default Days | Paid |
|------|-------------|------|
| Annual Leave | 20 | Yes |
| Sick Leave | 10 | Yes |
| Parental Leave | 90 | Yes |
| Unpaid Leave | Unlimited | No |

### Creating a Custom Leave Type

1. Go to **Settings > Leave Policies > Leave Types**
2. Click **Add Leave Type**
3. Configure:
   - **Name** (e.g., "Volunteer Day")
   - **Paid / Unpaid**
   - **Default allowance** (days per year)
   - **Requires approval**: Yes / No
   - **Requires documentation** (e.g., medical certificate for sick leave)
4. Save

## Accrual Rules

Control how employees earn leave:

- **Up-front**: Full allowance granted on the employee's anniversary date
- **Monthly**: Days accrue each month (e.g., 1.67 days/month for 20 days/year)
- **Weekly**: Days accrue each week

Configure under **Settings > Leave Policies > Accrual**.

## Carry-Over Limits

Set rules for unused leave at year end:

- **No carry-over**: Unused days are forfeited
- **Carry-over cap**: Maximum days that can roll over (e.g., 5 days)
- **Full carry-over**: All unused days roll to the next year

Set expiry for carried-over days (e.g., must be used by 31 March).

## Approval Workflows

### Single Approver

The employee's direct manager approves all requests.

### Multi-Level Approval

For longer leave (e.g., over 5 days):

1. Direct manager approves first
2. HR then gives final approval

Configure under **Settings > Leave Policies > Approval Rules**.

### Auto-Approval

For certain leave types (e.g., unpaid leave under 1 day), enable **Auto-Approval** to remove the approval step entirely.

## Assigning Policies to Employees

Policies can be assigned:

- **Company-wide**: Applies to all employees
- **By department**: Different rules per department
- **Individually**: Override for a specific employee

Go to **Settings > Leave Policies > Assignments** to configure.

## Public Holidays

Add public holidays to exclude them from leave calculations:

1. Go to **Settings > Public Holidays**
2. Select your country/region
3. HR imports the official calendar automatically
4. Add custom holidays (company-specific days off)

## Troubleshooting

**Leave balance shows incorrectly after policy change:**
- Balances recalculate overnight
- Click **Recalculate Now** in **Settings > Leave Policies** for immediate update

**New employee not accruing leave:**
- Check the employee's start date
- Verify the correct policy is assigned

## Next Steps

- [Manage leave requests](/en/help-center/articles/leave-requests)
- [View the team calendar](/en/help-center/articles/team-calendar)
- [Set up payroll](/en/help-center/articles/payroll-setup)
            `,
            tags: ['leave', 'policy', 'accrual', 'carry-over', 'time-off']
        },
        'team-calendar': {
            id: 'team-calendar',
            title: 'Using the Team Calendar',
            description: 'View team availability, approved leave, and company events in one shared calendar.',
            category: 'time-off',
            categoryName: 'Time Off',
            readTime: '4 min',
            lastUpdated: '2024-02-17',
            content: `
# Using the Team Calendar

The Team Calendar gives everyone a shared view of approved leave, public holidays, and company events, making it easy to plan work and avoid scheduling conflicts.

## Accessing the Calendar

Go to **Time Off > Team Calendar**. The calendar defaults to the current month and shows your immediate team. Use the department filter to view other teams.

## What's Shown

- **Green blocks**: Approved annual leave
- **Blue blocks**: Public holidays
- **Orange blocks**: Other approved leave types (sick, parental, etc.)
- **Grey blocks**: Pending leave (awaiting approval)

## Navigating the Calendar

- Switch between **Month**, **Week**, and **List** views
- Use **◀ ▶** to move between months or weeks
- Filter by **Department** or **Employee** using the top filters
- Click any event to see full details

## Exporting the Calendar

Export a calendar snapshot:

1. Click **Export**
2. Choose **PDF** (for sharing) or **ICS** (to import into Google Calendar / Outlook)
3. Select the date range
4. Download

## Syncing with External Calendars

### Google Calendar

1. Go to **Settings > Integrations > Google Calendar**
2. Authenticate with your Google account
3. Choose which calendars to sync (team leave, public holidays, company events)
4. Events sync automatically — updates appear within 15 minutes

### Microsoft Outlook / Teams

Follow the same steps under **Settings > Integrations > Microsoft 365**.

## Adding Company Events

HR Managers and Admins can add events visible to the whole company:

1. Go to **Team Calendar**
2. Click **+ Add Event**
3. Fill in title, date, and description
4. Set visibility: Company-wide, Department, or Team
5. Save

## Troubleshooting

**Leave not showing on calendar:**
- Confirm the leave request is **Approved** (pending leave shows in grey)
- Check the department filter isn't excluding the employee

**External calendar not syncing:**
- Reconnect the integration under **Settings > Integrations**
- Allow up to 15 minutes for changes to propagate

## Next Steps

- [Submit leave requests](/en/help-center/articles/leave-requests)
- [Configure leave policies](/en/help-center/articles/leave-policies)
            `,
            tags: ['calendar', 'team', 'leave', 'availability', 'schedule']
        },
        'payroll-setup': {
            id: 'payroll-setup',
            title: 'Setting Up Payroll',
            description: 'Configure payroll cycles, payment methods, deductions, and run your first payroll.',
            category: 'payroll',
            categoryName: 'Payroll',
            readTime: '10 min',
            lastUpdated: '2024-02-13',
            content: `
# Setting Up Payroll

HR includes a full payroll engine for Bulgarian labour law compliance, including automated social insurance and tax calculations.

## Payroll Configuration

### Pay Cycle

1. Go to **Payroll > Settings**
2. Set your **Pay Frequency**: Monthly (most common in Bulgaria), Bi-weekly
3. Set your **Pay Date**: e.g., the last working day of each month
4. Set the **Payroll Cut-off Date**: the date after which changes don't apply to the current period

### Bank Account Details

Connect your company's bank account for direct salary payments:

1. Go to **Payroll > Settings > Bank Account**
2. Enter IBAN and bank details
3. Verify with a small test transaction
4. Enable **Direct Deposit**

## Adding Salary Information

For each employee:

1. Open the employee profile
2. Go to the **Compensation** tab
3. Enter:
   - **Gross Salary** (BGN)
   - **Employment Type**: Full-time, Part-time, Contractor
   - **Social Insurance Category**
   - **Additional Allowances**: Transport, food vouchers, etc.

## Statutory Deductions (Bulgaria)

HR automatically calculates:

| Deduction | Employee | Employer |
|-----------|----------|----------|
| Social Insurance (ДОО) | 7.9% | 9.9% |
| Health Insurance | 3.2% | 4.8% |
| Supplementary Pension (ДЗПО) | 2% | 2.8% |
| Income Tax (ДДФЛ) | 10% on net | — |

Rates are updated automatically when legislation changes.

## Running Payroll

### Step 1: Review the Payroll Draft

Before processing, go to **Payroll > Run Payroll** and review:

- All employee salaries for the period
- Deductions (social insurance, tax)
- Leave deductions (unpaid leave days)
- Bonuses or one-off payments

### Step 2: Make Adjustments

Click any employee row to add:

- **Bonus**: One-time payment
- **Deduction**: Ad-hoc deduction
- **Correction**: Fix a previous payroll error

### Step 3: Approve and Process

1. Click **Approve Payroll**
2. Confirm the total net payroll amount
3. HR generates payslips and initiates bank transfers
4. Employees are notified to view their payslip

## Payroll Reports

After processing, download:

- **Payroll Summary**: Total costs for the period
- **Декларация 1 (Декл. 1)**: NRA social insurance declaration
- **Декларация 6 (Декл. 6)**: NRA income tax declaration
- **Bank Transfer File**: For uploading to your bank

## Troubleshooting

**Payroll calculation doesn't match expectations:**
- Check the employee's gross salary and employment type
- Verify the correct social insurance category is assigned
- Review any manual adjustments from previous periods

**Bank transfer fails:**
- Verify IBAN is correct
- Check your company bank account has sufficient funds
- Contact your bank if the issue persists

## Next Steps

- [Configure tax settings](/en/help-center/articles/tax-configuration)
- [Manage payslips](/en/help-center/articles/payslips)
- [GDPR and data compliance](/en/help-center/articles/gdpr-compliance)
            `,
            tags: ['payroll', 'salary', 'deductions', 'tax', 'bank']
        },
        'tax-configuration': {
            id: 'tax-configuration',
            title: 'Tax Configuration',
            description: 'Configure income tax, social insurance rates, and statutory reporting for your country.',
            category: 'payroll',
            categoryName: 'Payroll',
            readTime: '7 min',
            lastUpdated: '2024-02-11',
            content: `
# Tax Configuration

HR handles statutory tax and social insurance calculations automatically. This guide explains how to configure tax settings and stay compliant with Bulgarian tax law.

## Country and Jurisdiction

1. Go to **Settings > Payroll > Tax Configuration**
2. Confirm **Country**: Bulgaria
3. Set your **Municipality** (determines local tax rates where applicable)

## Income Tax (ДДФЛ)

### Flat Rate

Bulgaria uses a flat **10% personal income tax** on net taxable income. HR applies this automatically.

### Tax-Exempt Income

Configure tax exemptions:

- **Young families exemption**: For parents of children under 18
- **Disability exemption**: For employees with certified disability
- **Pension contributions**: Employee pension contributions reduce taxable income

Add exemptions per employee under **Employee Profile > Tax Settings**.

## Social Insurance

### Rate Table

HR maintains the current NRA-published rates and updates them automatically at the start of each year. You can view current rates under **Settings > Payroll > Social Insurance Rates**.

### Social Insurance Categories

Assign the correct category per employee:

| Category | Description |
|----------|-------------|
| 1 | Standard employees |
| 2 | Night shift / hazardous work |
| 3 | Teachers and educators |
| 4 | Mining and underground work |

### Minimum Insurance Base

The minimum insurance base (МРЗ) is enforced automatically — HR will flag any salary below the statutory minimum.

## NRA Declarations

### Декларация 1 (Monthly)

Generated automatically after each payroll run. Submit via:

1. Download from **Payroll > Reports > Decl. 1**
2. Upload to the NRA's ePay portal
3. Or enable **Auto-Submit** to let HR file on your behalf (requires NRA API credentials)

### Декларация 6 (Monthly)

Similarly generated and downloadable from **Payroll > Reports > Decl. 6**.

## Annual Tax Report

At year end, HR generates the **Служебна бележка** (employment income certificate) for each employee:

1. Go to **Payroll > Year End**
2. Review and approve the annual summary
3. Download individual certificates or bulk PDF
4. Distribute to employees (or they can download from their self-service portal)

## Troubleshooting

**Tax calculation seems wrong:**
- Check the employee's tax exemptions
- Verify gross salary and employment type
- Review any manual overrides

**Declaration upload rejected by NRA:**
- Ensure your company's Булстат is correctly configured under **Settings > Company**
- Check that all employee EGN/LNCH numbers are entered

## Next Steps

- [Run payroll](/en/help-center/articles/payroll-setup)
- [View and distribute payslips](/en/help-center/articles/payslips)
            `,
            tags: ['tax', 'NRA', 'social-insurance', 'declarations', 'compliance']
        },
        'payslips': {
            id: 'payslips',
            title: 'Managing Payslips',
            description: 'How payslips are generated, distributed to employees, and accessed through self-service.',
            category: 'payroll',
            categoryName: 'Payroll',
            readTime: '4 min',
            lastUpdated: '2024-02-09',
            content: `
# Managing Payslips

HR automatically generates payslips after each payroll run and makes them available to employees through the self-service portal.

## Payslip Generation

Payslips are generated automatically when payroll is approved. Each payslip includes:

- **Gross salary** breakdown
- **Employer contributions** (social insurance, health)
- **Employee deductions** (social insurance, health, income tax)
- **Net pay**
- **Bonuses and allowances**
- **Leave deductions** (if any unpaid leave was taken)

## Distributing Payslips

### Email Notification

When payslips are ready, employees receive an email notification with a secure link to view and download their payslip. No attachments are sent for security reasons.

Enable or disable email notifications under **Settings > Payroll > Notifications**.

### Self-Service Portal

Employees can access all their payslips from **My Profile > Payslips**:

- View current and historical payslips
- Download as PDF
- Filter by year

### Bulk Download (HR)

HR managers can download all payslips for a period:

1. Go to **Payroll > Payslips**
2. Select the payroll period
3. Click **Download All** → ZIP file containing all PDFs

## Payslip Format

Payslips are generated in Bulgarian and comply with the format required by Bulgarian labour law. The company logo and details appear in the header.

To customise the payslip header or footer, go to **Settings > Payroll > Payslip Template**.

## Correcting a Payslip

If a payslip contains an error:

1. Go to **Payroll > [Period] > Corrections**
2. Select the employee
3. Enter the correction (positive or negative amount)
4. The correction appears in the next payroll run with a note

Retroactive corrections are tracked in the audit log.

## Troubleshooting

**Employee can't see their payslip:**
- Confirm payroll was fully approved for that period
- Check the employee's account is active
- Verify the employee has the correct self-service role

**Payslip shows wrong values:**
- Review the payroll run details in **Payroll > History**
- Check for manual adjustments that may have been applied

## Next Steps

- [Run payroll](/en/help-center/articles/payroll-setup)
- [Tax configuration](/en/help-center/articles/tax-configuration)
            `,
            tags: ['payslips', 'salary', 'payroll', 'self-service']
        },
        'slack-integration': {
            id: 'slack-integration',
            title: 'Slack Integration',
            description: 'Connect HR with Slack to receive notifications, approve requests, and update statuses.',
            category: 'integrations',
            categoryName: 'Integrations',
            readTime: '5 min',
            lastUpdated: '2024-02-08',
            content: `
# Slack Integration

The HR Slack integration delivers real-time notifications to your team's Slack workspace and allows managers to approve leave requests directly from Slack.

## Connecting Slack

1. Go to **Settings > Integrations > Slack**
2. Click **Connect to Slack**
3. Authorise the HR app in your Slack workspace
4. Select the default notification channel (e.g., #hr-notifications)
5. Click **Save**

You'll see a confirmation message in the selected Slack channel.

## What You Can Do in Slack

### Notifications

Receive automatic Slack messages for:

- New leave requests (sent to the manager)
- Leave approved / declined (sent to the employee)
- New job application received
- Payslip available
- Document expiry reminders

### Approve / Decline Requests

Managers can act directly in Slack without opening HR:

When a leave request notification arrives, click **Approve** or **Decline** on the Slack message. The action is recorded in HR and the employee is notified.

### Slash Commands

Use **/hr** commands in any Slack channel:

| Command | Action |
|---------|--------|
| /hr leave | Submit a leave request |
| /hr balance | Check your leave balance |
| /hr team | See who's off today |
| /hr help | List all commands |

## Configuring Notifications

Customise which events send a Slack message:

1. Go to **Settings > Integrations > Slack > Notifications**
2. Toggle each notification type on or off
3. Choose the channel for each notification type

Per-user preferences can be set under **My Profile > Notification Preferences**.

## Disconnecting Slack

To remove the integration:

1. Go to **Settings > Integrations > Slack**
2. Click **Disconnect**
3. Confirm — notifications will stop immediately

## Troubleshooting

**Not receiving Slack notifications:**
- Check the HR app is installed in your workspace (**Slack > Apps**)
- Verify the notification channel is correct and the app is a member
- Check your notification settings in HR

**Slash commands not working:**
- Re-install the HR Slack app
- Ensure your Slack email matches your HR email

## Next Steps

- [Connect Google Workspace](/en/help-center/articles/google-workspace)
            `,
            tags: ['slack', 'integration', 'notifications', 'approval']
        },
        'google-workspace': {
            id: 'google-workspace',
            title: 'Google Workspace Integration',
            description: 'Sync employees, calendars, and directories with Google Workspace.',
            category: 'integrations',
            categoryName: 'Integrations',
            readTime: '6 min',
            lastUpdated: '2024-02-07',
            content: `
# Google Workspace Integration

Connecting HR with Google Workspace allows you to sync your employee directory, calendar, and single sign-on (SSO) in one setup.

## Connecting Google Workspace

### Prerequisites

- Google Workspace Admin account
- HR Admin role

### Setup Steps

1. Go to **Settings > Integrations > Google Workspace**
2. Click **Connect with Google**
3. Sign in as a Google Workspace Admin
4. Grant the requested permissions (directory read, calendar write)
5. Select your domain
6. Click **Save**

## Features

### Single Sign-On (SSO)

Once connected, employees can log in to HR using their Google account — no separate password needed.

Enable SSO under **Settings > Security > Single Sign-On > Google**.

### Directory Sync

Sync your Google Workspace directory to HR:

- New users added in Google Workspace are automatically created in HR
- Deactivated Google accounts are deactivated in HR on the next sync
- Sync runs every 4 hours (or trigger manually from the integration settings)

### Calendar Sync

Approved leave and company events appear in employees' Google Calendars automatically.

- Events are written to the **HR** calendar in each user's Google Calendar
- Employees can subscribe or unsubscribe from their Google Calendar settings

## Managing the Sync

### Manual Sync

Trigger an immediate sync:

1. Go to **Settings > Integrations > Google Workspace**
2. Click **Sync Now**
3. Review the sync log for any conflicts

### Conflict Resolution

If a user exists in both systems with different details (e.g., different email):

- HR flags the conflict in the **Sync Log**
- HR manually resolves by choosing the master record

## Disconnecting

1. Go to **Settings > Integrations > Google Workspace**
2. Click **Disconnect**
3. Confirm — SSO and sync stop immediately; existing user accounts are preserved

## Troubleshooting

**Sync not running:**
- Check that the connected Google account still has Admin access
- Review the sync log for API errors
- Re-authenticate by clicking **Reconnect**

**SSO login fails:**
- Verify the user's Google email matches their HR email
- Check that SSO is enabled in **Settings > Security**

## Next Steps

- [Slack integration](/en/help-center/articles/slack-integration)
- [User permissions](/en/help-center/articles/user-permissions)
            `,
            tags: ['google', 'workspace', 'SSO', 'directory', 'calendar', 'sync']
        },
        'gdpr-compliance': {
            id: 'gdpr-compliance',
            title: 'GDPR Compliance',
            description: 'How HR helps you meet GDPR obligations: data requests, retention, consent, and audit logs.',
            category: 'security',
            categoryName: 'Security & Compliance',
            readTime: '8 min',
            lastUpdated: '2024-02-05',
            content: `
# GDPR Compliance

HR is built with GDPR in mind. This guide explains the tools available to help you meet your obligations as a data controller.

## Data Processing Overview

HR acts as a **data processor** on your behalf. You are the **data controller** responsible for the legal basis of processing employee personal data.

Your Data Processing Agreement (DPA) is available under **Settings > Legal > Data Processing Agreement**.

## Enabling GDPR Features

1. Go to **Settings > Privacy & Compliance**
2. Toggle **GDPR Mode: On**
3. Configure your data retention periods

## Subject Access Requests (SAR)

When an employee (data subject) requests a copy of their data:

1. Go to **Settings > Privacy > Subject Access Requests**
2. Click **New SAR**
3. Search for the employee
4. Click **Generate Data Export**
5. Download the ZIP containing all their data in machine-readable format
6. Deliver to the employee within 30 days (GDPR requirement)

## Right to Erasure ("Right to be Forgotten")

To delete an employee's personal data after their employment ends:

1. Go to the employee profile
2. Click **More > Request Data Erasure**
3. Confirm — HR anonymises personal data while retaining aggregate payroll records required by law (Bulgarian Tax Act requires 10-year retention of payroll records)

Data erasure is logged in the **Compliance Audit Log**.

## Data Retention Policies

Configure how long different data types are retained:

| Data Type | Legal Minimum | Default |
|-----------|--------------|---------|
| Payroll records | 10 years | 10 years |
| Leave records | 5 years | 5 years |
| Recruitment data | 6 months | 6 months |
| Employee documents | Duration of employment + 5 years | Configurable |

Go to **Settings > Privacy > Retention Policies** to adjust.

## Consent Management

For optional data processing (e.g., using employee photos on public profiles):

1. Go to **Settings > Privacy > Consent Types**
2. Define what you're asking consent for
3. Employees are prompted to consent when they first log in
4. Consent records are timestamped and stored

## Audit Log

Every action in HR is logged:

- Who accessed what data and when
- Changes to employee records
- Data exports and erasures
- Login events and failed attempts

Access the audit log at **Settings > Security > Audit Log**. Logs are retained for 2 years.

## Data Breach Response

If you suspect a data breach:

1. Go to **Settings > Privacy > Incident Response**
2. Click **Report Incident**
3. Document the breach details
4. HR generates a notification template for the supervisory authority (CPDP in Bulgaria)

## Troubleshooting

**Can't complete a data erasure:**
- Some records may be legally required to be retained — HR will explain which records cannot be deleted and why
- Contact support if you believe a record should be erasable

## Next Steps

- [User permissions](/en/help-center/articles/user-permissions)
- [Backup and recovery](/en/help-center/articles/backup-recovery)
            `,
            tags: ['GDPR', 'privacy', 'compliance', 'data', 'security']
        },
        'user-permissions': {
            id: 'user-permissions',
            title: 'User Permissions & Roles',
            description: 'Configure role-based access control, custom permission sets, and data visibility rules.',
            category: 'security',
            categoryName: 'Security & Compliance',
            readTime: '7 min',
            lastUpdated: '2024-02-04',
            content: `
# User Permissions & Roles

HR uses a flexible role-based access control (RBAC) system that lets you control exactly what each user can see and do.

## Built-in Roles

| Role | Description |
|------|-------------|
| **Admin** | Full access to all features and settings |
| **HR Manager** | Full HR access: employees, payroll, leave, documents |
| **Payroll Manager** | Payroll and compensation data only |
| **Hiring Manager** | Recruitment features and candidate management |
| **Department Manager** | View and manage their own team |
| **Employee** | Self-service: own data, leave requests, payslips |

## Assigning Roles

1. Go to **Settings > Users**
2. Select a user
3. Click **Edit Role**
4. Select the role
5. Save — changes take effect immediately

## Custom Permission Sets

If built-in roles don't fit, create a custom set:

1. Go to **Settings > Roles & Permissions**
2. Click **Create Custom Role**
3. Name the role (e.g., "Finance Reviewer")
4. Toggle individual permissions on or off:
   - Employee data (read / write / delete)
   - Payroll (view / run / approve)
   - Documents (view / upload / delete)
   - Reports (view / export)
   - Settings (view / edit)
5. Save and assign to users

## Data Visibility Rules

Control which records a user can see:

### Department Scope

Restrict a user to only see data for their department:

1. Open the user record
2. Under **Data Access**, set **Scope: Department**
3. Select the department(s) they can access

### Individual Scope

For payroll reviewers who should only see their own records — set **Scope: Own Records Only**.

## Sensitive Data Masking

For roles that need access to employee records but shouldn't see salary data:

1. Go to **Settings > Roles & Permissions > [Role Name]**
2. Under **Payroll**, enable **Mask Salary Data**
3. Salary fields show as **** (masked) for users in that role

## Audit of Permissions

Review who has access to what:

1. Go to **Settings > Roles & Permissions > Access Report**
2. Filter by role, department, or feature
3. Export as CSV for compliance reviews

## Troubleshooting

**User can't access a feature they should:**
- Check their role assignment
- Review any custom permissions
- Check department scope isn't too restrictive

**User can see data they shouldn't:**
- Review their role's data visibility settings
- Check if they have a custom permission set that overrides the role

## Next Steps

- [GDPR compliance](/en/help-center/articles/gdpr-compliance)
- [Backup and recovery](/en/help-center/articles/backup-recovery)
- [Team invitation guide](/en/help-center/articles/team-invitation)
            `,
            tags: ['permissions', 'roles', 'access', 'RBAC', 'security']
        },
        'backup-recovery': {
            id: 'backup-recovery',
            title: 'Backup & Data Recovery',
            description: 'How HR backs up your data, how to export it, and how to restore after an incident.',
            category: 'security',
            categoryName: 'Security & Compliance',
            readTime: '5 min',
            lastUpdated: '2024-02-03',
            content: `
# Backup & Data Recovery

HR automatically backs up all your data and provides tools to export or restore it when needed.

## Automatic Backups

HR performs:

- **Continuous replication** to a standby database in a separate data centre
- **Hourly snapshots** retained for 7 days
- **Daily backups** retained for 30 days
- **Monthly backups** retained for 1 year

All backups are encrypted with AES-256 and stored in geo-redundant storage.

You can view the backup status at **Settings > Security > Backup Status**.

## Data Export

Export all your company data at any time:

1. Go to **Settings > Data & Privacy > Export Data**
2. Select what to include:
   - Employee records
   - Payroll history
   - Leave records
   - Documents
   - Audit logs
3. Click **Request Export**
4. You'll receive an email when the export is ready (usually within 30 minutes)
5. Download the encrypted ZIP file — password is sent separately

Exports are available for **30 days** before the link expires.

## Point-in-Time Recovery

If data was accidentally deleted or corrupted:

1. Go to **Settings > Security > Data Recovery**
2. Select the data type and approximate time of the incident
3. Click **Request Recovery**
4. HR support will restore the data within 4 hours (Standard SLA) or 1 hour (Enterprise SLA)

## What Is Covered

| Scenario | Recovery Approach |
|----------|------------------|
| Accidental record deletion | Point-in-time restore from hourly snapshot |
| Bulk data corruption | Restore from last known-good daily backup |
| Platform outage | Automatic failover to standby (< 5 min RTO) |
| Complete data loss | Full restore from geo-redundant backup |

## Business Continuity

### RTO & RPO

- **Recovery Time Objective (RTO)**: < 1 hour for enterprise; < 4 hours for standard
- **Recovery Point Objective (RPO)**: < 1 hour (hourly snapshots)

### Status Page

Check real-time platform status at **status.hr.bg**.

Subscribe to status updates to receive email or Slack alerts for any incidents.

## Downloading Your Data Before Leaving

If you decide to cancel your subscription, you have **90 days** to export all your data. After 90 days, data is permanently deleted per our retention policy.

## Troubleshooting

**Export email not received:**
- Check your spam folder
- Verify the email address under **Settings > Company > Admin Email**
- Trigger a new export from the settings page

**Recovery request not resolved:**
- Check the ticket status in **Settings > Support > Open Tickets**
- Contact support directly at support@hr.bg

## Next Steps

- [GDPR compliance](/en/help-center/articles/gdpr-compliance)
- [User permissions](/en/help-center/articles/user-permissions)
            `,
            tags: ['backup', 'recovery', 'data', 'export', 'security', 'business-continuity']
        },
        'ats-pipeline': {
            id: 'ats-pipeline',
            title: 'ATS Pipeline Management',
            description: 'Managing your recruitment pipeline, tracking candidates, and organizing the hiring process.',
            category: 'getting-started',
            categoryName: 'Getting Started',
            readTime: '7 min',
            lastUpdated: '2024-02-15',
            content: `
# ATS Pipeline Management

Learn how to manage your Applicant Tracking System (ATS) pipeline, track candidates through different stages, and optimize your recruitment workflow.

## Understanding the ATS Pipeline

The ATS pipeline is the backbone of your recruitment process. It organizes candidates into different stages based on their progress in your hiring workflow.

### Default Pipeline Stages

HR comes with these standard stages:

- **Applied**: Initial applications received
- **Screening**: Initial resume review
- **Phone Screen**: Phone interview stage
- **Interview**: In-person or video interview
- **Offer**: Offer extended
- **Hired**: Candidate accepted offer
- **Rejected**: Application rejected

You can customize these stages to match your hiring process.

## Creating a Custom Pipeline

### Step 1: Access Pipeline Settings

Go to **Settings > Recruitment > Pipeline Stages** to customize your hiring workflow.

### Step 2: Add Custom Stages

1. Click **Add Stage**
2. Enter stage name (e.g., "Technical Assessment", "Final Round")
3. Set stage order
4. Configure automatic actions (optional)
5. Save stage

### Step 3: Set Default Actions

For each stage, configure:

- **Email Template**: Automatic email sent to candidate
- **Assessment**: Required tests or assignments
- **Interview Type**: Video, phone, or in-person
- **Duration**: How long candidates stay in this stage

## Managing Candidates Through the Pipeline

### Moving Candidates

**Automated Movement**:
- Set rules to automatically advance candidates based on criteria
- Use scoring and AI screening to move qualified candidates forward

**Manual Movement**:
1. Open candidate profile
2. Click stage selector
3. Choose new stage
4. Add notes (optional)
5. Save

### Bulk Actions

Move multiple candidates at once:

1. Select candidates using checkboxes
2. Click **Bulk Actions**
3. Choose **Change Stage**
4. Select new stage
5. Apply

## Pipeline Analytics

### Track Performance

Monitor your recruitment process:

- **Time per Stage**: How long candidates spend in each stage
- **Conversion Rate**: Percentage advancing to next stage
- **Bottlenecks**: Identify slow stages
- **Drop-off Points**: Where candidates leave

### Generate Reports

1. Go to **Analytics > Recruitment**
2. Select date range
3. Choose metrics:
   - Applications by source
   - Time to hire
   - Stage breakdown
   - Offer acceptance rate
4. Export as PDF or CSV

## AI Screening

### Automated Candidate Screening

Let AI help screen candidates automatically:

1. Go to **Job > AI Screening Settings**
2. Define screening criteria based on job description
3. Set pass score threshold
4. Enable automatic advancement

The AI will:
- Parse resumes automatically
- Score based on qualifications
- Suggest top candidates
- Identify potential matches

### Manual Review

Even with AI screening, always review:

1. Top candidates recommended by AI
2. Borderline candidates for human judgment
3. Special cases or exceptions

## Communication & Notifications

### Automatic Emails

Configure what candidates receive:

- **Application Confirmation**: "We received your application"
- **Stage Change**: "Your application has moved to the next stage"
- **Interview Invitation**: "You're invited for an interview"
- **Rejection**: "We've decided to move forward with other candidates"
- **Offer**: "We're pleased to extend an offer"

### Candidate Portal

Candidates can:
- Track their application status
- View interview schedule
- Upload additional documents
- Communicate with hiring team

## Integration with Calendar

### Automated Scheduling

1. Set interview details in pipeline
2. Calendar invitations sent automatically
3. Candidates receive meeting details via email
4. Reminders sent 24 hours before interview

### Calendar Sync

Connect with:
- **Google Calendar**: Sync with team calendars
- **Outlook**: For Microsoft 365 users
- **Slack**: Receive notifications in Slack

## Team Collaboration

### Assign Candidates

Distribute candidates among hiring team:

1. Open candidate
2. Click **Assign To**
3. Select team member
4. Add internal notes for context

### Interview Feedback

After interviews, team can:
- Submit feedback forms
- Rate candidates
- Add comments and scores
- Discuss with other interviewers

### Decision Making

- View all feedback in one place
- Compare candidate scores
- Create shortlist
- Make hiring decisions

## Best Practices

### Efficient Screening

- Use clear screening questions
- Enable AI to help with initial filtering
- Have clear job requirements
- Remove bias from process

### Timely Communication

- Respond to applicants quickly
- Keep candidates informed
- Send rejection letters promptly
- Offer feedback when possible

### Team Coordination

- Assign clear responsibilities
- Use internal notes for context
- Schedule interviews efficiently
- Document all decisions

### Data Quality

- Keep candidate information current
- Regular pipeline reviews
- Remove duplicate applications
- Archive old candidates

## Troubleshooting

**Candidates not advancing automatically:**
- Check AI screening criteria
- Verify pass score threshold
- Review automation rules
- Test with specific candidate

**Emails not being sent:**
- Verify email templates are configured
- Check SMTP settings
- Review email log for errors
- Ensure no spam filters blocking

**Calendar integration not working:**
- Verify calendar permissions
- Check event details before sending invitations
- Ensure time zones are correct
- Test with manual calendar invite first

## Next Steps

After setting up your pipeline:

- [Post your first job](/en/help-center/articles/first-job-posting)
- [Screen candidates effectively](/en/help-center/articles/candidate-screening)
- [Schedule interviews](/en/help-center/articles/interview-scheduling)
- [Integrate with external tools](/en/help-center/articles/job-board-integration)
            `,
            tags: ['ats', 'pipeline', 'recruitment', 'candidates', 'hiring']
        }
    }

    return articles[articleId]
}

function getRelatedArticles(currentArticleId: string, category: string) {
    const allArticles = [
        'getting-started', 'dashboard-overview', 'company-setup', 'notification-settings',
        'employee-directory', 'employee-data', 'employee-documents',
        'salary-calculator', 'freelancer-comparison', 'hr-document-templates',
        'tax-social-security', 'labor-code-basics', 'data-protection',
        'user-permissions', 'account-settings', 'two-factor-auth', 'data-export'
    ]

    // Simple logic: return other articles from the same category
    return allArticles.filter(id => id !== currentArticleId).slice(0, 3)
}

export default async function ArticlePage({
    params,
}: {
    params: Promise<{ locale: string; article: string }>
}) {
    const { locale, article } = await params

    setRequestLocale(locale)
    const t = await getTranslations('helpCenter')

    const articleData = getArticleData(article)
    if (!articleData) {
        notFound()
    }

    const relatedArticles = getRelatedArticles(article, articleData.category)

    return (
        <div className="min-h-screen bg-white">
            {/* Article Header */}
            <section className="bg-navy-deep text-white py-16">
                <div className="container-xl">
                    <div className="max-w-4xl mx-auto">
                        <HelpCenterBreadcrumbs
                            currentPage="article"
                            category={articleData.category}
                            categoryTitle={articleData.categoryName}
                            article={article}
                            articleTitle={articleData.title}
                            className="mb-8"
                        />

                        <div className="mb-6">
                            <Link
                                href={`/${locale}/help-center/categories/${articleData.category}`}
                                className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm mb-4"
                            >
                                {articleData.categoryName}
                            </Link>
                        </div>

                        <h1 className="text-3xl md:text-4xl font-bold font-heading mb-4">
                            {articleData.title}
                        </h1>

                        <div className="flex items-center gap-4 text-blue-200 text-sm">
                            <span>{articleData.readTime}</span>
                            <span className="w-1 h-1 rounded-full bg-blue-200" />
                            <span>Updated {articleData.lastUpdated}</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Article Content */}
            <SectionReveal>
                <section className="py-20">
                    <div className="container-xl">
                        <div className="max-w-4xl mx-auto">
                            <div className="grid lg:grid-cols-4 gap-8">
                                {/* Table of Contents */}
                                <aside className="lg:col-span-1">
                                    <div className="sticky top-8">
                                        <h3 className="font-semibold mb-4 text-navy text-sm uppercase tracking-wide">{t('article.tocTitle')}</h3>
                                        <nav className="space-y-2 text-sm text-gray-600">
                                            <p className="text-xs text-gray-500 mb-2">
                                                {t('article.tocHint')}
                                            </p>
                                            {/* In a future iteration, this can be generated from structured article content */}
                                        </nav>
                                    </div>
                                </aside>

                                {/* Main Content */}
                                <div className="lg:col-span-3">
                                    <article className="prose prose-lg max-w-none">
                                        <div
                                            dangerouslySetInnerHTML={{ __html: articleData.content.replace(/\n/g, '<br/>') }}
                                            className="text-gray-700 leading-relaxed space-y-6"
                                        />
                                    </article>

                                    <ArticleFeedback articleId={article} />

                                    {/* Tags */}
                                    <div className="mt-8">
                                        <div className="flex flex-wrap gap-2">
                                            {articleData.tags.map((tag: string) => (
                                                <span key={tag} className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
                                                    #{tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </SectionReveal>

            {/* Related Articles */}
            {relatedArticles.length > 0 && (
                <SectionReveal>
                    <section className="py-20 bg-surface-lighter">
                        <div className="container-xl">
                            <div className="max-w-4xl mx-auto">
                                <h2 className="text-2xl font-bold font-heading mb-8 text-navy text-center">
                                    Related Articles
                                </h2>
                                <div className="grid md:grid-cols-3 gap-6">
                                    {relatedArticles.map((relatedId) => {
                                        const relatedArticle = getArticleData(relatedId)
                                        if (!relatedArticle) return null

                                        return (
                                            <Link
                                                key={relatedId}
                                                href={`/${locale}/help-center/articles/${relatedId}`}
                                                className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md hover:border-primary/30 transition-all group"
                                            >
                                                <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors">
                                                    {relatedArticle.title}
                                                </h3>
                                                <p className="text-sm text-gray-600 line-clamp-2">
                                                    {relatedArticle.description}
                                                </p>
                                            </Link>
                                        )
                                    })}
                                </div>
                            </div>
                        </div>
                    </section>
                </SectionReveal>
            )}

            {/* Still Need Help */}
            <SectionReveal>
                <section className="py-20">
                    <div className="container-xl">
                        <div className="max-w-4xl mx-auto text-center">
                            <h2 className="text-3xl font-bold font-heading mb-6 text-navy">
                                Still Need Help?
                            </h2>
                            <p className="text-xl text-gray-600 leading-relaxed mb-8">
                                Our support team is ready to assist you.
                            </p>
                            <div className="grid md:grid-cols-3 gap-6">
                                <div className="bg-surface-lighter p-6 rounded-xl">
                                    <h3 className="font-semibold mb-3">Live Chat</h3>
                                    <p className="text-gray-600 text-sm mb-4">Chat with support in real time.</p>
                                    <button className="text-primary font-semibold hover:text-primary/80 transition-colors">
                                        Start chat
                                    </button>
                                </div>
                                <div className="bg-surface-lighter p-6 rounded-xl">
                                    <h3 className="font-semibold mb-3">Email Support</h3>
                                    <p className="text-gray-600 text-sm mb-4">We&apos;ll reply within 24 hours.</p>
                                    <a href="mailto:support@hr.bg" className="text-primary font-semibold hover:text-primary/80 transition-colors">
                                        support@hr.bg
                                    </a>
                                </div>
                                <div className="bg-surface-lighter p-6 rounded-xl">
                                    <h3 className="font-semibold mb-3">Book a Demo</h3>
                                    <p className="text-gray-600 text-sm mb-4">See HR with a guide.</p>
                                    <button className="text-primary font-semibold hover:text-primary/80 transition-colors">
                                        Schedule demo
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </SectionReveal>
        </div>
    )
}
