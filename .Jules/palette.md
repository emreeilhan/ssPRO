## 2024-11-20 - Missing Accessibility Labels on Icon-only Buttons
**Learning:** Found an accessibility issue pattern where icon-only buttons (like `^`, `v`, `<`, `>`) in panels are missing `title` tooltips and sometimes `aria-label`s. This hinders screen reader users and causes sighted users to guess their purpose.
**Action:** Always verify that buttons containing only symbols or icons have descriptive `title` and `aria-label` attributes to ensure clarity and accessibility.
