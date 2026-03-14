# Chapter 5: Development and Testing

This chapter documents the iterative development of the Bite Byte platform across three sprints. Each sprint section details the functional requirements implemented, the system design through use case and class diagrams, the screen designs produced, and the functional testing undertaken to validate correctness. The platform was built using a monorepo architecture comprising a Next.js 16 front-end application (`apps/web`) and a NestJS 11 back-end API (`apps/api`), with PostgreSQL (via Neon) as the persistence layer, Prisma 7 as the ORM, Stripe for payment processing, Socket.IO for real-time communication, and Tailwind CSS with shadcn/ui for the component library.

---

## 5.1 Sprint 1-2: Auth, Venue Setup & Menu Builder

### 5.1.1 Functional Requirements

Sprint 1-2 established the foundational capabilities of the platform, covering user authentication, multi-tenant venue management, and the complete menu builder experience. The following requirements were implemented.

#### FR-1: User Registration

Users can create an account by providing an email address and password. The registration form is located at `/register` and is built using React's `useActionState` hook bound to a Next.js Server Action (`registerAction`). On the server side, the NestJS `AuthService` validates that the email is not already registered, hashes the password using bcrypt, persists the new user record to the `users` table in PostgreSQL, and returns a signed JSON Web Token (JWT). The JWT is stored in an HTTP-only cookie (`access_token`) and the user is redirected to the dashboard. Field-level validation errors (e.g. invalid email format, password too short) are returned to the client and displayed inline beneath the relevant input fields. A general error banner is shown for duplicate email registration attempts.

**Key implementation decision:** All forms in the application use plain `action={formAction}` via `useActionState` rather than `react-hook-form`. Early development revealed that `react-hook-form`'s `handleSubmit` combined with `requestSubmit()` was incompatible with Next.js Server Actions in this project. This pattern was established as a project-wide convention and documented in project memory to prevent regression.

#### FR-2: User Login

Registered users can sign in via the `/login` page. The login form submits credentials to a Server Action (`loginAction`) which calls the NestJS API's `/auth/login` endpoint. Authentication is handled by Passport's `LocalStrategy`, which validates the email and bcrypt-hashed password. Upon successful authentication, a JWT is issued, stored as an HTTP-only cookie, and the user is redirected to the dashboard. Invalid credentials produce a general error message displayed in a styled alert banner above the form inputs. The form includes `autoComplete` attributes (`email` for the email field, `current-password` for the password field) to support browser credential management.

#### FR-3: Venue CRUD with Payment Mode Configuration

Authenticated venue owners can create, read, update, and delete venues. Venue creation requires a name and URL slug (the slug forms part of the public menu URL, e.g. `/menu/bobs-burgers`). The venue settings page provides a form to update the venue name, slug, and payment mode. The payment mode is configured via a dropdown select component with three options:

- **PREPAY_REQUIRED**: Customers must complete payment via Stripe before their order is placed.
- **PAY_AT_COUNTER**: Customers place orders through the app and pay in person at the venue counter.
- **BOTH**: Customers are presented with a choice between online payment and pay-at-counter at checkout.

The payment mode is stored as a PostgreSQL enum (`PaymentMode`) on the `venues` table and defaults to `BOTH`. A hidden form field synchronises the React-controlled `Select` component value with the form submission.

Venue deletion is protected by a confirmation dialog (`AlertDialog` from shadcn/ui) that requires explicit user acknowledgement. Deletion cascades to all associated menu categories, menu items, and orders via Prisma's `onDelete: Cascade` configuration. After deletion, the user is redirected to the dashboard and `revalidatePath('/dashboard', 'layout')` is called to refresh the sidebar venue list.

#### FR-4: Venue Logo Upload

Each venue can optionally have a logo image. The logo upload is handled separately from the main venue settings form via a dedicated `uploadLogoAction` Server Action. The file is uploaded to Vercel Blob storage, and the returned URL is persisted to the `logo_url` column on the `venues` table. The upload interface displays a 96x96 pixel preview of the current logo (or a placeholder if none is set) and accepts PNG, JPG, and WebP files up to 5 MB. Upload progress is indicated by a loading state on the upload button.

#### FR-5: Menu Category Management with Drag-Drop Reorder

Within each venue, the owner can create, rename, and delete menu categories. Categories are displayed as collapsible sections in the menu builder interface at `/venues/[venueId]/menu`. Each category has a `sortOrder` integer field that determines its display position.

Category reordering is implemented using the `@dnd-kit` library. The `CategoryList` component wraps all categories in a `DndContext` with `SortableContext` using the `verticalListSortingStrategy`. Each category is rendered by a `SortableCategory` component that provides a drag handle (grip icon). When the user drags a category to a new position, the `handleDragEnd` callback performs an optimistic local state update using `arrayMove`, then persists the new sort order to the API via `reorderCategoriesAction`. The API endpoint expects a bare JSON array of `{ id, sortOrder }` objects (not wrapped in an object).

**Key implementation decision:** A stable `id` prop (`"menu-category-dnd"`) is passed to `DndContext` to prevent SSR/client hydration mismatches. Without this, `@dnd-kit` generates different `aria-describedby` attributes on server and client, causing React hydration warnings.

New categories are added via an inline form that appears when the user clicks the "Add Category" button. The form uses `useActionState` bound to `createCategoryAction` with the `venueId` pre-bound via `.bind()`. After successful creation, the form is hidden and `router.refresh()` triggers a server component re-render to fetch the updated category list.

#### FR-6: Menu Item Management with Photo Upload

Each menu category contains zero or more menu items. Items are managed through a dialog-based form (`ItemForm` component) that supports both creation and editing. The form collects the item name (required), price (required, with a currency prefix), description (optional), and photo (optional).

Item photos are uploaded to Vercel Blob storage via the Server Action. The form includes a client-side file size check (maximum 4 MB) with a warning message, and displays a live preview of the selected image using `FileReader.readAsDataURL()`. Existing items show their current photo in the preview area.

The `ItemForm` employs a callback ref pattern to prevent infinite re-render loops. Because the parent component passes an inline arrow function as the `onClose` prop, each re-render creates a new function reference. If `onClose` were included in the `useEffect` dependency array, it would trigger an infinite cycle: effect fires, calls `onClose`, parent calls `router.refresh()`, re-render produces a new `onClose` reference, and the effect fires again. The solution stores `onClose` in a mutable ref (`onCloseRef`) that is updated on each render but excluded from the dependency array.

#### FR-7: Menu Item Availability Toggle

Each menu item has an `isAvailable` boolean field (defaulting to `true`). The `ItemCard` component displays a toggle switch that allows the venue owner to immediately mark an item as available or unavailable. Toggling availability calls a Server Action that updates the item's `is_available` column in the database. Unavailable items are visually dimmed in the menu builder and hidden from the public-facing customer menu.

#### FR-8: QR Code Generation and Download

Each venue has a dedicated QR code page at `/venues/[venueId]/qrcode`. The page generates a QR code encoding the venue's public menu URL (`{APP_URL}/menu/{slug}`) using the `qrcode` library. The QR code is rendered as a 512x512 pixel PNG data URL and displayed as a preview image within a card component. Below the preview, the full menu URL is displayed in a monospace font for manual reference.

A download button allows the venue owner to save the QR code as a PNG file. The download is handled by a Next.js route handler at `/api/venues/[venueId]/qrcode` that generates the image server-side and serves it with the appropriate `Content-Type` and `Content-Disposition` headers. The filename follows the pattern `qrcode-{slug}.png`.

### 5.1.2 Use Case Diagram

`[Diagram placeholder: Sprint 1-2 Use Case Diagram -- Venue Owner actor with use cases: Register, Login, Create Venue, Update Venue, Delete Venue, Create Category, Reorder Categories, Create Item, Edit Item, Toggle Availability, Upload Photo, Generate QR Code]`

The Sprint 1-2 use case diagram centres on a single primary actor: the **Venue Owner**. This actor interacts with the system through the following use cases:

1. **Register** -- The venue owner creates a new account by providing an email and password. This use case is a prerequisite for all subsequent interactions. Upon successful registration, a JWT is issued and the user is authenticated.

2. **Login** -- A returning venue owner authenticates with their existing credentials. This use case is an alternative entry point to the system for users who have already registered.

3. **Create Venue** -- The authenticated owner creates a new venue by specifying a name and URL slug. This use case extends the authentication use cases (Register or Login), as authentication is required.

4. **Update Venue Settings** -- The owner modifies a venue's name, URL slug, or payment mode configuration. This use case includes the sub-use case **Upload Logo**, which allows the owner to attach or replace a logo image for the venue.

5. **Delete Venue** -- The owner permanently removes a venue and all associated data. This use case includes a confirmation step and triggers cascading deletion of categories, items, and orders.

6. **Create Category** -- Within a venue, the owner adds a new menu category (e.g. "Starters", "Mains", "Desserts"). This use case requires that at least one venue exists.

7. **Reorder Categories** -- The owner changes the display order of categories by dragging them to new positions. This use case is performed within the menu builder interface.

8. **Create Item** -- The owner adds a new menu item to a category, specifying name, price, and optionally a description and photo. This use case includes the sub-use case **Upload Photo**.

9. **Edit Item** -- The owner modifies an existing item's details (name, price, description, or photo). This use case reuses the same dialog form as Create Item.

10. **Toggle Availability** -- The owner marks an item as available or unavailable, controlling its visibility on the public menu. This is a lightweight operation performed directly from the item card.

11. **Delete Item** -- The owner permanently removes a menu item from a category.

12. **Generate QR Code** -- The owner views and downloads a QR code image that encodes the venue's public menu URL for printing and display at the physical venue.

All use cases except Register and Login require prior authentication, represented by an `<<include>>` relationship with the Login/Register use cases. The Upload Photo use case is shared between Update Venue Settings (logo upload) and Create/Edit Item (item photo upload), represented by `<<include>>` relationships.

### 5.1.3 Class Diagram

`[Diagram placeholder: Sprint 1-2 Class Diagram -- User, Venue, MenuCategory, MenuItem classes with attributes and relationships]`

The Sprint 1-2 class diagram defines four core domain entities and their relationships, as reflected in the Prisma schema and the PostgreSQL database.

#### User

