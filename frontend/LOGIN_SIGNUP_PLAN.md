# Login & Sign Up Pages – Frontend Implementation Plan

**Target files:** `src/pages/loginPage.tsx`, `src/pages/signUpPage.tsx`  
**Stack:** React, MUI (Material UI), React Router  
**Routes:** `/login`, `/signup` (to be added in `App.tsx`)

---

## 1. Scope: What we’re building

| Page      | Fields              | Purpose                          |
|-----------|---------------------|----------------------------------|
| **Login** | Email, Password     | Authenticate existing users      |
| **Sign up** | Name, Email, Password, Confirm password | Register new users (minimal v1) |

- **No** social login, magic links, or “forgot password” in v1 (can add later).
- Sign up includes **name** and **confirm password** (required).

---

## 2. Design approach (MUI)

- **Layout:** Centred card on the page (similar feel to many auth UIs). Use MUI `Container`, `Paper`/`Card`, and your existing `theme.ts` (primary `#ffa071`).
- **Form:** One column; on sign up: name, email, password, confirm password; on login: email, password; primary button to submit; secondary link to switch between “Log in” and “Sign up”.
- **Consistency:** Same spacing, typography, and primary/contrast colours as the rest of the app (navbar, profile).

---

## 3. Page layout and UX

### 3.1 Login page (`/login`)

- **Header:** “Log in” (e.g. `Typography` variant h5/h4).
- **Form:**
  - **Email** – `TextField` with `type="email"`, `autoComplete="email"`, full width.
  - **Password** – `TextField` with `type="password"`, `autoComplete="current-password"`, full width.
- **Actions:**
  - Primary button: “Log in” (submit).
  - Link below: “Don’t have an account? Sign up” → `/signup`.
- **States:** Idle, loading (button disabled + optional CircularProgress), error (inline under form or Snackbar), success (redirect to `/` or intended route).

### 3.2 Sign up page (`/signup`)

- **Header:** “Sign up”.
- **Form:**
  - **Name** – `TextField` (e.g. “Full name” or “Name”), `autoComplete="name"`, full width.
  - **Email** – same as login.
  - **Password** – `TextField` type password, `autoComplete="new-password"`.
  - **Confirm password** – `TextField` type password, `autoComplete="new-password"`; validate “passwords match” before submit.
- **Actions:**
  - Primary button: “Sign up”.
  - Link: “Already have an account? Log in” → `/login`.
- **States:** Same as login (idle, loading, error, success/redirect).

### 3.3 Shared UX details

- **Centring:** Use `Container` with `maxWidth="sm"` and flex/box to centre the card vertically and horizontally (or use a simple full-height container with flex).
- **Spacing:** Consistent `sx={{ mt: 2 }}` (or similar) between fields and between form and buttons.
- **Accessibility:** Proper `<label>` / `aria-label`, and `error`/`helperText` on `TextField` for validation errors.

---

## 4. MUI components to use

| Use case           | Component        | Notes                                              |
|--------------------|------------------|----------------------------------------------------|
| Page wrapper       | `Container`      | `maxWidth="sm"` for narrow auth card                |
| Card container     | `Paper` or `Card`| Elevated card; padding (e.g. 3)                    |
| Title              | `Typography`     | variant h5 or h4                                   |
| Name / email / password | `TextField`      | `fullWidth`, `required`, `type` and `autoComplete` as above; sign up includes name and confirm password |
| Submit             | `Button`         | `variant="contained"`, `type="submit"`, fullWidth  |
| Switch page        | `Link` + `Typography` or `Button` text | React Router `Link` to `/login` or `/signup` |
| Loading            | `CircularProgress` | Optional: inside button or above form            |
| Global error/success | `Alert` or `Snackbar` | Optional; or inline under form                  |

---

## 5. Validation (client-side, minimal)

- **Name (sign up):** Non-empty.
- **Email:** Non-empty; format check (e.g. simple regex or HTML5 `type="email"`).
- **Password:** Non-empty; optional min length (e.g. 8) for sign up.
- **Confirm password (sign up):** Must match “Password”; required.
- Show errors via `TextField` `error` and `helperText`; clear on change or submit.

---

## 6. Data and state (local storage for v1)

- **For now, persist auth in local storage.** No backend required; you can replace with real API + tokens later.
- **What to store in `localStorage`:**
  - **Registered users:** e.g. key `auth_users` – array of `{ name, email, password }` (or a simple map keyed by email). Sign up = append to this list (after checking email not already registered). Login = find user by email and check password matches.
  - **Current session:** e.g. key `auth_user` – the signed-in user (e.g. `{ name, email }`). On app load, read this to show “logged in” state in navbar (and name/avatar if needed); on logout, remove it.
- **State per page:**
  - Login: `email`, `password`.
  - Sign up: `name`, `email`, `password`, `confirmPassword`.
  - Both: `loading` (boolean), `error` (string or null).
