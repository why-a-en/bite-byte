# Appendix

## Appendix A: Project Proposal

`[Placeholder: Insert original project proposal document here]`

The project proposal included the following sections:

### A.1 Project Overview

Bite Byte is a QR code-based food ordering platform designed for small, independent food and beverage venues. The platform enables venue owners to create digital menus accessible via QR codes, through which customers can browse items, place orders, and make payments without downloading a dedicated application. The system provides venue owners with real-time order management tools and business analytics.

### A.2 Project Aim

To design and develop a QR code-based food ordering platform that enables small venues to digitise their ordering process, reducing wait times and order errors while providing venue owners with real-time operational tools and business analytics.

### A.3 Objectives

| Ref | Objective | Estimated Duration |
|-----|-----------|-------------------|
| OBJ-01 | Research existing food ordering solutions and identify the market gap for small independent venues | 2 weeks |
| OBJ-02 | Plan the project using Agile/Scrum methodology with sprint-based delivery and MoSCoW prioritisation | 1 week |
| OBJ-03 | Design a monorepo architecture with REST API, WebSocket communication, and a Prisma schema supporting multi-tenant isolation | 2 weeks |
| OBJ-04 | Develop Sprint 1: authentication system and venue setup | 2 weeks |
| OBJ-05 | Develop Sprint 2: menu builder with categorisation, drag-and-drop reordering, and image uploads | 2 weeks |
| OBJ-06 | Develop Sprint 3: customer-facing ordering flow with cart management and Stripe payment integration | 3 weeks |
| OBJ-07 | Develop Sprint 4: real-time order tracking, live dashboard, and analytics | 2 weeks |
| OBJ-08 | Conduct User Acceptance Testing at the end of each sprint | Ongoing |
| OBJ-09 | Deploy the platform to production (Vercel and Railway) | 1 week |
| OBJ-10 | Evaluate the project against its aims, methodology choices, and personal growth | 1 week |

### A.4 Legal, Social, Ethical, and Professional Considerations

**Legal considerations:**

- **Data Protection Act 2018 and UK GDPR**: The platform collects and processes personal data including email addresses, hashed passwords, customer names, and order histories. Data is stored securely in a managed PostgreSQL database with encrypted connections. Passwords are hashed using bcrypt and never stored in plain text. The platform does not collect unnecessary personal data, adhering to the data minimisation principle.
- **PCI DSS compliance**: Payment card data is handled exclusively by Stripe. The application never receives, processes, or stores card numbers, CVVs, or other sensitive payment information. Stripe's PCI DSS Level 1 certification covers the payment processing component.
- **Consumer Rights Act 2015**: Menu prices displayed to customers must be accurate and clearly stated. The order confirmation displays an itemised breakdown of the order total. The snapshot columns in the `order_items` table (`item_name_at_order`, `unit_price_at_order`) ensure that the price charged matches the price displayed at the time of ordering, even if the menu is subsequently updated.

**Social considerations:**

- The platform aims to make digital ordering accessible to small venues that cannot afford enterprise solutions, promoting digital inclusion in the hospitality sector.
- The web-based approach (no app download required) reduces barriers for customers, though internet access and a smartphone remain prerequisites.

**Ethical considerations:**

- User data is used solely for the purpose of providing the ordering service. No data is sold to third parties or used for advertising.
- The platform is designed with transparency: customers can see all items and prices before committing to an order.

**Professional considerations:**

- Development adheres to the BCS Code of Conduct, prioritising public interest, professional competence, and integrity.
- Code is version-controlled using Git with meaningful commit messages, supporting maintainability and auditability.

### A.5 Research Methodologies

Primary research was conducted through analysis of existing food ordering platforms (Square for Restaurants, Mr Yum, Toast, and Lightspeed) to identify common features, pricing models, and target markets. Secondary research included review of academic literature on digital transformation in the hospitality industry, Agile software development methodologies, and web application security best practices.

### A.6 Technology Stack

| Layer | Technology | Justification |
|-------|-----------|---------------|
| Frontend | Next.js 16 (React) | Server components, server actions, App Router, Vercel-optimised |
| Backend | NestJS 11 (Node.js) | TypeScript-native, modular architecture, WebSocket support |
| Database | PostgreSQL 16 | Relational model, ACID transactions, Decimal type, JSONB |
| ORM | Prisma | Type-safe database access, migration management, schema-first design |
| Payments | Stripe | PCI DSS Level 1 certified, Payment Intents API, webhook support |
| Real-time | Socket.IO | WebSocket abstraction with fallback, room-based broadcasting |
| Styling | Tailwind CSS + shadcn/ui | Utility-first CSS, accessible component primitives |
| Monorepo | Turborepo + pnpm | Build caching, workspace management, shared packages |
| Language | TypeScript | Full-stack type safety, shared schemas via Zod |

### A.7 Project Planning

`[Placeholder: Insert Gantt chart showing sprint timelines, milestones, and deliverables]`

---