| Attribute     | Type     | Constraints              |
|---------------|----------|--------------------------|
| id            | UUID     | Primary key, auto-generated |
| email         | String   | Unique, required         |
| passwordHash  | String   | Required (bcrypt hash)   |
| createdAt     | DateTime | Auto-set on creation     |
| updatedAt     | DateTime | Auto-updated on mutation |

The `User` class represents an authenticated venue owner. The `passwordHash` field stores the bcrypt-hashed password (mapped to the `password_hash` column in PostgreSQL). The `User` has a one-to-many relationship with `Venue`: a single user can own multiple venues.

**Relationship:** User 1 ---* Venue (one user owns zero or more venues)

#### Venue

| Attribute   | Type        | Constraints                          |
|-------------|-------------|--------------------------------------|
| id          | UUID        | Primary key, auto-generated          |
| name        | String      | Required                             |
| slug        | String      | Unique, required                     |
| logoUrl     | String?     | Nullable (Vercel Blob URL)           |
| paymentMode | PaymentMode | Enum, default BOTH                   |
| ownerId     | UUID        | Foreign key to User                  |
| createdAt   | DateTime    | Auto-set on creation                 |
| updatedAt   | DateTime    | Auto-updated on mutation             |

The `Venue` class represents a physical food service location. The `slug` field provides a URL-safe identifier used in the public menu URL path. The `paymentMode` field is a PostgreSQL enum with three possible values: `PREPAY_REQUIRED`, `PAY_AT_COUNTER`, and `BOTH`. The `Venue` has a one-to-many relationship with `MenuCategory`.

**Relationships:**
- Venue * ---1 User (many venues belong to one owner)
- Venue 1 ---* MenuCategory (one venue has zero or more categories)

#### MenuCategory

| Attribute | Type     | Constraints                          |
|-----------|----------|--------------------------------------|
| id        | UUID     | Primary key, auto-generated          |
| venueId   | UUID     | Foreign key to Venue                 |
| name      | String   | Required                             |
| sortOrder | Int      | Default 0, determines display order  |
| createdAt | DateTime | Auto-set on creation                 |
| updatedAt | DateTime | Auto-updated on mutation             |

The `MenuCategory` class groups related menu items (e.g. "Starters", "Main Courses"). The `sortOrder` field is an integer that determines the display position of the category within the venue's menu. Categories are deleted when their parent venue is deleted (`onDelete: Cascade`).

**Relationships:**
- MenuCategory * ---1 Venue (many categories belong to one venue)
- MenuCategory 1 ---* MenuItem (one category contains zero or more items)

#### MenuItem

| Attribute   | Type      | Constraints                            |
|-------------|-----------|----------------------------------------|
| id          | UUID      | Primary key, auto-generated            |
| venueId     | UUID      | Foreign key (denormalised for queries)  |
| categoryId  | UUID      | Foreign key to MenuCategory            |
| name        | String    | Required                               |
| description | String?   | Nullable                               |
| price       | Decimal   | Decimal(10,2), required                |
| imageUrl    | String?   | Nullable (Vercel Blob URL)             |
| isAvailable | Boolean   | Default true                           |
| sortOrder   | Int       | Default 0                              |
| metadata    | JSONB     | Default empty object, extensibility hook |
| createdAt   | DateTime  | Auto-set on creation                   |
| updatedAt   | DateTime  | Auto-updated on mutation               |

The `MenuItem` class represents an individual food or drink item available for ordering. The `price` field uses `Decimal(10,2)` to avoid floating-point precision errors in financial calculations. The `metadata` JSONB column is reserved for future extensibility (e.g. modifiers and customisation options in a future version). Items cascade-delete with their parent category.

**Relationships:**
- MenuItem * ---1 MenuCategory (many items belong to one category)

### 5.1.4 Screen Design

#### Registration Page

`[Screenshot placeholder: Registration page]`

The registration page presents a centred card component against a clean background. The card contains a header with the title "Create your account" and the subtitle "Start managing your venue with Bite Byte". The form body contains two input fields: an email field with the placeholder "you@example.com" and a password field with a masked placeholder. Each field has a corresponding label element above it. Field-level validation errors appear as small red text beneath the affected input, and the input's border changes to indicate an invalid state via the `aria-invalid` attribute. A general error banner (e.g. "Email already registered") appears at the top of the form body in a red-tinted background. The submit button spans the full card width and displays "Creating account..." with a disabled state while the Server Action is pending. Below the button, a secondary text line reads "Already have an account?" with a link to the login page.

**Design decisions:** The card-based layout was chosen for visual focus on the single task of registration. The `useActionState` pattern provides built-in pending state management without additional loading state variables. The `autoComplete="email"` and `autoComplete="new-password"` attributes enable browser credential autofill and password manager integration.

#### Login Page

`[Screenshot placeholder: Login page]`

The login page mirrors the registration page's layout with a centred card component. The header reads "Welcome back" with the subtitle "Sign in to manage your venue". The form contains email and password fields with identical styling to the registration page but uses `autoComplete="current-password"` for the password field. The submit button text cycles between "Sign in" and "Signing in..." during form submission. The footer text reads "Don't have an account?" with a link to the registration page. Error handling follows the same pattern as registration: field-level errors appear beneath inputs, and general authentication failures appear in a banner at the top of the form.

#### Dashboard -- Venue List

`[Screenshot placeholder: Dashboard -- venue list]`

The dashboard page serves as the landing page for authenticated users. It displays a list of the user's venues in the main content area. Each venue is represented as a card or list item showing the venue name, slug, and a link to the venue settings page. A sidebar navigation component (`sidebar.tsx`) provides persistent navigation across all dashboard pages, listing the user's venues with links to each venue's settings, menu builder, QR code, live orders, analytics, and order history pages. The sidebar updates dynamically when venues are created or deleted via `revalidatePath('/dashboard', 'layout')`.

#### Venue Settings Page

`[Screenshot placeholder: Venue settings page]`

The venue settings page is divided into four sections separated by horizontal rules (`Separator` component):

1. **Venue Details**: A form containing inputs for the venue name, URL slug, and a dropdown select for the payment mode. The slug field displays a preview of the resulting public menu URL in monospace text beneath it. A success banner ("Venue settings saved.") appears after a successful update. The "Save changes" button indicates pending state.

2. **Venue Logo**: A 96x96 pixel rounded preview of the current logo (or a "No logo" placeholder). A hidden file input is triggered by an "Upload logo" / "Change logo" button. Supported formats (PNG, JPG, WebP) and the 5 MB size limit are noted below the button. Upload errors are displayed in a red-tinted banner.

3. **QR Code**: A description of the QR code functionality with a preview of the menu URL, and a button linking to the dedicated QR code page.

4. **Danger Zone**: Styled with a red heading, this section contains the venue deletion functionality. The "Delete venue" button triggers an `AlertDialog` confirmation modal that names the specific venue and warns that all associated menus, categories, and items will be permanently deleted.

**Design decisions:** The separation of logo upload from the main form was a deliberate choice to avoid the complexity of mixing file uploads with the `useActionState` form pattern. The danger zone is visually distinguished with destructive colouring to prevent accidental deletion.

#### Menu Builder -- Categories with Drag Handles

`[Screenshot placeholder: Menu builder -- categories with drag handles]`

The menu builder page at `/venues/[venueId]/menu` displays all categories for the venue as vertically stacked, bordered card sections. Each category card has a grip icon (drag handle) on the left side, the category name as a heading, and action buttons for renaming and deleting the category on the right side. The categories can be reordered by dragging the grip handle; during a drag operation, a visual indicator shows the drop target position. A "Saving order..." text appears briefly while the new sort order is persisted to the API.

At the bottom of the category list, a dashed-border "Add Category" button spans the full width. Clicking it reveals an inline form with a text input for the category name, an "Add" button, and a "Cancel" button. The inline form pattern avoids the overhead of a modal dialog for this lightweight operation.

#### Menu Builder -- Items in a Category

`[Screenshot placeholder: Menu builder -- items in a category]`

Each category section in the menu builder expands to show its menu items. Each item is rendered as an `ItemCard` component displaying the item name, formatted price, an availability toggle switch, and edit/delete action buttons. If the item has a photo, a small thumbnail is displayed alongside the item details. Unavailable items are visually dimmed (reduced opacity) to indicate their hidden status on the public menu. An "Add Item" button within each category opens the item form dialog.

#### Item Form Dialog (Add/Edit)

`[Screenshot placeholder: Item form dialog (add/edit)]`

The item form is presented in a modal dialog (`Dialog` from shadcn/ui) with a maximum width of 480 pixels. The dialog title reads "Add Item" or "Edit Item" depending on the mode. The form contains four fields:

1. **Name** (required): A text input with the placeholder "e.g. Cheeseburger".
2. **Price** (required): A numeric input with step 0.01, minimum 0.01, prefixed with a dollar sign character positioned absolutely within the input.
3. **Description** (optional): A three-row textarea with the placeholder "Optional description...".
4. **Photo** (optional): A file input styled to match the application's design system, with a 64x64 pixel preview area to the left. The preview shows the selected file (via `FileReader`) or the existing image for edit mode. A "Max 4 MB" note appears below the file input, and a destructive warning replaces it if the selected file exceeds the limit.

The dialog footer contains "Cancel" and "Add Item" / "Save Changes" buttons. The submit button is disabled during form submission and when a file size warning is active.

#### QR Code Page

`[Screenshot placeholder: QR code page]`

The QR code page displays within a card component with a maximum width constraint. A back-navigation link at the top reads "Back to {venue name}" with an arrow icon. The card header shows "QR Code -- {venue name}" with a description instructing the user to print and display the code at their venue. The card body contains a centred 256x256 pixel QR code image, a muted-background panel showing the full menu URL in monospace text, a full-width "Download PNG" button with a download icon, and a note indicating the downloaded image resolution (512x512 pixels).

### 5.1.5 Functional Testing

#### Test Plans

The following test plans were developed and executed as part of the Sprint 1-2 User Acceptance Testing (UAT). Each test was conducted manually against the deployed application.

##### TP1.1: User Registration with Valid Data

| Field            | Value                                                                  |
|------------------|------------------------------------------------------------------------|
| **Test ID**      | TP1.1                                                                  |
| **Description**  | Verify that a new user can register with a valid email and password     |
| **Pre-condition**| The email address used is not already registered in the system          |
| **Steps**        | 1. Navigate to `/register`                                             |
|                  | 2. Enter a valid email address (e.g. `test@example.com`)               |
|                  | 3. Enter a valid password (minimum length met)                         |
|                  | 4. Click "Create account"                                              |
| **Expected Result** | User is redirected to the dashboard. An `access_token` cookie is set. The user's venues list is initially empty. |
| **Actual Result**   | User was successfully redirected to the dashboard with an empty venue list. JWT cookie was set correctly. |
| **Status**       | Pass                                                                   |

