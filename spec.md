# AK Central Library Management System

## Current State
- UsersScreen allows Admin/Librarian to edit any user's Name, Username, Department, and Password freely with no restrictions on repeated edits.
- LoginScreen has no Forgot Password option.
- User type has no flag to track whether name has been updated.

## Requested Changes (Diff)

### Add
- `nameUpdated: boolean` flag on the User type in storage.ts. Once a name has been saved/edited by Admin or Librarian, this flag is set to `true`.
- Forgot Password flow on the Login screen: a link below the login form that opens a panel where the user enters their Register ID. The panel shows a message instructing them to contact the Admin or Librarian to reset their password (no email required).
- Admin/Librarian can reset any user's password from the Edit User dialog (this is unrelated to the lock).

### Modify
- UsersScreen Edit User dialog: the Name field should be read-only (disabled) if `user.nameUpdated === true`. Show a small note: "Name has already been updated and cannot be changed again." The save button should still work for other fields (Department, Username, Password).
- When Admin/Librarian saves a name edit for a user, set `nameUpdated: true` on that user.
- storage.ts: add `nameUpdated` optional boolean to User interface.
- LoginScreen: add a "Forgot Password?" link below the login button that reveals a small inline panel asking for Register ID and showing instructions to contact the librarian.

### Remove
- Nothing removed.

## Implementation Plan
1. Add `nameUpdated?: boolean` to `User` interface in storage.ts.
2. In UsersScreen: disable Name input in Edit dialog if `editUser.nameUpdated === true`; set `nameUpdated: true` when saving a name change.
3. In LoginScreen: add Forgot Password link that opens an inline panel with a Register ID input and a contact-librarian message.