## Appendix B: Sprint Backlog

`[Placeholder: Insert sprint backlog / product backlog here]`

The sprint backlog was structured as follows:

### Sprint 1: Authentication and Venue Setup

| ID | User Story | Priority | Story Points | Status |
|----|-----------|----------|-------------|--------|
| S1-01 | As a venue owner, I want to register an account so that I can manage my venues | Must Have | 3 | Complete |
| S1-02 | As a venue owner, I want to log in to my account so that I can access the dashboard | Must Have | 2 | Complete |
| S1-03 | As a venue owner, I want to create a new venue with a name and slug so that I can set up my online presence | Must Have | 3 | Complete |
| S1-04 | As a venue owner, I want to update my venue settings so that I can change the name, logo, and payment mode | Must Have | 3 | Complete |
| S1-05 | As a venue owner, I want to upload a venue logo so that my brand is visible to customers | Should Have | 2 | Complete |

### Sprint 2: Menu Builder

| ID | User Story | Priority | Story Points | Status |
|----|-----------|----------|-------------|--------|
| S2-01 | As a venue owner, I want to create menu categories so that I can organise my menu | Must Have | 3 | Complete |
| S2-02 | As a venue owner, I want to add menu items with name, description, price, and image so that customers can browse my offerings | Must Have | 5 | Complete |
| S2-03 | As a venue owner, I want to reorder menu categories using drag-and-drop so that I can control the menu layout | Should Have | 5 | Complete |
| S2-04 | As a venue owner, I want to toggle item availability so that I can mark items as unavailable without deleting them | Must Have | 2 | Complete |
| S2-05 | As a venue owner, I want to edit and delete menu items so that I can keep the menu up to date | Must Have | 3 | Complete |
| S2-06 | As a venue owner, I want to delete menu categories so that I can remove obsolete sections | Must Have | 2 | Complete |

### Sprint 3: Customer Ordering and Payments

| ID | User Story | Priority | Story Points | Status |
|----|-----------|----------|-------------|--------|
| S3-01 | As a customer, I want to browse a venue's menu without creating an account so that I can order quickly | Must Have | 3 | Complete |
| S3-02 | As a customer, I want to add items to a cart so that I can review my order before submitting | Must Have | 5 | Complete |
| S3-03 | As a customer, I want to pay for my order using Stripe so that I can complete the transaction online | Must Have | 8 | Complete |
| S3-04 | As a customer, I want to choose pay-at-counter so that I can pay in person | Must Have | 3 | Complete |
| S3-05 | As a customer, I want to receive an order confirmation with a reference code so that I can collect my order | Must Have | 2 | Complete |
| S3-06 | As a customer, I want to track my order status so that I know when it is ready | Should Have | 3 | Complete |

### Sprint 4: Real-Time Dashboard and Analytics

| ID | User Story | Priority | Story Points | Status |
|----|-----------|----------|-------------|--------|
| S4-01 | As a venue owner, I want to see incoming orders in real time so that I can begin preparation immediately | Must Have | 5 | Complete |
| S4-02 | As a venue owner, I want to update order status (Preparing, Ready, Completed) so that customers are informed | Must Have | 3 | Complete |
| S4-03 | As a venue owner, I want to view order history so that I can review past transactions | Should Have | 3 | Complete |
| S4-04 | As a venue owner, I want to see analytics (revenue, order count, status breakdown) so that I can understand my business performance | Should Have | 5 | Complete |
| S4-05 | As a venue owner, I want real-time WebSocket updates instead of polling so that the dashboard is responsive | Should Have | 5 | Complete |

---

## Appendix C: User Stories

The following user stories were defined during the planning phase and guided development throughout the project:

### Authentication and Account Management

1. **US-01**: As a venue owner, I want to register an account with my email and password so that I can access the platform.
2. **US-02**: As a venue owner, I want to log in to my account so that I can manage my venues and view orders.
3. **US-03**: As a venue owner, I want to log out of my account so that my session is terminated securely.

### Venue Management

4. **US-04**: As a venue owner, I want to create a new venue with a name so that I can begin setting up my online ordering.
5. **US-05**: As a venue owner, I want the system to generate a unique slug from my venue name so that my menu has a shareable URL.
6. **US-06**: As a venue owner, I want to update my venue's name, logo, and payment mode so that I can customise my venue's settings.
7. **US-07**: As a venue owner, I want to choose between prepay-only, pay-at-counter-only, or both payment modes so that I can match my venue's workflow.

### Menu Management

8. **US-08**: As a venue owner, I want to create menu categories (e.g., Starters, Mains, Desserts) so that my menu is organised logically.
9. **US-09**: As a venue owner, I want to add menu items with a name, description, price, and image to a category so that customers can see my offerings.
10. **US-10**: As a venue owner, I want to edit menu items so that I can update prices, descriptions, or images.
11. **US-11**: As a venue owner, I want to delete menu items so that I can remove discontinued items.
12. **US-12**: As a venue owner, I want to toggle an item's availability so that I can temporarily hide out-of-stock items without deleting them.
13. **US-13**: As a venue owner, I want to reorder menu categories using drag-and-drop so that I can control the display order.
14. **US-14**: As a venue owner, I want to delete a menu category and all its items so that I can remove entire sections.