##### TP1.2: User Registration with Duplicate Email

| Field            | Value                                                                  |
|------------------|------------------------------------------------------------------------|
| **Test ID**      | TP1.2                                                                  |
| **Description**  | Verify that registration fails gracefully when the email is already in use |
| **Pre-condition**| A user with the email `test@example.com` already exists                 |
| **Steps**        | 1. Navigate to `/register`                                             |
|                  | 2. Enter the already-registered email address                          |
|                  | 3. Enter a valid password                                              |
|                  | 4. Click "Create account"                                              |
| **Expected Result** | An error message is displayed indicating the email is already registered. The user remains on the registration page. No new account is created. |
| **Actual Result**   | Error banner displayed "Email already registered". User remained on `/register`. |
| **Status**       | Pass                                                                   |

##### TP1.3: User Login with Valid Credentials

| Field            | Value                                                                  |
|------------------|------------------------------------------------------------------------|
| **Test ID**      | TP1.3                                                                  |
| **Description**  | Verify that an existing user can log in with correct credentials       |
| **Pre-condition**| A user account exists with known email and password                     |
| **Steps**        | 1. Navigate to `/login`                                                |
|                  | 2. Enter the registered email address                                  |
|                  | 3. Enter the correct password                                          |
|                  | 4. Click "Sign in"                                                     |
| **Expected Result** | User is redirected to the dashboard. An `access_token` cookie is set. The user's venues are listed in the sidebar. |
| **Actual Result**   | User was redirected to dashboard. Venues appeared in sidebar. JWT cookie was set. |
| **Status**       | Pass                                                                   |

##### TP1.4: User Login with Invalid Credentials

| Field            | Value                                                                  |
|------------------|------------------------------------------------------------------------|
| **Test ID**      | TP1.4                                                                  |
| **Description**  | Verify that login fails gracefully with incorrect credentials          |
| **Pre-condition**| A user account exists with a known email                               |
| **Steps**        | 1. Navigate to `/login`                                                |
|                  | 2. Enter the registered email address                                  |
|                  | 3. Enter an incorrect password                                         |
|                  | 4. Click "Sign in"                                                     |
| **Expected Result** | An error message is displayed. The user remains on the login page. No cookie is set. |
| **Actual Result**   | Error banner displayed with authentication failure message. User remained on `/login`. |
| **Status**       | Pass                                                                   |

##### TP1.5: Create Venue

| Field            | Value                                                                  |
|------------------|------------------------------------------------------------------------|
| **Test ID**      | TP1.5                                                                  |
| **Description**  | Verify that an authenticated user can create a new venue               |
| **Pre-condition**| User is logged in and on the dashboard                                 |
| **Steps**        | 1. Click "Create Venue" or navigate to `/venues/new`                   |
|                  | 2. Enter a venue name (e.g. "Bob's Burgers")                          |
|                  | 3. Enter a URL slug (e.g. "bobs-burgers")                             |
|                  | 4. Submit the form                                                     |
| **Expected Result** | User is redirected to the venue settings page. The venue appears in the dashboard sidebar. The public menu URL is displayed on the settings page. |
| **Actual Result**   | Venue was created and appeared in sidebar after `revalidatePath`. Redirected to venue settings page. |
| **Status**       | Pass                                                                   |

##### TP1.6: Update Venue Settings

| Field            | Value                                                                  |
|------------------|------------------------------------------------------------------------|
| **Test ID**      | TP1.6                                                                  |
| **Description**  | Verify that venue name, slug, and payment mode can be updated          |
| **Pre-condition**| A venue exists and the user is on its settings page                     |
| **Steps**        | 1. Change the venue name to a new value                                |
|                  | 2. Change the payment mode from "Both" to "Prepay Required"           |
|                  | 3. Click "Save changes"                                                |
| **Expected Result** | A success banner "Venue settings saved." appears. The sidebar reflects the updated name. The payment mode is persisted and shows correctly on page reload. |
| **Actual Result**   | Success banner appeared. Sidebar updated after `router.refresh()`. Payment mode persisted correctly. |
| **Status**       | Pass                                                                   |

##### TP1.7: Delete Venue (Cascade)

| Field            | Value                                                                  |
|------------------|------------------------------------------------------------------------|
| **Test ID**      | TP1.7                                                                  |
| **Description**  | Verify that deleting a venue removes all associated data               |
| **Pre-condition**| A venue exists with at least one category and one menu item            |
| **Steps**        | 1. Navigate to the venue settings page                                 |
|                  | 2. Scroll to the Danger Zone section                                   |
|                  | 3. Click "Delete venue"                                                |
|                  | 4. Confirm deletion in the alert dialog                                |
| **Expected Result** | The venue, all its categories, and all its items are deleted from the database. The user is redirected to the dashboard. The venue no longer appears in the sidebar. |
| **Actual Result**   | Venue and all cascaded records were deleted. User redirected to dashboard. Sidebar updated. |
| **Status**       | Pass                                                                   |

##### TP1.8: Create Menu Category

| Field            | Value                                                                  |
|------------------|------------------------------------------------------------------------|
| **Test ID**      | TP1.8                                                                  |
| **Description**  | Verify that a new menu category can be created within a venue          |
| **Pre-condition**| A venue exists and the user is on its menu builder page                 |
| **Steps**        | 1. Click "Add Category"                                                |
|                  | 2. Enter a category name (e.g. "Starters")                            |
|                  | 3. Click "Add"                                                         |
| **Expected Result** | The new category appears in the category list. The inline add form closes. The category is persisted to the database. |
| **Actual Result**   | Category appeared in the list after `router.refresh()`. Form closed. Category persisted in database. |
| **Status**       | Pass                                                                   |

##### TP1.9: Reorder Categories via Drag-Drop

| Field            | Value                                                                  |
|------------------|------------------------------------------------------------------------|
| **Test ID**      | TP1.9                                                                  |
| **Description**  | Verify that categories can be reordered by drag-and-drop               |
| **Pre-condition**| At least two categories exist in the venue                             |
| **Steps**        | 1. Grab the drag handle of the second category                         |
|                  | 2. Drag it above the first category                                    |
|                  | 3. Release the drag                                                    |
| **Expected Result** | The categories swap positions immediately (optimistic update). A "Saving order..." indicator appears briefly. After a page refresh, the new order is preserved. |
| **Actual Result**   | Categories swapped immediately. Sort order persisted correctly via API. Order preserved after refresh. |
| **Status**       | Pass                                                                   |

##### TP1.10: Create Menu Item with Photo

| Field            | Value                                                                  |
|------------------|------------------------------------------------------------------------|
| **Test ID**      | TP1.10                                                                 |
| **Description**  | Verify that a new menu item can be created with all fields including a photo |
| **Pre-condition**| A category exists in the venue                                         |
| **Steps**        | 1. Click "Add Item" within a category                                  |
|                  | 2. Enter item name (e.g. "Cheeseburger")                              |
|                  | 3. Enter price (e.g. "9.50")                                          |
|                  | 4. Enter description (e.g. "Classic beef burger with cheese")          |
|                  | 5. Select a photo file (under 4 MB)                                   |
|                  | 6. Verify the photo preview appears                                    |
|                  | 7. Click "Add Item"                                                    |
| **Expected Result** | The dialog closes. The new item appears in the category with its name, price, and photo thumbnail. The photo is uploaded to Vercel Blob storage. |
| **Actual Result**   | Item created with all fields. Photo uploaded to Vercel Blob. Thumbnail displayed in item card. |
| **Status**       | Pass                                                                   |

##### TP1.11: Toggle Item Availability

| Field            | Value                                                                  |
|------------------|------------------------------------------------------------------------|
| **Test ID**      | TP1.11                                                                 |
| **Description**  | Verify that an item's availability can be toggled on and off           |
| **Pre-condition**| A menu item exists and is currently available                           |
| **Steps**        | 1. Locate the item in the menu builder                                 |
|                  | 2. Click the availability toggle switch                                |
|                  | 3. Verify the item appears dimmed                                      |
|                  | 4. Navigate to the public menu page                                    |
|                  | 5. Verify the item is not visible                                      |
|                  | 6. Return to the menu builder and toggle the item back on              |
| **Expected Result** | The toggle correctly switches the item between available and unavailable states. The public menu reflects the availability status in real time. |
| **Actual Result**   | Toggle updated immediately. Item was hidden from public menu when unavailable. Re-enabling restored visibility. |
| **Status**       | Pass                                                                   |

##### TP1.12: Delete Menu Item

| Field            | Value                                                                  |
|------------------|------------------------------------------------------------------------|
| **Test ID**      | TP1.12                                                                 |
| **Description**  | Verify that a menu item can be deleted from a category                 |
| **Pre-condition**| A menu item exists in a category                                       |
| **Steps**        | 1. Locate the item in the menu builder                                 |
|                  | 2. Click the delete button on the item card                            |
|                  | 3. Confirm the deletion if prompted                                    |
| **Expected Result** | The item is removed from the category list. The item is deleted from the database. The category remains intact. |
| **Actual Result**   | Item removed from the list immediately. Database record deleted. Category unaffected. |
| **Status**       | Pass                                                                   |

#### Test Scripts

`[Screenshot placeholder: Test execution evidence -- showing test results for Sprint 1-2]`

Testing for Sprint 1-2 followed a manual User Acceptance Testing (UAT) approach. All twelve test plans (TP1.1 through TP1.12) were executed sequentially against the deployed application. Each test was performed by navigating the application in a web browser and verifying the expected behaviour against the actual result. Database state was verified by querying the PostgreSQL database via Prisma Studio where necessary (e.g. confirming cascade deletions in TP1.7, verifying sort order persistence in TP1.9).

The UAT resulted in **12 out of 12 tests passing**, confirming that all functional requirements for Sprint 1-2 were correctly implemented.

### 5.1.6 Sprint 1-2 Summary

Sprint 1-2 successfully delivered the core platform infrastructure: user authentication, multi-tenant venue management, and a fully functional menu builder with drag-drop reordering and photo uploads. The sprint produced a working vertical slice of the application from database to user interface.

