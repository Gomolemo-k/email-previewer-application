# Email Previewer Application Product Requirements Document (PRD)

## Goals and Background Context

### Goals

- Provide a user-friendly interface for creating email templates.
- Allow users to preview email templates in real-time.
- Ensure email templates are responsive and look good on all devices.
- Integrate with existing email delivery systems (Resend).
- Reduce the time required to create and test email templates by 50%.
- Improve the quality of emails sent by MkSaaS users.

### Background Context

The MkSaaS template is a comprehensive Next.js boilerplate designed to accelerate the development of profitable SaaS applications. It includes essential SaaS features such as authentication, payments, internationalization, newsletter management, dashboard, blog, documentation, and UI components.

Currently, users of the MkSaaS template who wish to send emails must either use external tools or manually code and test their email templates. This process is time-consuming, error-prone, and often results in emails that don't render consistently across different email clients. The lack of an integrated email previewing solution within the MkSaaS template creates a gap in the development workflow, leading to potential delays in product launches and subpar user experiences.

This PRD outlines the requirements for integrating a comprehensive email previewing feature directly into the MkSaaS template. This feature will include a user-friendly interface for creating and editing email templates, a real-time preview pane that accurately reflects how emails will appear in various email clients, and seamless integration with the existing Resend email delivery system.

### Change Log

| Date | Version | Description | Author |
| :--- | :--- | :--- | :--- |
| 2025-09-15 | 1.0 | Initial draft of the PRD | Product Manager (John) |

## Requirements

### Functional

1. FR1: Users can create new email templates.
2. FR2: Users can edit existing email templates.
3. FR3: Users can save email templates.
4. FR4: Users can delete email templates.
5. FR5: Users can preview email templates in real-time.
6. FR6: The preview is responsive and looks good on all devices.
7. FR7: The preview accurately reflects how the email will look when sent.
8. FR8: Users can list all email templates.
9. FR9: Users can search for email templates by name.
10. FR10: Users can filter email templates by creation date.

### Non Functional

1. NFR1: The application should be responsive and work on all modern browsers.
2. NFR2: The application should be secure and protect user data.
3. NFR3: The application should be scalable to handle a large number of users.
4. NFR4: The email previewing feature should not significantly impact the performance of the existing application.
5. NFR5: The email previewing feature should integrate seamlessly with the existing MkSaaS template architecture.
6. NFR6: Email templates must be sanitized to prevent XSS attacks.

## User Interface Design Goals

### Overall UX Vision

The UX vision is to provide a seamless and intuitive experience for creating, editing, and previewing email templates. The interface should be clean and uncluttered, with a focus on the content. The preview pane should be prominent and update in real-time as the user makes changes to the template.

### Key Interaction Paradigms

- Real-time previewing: The preview pane should update immediately as the user types or makes changes to the template.
- Template management: Users should be able to easily create, edit, list, search, and delete email templates.
- Responsive design: The preview should accurately reflect how the email will look on different devices.

### Core Screens and Views

- Template List Screen: Displays a list of all email templates with options to edit, delete, and preview.
- Create/Edit Template Screen: Provides a form for creating or editing an email template, with a prominent preview pane.
- Preview Screen: A full-screen view of the email template preview.

### Accessibility

WCAG AA

### Branding

The email previewer should follow the existing MkSaaS branding and design system.

### Target Device and Platforms

Web Responsive

## Technical Assumptions

### Repository Structure

Monorepo

### Service Architecture

Monolith (leveraging existing Next.js Server Actions)

### Testing Requirements

Unit + Integration

### Additional Technical Assumptions and Requests

- The email previewer will be built using React, TypeScript, TailwindCSS, and Radix UI.
- The backend will use Next.js Server Actions for data mutations.
- The database will be PostgreSQL with Drizzle ORM.
- The email previewer will integrate with the existing Resend email delivery system.
- Email templates will be stored in the database.
- The preview pane will render the email template using an iframe to ensure accurate representation across different email clients.
- The application will be deployed using Cloudflare Workers.

