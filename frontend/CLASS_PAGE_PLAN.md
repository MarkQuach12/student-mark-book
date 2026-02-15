# Class Page Plan – Student Homework Tracking

## Overview

A class page that displays students and their homework completion over 10 weeks. Teachers can mark homework as complete or incomplete via checkboxes. The view is **by week** (one week at a time).

---

## 1. Data Model

### Class

- **Class ID** – from route param (`:id`)
- **Class name** – e.g. "Year 10 Mathematics"
- **Students** – list of students in the class
- **Homework** – list of homework items grouped by week

### Student

- **ID**
- **Name**
- **Homework completions** – which homework items each student has completed

### Homework

- **ID**
- **Title** – e.g. "Algebra – Linear Equations", "Geometry Quiz"
- **Week** – 1–10

### Completion Record

- **Student ID**
- **Homework ID**
- **Completed** – boolean

---

## 2. Sample Data

- **Students**: 5–8 names (e.g. Alice Smith, Bob Jones, Charlie Brown, Diana Prince, Eve Wilson)
- **Weeks**: 10 weeks (Week 1 to Week 10)
- **Homework per week**: 1–3 items per week (~15–25 total)
- **Completions**: Mix of completed/incomplete (~60–80% done) to show realistic data

---

## 3. View: By Week

- **Week selector** – Tabs or buttons for Week 1 … Week 10 at the top
- **Single week shown** – Only that week’s homework columns are visible
- **Header** – e.g. "Week 3 – Homework"
- **Content** – Student names (rows) × that week’s homework items (columns)

---

## 4. Editable Checkboxes (Teacher View)

- Each completion cell is a **checkbox**, not a static icon
- **Checked** = completed  
- **Unchecked** = incomplete  
- Teachers click to toggle completion status
- Changes update state (and can be sent to backend if available)

---

## 5. Component Breakdown

| Component | Responsibility |
|-----------|----------------|
| `ClassPage` | Top-level container, loads class data, manages selected week state |
| `ClassHeader` | Class name, summary stats |
| `WeekTabs` | Week 1–10 selector, calls `onWeekChange(week)` |
| `WeekContent` | Table for the selected week |
| `StudentRow` | One student row with completion cells |
| `CompletionCell` | Checkbox, handles `onChange`, calls `onCompletionChange(studentId, homeworkId, completed)` |
| `SampleData` / `useSampleData` | Sample data for students, homework, completions |

---

## 6. Implementation Order

1. Define TypeScript types and sample data
2. Build `ClassHeader` with class name and basic stats
3. Build `WeekTabs` for week selection
4. Build `CompletionCell` (checkbox with handler)
5. Build `StudentRow` using `CompletionCell`
6. Build `WeekContent` table
7. Wire up `ClassPage` with sample data and state
8. Add styling and responsive behaviour

---

## 7. Out of Scope (for now)

- Undo
- Bulk actions (e.g. "Mark all Week 3 complete")
- Unsaved changes indicator
- Confirmation dialogs
- Backend integration (can be added later)