**Challenges encountered and their resolutions:**

1. **react-hook-form incompatibility with Server Actions**: The initial form implementation used `react-hook-form` with its `handleSubmit` and `requestSubmit()` pattern. This approach proved incompatible with Next.js Server Actions, causing form submissions to fail silently. The resolution was to remove `react-hook-form` entirely and adopt the `useActionState` pattern with plain `action={formAction}` for all forms. This was established as a project-wide convention.

2. **@dnd-kit SSR hydration mismatch**: The `@dnd-kit` library generates `aria-describedby` attributes during rendering. Without a stable `id` prop on `DndContext`, different IDs were generated on the server and client, causing React hydration warnings. The fix was to pass a deterministic `id="menu-category-dnd"` to the `DndContext` component.

3. **@Body() array shape mismatch**: The NestJS reorder endpoint declared `@Body() items: ReorderItem[]`, expecting a bare JSON array. The initial client-side implementation sent `{ items: [...] }`, causing a 400 Bad Request error. The resolution was to send the bare array directly in the `fetch` body, matching the controller's expected shape.

4. **Infinite re-render loop in ItemForm**: The `onClose` callback prop, passed as an inline arrow function from the parent, created a new reference on each render. When included in the `useEffect` dependency array, this caused an infinite loop: the effect called `onClose`, which triggered `router.refresh()`, which re-rendered the parent, which created a new `onClose` reference, and so on. The resolution was the callback ref pattern: storing `onClose` in a mutable ref updated each render but excluded from the dependency array.

---

## 5.2 Sprint 3: Customer Ordering & Payments

### 5.2.1 Functional Requirements

Sprint 3 introduced the customer-facing ordering experience, transforming the platform from an administrative tool into a complete ordering system. The following requirements were implemented.

#### FR-9: Public Menu Browsing (No Authentication Required)

Customers access a venue's menu by navigating to `/menu/[slug]`, typically by scanning a QR code displayed at the venue. This route is entirely public and requires no authentication. The menu page is rendered as a server component that fetches the venue details and menu categories (with items) from the NestJS API's public endpoints (`/public/venues/:slug/menu`). Only items marked as available (`isAvailable: true`) are returned by the API.

The menu page (`MenuPage` client component) displays the venue name and logo at the top, followed by a horizontal category navigation bar (`CategoryNav` component) that allows customers to tap a category name to scroll to that section. Each menu item is rendered as a `MenuItemRow` component showing the item name, description, price, and photo (if available). Tapping an item opens an `ItemDetailSheet` (a bottom sheet on mobile) showing a larger photo, full description, and an "Add to cart" button.

#### FR-10: Cart Management

The cart is implemented as a custom React hook (`useCart`) in `apps/web/src/lib/cart.ts`. The hook manages cart state using React's `useState` and persists items to `localStorage` with a key scoped to the venue slug (`cart:{slug}`). This scoping ensures that customers visiting multiple venues maintain separate carts.

The cart is hydration-safe for server-side rendering: the initial state is always an empty array, and `localStorage` is only accessed after component mount within a `useEffect`. A `hydrated` boolean flag indicates when the cart has loaded from storage, allowing components to show a loading skeleton until hydration completes and preventing the brief flash of empty cart content.

The hook provides the following operations:
- **addItem**: Adds an item to the cart or increments its quantity if already present.
- **updateQuantity**: Sets the quantity of a specific item; removes the item if quantity falls to zero.
- **clearCart**: Empties the cart entirely (called after successful order placement).
- **total**: A computed property summing the price multiplied by quantity for all items.
- **itemCount**: A computed property summing the total number of items.

A floating `CartButton` component at the bottom of the menu page displays the current item count and total, providing one-tap navigation to the checkout page. A `CartDrawer` component allows customers to review and modify their cart contents before proceeding to checkout.

#### FR-11: Guest Checkout with Customer Name

The checkout page at `/menu/[slug]/checkout` displays a form requiring the customer's name. This name is associated with the order and displayed to venue staff on the live orders board for identification during collection. No account creation or email is required, supporting the walk-in, scan-and-order use case.

#### FR-12: Payment Mode Selection

The checkout form dynamically adapts based on the venue's `paymentMode` configuration:

- **PREPAY_REQUIRED**: Only the Stripe payment flow is available. The customer proceeds directly to the Stripe PaymentElement.
- **PAY_AT_COUNTER**: Only the pay-at-counter flow is available. The customer clicks "Place Order" and the order is created immediately with `RECEIVED` status.
- **BOTH**: Radio buttons are displayed allowing the customer to choose between "Pay now (card / Apple Pay / Google Pay)" and "Pay at counter". The default selection is Stripe.

An informational banner is shown for pay-at-counter orders explaining that the customer should pay when collecting their order.

#### FR-13: Order Creation with Correct Initial Status

When the customer submits the checkout form, an order is created via a POST request to `/public/venues/:slug/orders`. The request body contains the customer name, payment method, and an array of items with their menu item IDs and quantities. The API creates an `Order` record and associated `OrderItem` records.

The initial order status depends on the payment method:
- **PAY_AT_COUNTER**: The order is created with `RECEIVED` status immediately, as no payment processing is required before the order can be prepared.
- **STRIPE**: The order is created with `PENDING_PAYMENT` status. The order remains in this state until the Stripe webhook confirms successful payment.

Each `OrderItem` stores snapshot data: `itemNameAtOrder` and `unitPriceAtOrder` capture the item's name and price at the moment of ordering. This snapshot pattern ensures that subsequent changes to the menu (price adjustments, item renaming, or deletion) do not retroactively alter historical order records. The `menuItemId` foreign key is retained as a nullable field for analytics linkage but is set to `NULL` if the menu item is later deleted (`onDelete: SetNull`).

#### FR-14: Stripe PaymentIntent and Webhook Handling

For Stripe payments, the checkout follows a two-phase process:

1. **Phase A -- Order Creation**: The order is created in `PENDING_PAYMENT` status before any payment processing begins. This ensures the order exists in the database before the payment is initiated.

2. **Phase B -- PaymentIntent Creation**: A POST request to `/public/venues/:slug/orders/:orderId/payment-intent` creates a Stripe PaymentIntent with the order's total amount. The PaymentIntent's `metadata` includes the order ID for correlation during webhook processing. The `clientSecret` is returned to the client.

3. **Phase C -- Payment Confirmation**: The client renders a Stripe `PaymentElement` using the `@stripe/react-stripe-js` library. The customer enters payment details (card, Apple Pay, or Google Pay) and confirms the payment. On success, the client navigates to the order status page.

4. **Phase D -- Webhook Processing**: Stripe sends a `payment_intent.succeeded` event to the webhook endpoint. The webhook handler verifies the event signature, checks the `StripeEvent` idempotency table to prevent duplicate processing, extracts the order ID from the PaymentIntent metadata, and transitions the order from `PENDING_PAYMENT` to `RECEIVED`.

**Idempotency**: The `StripeEvent` model stores the `stripeEventId` (unique) and `processedAt` timestamp. Before processing any webhook event, the handler checks whether a record with that `stripeEventId` already exists. If so, the event is acknowledged (200 response) without reprocessing. This guards against Stripe's retry mechanism, which may resend events within a 72-hour window.

**Critical ordering constraint**: The order must always be created before the PaymentIntent. Creating the PaymentIntent first would risk a race condition where the webhook fires before the order exists in the database, causing the status transition to fail.

#### FR-15: Order Confirmation with Reference Code

Upon successful order placement (either payment method), the customer is redirected to the order status page at `/menu/[slug]/order/[orderId]`. A unique 8-character reference code (e.g. `#A3K9X2B7`) is prominently displayed at the top of the page, centred in a bordered panel with large, tracking-widened typography. This reference code is used for identification when the customer collects their order.

The order ID and reference code are also persisted to `localStorage` (`lastOrder:{slug}`) so that the customer can return to the status page after closing the browser or navigating away.

#### FR-16: Real-Time Order Status Tracking via WebSocket

The `OrderStatus` component on the order status page establishes a Socket.IO WebSocket connection to receive live status updates. The component defines a three-step progress indicator:

1. **Order Received** -- "We have your order"
2. **Preparing** -- "Your order is being prepared"
3. **Ready for Collection** -- "Your order is ready!"

Each step is visualised as a circular indicator connected by vertical lines. Completed steps show a green checkmark, the current step shows a solid black circle, and upcoming steps show an empty grey circle. The connector lines between steps change from grey to green as steps complete.

The WebSocket connection is anonymous (no JWT) and joins an order-specific room (`order:{orderId}`). When an `order:updated` event is received, the component updates the local status state and calls `router.refresh()` to sync the server component data. If the status reaches a terminal state (`READY`, `COMPLETED`, or `CANCELLED`), the WebSocket disconnects as no further updates are expected.

A fallback polling mechanism activates if the WebSocket connection fails after exhausting reconnection attempts (three retries). In this case, `router.refresh()` is called every five seconds to poll for status changes via server-side data fetching.

Special states are handled:
- **PENDING_PAYMENT**: Displays an amber-coloured banner with a spinning indicator and the message "Awaiting payment confirmation".
- **CANCELLED**: Displays a red-coloured banner indicating the order has been cancelled.

Below the status tracker, the order items are listed in a summary panel showing quantity, item name (from the snapshot), line totals, and the order total.

### 5.2.2 Use Case Diagram

`[Diagram placeholder: Sprint 3 Use Case Diagram -- Customer actor with use cases: Scan QR Code, Browse Menu, Add to Cart, Checkout, Pay with Stripe, Pay at Counter, View Order Status, Track Order (WebSocket)]`

The Sprint 3 use case diagram introduces a new primary actor: the **Customer**. This actor interacts with the system without authentication through the following use cases:

1. **Scan QR Code** -- The customer scans a QR code displayed at the venue, which opens the public menu URL in their mobile browser. This is the primary entry point for the customer journey.

2. **Browse Menu** -- The customer views the venue's menu organised by categories. They can navigate between categories using the horizontal category bar and view item details in a bottom sheet. This use case extends Scan QR Code.

3. **Add to Cart** -- The customer adds items to their cart with a default quantity of one. Multiple taps increment the quantity. The cart persists in localStorage.

