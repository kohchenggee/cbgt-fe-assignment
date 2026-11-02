
# Meridian Banking — Koh Cheng Gee

- Deployed: [<url>](https://cbgt-fe-assignment-eb957kqsl-kohchenggees-projects.vercel.app)
- Run locally: `npm install && npm run dev`

## Project structure
The project is organised into three main areas to keep reusable UI components separate from dashboard sections and dialog workflows.

| Folder | Responsibility |
|---|---|
| `components/` | Contains reusable UI components shared across different parts of the application, such as buttons, loading indicators, and other common interface elements. |
| `views/` | Contains the individual UI sections that make up the dashboard, such as the header, greetings, account summary, recent transactions and dialog component. |

This structure keeps shared components reusable, dashboard sections easy to maintain, and the transfer workflow organised independently.

## Decisions and trade-offs
### 1. State Management

**Decision:** Used React Query for server state and React `useState` for local UI state.

- **React Query:** Handles API data fetching, caching, loading states, and error handling.
- **useState:** Manages local UI interactions, such as opening and closing dialogs and controlling the transfer flow.

**Trade-off:** This keeps state management simple without introducing an additional global state library. If the application grows and more components need to share complex client-side state, I would consider introducing a dedicated state management solution.

### 2. Forms and Validation

**Decision:** Used React Hook Form with Zod for form handling and validation.

- React Hook Form manages form values and submission.
- Zod provides validation schemas for recipient details and transfer amounts.
- Added balance validation to prevent users from entering a transfer amount that exceeds the selected account's available balance.

**Trade-off:** Client-side validation provides immediate feedback and a better user experience. However, important business rules should also be enforced by the backend.

### 3. UI Components and Styling

**Decision:** Did not introduce a dedicated theme library and kept styling within the project's CSS.

- Used CSS variables and custom styles to control the appearance of UI components.
- Used Radix UI primitives for accessible interactions without introducing predefined component styling.
- Avoided adding another dependency for theme management, as the current application requirements did not justify the additional complexity.

**Trade-off:** This keeps the project lightweight and provides direct control over the visual design. However, as the application grows to support more themes or complex user preferences, I would consider introducing a dedicated theming solution to centralise theme configuration and reduce manual maintenance.

### 4. What I Would Improve

If I were to extend the project further, I would consider:

- Introducing shared client-side state management if UI state becomes more complex or needs to be shared across many components.
- Expanding automated tests to cover more edge cases, including API failures and form validation scenarios.
- Improving the separation of business logic from UI components as the application grows.

## Loading, empty and error states
How you handled them, and how to see each one in the deployed app.
# Loading states

Used skeleton placeholders while dashboard data is being fetched, avoiding sudden layout shifts and providing visual feedback.

React Query manages the asynchronous API requests and loading states.

Skeleton components use the application's semantic design tokens to remain consistent across all four theme combinations.

How to see it: Open the deployed application and observe the initial dashboard load. The skeleton placeholders appear while the API requests are pending. Depending on network speed and caching, this state may be brief.

# Empty states

Empty states are handled separately from loading and error states, so users are not shown an error when a successful API response simply contains no records.

Where applicable, the UI provides contextual messaging to explain that there is currently no data to display.

How to see it: Use an account or transaction dataset with an empty collection, if an empty-state dataset or API response is available in the deployed environment.

# Error states

Dashboard API failures display a clear error message instead of leaving the page blank.

A retry action allows users to trigger the request again using React Query's refetch().

Transfer form validation errors are displayed next to the relevant fields, including checks for available account balance and daily transfer limits.

How to see it: The dashboard error state can be tested by making the customer API request fail. Select Retry to trigger another request. If the deployed environment does not expose a way to simulate API failures, this state can be verified through the automated tests.

## Tests
### i) New Transfer Creation Flow Test

**What it covers:**
- Verifies that clicking the "New transfer" button opens the transfer creation dialog.
- Checks that users can proceed through the transfer steps, enter recipient and transfer details, and complete the flow.
- Ensures the expected UI is displayed at each stage.

**Why I picked this case:**
- Transfer creation is one of the dashboard's key user journeys.
- It involves multiple steps and user interactions, so testing the complete flow helps catch issues that individual component tests may miss.
- Provides confidence that the main transfer functionality works as expected.

### ii) Dashboard Loading Failure Test

**What it covers:**
- Simulates a failure when retrieving dashboard data.
- Verifies that an appropriate error message is displayed instead of leaving the user with a broken or blank dashboard.
- Checks that the Retry action allows the user to attempt loading the dashboard data again.

**Why I picked this case:**
- Dashboard data is essential to the user experience, but API failures can occur.
- Ensures the application handles failures gracefully and provides users with a clear recovery action.

### iii) New Transfer Validation Test

**What it covers:**
- Verifies that the transfer amount cannot exceed the available balance of the selected account.
- Checks that the appropriate validation message is displayed when the entered amount exceeds the account balance.
- Ensures that a valid amount within the available balance can pass validation.
- Verifies if user plan to transfer to new payee without fulfilling requirement

**Why I picked this case:**
- Preventing transfers beyond the available balance is an important business rule.
- Testing both invalid and valid amounts ensures users receive immediate and meaningful feedback before submitting a transfer.
- Make sure the new payee has required information for fulfiling the transfer


## AI use
## AI Tools and How I Used Them

### Tools Used

- **ChatGPT:** Used for technical discussions, exploring implementation approaches, debugging issues, reviewing code, and understanding trade-offs involving React, TypeScript, React Query, Radix UI, and CSS.
- **Google Antigravity:** Used as an AI-assisted development environment to help implement features, generate and refine code, and make changes across the project.

### Examples of AI Suggestions I Reviewed or Changed

#### i) Form Validation

The initial AI-generated implementation performed validation mainly at the point of form submission. I changed this approach to validate inputs at each stage of the transfer flow instead.

**Why:** This provides users with earlier feedback, helps them correct invalid information before proceeding, and creates a more user-friendly experience.

#### ii) Responsive UI Refinement

Some AI-generated UI implementations did not fully accommodate both desktop and mobile layouts. I refined the styling and layout to address issues such as:

- Mobile action buttons overlapping the transfer modal.
- Account card details taking up too much vertical space on smaller screens.
- Adjusting spacing and component alignment to improve the mobile experience.

**Why:** AI-generated layouts provided a useful starting point, but required manual refinement to ensure the interface remained usable across different screen sizes.

#### iii) UI Library Selection

I explored using both shadcn/ui and Radix UI. After reviewing the options, I decided to use Radix UI primitives with a custom CSS design system.

**Why:** I noticed that my `design-token.css` already contained many of the styling foundations commonly used by shadcn/ui. Rather than introducing another layer of predefined component styling, I chose Radix UI for its accessible interaction primitives and retained control over the visual design through custom CSS.

## Not Done / Known Limitations

The following improvements were identified but not implemented within the assignment timeframe:

### 1. Expand Test Coverage
Add more automated tests to cover additional user journeys, edge cases, form validation scenarios, and API failure handling.

### 2. Transfer Dialog Discard Confirmation
Implement a confirmation prompt when users attempt to close the transfer dialog before completing the process. This helps prevent accidental loss of entered information.

### 3. Stepper Navigation
Allow users to navigate back to previously completed steps by clicking on the corresponding step in the transfer stepper, rather than relying only on the Back button.