## Epic List

1. Epic 1: Email Template Management: Establish the core functionality for creating, editing, listing, and deleting email templates.
2. Epic 2: Email Template Previewing: Implement the real-time preview functionality for email templates.
3. Epic 3: Email Template Integration: Integrate the email previewer with the existing Resend email delivery system and ensure seamless operation within the MkSaaS template.

## Epic 1: Email Template Management

**Epic Goal**: To provide users with the ability to create, edit, list, search, filter, and delete email templates within the application.

### Story 1.1 Create Email Template

As a Content Creator,
I want to create a new email template,
so that I can design emails for my campaigns.

#### Acceptance Criteria

1. AC1: User can navigate to a "Create Template" page.
2. AC2: User can enter a name for the template.
3. AC3: User can enter the HTML content for the template.
4. AC4: User can save the template.
5. AC5: User is redirected to the template list page after saving.

### Story 1.2 Edit Email Template

As a Content Creator,
I want to edit an existing email template,
so that I can update the content.

#### Acceptance Criteria

1. AC1: User can navigate to the "Edit Template" page from the template list.
2. AC2: The template name and content are pre-filled.
3. AC3: User can modify the template name and content.
4. AC4: User can save the changes.
5. AC5: User is redirected to the template list page after saving.

### Story 1.3 List Email Templates

As a Content Creator,
I want to see a list of all my email templates,
so that I can manage them.

#### Acceptance Criteria

1. AC1: User can navigate to the "Template List" page.
2. AC2: The page displays a list of all email templates.
3. AC3: Each template shows its name and creation date.
4. AC4: User can click on a template to edit it.
5. AC5: User can delete a template from the list.

### Story 1.4 Delete Email Template

As a Content Creator,
I want to delete an email template,
so that I can remove unused templates.

#### Acceptance Criteria

1. AC1: User can click a "Delete" button next to a template in the list.
2. AC2: User is prompted to confirm the deletion.
3. AC3: If confirmed, the template is deleted from the database.
4. AC4: The template list is updated to reflect the deletion.

### Story 1.5 Search and Filter Email Templates

As a Content Creator,
I want to search and filter email templates,
so that I can find specific templates quickly.

#### Acceptance Criteria

1. AC1: User can search for templates by name.
2. AC2: User can filter templates by creation date.
3. AC3: The template list updates dynamically based on search and filter criteria.

## Epic 2: Email Template Previewing

**Epic Goal**: To provide users with a real-time preview of their email templates that accurately reflects how the email will look when sent.

### Story 2.1 Preview Email Template

As a Content Creator,
I want to preview an email template,
so that I can see how it will look when sent.

#### Acceptance Criteria

1. AC1: User can navigate to the "Preview Template" page from the template list or edit page.
2. AC2: The page displays a live preview of the email template.
3. AC3: The preview updates in real-time as the user edits the template.
4. AC4: The preview is responsive and looks good on all devices.
5. AC5: The preview accurately reflects how the email will look when sent.

## Epic 3: Email Template Integration

**Epic Goal**: To integrate the email previewer with the existing Resend email delivery system and ensure seamless operation within the MkSaaS template.

### Story 3.1 Integrate with Resend

As a Developer,
I want to integrate the email previewer with Resend,
so that users can send emails directly from the application.

#### Acceptance Criteria

1. AC1: The email previewer can send emails using the Resend API.
2. AC2: The integration respects the existing MkSaaS authentication and authorization mechanisms.
3. AC3: The integration is secure and protects user data.
4. AC4: The integration is scalable and can handle a large number of users.

## Checklist Results Report

This section will be populated after executing the pm-checklist.

## Next Steps

### UX Expert Prompt

Please review the PRD and create a detailed UI/UX design for the email previewer application, focusing on the user interface design goals outlined in the PRD.

### Architect Prompt

Please review the PRD and create a detailed architecture document for the email previewer application, focusing on the technical assumptions and requirements outlined in the PRD.