4. **View Cart** -- The customer reviews their cart contents, modifies quantities, or removes items. This use case is accessible via the floating cart button.

5. **Checkout** -- The customer provides their name and selects a payment method (if the venue supports both). This use case requires that the cart is non-empty.

6. **Pay with Stripe** -- For venues configured with `PREPAY_REQUIRED` or `BOTH` (when selected by the customer), the checkout initiates a Stripe PaymentIntent and presents the PaymentElement. This use case extends Checkout.

7. **Pay at Counter** -- For venues configured with `PAY_AT_COUNTER` or `BOTH` (when selected by the customer), the order is placed immediately with `RECEIVED` status. This use case extends Checkout.

8. **View Order Confirmation** -- After successful checkout, the customer views their order reference code and item summary. This use case follows both payment paths.

9. **Track Order Status** -- The customer monitors their order's progress in real time via WebSocket updates. The status advances through Received, Preparing, and Ready stages. This use case includes a fallback to polling if WebSocket connectivity is unavailable.

The Customer actor has no association with the authentication use cases (Register, Login) from Sprint 1-2. The Venue Owner actor from Sprint 1-2 is not directly involved in Sprint 3 use cases but implicitly enables them by creating venues and configuring menus.

### 5.2.3 Class Diagram

`[Diagram placeholder: Sprint 3 Class Diagram -- Order, OrderItem, StripeEvent added. Order to OrderItem (1 to many), MenuItem to OrderItem (optional), Order to Venue]`

Sprint 3 introduces three new domain entities to the class diagram.

#### Order

| Attribute       | Type          | Constraints                            |
|-----------------|---------------|----------------------------------------|
| id              | UUID          | Primary key, auto-generated            |
| venueId         | UUID          | Foreign key to Venue                   |
| status          | OrderStatus   | Enum, default PENDING_PAYMENT          |
| paymentMethod   | PaymentMethod | Enum (STRIPE or PAY_AT_COUNTER)        |
| paymentIntentId | String?       | Nullable (null for PAC orders)         |
| totalAmount     | Decimal       | Decimal(10,2)                          |
| referenceCode   | String        | Unique, 8-character alphanumeric       |
| customerName    | String        | Required                               |
| createdAt       | DateTime      | Auto-set on creation                   |
| updatedAt       | DateTime      | Auto-updated on mutation               |

The `Order` class represents a customer's food order placed at a specific venue. The `status` field is a PostgreSQL enum with six possible values: `PENDING_PAYMENT`, `RECEIVED`, `PREPARING`, `READY`, `COMPLETED`, and `CANCELLED`. The `paymentMethod` enum distinguishes between `STRIPE` and `PAY_AT_COUNTER` orders. The `paymentIntentId` is only populated for Stripe orders and stores the Stripe PaymentIntent identifier for reconciliation. The `referenceCode` is a unique 8-character string used for customer identification at the counter. Orders cascade-delete with their parent venue.

**Relationships:**
- Order * ---1 Venue (many orders belong to one venue)
- Order 1 ---* OrderItem (one order contains one or more order items)

#### OrderItem

| Attribute         | Type     | Constraints                              |
|-------------------|----------|------------------------------------------|
| id                | UUID     | Primary key, auto-generated              |
| orderId           | UUID     | Foreign key to Order                     |
| menuItemId        | UUID?    | Nullable FK to MenuItem (analytics link) |
| itemNameAtOrder   | String   | Snapshot of item name at order time       |
| unitPriceAtOrder  | Decimal  | Decimal(10,2), snapshot of price          |
| quantity          | Int      | Required, minimum 1                      |
| selectedModifiers | JSONB    | Default empty array, v2 extensibility     |
| createdAt         | DateTime | Auto-set on creation                     |

The `OrderItem` class employs a **snapshot pattern**: the `itemNameAtOrder` and `unitPriceAtOrder` fields capture the item's name and unit price at the moment the order is placed. These snapshot fields are immutable after creation and are not affected by subsequent changes to the referenced `MenuItem`. This design decision ensures historical accuracy of order records, which is critical for financial reporting and dispute resolution.

The `menuItemId` foreign key is nullable and uses `onDelete: SetNull`. If a menu item is deleted after an order referencing it has been placed, the foreign key is set to `NULL` rather than cascading the deletion to the order item. The snapshot fields remain intact, preserving the complete order history.

The `selectedModifiers` JSONB field is reserved for version 2 functionality (item customisations such as size, extras, and dietary modifications). It defaults to an empty array in the current version.

**Relationships:**
- OrderItem * ---1 Order (many order items belong to one order)
- OrderItem * ---0..1 MenuItem (optional link; null if item deleted)

#### StripeEvent

