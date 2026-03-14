---
status: complete
phase: 02-auth-and-venue-setup
source: [02-01-SUMMARY.md, 02-02-SUMMARY.md, 02-03-SUMMARY.md, 02-04-SUMMARY.md, 02-05-SUMMARY.md]
started: 2026-03-03T12:00:00Z
updated: 2026-03-03T12:00:00Z
---

## Current Test
<!-- OVERWRITE each test - shows where we are -->

number: 12
name: Delete a venue
expected: On a venue's settings page, click Delete. A confirmation dialog should appear. Confirm deletion. The venue should be removed from the dashboard and sidebar.
result: complete

## Tests

### 1. Register a new account
expected: Navigate to /register. Fill in email and password. Submit the form. You should be redirected to /dashboard with no errors.
result: pass
notes: "Fixed form submission loop, JWT_SECRET async loading, duplicate /dashboard route, and Neon DB connection. Pass for now — full retest after iteration."

### 2. Login with existing account
expected: Navigate to /login. Enter the credentials you just registered with. Submit. You should be redirected to /dashboard.
result: pass
notes: "Added pt-6 spacing between password field and Sign In button."

### 3. Session persists across browser refresh
expected: While logged in on /dashboard, refresh the page (F5 or Cmd+R). You should remain on /dashboard, NOT be redirected to /login.
result: pass

### 4. Logout
expected: On the dashboard, click the Logout button. You should be redirected to /login. Navigating to /dashboard should redirect you back to /login (protected route).
result: pass

### 5. Create a venue
expected: Log in, go to dashboard. Click "Create Venue" (or the dashed-border card). Fill in a venue name — the slug field should auto-generate from the name. Submit. The new venue should appear on the dashboard grid and in the sidebar.
result: pass
notes: "Fixed same react-hook-form + requestSubmit loop as auth pages."

### 6. Edit venue settings and payment mode
expected: Click into a venue from the dashboard or sidebar. On the venue settings page, change the venue name, slug, or payment mode (Prepay Required / Pay at Counter / Both). Save. Changes should persist after page refresh.
result: pass
notes: "Added revalidatePath + router.refresh() for immediate UI update. Made name/slug/paymentMode controlled state."

### 7. QR code view and download
expected: On a venue's page, navigate to the QR code section/page. A QR code image should display (512x512 preview). A download button should save a PNG file. The QR code should encode the venue's public menu URL.
result: pass

### 8. Add a menu category
expected: Navigate to a venue's menu page (/venues/[venueId]/menu). Use the "Add Category" form to create a new category (e.g., "Appetizers"). The category should appear in the list immediately.
result: pass
notes: "Fixed refetch with router.refresh() + useEffect sync. Added sidebar Menu/Settings sub-links."

### 9. Drag-and-drop reorder categories
expected: With 2+ categories on the menu page, grab a category by its drag handle (grip icon) and drag it to a new position. The order should update visually on drop and persist after page refresh.
result: pass
notes: "Fixed: client was sending { items: [...] } but API expected bare array. Changed JSON.stringify({ items }) → JSON.stringify(items). Fixed DnD hydration mismatch with stable DndContext id."

### 10. Add a menu item
expected: Click "Add Item" on a category. A dialog appears with fields for name, price, description, and photo. Fill in name and price (minimum). Submit. The item should appear in that category's item list.
result: pass

### 11. Toggle item availability
expected: On an existing menu item, click the availability toggle switch. The item should visually change to show it's unavailable (or available). The state should persist after page refresh.
result: pass

### 12. Delete a venue
expected: On a venue's settings page, click Delete. A confirmation dialog should appear. Confirm deletion. The venue should be removed from the dashboard and sidebar.
result: pass
notes: "Added onDelete: Cascade to MenuCategory→Venue, MenuItem→MenuCategory, Order→Venue relations and ran migration."

## Summary

total: 12
passed: 12
issues: 0
pending: 0
skipped: 0

## Gaps

[none yet]
