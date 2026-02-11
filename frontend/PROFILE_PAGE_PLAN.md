# Profile Page – Frontend Implementation Plan

**Target file:** `src/pages/profilePage.tsx`  
**Stack:** React, MUI (Material UI), React Router  
**Route:** `/profile` (already wired in `App.tsx`)

---

## 1. Scope: What the user can view and edit

| Field | View | Edit | Notes |
|-------|------|------|--------|
| **Profile picture** | Yes | Yes (upload/change) | Avatar; crop/resize optional for v1 |
| **Display name** | Yes | Yes | e.g. "John Smith" |
| **Email** | Yes | Yes | Validate format; consider "verified" badge later |
| **Password** | No | Yes (change only) | Separate "Change password" flow; never show current password |
| **Role / school info** | Yes | No (or read-only) | If backend provides it (e.g. teacher vs student) |
| **Preferences** (optional v2) | Yes | Yes | e.g. theme, notifications |

For **v1**, focus on: **profile picture**, **display name**, **email**, and **change password**.

---

## 2. Page layout and UX

- **Layout:** Single scrollable page; use MUI `Container` and existing theme (`theme.ts`).
- **Sections:**
  1. **Header** – Page title (e.g. "Profile") and optional short subtitle.
  2. **Profile picture block** – Large avatar, "Change photo" (and optionally "Remove") with file input; show loading state during upload.
  3. **Details card** – Form with:
     - Display name (text field)
     - Email (text field, type email)
     - Read-only or optional fields (e.g. "Member since", role) if API provides them.
  4. **Actions** – "Save changes" (and optionally "Cancel" that resets form).
  5. **Security section** – "Change password" link/button that opens a dialog or navigates to a small sub-flow (current password, new password, confirm).
- **States to handle:** Initial load (skeleton or spinner), loaded, saving, error (inline or snackbar), success (e.g. snackbar "Profile updated").
- **Accessibility:** Labels for all inputs, focus management in modals, and clear error messages.

---

## 3. Data and state

- **User model (frontend):** Define a minimal type, e.g.  
  `id`, `email`, `displayName`, `avatarUrl?`, `role?`, `createdAt?`.
- **Source of truth:** Assume an API (REST or similar) for:
  - `GET /me` or `GET /users/me` – current user profile.
  - `PATCH /me` or `PATCH /users/me` – update profile (name, email, optionally avatar URL if uploaded separately).
  - `POST /me/avatar` or dedicated upload endpoint – profile picture upload (returns URL or ID).
  - `POST /me/change-password` or similar – change password (current + new).
- **State:**  
  - Fetch profile on mount (or from a global auth/user context if you add one).  
  - Local component state for form fields (or a small form library later).  
  - Keep "server state" (what’s saved) and "dirty" state clear so "Cancel" and "Save" behave correctly.

---

## 4. Profile picture flow

- **Input:** `<input type="file" accept="image/*" />` (triggered by button/link).
- **Validation:** Max size (e.g. 2–5 MB), allow only image types (e.g. jpeg, png, webp).
- **Preview:** Show selected image in the avatar area before upload; optional client-side crop for v2.
- **Upload:** Call upload API; on success, set `avatarUrl` in state and optionally update navbar avatar (if you lift user state to context).
- **Fallback:** If no photo, use MUI `Avatar` with initials from display name.

---

## 5. Change password flow

- **Trigger:** Button/link "Change password" in a Security subsection.
- **UI:** Modal (MUI `Dialog`) with:
  - Current password
  - New password
  - Confirm new password
- **Validation:** Passwords match, minimum length, and any backend rules.
- **Submit:** Call change-password API; on success close dialog and show success message; on error show inline error.

---

## 6. Suggested file and component structure

```
src/
  pages/
    profilePage.tsx          # Main page: layout, fetch profile, compose sections
  components/
    profile/
      ProfileHeader.tsx     # Title + optional subtitle
      ProfileAvatar.tsx     # Avatar + change/remove photo
      ProfileForm.tsx       # Display name, email, save/cancel
      ChangePasswordDialog.tsx  # Modal for password change
  hooks/
    useProfile.ts           # (optional) fetch + update profile, loading/error state
  types/
    user.ts                 # User / profile types
  api/
    profile.ts              # (optional) API functions: getProfile, updateProfile, uploadAvatar, changePassword
```

Start with everything in `profilePage.tsx` if preferred; split into these components when the file gets large or for reuse.

---

## 7. Implementation order

1. **Types and API layer**  
   - Add `User` / `Profile` type in `types/user.ts`.  
   - Add stub or real API functions in `api/profile.ts` (get, update, upload avatar, change password).

2. **Profile data on the page**  
   - In `profilePage.tsx`, fetch profile on mount (or from context).  
   - Handle loading and error states; render a simple read-only view first (no edit).

3. **Profile form (name + email)**  
   - Editable fields, local state, "Save" that calls update API.  
   - Success/error feedback (e.g. MUI Snackbar).

4. **Profile picture**  
   - `ProfileAvatar` with file input, validation, preview, upload API call.  
   - Update navbar avatar when user context is available.

5. **Change password**  
   - `ChangePasswordDialog` with form and validation; call API and handle errors.

6. **Polish**  
   - Align with `theme.ts` and existing `navbar.tsx` (e.g. AppBar, Container).  
   - Responsive layout, accessibility, and any copy/microcopy.

---

## 8. Integration with navbar

- Navbar currently uses a hardcoded avatar (`/static/images/avatar/2.jpg`).  
- Once profile (including `avatarUrl`) is available from API or context, pass the user’s avatar URL into the navbar so the app bar shows the same profile picture as the profile page.

---

## 9. Out of scope for v1 (optional later)

- Email verification flow and "verified" badge.  
- Client-side image cropping.  
- Profile deletion or account deactivation.  
- Two-factor authentication.

---

## 10. Checklist for the engineer

- [ ] Add `User` / profile types.
- [ ] Add profile API functions (get, update, upload avatar, change password).
- [ ] Implement profile fetch and read-only view with loading/error.
- [ ] Add editable form (display name, email) with save and feedback.
- [ ] Implement profile picture upload and display (and navbar sync if applicable).
- [ ] Implement change-password dialog and API call.
- [ ] Use MUI + theme consistently; ensure responsive and accessible.
- [ ] Test with real or mocked backend.

This plan gives a frontend engineer a clear scope (profile picture, email, display name, change password), layout, data model, and implementation order for the profile page in `profilePage.tsx` and related components.