- **Submit behaviour:**
  - **Sign up:** Validate (name, email, password, confirm password match); check email not already in `auth_users`; push new user `{ name, email, password }` to `auth_users`, set `auth_user` to `{ name, email }`, then redirect (e.g. `navigate('/')`).
  - **Login:** Validate; find user in `auth_users` by email; if not found or password wrong, set `error`; else set `auth_user` to `{ name, email }` and redirect.
- **Logout:** Clear `auth_user` from localStorage (and optionally redirect to `/login`).
- Later you can swap this for real API calls and store a token (e.g. `auth_token`) instead of (or in addition to) `auth_user`.
- **Note:** Storing passwords in localStorage is **not secure** and is only for v1/demo. Use proper backend auth (hashed passwords, tokens) for production.

---

## 7. Suggested file and component structure

```
src/
  pages/
    loginPage.tsx      # Login form + layout
    signUpPage.tsx     # Sign up form + layout
  components/
    auth/
      AuthCard.tsx     # (optional) Shared Container + Paper + title for login/signup
      EmailPasswordForm.tsx  # (optional) Reusable email + password fields if you want to DRY
  utils/
    authStorage.ts     # (v1) localStorage helpers: getUsers(), addUser(user: { name, email, password }), getCurrentUser() → { name, email }, setCurrentUser(), clearCurrentUser()
  api/
    auth.ts            # (optional, later) login(), signUp() API calls when backend exists
  types/
    auth.ts            # (optional) e.g. User, LoginPayload, SignUpPayload
```

Start with everything inside `loginPage.tsx` and `signUpPage.tsx`; add `authStorage.ts` for localStorage read/write so both pages and the navbar can use it. Extract shared `AuthCard` or field group only if you want to reduce duplication.

---

## 8. Routes and navigation

- **Add routes in `App.tsx`:**
  - `<Route path="/login" element={<LoginPage />} />`
  - `<Route path="/signup" element={<SignUpPage />} />`
- **Where to link:**
  - Landing: “Log in” and “Sign up” (e.g. in navbar or hero).
  - Navbar: If user not logged in, show “Log in” / “Sign up” instead of avatar menu (or in addition, depending on product).
- **After login/signup:** Redirect to `/` or to a “next” query/state (e.g. from protected route).

---

## 9. Implementation order

1. **Routes and shells**
   - Add `/login` and `/signup` routes.
   - Create `loginPage.tsx` and `signUpPage.tsx` with a simple title and `Container` + `Paper` layout (no form yet).

2. **Login form**
   - Add email and password `TextField`s and “Log in” button; local state; client-side validation; stub submit (e.g. `console.log` or `setTimeout` then redirect).

3. **Sign up form**
   - Same for sign up (name, email, password, confirm password); validate passwords match; stub submit.

4. **Cross-links**
   - “Sign up” link on login page; “Log in” link on sign up page.

5. **Loading and error**
   - Add loading state and error message (inline or Snackbar) on both pages.

6. **Local storage persistence**
   - Implement `utils/authStorage.ts`: store/read registered users and current user; use it in login/signup submit and in navbar to show logged-in state and logout.
   - (Later) Replace with `api/auth.ts` and token/session if you add a backend.

7. **Polish**
   - Align with `theme.ts` (primary colour on buttons); ensure responsive and keyboard/accessible.

---

## 10. Optional: shared AuthCard component

To keep login and sign up visually identical and reduce code:

- **AuthCard:** Accept `title`, `children` (form content), and optional `footer` (link to other page).
- **Layout:** `Container` → `Box` (flex, centre) → `Paper` (padding) → title → children → footer.
- Use `AuthCard` in both `loginPage.tsx` and `signUpPage.tsx` with different title and form.

---

## 11. Out of scope for v1 (optional later)

- “Forgot password” flow.
- Social login (Google, etc.).
- Email verification step.
- Remember me / persistent session (can be backend-only).
- Rate limiting or CAPTCHA (usually backend).

---

## 12. Checklist for the engineer

- [ ] Add routes `/login` and `/signup` in `App.tsx`.
- [ ] Create `loginPage.tsx` with Container + Paper, email and password fields, “Log in” button, and “Sign up” link.
- [ ] Create `signUpPage.tsx` with same layout, name + email + password + confirm password, “Sign up” button, and “Log in” link.
- [ ] Add client-side validation (name non-empty, email format, non-empty password, confirm password match).
- [ ] Add loading and error state and display.
- [ ] Use MUI + `theme.ts` consistently; keep form narrow and centred.
- [ ] Add `utils/authStorage.ts` for localStorage (users list + current user); use it in login/signup and navbar.
- [ ] (Optional) Extract `AuthCard`; (later) add `api/auth.ts` when backend exists.
- [ ] Add “Log in” / “Sign up” entry points from landing and/or navbar.

This plan gives a frontend engineer a simple, MUI-based login and sign up (email + password only) with clear layout, components, and implementation order.