| Attribute     | Type     | Constraints                          |
|---------------|----------|--------------------------------------|
| id            | UUID     | Primary key, auto-generated          |
| stripeEventId | String   | Unique (Stripe's event identifier)   |
| processedAt   | DateTime | Auto-set on processing               |
| eventType     | String   | e.g. "payment_intent.succeeded"      |

The `StripeEvent` class serves as an idempotency table for Stripe webhook processing. Each record represents a Stripe event that has been successfully processed by the application. Before processing any incoming webhook event, the handler queries this table to determine whether the event has already been handled. If a matching `stripeEventId` exists, the webhook returns a 200 response without reprocessing, preventing duplicate order status transitions that could occur due to Stripe's event retry mechanism (up to 72 hours).

**Relationships:** StripeEvent has no foreign key relationships to other entities. It is a standalone reference table.

### 5.2.4 Screen Design

#### Public Menu Page -- Category Tabs, Item Cards

`[Screenshot placeholder: Public menu page -- category tabs, item cards]`

The public menu page is designed for mobile-first use, as customers typically access it by scanning a QR code on their smartphone. At the top, the venue name and logo are displayed. Below this, a horizontally scrollable category navigation bar (`CategoryNav`) shows category names as tappable pills. Selecting a category scrolls the page to that section.

Each category section contains a heading and a list of `MenuItemRow` components. Each row displays the item name (bold), price (right-aligned), and an optional description (truncated to two lines). If the item has a photo, a small rounded thumbnail appears on the right side of the row. Tapping a row opens the `ItemDetailSheet`, a bottom sheet (on mobile) or side panel (on desktop) that shows a full-size photo, the complete description, and an "Add to cart" button.

At the bottom of the screen, a persistent `CartButton` shows the number of items in the cart and the total price. This button is only visible when the cart contains at least one item.

**Design decisions:** The mobile-first approach prioritises the primary use case of in-venue ordering. The horizontal category navigation avoids consuming vertical space. The bottom sheet pattern for item details follows established mobile UX conventions.

#### Cart Sidebar/Drawer

`[Screenshot placeholder: Cart sidebar/drawer]`

The `CartDrawer` component slides in from the right side of the screen when activated via the cart button. It displays each cart item with its name, unit price, quantity controls (increment/decrement buttons), and a line total. Below the item list, the order total is displayed in bold. A "Checkout" button at the bottom navigates to the checkout page. Items can be removed by decrementing the quantity to zero.

#### Checkout Page -- Customer Name and Payment Choice

`[Screenshot placeholder: Checkout page -- customer name + payment choice]`

The checkout page is rendered by the `CheckoutForm` component. The layout consists of:

1. **Customer Name Input**: A text field labelled "Your name" with a red asterisk indicating it is required. The field uses a large touch target (padding of 12 pixels vertically) for mobile usability.

2. **Payment Method Selection** (conditional): For venues with `paymentMode: 'BOTH'`, two radio buttons are displayed: "Pay now (card / Apple Pay / Google Pay)" and "Pay at counter". For venues with a single payment mode, this section is hidden and the appropriate flow is used automatically.

3. **Order Summary**: A bordered panel listing all cart items with names, quantities, and line totals. The order total is displayed in a grey-background footer row.

4. **Pay-at-Counter Instructions** (conditional): When the pay-at-counter option is selected, a blue-tinted informational banner explains: "Place your order now and pay at the counter when your order is ready."

5. **Submit Button**: A full-width black button with white text reading "Place Order" (for pay-at-counter) or "Proceed to Payment" (for Stripe). The button shows "Processing..." and is disabled during form submission.

Error messages appear in a red-bordered, red-tinted panel above the submit button when validation fails (empty name, empty cart) or when the API returns an error.

#### Stripe Payment Form

`[Screenshot placeholder: Stripe payment form]`

When the customer selects Stripe payment and clicks "Proceed to Payment", the checkout form is replaced by the Stripe `PaymentElement`. This component (from `@stripe/react-stripe-js`) renders Stripe's pre-built payment form, which supports card entry, Apple Pay, and Google Pay. Above the payment element, a summary panel shows the venue name and order total. Error messages from Stripe (e.g. declined card, insufficient funds) are displayed in the same red error panel style used throughout the checkout flow. Upon successful payment, the customer is automatically redirected to the order status page.

#### Order Confirmation with Reference Code

`[Screenshot placeholder: Order confirmation with reference code]`

The order status page prominently displays the 8-character order reference code in a centred panel with extra-large bold typography and wide letter spacing (tracking-widest). Below the reference code, the customer's name is shown. The page serves dual purposes: immediate confirmation that the order was placed, and ongoing status tracking.

#### Order Status Tracking Page

`[Screenshot placeholder: Order status tracking page]`

The order status page displays a vertical step indicator with three stages: "Order Received", "Preparing", and "Ready for Collection". Each stage is represented by a circular icon connected by vertical lines:

- **Completed stages**: Green circle with a white checkmark, green connector line, and green label text.
- **Current stage**: Black circle with a white dot in the centre, label in black text.
- **Upcoming stages**: Grey-bordered empty circle, grey connector line, and light grey label text.

Each stage has a descriptive subtitle (e.g. "Your order is being prepared"). Special states (Pending Payment, Cancelled) are displayed as coloured banners instead of the step indicator.

Below the status tracker, the order items are summarised in a bordered list showing quantity, item name (from snapshot), and line totals. The order total appears in a grey footer row.

A "Back to Menu" link at the bottom allows the customer to return to the venue's menu to place additional orders.

### 5.2.5 Functional Testing

#### Test Plans

##### TP3.1: Browse Menu by Scanning QR Code URL

| Field            | Value                                                                  |
|------------------|------------------------------------------------------------------------|
| **Test ID**      | TP3.1                                                                  |
| **Description**  | Verify that the public menu is accessible via the QR code URL without authentication |
| **Pre-condition**| A venue exists with at least one category and one available menu item   |
| **Steps**        | 1. Open the URL `/menu/{slug}` in a browser (simulating QR scan)       |
|                  | 2. Verify the venue name is displayed                                  |
|                  | 3. Verify categories are listed in the navigation bar                  |
|                  | 4. Verify available items are displayed with name, price, and photo    |
|                  | 5. Tap a category name and verify the page scrolls to that section     |
| **Expected Result** | The menu page loads without requiring login. Categories and available items are displayed correctly. Category navigation scrolls to the correct section. |
| **Actual Result**   | Menu loaded without authentication. All available items displayed. Category navigation scrolled correctly. Unavailable items were hidden. |
| **Status**       | Pass                                                                   |

##### TP3.2: Add Items to Cart

| Field            | Value                                                                  |
|------------------|------------------------------------------------------------------------|
| **Test ID**      | TP3.2                                                                  |
| **Description**  | Verify that items can be added to the cart and quantities update correctly |
| **Pre-condition**| The public menu page is open with available items                       |
| **Steps**        | 1. Tap on a menu item to open the detail sheet                         |
|                  | 2. Tap "Add to cart"                                                   |
|                  | 3. Verify the cart button appears with count "1"                       |
|                  | 4. Add the same item again                                             |
|                  | 5. Verify the cart count increases to "2"                              |
|                  | 6. Add a different item                                                |
|                  | 7. Verify the cart count increases to "3" and the total updates        |
| **Expected Result** | Items are added to the cart correctly. Adding the same item increments its quantity. The cart button displays the correct item count and total. |
| **Actual Result**   | Items added correctly. Duplicate items incremented quantity. Cart count and total updated accurately. |
| **Status**       | Pass                                                                   |

##### TP3.3: Cart Persists After Page Refresh

| Field            | Value                                                                  |
|------------------|------------------------------------------------------------------------|
| **Test ID**      | TP3.3                                                                  |
| **Description**  | Verify that cart contents persist across page refreshes via localStorage |
| **Pre-condition**| At least one item is in the cart                                       |
| **Steps**        | 1. Note the current cart contents and total                            |
|                  | 2. Refresh the browser page                                           |
|                  | 3. Wait for the page to fully load (hydration to complete)             |
|                  | 4. Verify the cart button shows the same count and total               |
|                  | 5. Open the cart drawer and verify all items are present               |
| **Expected Result** | Cart contents are identical before and after the page refresh. The loading skeleton is briefly shown during hydration. |
| **Actual Result**   | Cart persisted correctly via localStorage. Skeleton shown during hydration. All items and quantities preserved. |
| **Status**       | Pass                                                                   |

##### TP3.4: Checkout with Pay-at-Counter

| Field            | Value                                                                  |
|------------------|------------------------------------------------------------------------|
| **Test ID**      | TP3.4                                                                  |
| **Description**  | Verify the complete pay-at-counter checkout flow                       |
| **Pre-condition**| Venue payment mode is PAY_AT_COUNTER or BOTH. Cart contains items.     |
| **Steps**        | 1. Navigate to the checkout page                                       |
|                  | 2. Enter a customer name                                               |
|                  | 3. Select "Pay at counter" if payment mode is BOTH                     |
|                  | 4. Click "Place Order"                                                 |
|                  | 5. Verify redirection to order status page                             |
|                  | 6. Verify the reference code is displayed                              |
|                  | 7. Verify the order status is "Received"                               |
| **Expected Result** | The order is created with `RECEIVED` status. The customer is redirected to the order status page with a visible reference code. The cart is cleared. |
| **Actual Result**   | Order created with RECEIVED status. Reference code displayed. Cart cleared. Status page showed "Order Received" as the current step. |
| **Status**       | Pass                                                                   |

##### TP3.5: Checkout with Stripe Payment

| Field            | Value                                                                  |
|------------------|------------------------------------------------------------------------|
| **Test ID**      | TP3.5                                                                  |
| **Description**  | Verify the complete Stripe payment checkout flow                       |
| **Pre-condition**| Venue payment mode is PREPAY_REQUIRED or BOTH. Cart contains items. Stripe test keys configured. |
| **Steps**        | 1. Navigate to the checkout page                                       |
|                  | 2. Enter a customer name                                               |
|                  | 3. Select "Pay now" if payment mode is BOTH                            |
|                  | 4. Click "Proceed to Payment"                                         |
|                  | 5. Verify the Stripe PaymentElement appears                            |
|                  | 6. Enter test card details (4242 4242 4242 4242)                       |
|                  | 7. Confirm payment                                                     |
|                  | 8. Verify redirection to order status page                             |
|                  | 9. Verify the order status transitions to "Received" after webhook     |
| **Expected Result** | The order is created in `PENDING_PAYMENT` status. The Stripe PaymentElement renders correctly. After successful payment and webhook processing, the order transitions to `RECEIVED`. |
| **Actual Result**   | Order created in PENDING_PAYMENT. Stripe form rendered. Test payment succeeded. Webhook processed and order transitioned to RECEIVED. |
| **Status**       | Pass                                                                   |

##### TP3.6: Order Confirmation Shows Reference Code

| Field            | Value                                                                  |
|------------------|------------------------------------------------------------------------|
| **Test ID**      | TP3.6                                                                  |
| **Description**  | Verify that the order confirmation page displays a unique reference code |
| **Pre-condition**| An order has been successfully placed                                   |
| **Steps**        | 1. Complete a checkout (either payment method)                         |
|                  | 2. On the order status page, verify the reference code is displayed    |
|                  | 3. Verify the code is 8 characters and prominently positioned          |
|                  | 4. Verify the customer name is displayed below the reference code      |
|                  | 5. Verify the order items summary matches what was ordered             |
| **Expected Result** | An 8-character reference code is displayed in large, bold typography. The customer name and order items are correctly summarised. |
| **Actual Result**   | Reference code displayed as 8 characters with tracking-widest styling. Customer name and items matched the order. |
| **Status**       | Pass                                                                   |

##### TP3.7: Order Status Updates in Real-Time

| Field            | Value                                                                  |
|------------------|------------------------------------------------------------------------|
| **Test ID**      | TP3.7                                                                  |
| **Description**  | Verify that order status changes are pushed to the customer in real time |
| **Pre-condition**| An order exists in RECEIVED status. The customer is viewing the order status page. |
| **Steps**        | 1. Open the order status page in one browser tab (customer view)       |
|                  | 2. Open the live orders board in another tab (venue owner view)        |
|                  | 3. Advance the order from RECEIVED to PREPARING on the owner board    |
|                  | 4. Verify the customer's status page updates to show "Preparing"       |
|                  | 5. Advance the order to READY                                          |
|                  | 6. Verify the customer's status page updates to show "Ready for Collection" |
| **Expected Result** | Status changes made by the venue owner are immediately reflected on the customer's order status page without requiring a manual page refresh. |
| **Actual Result**   | WebSocket push delivered status updates within one second. Step indicator advanced correctly. |
| **Status**       | Pass                                                                   |

##### TP3.8: Empty Cart Prevented from Checkout

| Field            | Value                                                                  |
|------------------|------------------------------------------------------------------------|
| **Test ID**      | TP3.8                                                                  |
| **Description**  | Verify that a customer cannot submit checkout with an empty cart       |
| **Pre-condition**| The cart is empty or has been cleared                                   |
| **Steps**        | 1. Navigate directly to `/menu/{slug}/checkout` with an empty cart     |
|                  | 2. Enter a customer name                                               |
|                  | 3. Attempt to submit the form                                          |
| **Expected Result** | The checkout form displays a message indicating the cart is empty and provides a link back to the menu. The submit button is not displayed when the cart is empty. |
| **Actual Result**   | "Your cart is empty" message displayed with a "Go back to menu" link. Submit button was hidden. |
| **Status**       | Pass                                                                   |

#### Test Scripts

`[Screenshot placeholder: Test execution evidence for Sprint 3]`

Testing for Sprint 3 followed the same manual UAT approach established in Sprint 1-2. All eight test plans (TP3.1 through TP3.8) were executed against the deployed application. Stripe payment testing used Stripe's test mode with the standard test card number (4242 4242 4242 4242). Webhook testing was validated by monitoring the Stripe dashboard's webhook event log and verifying order status transitions in the application's database.

Real-time WebSocket testing (TP3.7) required two browser tabs open simultaneously: one acting as the customer viewing the order status page, and another acting as the venue owner managing orders on the live orders board. All eight tests passed successfully.

### 5.2.6 Sprint 3 Summary

Sprint 3 transformed the Bite Byte platform from an administrative menu management tool into a fully functional ordering system. Customers can now scan a QR code, browse a menu, add items to a cart, complete checkout with either Stripe or pay-at-counter, and track their order status in real time.

**Challenges encountered and their resolutions:**

1. **Stripe webhook idempotency**: Stripe's retry mechanism can resend webhook events for up to 72 hours if the initial delivery fails or times out. Without idempotency protection, a retried `payment_intent.succeeded` event could cause duplicate order status transitions or other side effects. The resolution was the `StripeEvent` idempotency table, which records every processed event by its Stripe event ID. Duplicate events are acknowledged without reprocessing.

2. **localStorage SSR hydration mismatch**: Accessing `localStorage` during server-side rendering causes a hydration mismatch because the server has no access to client-side storage. The initial implementation caused a flash of empty cart content followed by a sudden appearance of cart items after hydration. The resolution was the `hydrated` boolean flag in the `useCart` hook: the initial state is always empty (matching SSR output), `localStorage` is read in a `useEffect` after mount, and components display a loading skeleton until `hydrated` becomes `true`.

3. **CORS configuration**: The Next.js front-end and NestJS API run on different ports during development (3000 and 3001, respectively). Client-side `fetch` calls from the public menu pages (which run in the browser) were blocked by the browser's same-origin policy. The resolution was enabling CORS in the NestJS `main.ts` bootstrap with appropriate origin configuration.

4. **Order creation sequence for Stripe**: An early design considered creating the PaymentIntent first and the order upon webhook confirmation. This was rejected because it creates a window where the payment succeeds but the order does not yet exist, leading to a poor customer experience. The final design always creates the order first (in `PENDING_PAYMENT` status) and then creates the PaymentIntent, ensuring the order record is available when the webhook fires.

---

## 5.3 Sprint 4: Real-time Operations & Analytics

### 5.3.1 Functional Requirements

Sprint 4 completed the platform's operational capabilities by providing venue owners with real-time order management tools and business analytics. The following requirements were implemented.

#### FR-17: Live Orders Board with WebSocket Push

The live orders board at `/venues/[venueId]/orders` displays incoming orders in a kanban-style three-column layout. The `OrdersBoard` component manages the board, which organises orders into columns by status:

- **Received** (blue header): Orders that have been placed and are awaiting preparation.
- **Preparing** (orange header): Orders currently being prepared.
- **Ready** (green header): Orders that are ready for customer collection.

Each column header includes a badge showing the current count of orders in that status. Individual orders are rendered as `OrderCard` components displaying the reference code, customer name, item list, order total, and a button to advance the order to the next status.

The board establishes an authenticated WebSocket connection using the venue owner's JWT token. Upon connection, the client emits a `join:venue` event with the venue ID, subscribing to the `venue:{venueId}` room. The server pushes two types of events:

- **order:new**: A new order has been placed at the venue. The order card appears in the Received column with a brief highlight animation. An audio alert plays (unless muted).
- **order:updated**: An order's status has changed. The order card moves to the appropriate column.

On initial connection and on every reconnection, the board performs a REST API fetch (`fetchActiveOrders`) to ensure the displayed state is synchronised with the server. This guards against missed WebSocket events during brief disconnections.

A mute/unmute button in the header (volume icon) allows the venue owner to toggle the audio alert for new orders. The mute preference is persisted to `localStorage` per venue.

If the WebSocket connection fails after three reconnection attempts, the board falls back to REST polling every five seconds via `fetchActiveOrders`.

#### FR-18: Order Status Transitions (Forward-Only State Machine)

Order status transitions follow a strictly forward-only state machine:

```
PENDING_PAYMENT --> RECEIVED --> PREPARING --> READY --> COMPLETED
```

The `CANCELLED` status can be reached from any non-terminal state but is not currently exposed in the UI.

Each `OrderCard` displays a single action button corresponding to the next valid status:
- A Received order shows a "Start Preparing" button.
- A Preparing order shows a "Mark Ready" button.
- A Ready order shows a "Complete" button.

Status updates are performed optimistically: the local state updates immediately when the button is clicked, and the API call is made asynchronously. If the API call fails, the board reverts to the server's actual state by re-fetching active orders.

Completed orders remain visible on the board for 30 seconds (via `setTimeout`) before being automatically removed, giving venue staff time to confirm the handoff.

#### FR-19: Real-Time Push to Customers

When a venue owner changes an order's status, the server emits an `order:updated` event to two WebSocket rooms simultaneously:

- **venue:{venueId}**: The venue owner's live orders board receives the update (for multi-device scenarios or to reflect changes made by another staff member).
- **order:{orderId}**: The customer's order status page receives the update, advancing the step indicator in real time.

This bidirectional push ensures that both the venue operator and the customer have a consistent, real-time view of the order's progress without polling.

#### FR-20: Revenue Analytics

The analytics page at `/venues/[venueId]/analytics` displays revenue summaries in three card components (`RevenueCards`):

- **Today**: Total revenue from completed orders placed today.
- **This Week**: Total revenue from completed orders placed within the current calendar week.
- **This Month**: Total revenue from completed orders placed within the current calendar month.

Revenue figures are formatted as GBP currency using `Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' })`. Each card displays the period label, a pound sterling icon, and the formatted amount in large bold typography.

All analytics are based exclusively on orders with `COMPLETED` status, ensuring that pending, cancelled, or in-progress orders do not inflate revenue figures.

#### FR-21: Top-Selling Items

The `TopItemsList` component displays a ranked list of the venue's most frequently ordered items. Each entry shows the item name, total quantity sold, and total revenue generated. The list is derived from `OrderItem` records linked to completed orders, aggregated by `menuItemId` (using the snapshot `itemNameAtOrder` for display to handle deleted items). Items are sorted by total quantity in descending order.

#### FR-22: Daily Order Volume

The `OrderVolumeChart` component displays a bar or line chart showing the number of completed orders per day over the most recent seven-day period. The data is fetched from the `fetchDailyVolume` analytics action, which aggregates completed orders by their creation date. The chart provides venue owners with a visual trend of their order volume, helping identify busy periods and growth patterns.

#### FR-23: Order History with Date Range Filtering and Pagination

The order history page at `/venues/[venueId]/history` provides a searchable, paginated table of all orders for the venue. The `OrderHistoryTable` component accepts optional `from` and `to` date parameters (passed as URL search parameters) to filter orders by creation date. Results are paginated at 20 orders per page.

The table displays the order reference code, customer name, status (as a coloured badge), total amount, payment method, and creation timestamp for each order. Date range filters are applied via URL search parameters, enabling bookmarkable filtered views and browser back/forward navigation through filter states.

### 5.3.2 Use Case Diagram

`[Diagram placeholder: Sprint 4 Use Case Diagram -- Venue Owner: View Live Orders, Update Order Status, View Analytics, View Order History]`

The Sprint 4 use case diagram extends the **Venue Owner** actor with four new use cases:

1. **View Live Orders** -- The venue owner opens the live orders board to see all active orders (RECEIVED, PREPARING, READY) in a kanban layout. The board connects via WebSocket and receives real-time updates. This use case includes the sub-use case **Receive New Order Alert**, which plays an audio notification and highlights the new order card.

2. **Update Order Status** -- The venue owner advances an order through the status pipeline (RECEIVED to PREPARING to READY to COMPLETED) by clicking the appropriate action button on an order card. This use case has a `<<triggers>>` relationship with the customer-facing **Track Order Status** use case from Sprint 3, as the status change is pushed to the customer in real time.

3. **View Analytics** -- The venue owner views business performance metrics including today's revenue, weekly revenue, monthly revenue, top-selling items, and daily order volume. This use case requires that at least one completed order exists for the venue.

4. **View Order History** -- The venue owner browses a paginated list of all orders, optionally filtered by date range. This use case supports operational review and record-keeping.

All Sprint 4 use cases require authentication (`<<include>>` relationship with Login) and are accessed from the venue-specific navigation in the dashboard sidebar.

### 5.3.3 Class Diagram

`[Diagram placeholder: Sprint 4 Class Diagram -- no new models, but show WebSocket gateway and analytics service relationships]`

Sprint 4 does not introduce new persistent data models. The existing `Order`, `OrderItem`, and related entities from Sprint 3 are sufficient for all Sprint 4 functionality. However, the architectural class diagram is extended with the following service-layer components:

#### OrdersGateway (WebSocket)

The `OrdersGateway` is a NestJS `@WebSocketGateway` that manages real-time communication. It maintains two types of rooms:

- **venue:{venueId}**: Joined by authenticated venue owners. Receives `order:new` and `order:updated` events for all orders in the venue.
- **order:{orderId}**: Joined by anonymous customers. Receives `order:updated` events for a specific order.

The gateway handles the following client-to-server events:
- `join:venue` -- Subscribes the socket to the venue room (requires JWT authentication).
- `join:order` -- Subscribes the socket to the order room (no authentication required).

The gateway emits the following server-to-client events:
- `order:new` -- Emitted to the venue room when a new order is created.
- `order:updated` -- Emitted to both the venue room and the order room when an order's status changes.

#### AnalyticsService

The `AnalyticsService` provides three query methods:

- **getRevenue(venueId)**: Aggregates `totalAmount` from completed orders grouped by time period (today, this week, this month).
- **getTopItems(venueId)**: Aggregates `OrderItem` records from completed orders, grouped by `menuItemId`, sorted by total quantity descending.
- **getDailyVolume(venueId, days)**: Counts completed orders per day for the specified number of recent days.

All analytics queries filter exclusively on `status = 'COMPLETED'` to ensure accuracy.

### 5.3.4 Screen Design

#### Live Orders Board / Kanban

`[Screenshot placeholder: Live orders board / kanban]`

The live orders board occupies the full viewport height with a sticky header containing the page title "Live Orders" and a mute/unmute toggle button (speaker icon). Below the header, a three-column grid layout presents the order pipeline:

- **Received column**: Blue header text, blue badge showing count. Contains order cards for newly received orders.
- **Preparing column**: Orange header text. Contains order cards for orders currently being prepared.
- **Ready column**: Green header text. Contains order cards for orders ready for collection.

Each column header displays the status label in uppercase, small font with wide tracking, followed by a secondary-styled badge showing the number of orders in that column. When a column is empty, a centred "No orders" placeholder in muted text is shown.

A `ConnectionBanner` component appears at the top of the board (below the header) when the WebSocket connection is lost. The banner is only shown after the first successful connection has been established, preventing a flash of the disconnection message during initial page load.

On mobile devices (below the `lg` breakpoint), the three columns stack vertically in a single-column layout.

**Design decision:** The kanban-style layout was chosen to provide an at-a-glance overview of the kitchen pipeline, a pattern familiar from physical order management systems. The colour coding (blue, orange, green) provides instant visual differentiation between stages.

#### Order Status Transition Buttons

`[Screenshot placeholder: Order status transition buttons]`

Each `OrderCard` on the live orders board displays the order reference code, customer name, a summary of ordered items (name and quantity), the order total, and a single action button. The action button is contextual:

- For RECEIVED orders: The button reads "Start Preparing" and advances the order to PREPARING.
- For PREPARING orders: The button reads "Mark Ready" and advances the order to READY.
- For READY orders: The button reads "Complete" and advances the order to COMPLETED.

New orders arriving via WebSocket are highlighted with a brief animation (pulse or glow effect) and trigger an audio alert sound. The animation lasts two seconds before the card settles into its normal appearance.

Completed orders fade out of the Ready column after a 30-second delay, providing a buffer for staff to confirm the order has been collected.

#### Analytics Dashboard -- Revenue Cards

`[Screenshot placeholder: Analytics dashboard -- revenue cards]`

The analytics page opens with three revenue summary cards arranged in a responsive grid (three columns on desktop, stacking to a single column on mobile). Each card follows the shadcn/ui `Card` pattern with:

- A header containing the period label ("Today", "This Week", "This Month") in muted text and a pound sterling icon.
- A body containing the revenue figure in large (2xl), bold typography, formatted as GBP currency (e.g. "£1,234.56").

The page header reads "Analytics" with a subtitle "Business performance overview for your venue".

#### Analytics -- Top Items Chart

`[Screenshot placeholder: Analytics -- top items chart]`

The `TopItemsList` component displays a ranked list of the venue's best-selling items. Each entry shows the item's rank, name, total quantity sold, and total revenue. The list is presented in a card or table format, ordered by quantity sold in descending order. This visualisation helps venue owners identify their most popular offerings for inventory planning and menu optimisation.

#### Analytics -- Daily Volume Chart

`[Screenshot placeholder: Analytics -- daily volume chart]`

The `OrderVolumeChart` component renders a chart (bar or line) showing the number of completed orders per day for the most recent seven days. The x-axis displays dates and the y-axis displays order counts. This chart provides a quick visual indication of daily trends and helps venue owners identify peak ordering days.

The analytics page arranges the daily volume chart and top items list side by side in a two-column grid on desktop, stacking vertically on mobile.

#### Order History Table with Filters

`[Screenshot placeholder: Order history table with filters]`

The order history page displays a filterable, paginated data table. At the top of the page, date range filter inputs ("From" and "To") allow the venue owner to narrow the displayed orders to a specific time period. The filters are applied via URL search parameters, enabling bookmarkable and shareable filtered views.

The table columns include:
- **Reference Code**: The 8-character order identifier.
- **Customer Name**: The name provided at checkout.
- **Status**: Displayed as a coloured badge (e.g. green for COMPLETED, blue for RECEIVED).
- **Total Amount**: Formatted as GBP currency.
- **Payment Method**: STRIPE or PAY_AT_COUNTER.
- **Created At**: Timestamp of order creation.

Pagination controls at the bottom of the table navigate between pages of 20 results each. The page title reads "Order History" with a subtitle "Browse and filter all orders for this venue".

### 5.3.5 Functional Testing

#### Test Plans

##### TP4.1: New Order Appears on Live Board via WebSocket

| Field            | Value                                                                  |
|------------------|------------------------------------------------------------------------|
| **Test ID**      | TP4.1                                                                  |
| **Description**  | Verify that a new order placed by a customer appears on the live orders board in real time |
| **Pre-condition**| The venue owner has the live orders board open. A customer is on the venue's menu page. |
| **Steps**        | 1. Venue owner opens the live orders board for their venue              |
|                  | 2. Verify the WebSocket connection is established (no disconnection banner) |
|                  | 3. In a separate browser, place a pay-at-counter order as a customer   |
|                  | 4. Observe the live orders board                                       |
| **Expected Result** | The new order appears in the Received column within one second. An audio alert plays (if not muted). The order card shows the reference code, customer name, and items. The column count badge increments. |
| **Actual Result**   | Order appeared in Received column within one second. Audio alert played. Card displayed correct details. Badge count updated. |
| **Status**       | Pass                                                                   |

##### TP4.2: Status Transition Updates Customer Page

| Field            | Value                                                                  |
|------------------|------------------------------------------------------------------------|
| **Test ID**      | TP4.2                                                                  |
| **Description**  | Verify that advancing an order's status on the live board pushes the update to the customer's status page |
| **Pre-condition**| An order exists in RECEIVED status. The customer has the order status page open. The venue owner has the live orders board open. |
| **Steps**        | 1. On the live orders board, click "Start Preparing" on the order card |
|                  | 2. Verify the order moves to the Preparing column                      |
|                  | 3. On the customer's browser, verify the status updates to "Preparing" |
|                  | 4. Click "Mark Ready" on the order card                                |
|                  | 5. Verify the customer's status page shows "Ready for Collection"      |
| **Expected Result** | Each status transition is reflected on both the venue owner's board and the customer's status page within one second. The step indicator advances correctly. |
| **Actual Result**   | Both transitions pushed to customer within one second. Step indicator advanced through Preparing and Ready stages. |
| **Status**       | Pass                                                                   |

##### TP4.3: Revenue Summary Shows Correct Amounts

| Field            | Value                                                                  |
|------------------|------------------------------------------------------------------------|
| **Test ID**      | TP4.3                                                                  |
| **Description**  | Verify that the revenue analytics display correct totals for completed orders |
| **Pre-condition**| At least one order has been completed today                             |
| **Steps**        | 1. Navigate to the analytics page for the venue                        |
|                  | 2. Note the "Today" revenue figure                                     |
|                  | 3. Complete a new order with a known total (e.g. £15.00)               |
|                  | 4. Refresh the analytics page                                          |
|                  | 5. Verify the "Today" revenue has increased by £15.00                  |
| **Expected Result** | The today revenue figure accurately reflects the sum of all completed orders placed today. Only COMPLETED orders are included (not pending or cancelled). |
| **Actual Result**   | Revenue figure increased by exactly £15.00 after completing the order. Pending orders were not counted. |
| **Status**       | Pass                                                                   |

##### TP4.4: Top Items Display Correctly

| Field            | Value                                                                  |
|------------------|------------------------------------------------------------------------|
| **Test ID**      | TP4.4                                                                  |
| **Description**  | Verify that the top-selling items list shows correct rankings and quantities |
| **Pre-condition**| Multiple completed orders exist with different items                    |
| **Steps**        | 1. Navigate to the analytics page                                      |
|                  | 2. Examine the top items list                                          |
|                  | 3. Verify items are sorted by total quantity sold (descending)          |
|                  | 4. Cross-reference the quantities with the order history               |
| **Expected Result** | The top items list accurately reflects the most-ordered items across all completed orders. Rankings match manual calculation from order history. |
| **Actual Result**   | Top items list displayed correctly sorted by quantity. Revenue figures matched manual calculation. |
| **Status**       | Pass                                                                   |

##### TP4.5: Order History Filters by Date Range

| Field            | Value                                                                  |
|------------------|------------------------------------------------------------------------|
| **Test ID**      | TP4.5                                                                  |
| **Description**  | Verify that the order history table correctly filters orders by date range |
| **Pre-condition**| Orders exist across multiple dates                                     |
| **Steps**        | 1. Navigate to the order history page                                  |
|                  | 2. Note the total number of orders displayed                           |
|                  | 3. Set a "From" date that excludes some orders                         |
|                  | 4. Verify the table updates to show only orders on or after that date  |
|                  | 5. Set a "To" date that further narrows the range                      |
|                  | 6. Verify the table shows only orders within the specified range       |
|                  | 7. Clear the filters and verify all orders are shown again             |
| **Expected Result** | The date range filter correctly includes only orders whose creation date falls within the specified range. Clearing filters restores the full list. URL search parameters update to reflect the filter state. |
| **Actual Result**   | Date filters correctly narrowed the displayed orders. URL parameters updated. Clearing filters restored full list. |
| **Status**       | Pass                                                                   |

##### TP4.6: WebSocket Reconnection Re-fetches State

| Field            | Value                                                                  |
|------------------|------------------------------------------------------------------------|
| **Test ID**      | TP4.6                                                                  |
| **Description**  | Verify that the live orders board re-synchronises state after a WebSocket reconnection |
| **Pre-condition**| The live orders board is open with an active WebSocket connection       |
| **Steps**        | 1. Open the live orders board                                          |
|                  | 2. Simulate a temporary network disconnection (e.g. disable network adapter briefly) |
|                  | 3. While disconnected, place a new order via a separate device          |
|                  | 4. Re-enable the network connection                                    |
|                  | 5. Verify the WebSocket reconnects                                     |
|                  | 6. Verify the board re-fetches all active orders and displays the new order |
| **Expected Result** | After reconnection, the board performs a full re-fetch of active orders. Any orders placed during the disconnection period appear on the board. The connection banner disappears once connected. |
| **Actual Result**   | WebSocket reconnected after network restoration. Board re-fetched active orders via REST API. The order placed during disconnection appeared in the Received column. Connection banner cleared. |
| **Status**       | Pass                                                                   |

#### Test Scripts

`[Screenshot placeholder: Test execution evidence for Sprint 4]`

Testing for Sprint 4 followed the same manual UAT methodology. All six test plans (TP4.1 through TP4.6) were executed against the deployed application. Real-time functionality testing required two simultaneous browser sessions: one authenticated as the venue owner viewing the live orders board or analytics, and one as an anonymous customer placing orders and viewing the order status page. WebSocket reconnection testing (TP4.6) was performed by temporarily disabling the network adapter on the owner's device to simulate connectivity loss.

All six tests passed successfully, confirming the correct implementation of real-time order management, analytics, and resilient WebSocket connectivity.

### 5.3.6 Sprint 4 Summary

Sprint 4 completed the operational layer of the Bite Byte platform. Venue owners now have a real-time live orders board that receives instant WebSocket notifications when customers place orders, allowing them to manage the kitchen pipeline through a kanban-style interface. The analytics dashboard provides immediate business insights with revenue summaries, top-selling item rankings, and daily order volume trends. The order history page supports retrospective review with date range filtering and pagination.

**Challenges encountered and their resolutions:**

1. **Connection banner timing**: The initial implementation displayed the WebSocket disconnection banner immediately on page load, as the connection had not yet been established. This created a misleading user experience where a brief "Disconnected" flash appeared every time the page was opened. The resolution was to track whether a successful connection had ever been established (`hasConnectedOnce` ref) and only render the `ConnectionBanner` component after the first successful connect event.

2. **Stale closure in WebSocket event handlers**: The mute toggle state (`isMuted`) was captured in the closure of the `handleOrderNew` callback registered with the Socket.IO client. Because this callback was only registered once (in the `useEffect` setup), subsequent state changes to `isMuted` were not reflected in the handler. The resolution applied the established callback ref pattern from the project memory: `isMuted` is mirrored in a mutable ref (`isMutedRef`) that is updated on every render, and the event handler reads from the ref instead of the state variable.

3. **Optimistic update rollback**: Status transition buttons use optimistic updates for responsiveness -- the local state changes immediately before the API call completes. If the API call fails (e.g. due to network issues), the board must revert to the server's actual state. The resolution was a catch block that re-fetches all active orders from the REST API (`fetchActiveOrders`) upon API failure, replacing the optimistic local state with the authoritative server state.

4. **Server Actions directive**: The analytics and order management actions initially lacked the `'use server'` directive at the top of their respective action files. This caused Next.js to treat them as client-side code rather than Server Actions, resulting in build errors. The resolution was to add the `'use server'` directive to the `orders.ts` and `analytics.ts` action files.
