# UI Standards and Documentation Rules

## UI Standards

This project uses **shadcn/ui** for all UI components. To maintain consistency, follow these guidelines:

### 1. Use shadcn/ui Components
- Always prefer components from `@/components/ui` over raw HTML tags or custom styles.
- **Buttons**: Use `@/components/ui/button`.
- **Badges**: Use `@/components/ui/badge`.
- **Cards**: Use `@/components/ui/card`.
- **Inputs/Forms**: Use `@/components/ui/input`, `@/components/ui/form`, `@/components/ui/select`, etc.
- **Tables**: Use `@/components/ui/table`.
- **Dialogs/Modals**: Use `@/components/ui/dialog` or `@/components/ui/alert-dialog`.
- **Tabs**: Use `@/components/ui/tabs`.
- **Avatars**: Use `@/components/ui/avatar`.
- **Tooltips**: Use `@/components/ui/tooltip`.

### 2. Styling with Tailwind CSS
- Use Tailwind CSS for layout and minor adjustments.
- Avoid inline styles.
- Use the theme variables (e.g., `text-muted-foreground`, `bg-background`, `border-border`) to ensure dark mode support.

### 3. Typography
- Use standard shadcn typography classes:
  - `text-3xl font-bold` for H1
  - `text-xl font-semibold` for H2
  - `text-sm text-muted-foreground` for helper text
- **Case Style**: All titles (H1, H2, Card titles, etc.) must be in **Sentence case** (e.g., "Add new candidate", "Personal information").

---

## Documentation Rules

### 1. Read Before You Code
Always read the relevant documentation in the `docs/` directory before starting a task to understand the architecture, API, and UI standards.

### 2. Update After Each Change
If a change affects the application's behavior, API, or UI structure, update the corresponding documentation file immediately:
- **Architecture changes**: Update `docs/ARCHITECTURE.md`.
- **API changes**: Update `docs/API.md`.
- **UI changes**: Update `docs/UI_STANDARDS.md`.
- **Database changes**: Update `docs/DB_SCHEMA.md`.

### 3. Keep README Current
The root `README.md` should reflect the current state of the project, including features, tech stack, and setup instructions.