### Customer Ordering

15. **US-15**: As a customer, I want to scan a QR code and view a venue's menu in my browser without downloading an app or creating an account.
16. **US-16**: As a customer, I want to add items to a cart and adjust quantities so that I can build my order.
17. **US-17**: As a customer, I want my cart to persist if I close and reopen the browser so that I do not lose my selections.
18. **US-18**: As a customer, I want to enter my name and submit my order so that the venue knows who the order belongs to.
19. **US-19**: As a customer, I want to pay for my order online using my card so that I can complete the transaction before my food is prepared.
20. **US-20**: As a customer, I want to choose to pay at the counter so that I can pay in person when collecting my order.
21. **US-21**: As a customer, I want to receive a unique reference code after placing my order so that I can identify my order when collecting.
22. **US-22**: As a customer, I want to see my order status update in real time so that I know when my food is being prepared and when it is ready.

### Venue Dashboard

23. **US-23**: As a venue owner, I want to see new orders appear on my dashboard in real time so that I can begin preparation without delay.
24. **US-24**: As a venue owner, I want to update an order's status (Received, Preparing, Ready, Completed) so that customers and staff can track progress.
25. **US-25**: As a venue owner, I want to view a history of past orders with filtering and search so that I can review transactions.
26. **US-26**: As a venue owner, I want to see analytics including total revenue, order count, and average order value so that I can monitor business performance.

---

## Appendix D: Wireframes

`[Placeholder: Insert wireframe designs here]`

The following wireframes were created during the design phase and guided the user interface implementation:

1. **Registration page** -- Email and password form with validation feedback
2. **Login page** -- Email and password form with link to registration
3. **Dashboard home** -- Sidebar navigation with venue list, main content area
4. **Venue creation form** -- Name input with automatic slug generation
5. **Venue settings** -- Name, slug, logo upload, payment mode selector
6. **Menu builder** -- Category list with drag handles, expandable item lists, add/edit dialogs
7. **Menu item form** -- Name, description, price, image upload, category selector
8. **Public menu page** -- Venue-branded header, categorised item grid with images and prices
9. **Cart drawer** -- Slide-out panel with item list, quantity controls, total, checkout button
10. **Checkout page** -- Customer name input, payment method selection, Stripe card element
11. **Order confirmation page** -- Reference code, order summary, real-time status indicator
12. **Live orders dashboard** -- Card-based order list with status columns and action buttons
13. **Order history page** -- Filterable table with date range, status filter, and search
14. **Analytics dashboard** -- Revenue chart, order volume chart, status breakdown, summary cards

---

## Appendix E: Additional Test Evidence

`[Placeholder: Insert additional test screenshots and evidence here]`

The following test evidence should be included:

### Phase 2 UAT Evidence (Authentication, Venue Setup, Menu Builder)

1. Screenshot: Successful user registration with validation
2. Screenshot: Successful login and redirect to dashboard
3. Screenshot: Venue creation with auto-generated slug
4. Screenshot: Venue settings update (name, logo, payment mode)
5. Screenshot: Menu category creation and display
6. Screenshot: Menu item creation with image upload
7. Screenshot: Menu item edit dialog with pre-populated fields
8. Screenshot: Drag-and-drop category reordering (before and after)
9. Screenshot: Item availability toggle (available and unavailable states)
10. Screenshot: Category deletion confirmation dialog
11. Screenshot: Menu item deletion
12. Screenshot: Responsive layout on mobile viewport

### Phase 3 UAT Evidence (Customer Ordering and Payments)

13. Screenshot: Public menu page accessed via venue slug URL
14. Screenshot: Cart with multiple items and quantity adjustments
15. Screenshot: Checkout page with Stripe card element
16. Screenshot: Stripe test payment completion (using test card 4242 4242 4242 4242)
17. Screenshot: Order confirmation page with reference code
18. Screenshot: Pay-at-counter order submission
19. Screenshot: Order status tracking page showing real-time updates

### Phase 4 UAT Evidence (Real-Time Dashboard and Analytics)

20. Screenshot: Live orders dashboard with incoming order
21. Screenshot: Order status update from Received to Preparing
22. Screenshot: Order status update from Preparing to Ready
23. Screenshot: Order history page with date filter applied
24. Screenshot: Analytics dashboard showing revenue and order metrics
25. Screenshot: WebSocket connection indicator on dashboard

### Browser and Device Testing

26. Screenshot: Application on Chrome (desktop)
27. Screenshot: Application on Safari (mobile)
28. Screenshot: Application on Firefox (desktop)

### Database Evidence

29. Screenshot: Prisma Studio showing database tables and relationships
30. Screenshot: Migration history in `apps/api/prisma/migrations/`
