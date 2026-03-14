# Chapter 4: System Requirements & Architecture

## 4.1 Target Users

Bite Byte serves two distinct user groups whose needs and technical proficiencies differ substantially. The platform must accommodate both without friction, ensuring that the venue owner's management experience is powerful yet approachable, while the customer's ordering experience is frictionless and requires no prior setup.

### 4.1.1 Venue Owners

Venue owners represent the primary paying user of the Bite Byte platform. This category encompasses small independent restaurant owners, food truck operators, pop-up kitchen managers, and cafe proprietors. These individuals are typically sole traders or small business operators who manage most aspects of their business personally, including food preparation, staffing, and customer service. Their technical proficiency varies considerably: some may be comfortable with modern web applications, while others may rely on paper-based systems and have limited experience with digital ordering platforms.

The platform must therefore prioritise simplicity and immediacy. Onboarding should require no more than a few minutes — registration, venue creation, and menu entry — before a working QR code can be printed and placed at tables. The menu builder must feel intuitive, with drag-and-drop reordering, inline editing, and clear visual feedback. Real-time order visibility is essential, as venue owners need to see incoming orders the moment they are placed, track their preparation status, and confirm completion. Business insights such as daily revenue summaries, top-selling items, and order volume trends allow owners to make informed operational decisions without requiring external analytics tools.

**Persona — Maria, Food Truck Owner:** Maria runs a Mediterranean food truck that operates at three weekly market locations. She is 38, uses a smartphone daily but rarely works with desktop software. She needs to set up her menu once, update item availability when ingredients run out, and see orders appear on her tablet in real time. She values simplicity and speed — if the system takes more than a few taps to accomplish a task, she will revert to shouting orders across the counter.

### 4.1.2 Customers (Diners)

Customers are walk-in diners at participating venues. They represent an extremely diverse demographic — ranging from teenagers to elderly patrons, from daily smartphone users to those who rarely interact with web applications. The unifying constraint is that these users must not be required to download an application, create an account, or provide any personal information beyond a first name at checkout. The entire ordering flow — from scanning a QR code to receiving an order confirmation — must be completable on a mobile device within sixty seconds.

The interface must be mobile-first, rendering correctly across iOS Safari, Android Chrome, and other common mobile browsers. Menu browsing must be fast and visually clear, with item images, descriptions, and prices presented without clutter. The cart experience should feel native, with intuitive quantity controls and a running total. Payment must support both card payment via Stripe and pay-at-counter options, depending on the venue's configuration. After placing an order, the customer receives a reference code and can optionally track their order status in real time via a WebSocket-driven status page.

**Persona — James, Lunchtime Customer:** James is a 27-year-old office worker who visits a nearby cafe for lunch. He scans the QR code on the table with his iPhone, browses the menu, adds a sandwich and a coffee to his cart, pays with Apple Pay via Stripe, and receives order reference "B7X2" on screen. His food is ready within eight minutes, and the status page updates to "READY" while he is still at his desk. He never created an account, never downloaded an app, and the entire process took forty seconds.

---

## 4.2 Functional Requirements

This section details the functional requirements of the Bite Byte platform, organised by feature area. Each requirement is assigned an identifier for traceability throughout the development and testing phases.

### 4.2.1 User Management

User management encompasses the registration, authentication, and session handling of venue owners. Customers do not require accounts and are therefore excluded from this requirement area.

| ID    | Requirement                                                                                             | Priority |
|-------|---------------------------------------------------------------------------------------------------------|----------|
| FR1.1 | Users shall be able to register with an email address and password. The system shall enforce email uniqueness and password strength validation. | Must     |
| FR1.2 | Users shall be able to log in with their registered credentials and receive a JWT access token upon successful authentication. | Must     |
| FR1.3 | Sessions shall persist for up to 7 days via HTTP-only secure refresh cookies, enabling seamless re-authentication without requiring the user to log in repeatedly. | Must     |
| FR1.4 | Users shall be able to log out, which invalidates the current session by clearing the authentication cookie. | Must     |
| FR1.5 | Authentication middleware shall protect all dashboard routes, redirecting unauthenticated users to the login page. Server actions shall verify JWT validity before processing requests. | Must     |

The authentication system is implemented using JWT tokens issued by the NestJS API. Access tokens are short-lived, while refresh tokens are stored in HTTP-only cookies to mitigate cross-site scripting (XSS) attacks. The Next.js middleware layer intercepts requests to `/dashboard/*` routes and verifies the presence and validity of the authentication cookie before rendering protected pages.

### 4.2.2 Venue Management

Venue management allows authenticated owners to create, configure, and manage one or more venues within the platform. Each venue operates as an independent entity with its own menu, orders, and settings.

| ID    | Requirement                                                                                             | Priority |
|-------|---------------------------------------------------------------------------------------------------------|----------|
| FR2.1 | Owners shall be able to create a new venue by providing a name and URL-safe slug. An optional logo image may be uploaded at creation time or subsequently. | Must     |
| FR2.2 | Owners shall be able to configure the venue's payment mode, selecting from PREPAY_REQUIRED (Stripe only), PAY_AT_COUNTER (counter only), or BOTH (customer chooses at checkout). | Should   |
| FR2.3 | Owners shall be able to update venue settings including name, slug, logo, and payment mode after creation. | Must     |
| FR2.4 | Owners shall be able to delete a venue. Deletion shall cascade to all associated data, including categories, menu items, and orders, to maintain referential integrity. | Must     |
| FR2.5 | Owners shall be able to generate and download a QR code that encodes the venue's public menu URL. The QR code shall be rendered as a downloadable image suitable for printing. | Must     |
| FR2.6 | The system shall support multi-venue ownership, allowing a single authenticated user to create and manage multiple venues. The dashboard sidebar shall list all venues belonging to the current user. | Must     |

The venue slug serves as the primary identifier in public-facing URLs (e.g., `/menu/marias-food-truck`), enabling human-readable and shareable links. The cascade delete behaviour is enforced at the database level through Prisma's `onDelete: Cascade` directive, ensuring that orphaned records cannot persist even if the application layer fails mid-operation.

### 4.2.3 Menu Management

The menu management system provides venue owners with a visual builder for organising their offerings into categories and items. The interface emphasises speed and directness, minimising the number of clicks required to make common changes.

| ID    | Requirement                                                                                             | Priority |
|-------|---------------------------------------------------------------------------------------------------------|----------|
| FR3.1 | Owners shall be able to create, edit, and delete menu categories within a venue. Each category has a name and a sort order that determines its display position on the public menu. | Must     |
| FR3.2 | Owners shall be able to reorder categories via drag-and-drop interaction. The new sort order shall be persisted to the API immediately upon drop. | Should   |
| FR3.3 | Owners shall be able to create, edit, and delete menu items within a category. Each item comprises a name, optional description, price (decimal to two places), and optional photograph. | Must     |
| FR3.4 | Owners shall be able to toggle the availability of individual menu items. Unavailable items shall appear greyed out or hidden on the public menu, preventing customers from adding them to their cart. | Could    |
| FR3.5 | Item photographs shall be uploaded to Vercel Blob cloud storage and referenced via URL in the database. The upload process shall validate file type and size constraints. | Should   |

The drag-and-drop functionality is implemented using the `@dnd-kit` library, with a stable `DndContext` ID to prevent server-side rendering hydration mismatches. Reordering dispatches an API call with the updated sort order array, and the UI optimistically reflects the new arrangement before server confirmation.

### 4.2.4 Ordering System

The ordering system constitutes the core customer-facing functionality of the platform. It must operate entirely without authentication, using the venue slug as the sole entry point.

| ID    | Requirement                                                                                             | Priority |
|-------|---------------------------------------------------------------------------------------------------------|----------|
| FR4.1 | Customers shall be able to browse a venue's menu by scanning a QR code or navigating to the venue's public URL. No authentication or account creation shall be required. | Must     |
| FR4.2 | Customers shall be able to add items to a persistent cart. Cart state shall be stored in the browser's localStorage, scoped by venue slug, to survive page refreshes and accidental navigation. | Must     |
| FR4.3 | Customers shall be able to proceed to checkout by providing their first name and selecting a payment method. The available payment methods are determined by the venue's payment mode configuration. | Must     |
| FR4.4 | Pay-at-counter orders shall be created with an initial status of RECEIVED, bypassing the payment gateway entirely. The customer receives a reference code to present at the counter. | Must     |
| FR4.5 | Stripe payment orders shall be created with an initial status of PENDING_PAYMENT. Upon successful payment confirmation via Stripe webhook, the order status shall transition to RECEIVED. | Must     |
| FR4.6 | Upon successful order creation, the system shall display a confirmation screen showing the order reference code (e.g., "B7X2"), the customer's name, and a summary of ordered items. | Must     |
| FR4.7 | Customers shall be able to track their order status in real time via a WebSocket connection. Status changes made by the venue owner shall be pushed to the customer's browser within 500 milliseconds. | Should   |

Order items are stored as snapshots at the time of order creation. The `itemNameAtOrder` and `unitPriceAtOrder` fields capture the item's name and price at the moment of purchase, ensuring that subsequent menu edits do not retroactively alter historical order records. The `menuItemId` foreign key is retained as a nullable reference for analytics linkage but is set to NULL if the original menu item is deleted.

### 4.2.5 Order Management (Venue Owner)

Order management provides venue owners with a real-time operational dashboard for processing incoming orders and tracking their lifecycle.

| ID    | Requirement                                                                                             | Priority |
|-------|---------------------------------------------------------------------------------------------------------|----------|
| FR5.1 | The system shall provide a live orders board that displays all active orders (RECEIVED, PREPARING, READY) for the selected venue. New orders shall appear on the board via WebSocket push without requiring a page refresh. | Must     |
| FR5.2 | Owners shall be able to advance an order's status through the lifecycle: RECEIVED to PREPARING to READY to COMPLETED. Each transition shall be a single-click action on the orders board. | Must     |
| FR5.3 | Status changes made by the venue owner shall be broadcast to the customer's order tracking page in real time via WebSocket, ensuring both parties maintain a consistent view of the order's progress. | Should   |

The live orders board is organised into columns representing each active status. When a venue owner updates an order's status, the API persists the change, emits a WebSocket event to the `venue:{venueId}` and `order:{orderId}` rooms, and the dashboard UI moves the order card to the appropriate column without a full page reload.

### 4.2.6 Analytics

The analytics dashboard provides venue owners with actionable business intelligence derived from their order data.

| ID    | Requirement                                                                                             | Priority |
|-------|---------------------------------------------------------------------------------------------------------|----------|
| FR6.1 | The system shall display revenue summaries for today, the current week, and the current month. Revenue calculations shall include only orders with a COMPLETED status to ensure accuracy. | Should   |
| FR6.2 | The system shall display a ranked list of top-selling items by total quantity sold, enabling owners to identify popular offerings. | Should   |
| FR6.3 | The system shall display a daily order volume chart showing the number of orders per day over a configurable time period. | Should   |
| FR6.4 | The system shall provide an order history view with date range filtering and pagination, allowing owners to review past orders and their details. | Should   |

Analytics queries operate on the `orders` and `order_items` tables, aggregating completed order data. The revenue calculation uses the `totalAmount` field from the `orders` table rather than recalculating from individual items, ensuring consistency with the amount originally charged. The top-selling items analysis joins through the snapshot fields (`itemNameAtOrder`) to remain accurate even after menu items have been edited or deleted.

---

## 4.3 MoSCoW Prioritisation

The MoSCoW method is applied to classify each feature according to its necessity for the minimum viable product (MVP) and its value to users. This prioritisation guided the sprint planning process and informed decisions about feature scope during development.

### 4.3.1 Must Have (M)

Must Have requirements represent the core functionality without which Bite Byte would not fulfil its fundamental purpose as a QR code ordering platform. The absence of any Must Have feature would render the system non-functional or commercially unviable.

| Requirement Area       | Feature                                                      |
|------------------------|--------------------------------------------------------------|
| User Management        | User registration with email and password                    |
| User Management        | User login with JWT-based authentication                     |
| User Management        | Session persistence via HTTP-only refresh cookies            |
| User Management        | Authentication middleware for dashboard route protection     |
| Venue Management       | Venue creation with name, slug, and optional logo            |
| Venue Management       | Venue settings update and deletion with cascade              |
| Venue Management       | QR code generation and download                              |
| Venue Management       | Multi-venue support per owner                                |
| Menu Management        | Category creation, editing, and deletion                     |
| Menu Management        | Menu item creation, editing, and deletion                    |
| Ordering               | Public menu browsing without authentication                  |
| Ordering               | Cart with localStorage persistence                           |
| Ordering               | Checkout with customer name and payment selection            |
| Ordering               | At least one payment method (pay-at-counter as baseline)     |
| Ordering               | Order creation with reference code confirmation              |
| Order Management       | Live orders dashboard for venue owners                       |
| Order Management       | Status transitions (RECEIVED -> PREPARING -> READY -> COMPLETED) |

These features collectively enable the end-to-end flow: a venue owner registers, creates a venue, builds a menu, prints a QR code, and receives orders from customers who scan, browse, order, and pay.

### 4.3.2 Should Have (S)

Should Have requirements significantly enhance the user experience and operational capability but are not strictly necessary for the system to function at a basic level. Their omission would result in a noticeably diminished product.

| Requirement Area       | Feature                                                      |
|------------------------|--------------------------------------------------------------|
| Menu Management        | Drag-and-drop category reordering                            |
| Menu Management        | Item photo upload to cloud storage                           |
| Venue Management       | Configurable payment modes (PREPAY/COUNTER/BOTH)             |
| Ordering               | Stripe integration for card payments                         |
| Ordering               | Real-time order status tracking via WebSocket                |
| Order Management       | WebSocket push for live order board updates                  |
| Analytics              | Revenue summary (today, week, month)                         |
| Analytics              | Top-selling items report                                     |
| Analytics              | Daily order volume chart                                     |
| Analytics              | Order history with date filtering and pagination             |

The inclusion of Stripe payments elevates the platform from a simple order notification system to a complete payment processing solution. Similarly, WebSocket-driven real-time updates transform the owner's experience from a polling-based refresh model to an instant, responsive operations dashboard.

### 4.3.3 Could Have (C)

Could Have requirements provide polish and convenience but do not fundamentally alter the system's value proposition. They were implemented where time permitted within the sprint schedule.

| Requirement Area       | Feature                                                      |
|------------------------|--------------------------------------------------------------|
| Menu Management        | Individual item availability toggle                          |
| Venue Management       | Venue logo upload                                            |
| Order Management       | Sound/visual notifications for new orders                    |
| Analytics              | Multiple chart types and visualisation options               |
| Ordering               | Human-readable order reference codes                         |
| User Management        | User logout with cookie clearing                             |

### 4.3.4 Will Not Have (W)

Will Not Have requirements were explicitly excluded from the project scope. Some represent future version considerations, while others fall outside the platform's intended purpose.

| Feature                                    | Rationale                                                                                          |
|--------------------------------------------|----------------------------------------------------------------------------------------------------|
| Customer accounts and login                | The guest-only model is a deliberate UX decision to minimise ordering friction.                    |
| Table reservation system                   | Outside the scope of an ordering platform; would require significant calendar/availability logic.  |
| Delivery integration                       | Bite Byte targets dine-in and counter-collection scenarios only.                                   |
| Inventory management                       | Stock tracking and supplier integration are complex domains warranting a separate system.          |
| Multi-language support                     | Internationalisation adds substantial complexity; English-only for v1.                             |
| Native mobile application                  | The progressive web approach via responsive design serves both user types adequately.              |
| Item modifiers and customisation           | The database schema reserves JSONB fields (`metadata`, `selectedModifiers`) for v2 implementation. |
| Loyalty programmes and discount codes      | Requires customer identity, which conflicts with the guest-only ordering model.                    |

---

## 4.4 Non-functional Requirements

Non-functional requirements define the quality attributes that the system must exhibit. These requirements constrain the design and implementation choices across all functional areas.

### 4.4.1 Usability

The platform must serve two user groups with fundamentally different interaction patterns. Venue owners interact with a feature-rich dashboard on tablets and desktops, while customers interact with a streamlined ordering flow on mobile devices.

**NFR-U1: Mobile-First Responsive Design.** All customer-facing pages shall be designed mobile-first using Tailwind CSS responsive utilities, rendering correctly on viewports from 320px (small smartphones) to 1920px (desktop monitors). The venue owner dashboard shall be optimised for tablet and desktop viewports while remaining functional on mobile.

**NFR-U2: Ordering Speed.** The complete customer ordering flow — from QR code scan to order confirmation — shall be completable within 60 seconds for an order of three items or fewer. This constraint drives design decisions including minimal form fields (name only), localStorage cart persistence, and streamlined checkout.

**NFR-U3: Zero-Installation Access.** Customers shall not be required to download a native application, install a progressive web app, or create an account. The system shall function entirely within the mobile browser.

**NFR-U4: Intuitive Menu Management.** The menu builder shall employ direct manipulation patterns (drag-and-drop, inline editing, toggle switches) that mirror the spatial arrangement of the resulting public menu. Actions shall provide immediate visual feedback — optimistic UI updates for reordering and availability toggling.

### 4.4.2 Security

Security requirements address authentication, data isolation, payment handling, and input validation. Given that the system processes financial transactions and stores business data for multiple independent venues, security is a critical quality attribute.

**NFR-S1: JWT Authentication with HTTP-Only Cookies.** Authentication tokens shall be transmitted via HTTP-only, Secure, SameSite cookies to prevent client-side JavaScript from accessing token values. This mitigates XSS-based token theft.

**NFR-S2: Multi-Tenant Data Isolation.** All API endpoints that access venue-specific data shall verify that the authenticated user is the owner of the requested venue. Prisma query extensions enforce owner-scoping at the data access layer, preventing cross-tenant data leakage even if application-level checks are bypassed.

**NFR-S3: PCI Compliance Delegation.** The system shall never receive, store, or transmit raw card numbers. All payment card data is handled exclusively by Stripe via their client-side Elements SDK and server-side Payment Intents API. Bite Byte operates as a PCI SAQ-A merchant.

**NFR-S4: Webhook Signature Verification.** All incoming Stripe webhook requests shall be verified against the webhook signing secret using Stripe's signature verification library. Requests with invalid signatures shall be rejected with HTTP 400 status.

**NFR-S5: Input Validation.** All user input shall be validated server-side using Zod schemas (in Next.js server actions) and NestJS validation pipes (in API controllers). Client-side validation is applied for user experience but is never relied upon as a security boundary.

### 4.4.3 Performance

Performance requirements ensure that the system remains responsive under expected load conditions. The target environment is small-to-medium venues with up to 50 concurrent customers during peak periods.

**NFR-P1: Page Load Time.** Initial page loads shall complete within 3 seconds on a 4G mobile connection. Next.js server-side rendering and static generation are leveraged to minimise time-to-first-byte. Client-side navigation between pages shall complete within 500 milliseconds.

**NFR-P2: Real-Time Latency.** WebSocket events (order creation, status updates) shall be delivered to connected clients within 500 milliseconds of the triggering action. Socket.IO's transport negotiation shall prefer WebSocket over long-polling where browser support permits.

**NFR-P3: Optimistic UI Updates.** Menu management operations (reordering, availability toggling, item editing) shall reflect changes in the UI immediately upon user action, with server confirmation occurring asynchronously. If the server rejects the change, the UI shall revert to the previous state.

### 4.4.4 Interface

Interface requirements govern the visual consistency and design system employed across the platform.

**NFR-I1: Component Library.** The application shall use shadcn/ui as its component foundation, providing a consistent set of accessible, themeable UI primitives (buttons, dialogs, cards, forms, charts) across all pages.

**NFR-I2: Design System.** Tailwind CSS shall serve as the styling framework, with a defined colour palette, typography scale, and spacing system configured in the Tailwind configuration file. All components shall adhere to this design system.

**NFR-I3: Accessibility Baseline.** Interactive elements shall be keyboard-navigable and include appropriate ARIA attributes. The drag-and-drop implementation shall provide `aria-describedby` instructions for screen reader users. Form inputs shall include associated labels.

---

## 4.5 Sprint Plan

Development is organised into four sprints, each delivering a vertically integrated slice of functionality. Sprints are structured so that each builds upon the previous, with the system becoming incrementally usable from Sprint 2 onwards.

### 4.5.1 Sprints 1-2: Foundation + Auth + Venue Setup + Menu Builder

**Duration:** Combined initial development phase.

**Goals:** Establish the project infrastructure, implement authentication, build venue management, and deliver the complete menu builder — enabling venue owners to register, set up their venue, and populate their menu.

**Deliverables:**
- Turborepo monorepo with Next.js and NestJS applications
- PostgreSQL database schema via Prisma migrations
- User registration and login with JWT authentication
- Venue CRUD with multi-venue support
- Menu category and item management with drag-and-drop reordering
- QR code generation and download
- Item photo upload to Vercel Blob
- Dashboard layout with venue-scoped sidebar navigation

**Acceptance Criteria:**
- A new user can register, log in, create a venue, add categories and items, reorder them, and generate a QR code.
- All 12 UAT scenarios pass (verified and documented).
- Authentication protects all dashboard routes; unauthenticated access redirects to login.
- Venue deletion cascades correctly to all child records.

### 4.5.2 Sprint 3: Customer Ordering + Payments

**Duration:** Single sprint following completion of Sprint 2.

**Goals:** Build the complete customer-facing ordering flow — from QR code scan through menu browsing, cart management, checkout, payment processing, and order confirmation.

**Deliverables:**
- Public menu page rendered from venue slug
- Cart system with localStorage persistence (scoped per venue)
- Checkout flow with customer name and payment method selection
- Pay-at-counter order creation (immediate RECEIVED status)
- Stripe Payment Intents integration for card payments
- Stripe webhook handler with idempotency (StripeEvent table)
- Order confirmation page with reference code
- Order status polling page for customers
- CORS configuration for cross-origin API requests

**Acceptance Criteria:**
- A customer can scan a QR code, browse the menu, add items to cart, and complete checkout.
- Pay-at-counter orders are created with RECEIVED status and display a reference code.
- Stripe orders transition from PENDING_PAYMENT to RECEIVED upon webhook confirmation.
- Cart state persists across page refreshes and is scoped to the specific venue.
- The Stripe webhook handler is idempotent — duplicate events do not create duplicate orders.

### 4.5.3 Sprint 4: Real-time Operations + Analytics

**Duration:** Final sprint, completing the feature set.

**Goals:** Replace polling-based order monitoring with WebSocket push notifications, build the analytics dashboard, and implement order history — completing the venue owner's operational toolkit.

**Deliverables:**
- Socket.IO gateway on the NestJS API
- WebSocket room architecture (`venue:{id}` and `order:{id}` rooms)
- Live orders board with real-time order creation and status update events
- Customer order tracking upgraded from polling to WebSocket push
- Connection status banner with automatic reconnection
- Analytics dashboard with revenue summary, top items, and daily volume chart
- Order history table with date filtering and pagination

**Acceptance Criteria:**
- New orders appear on the venue owner's live board without page refresh.
- Status changes by the owner are reflected on the customer's tracking page within 500ms.
- The analytics dashboard displays accurate revenue figures for COMPLETED orders only.
- Order history supports date range filtering and paginates correctly.
- WebSocket connections recover gracefully after network interruption.

---

## 4.6 Risks

The following risk register identifies potential threats to the project's successful delivery, assesses their likelihood and impact, and documents the mitigation strategies employed.

| Risk ID | Description                                                                                           | Likelihood | Impact | Mitigation Strategy                                                                                                                                                                                      |
|---------|-------------------------------------------------------------------------------------------------------|:----------:|:------:|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| R1      | **Stripe integration complexity.** The Payment Intents API, webhook handling, and idempotency requirements introduce significant complexity and potential for payment state errors. | M          | H      | Use Stripe's official Node.js SDK. Implement idempotency via the `StripeEvent` table to prevent duplicate processing. Verify webhook signatures on every request. Test with Stripe's test mode and CLI webhook forwarding. |
| R2      | **WebSocket scalability.** Socket.IO connections are stateful and consume server memory. A high number of concurrent connections could exhaust server resources on a single Railway instance. | L          | M      | Target deployment supports 50-100 concurrent connections per venue, well within a single server's capacity. Socket.IO supports Redis adapter for horizontal scaling if needed in production. Monitor connection counts. |
| R3      | **Multi-tenant data leakage.** A bug in query scoping could allow one venue owner to access another owner's data, or a customer to view orders from a different venue. | L          | H      | Enforce owner-scoping at the Prisma query layer via extensions. All API endpoints verify `ownerId` matches the authenticated user. Public endpoints are scoped by venue slug. Include multi-tenant isolation tests. |
| R4      | **Payment state inconsistency.** Network failures between Stripe webhook delivery and database update could leave orders in an incorrect payment state (e.g., paid but still PENDING_PAYMENT). | M          | H      | Stripe retries failed webhooks for up to 72 hours. The idempotent `StripeEvent` table ensures that retried webhooks are processed exactly once. Orders can be manually reconciled via the Stripe dashboard if necessary. |
| R5      | **Scope creep.** Stakeholder requests for additional features (item modifiers, loyalty programmes, delivery) could delay core functionality delivery. | M          | M      | Apply strict MoSCoW prioritisation. Defer "Will Not Have" features to future versions. The JSONB `metadata` and `selectedModifiers` fields provide schema-level extensibility without current implementation cost. |
| R6      | **Third-party service downtime.** Dependence on Stripe (payments), Vercel (frontend hosting), Railway (API hosting), and Neon (database) means that outages in any service could render parts of the system unavailable. | L          | H      | Use managed services with strong SLA track records. Stripe's lazy initialisation in `OrdersService` allows the API to boot without Stripe credentials, maintaining partial functionality. Implement pay-at-counter as a non-Stripe fallback payment method. |
| R7      | **Browser compatibility issues.** The application must function across diverse mobile browsers (Safari, Chrome, Samsung Internet, Firefox) with varying levels of CSS and JavaScript API support. | M          | M      | Use Tailwind CSS for cross-browser compatible styling. Avoid bleeding-edge browser APIs. Test on iOS Safari and Android Chrome as primary targets. localStorage API is universally supported across target browsers. |
| R8      | **Database performance under concurrent orders.** Peak service periods may generate many simultaneous order creation and status update transactions, potentially causing lock contention or slow queries. | L          | M      | PostgreSQL handles concurrent writes efficiently with MVCC. Prisma generates parameterised queries that leverage database indices. The `referenceCode` uniqueness constraint uses a UUID-derived short code to avoid collision retry loops. Neon's serverless PostgreSQL scales compute automatically. |
| R9      | **QR code scanning reliability.** Poor lighting, damaged printouts, or older phone cameras may prevent successful QR code scanning, blocking the customer's entry point to the ordering flow. | M          | M      | Generate high-contrast QR codes at sufficient resolution for reliable scanning. Provide the venue's public URL as a fallback that can be typed manually or shared via link. Recommend venues laminate QR code printouts. |
| R10     | **User adoption resistance from venue owners.** Non-technical venue owners may resist adopting a digital ordering system due to unfamiliarity, perceived complexity, or preference for traditional ordering methods. | M          | M      | Design the onboarding flow to be completable in under five minutes. Minimise required fields at each step. Provide immediate value — a working QR code — after basic setup. The system supplements rather than replaces existing ordering processes; owners can run both concurrently. |

---

## 4.7 Whole System Use Case and Class Diagrams

### 4.7.1 Whole System Use Case Diagram

`[Diagram placeholder: Whole System Use Case Diagram — showing Venue Owner and Customer actors with all use cases]`

The whole system use case diagram depicts two primary actors — **Venue Owner** and **Customer** — and one external system actor — **Stripe Payment Gateway** — interacting with the Bite Byte platform.

**Venue Owner Use Cases:**
- Register Account
- Log In / Log Out
- Create Venue
- Update Venue Settings
- Delete Venue
- Generate QR Code
- Create Menu Category
- Edit Menu Category
- Delete Menu Category
- Reorder Categories (drag-and-drop)
- Create Menu Item
- Edit Menu Item
- Delete Menu Item
- Toggle Item Availability
- Upload Item Photo
- View Live Orders Board
- Update Order Status
- View Revenue Analytics
- View Top-Selling Items
- View Order Volume Chart
- Browse Order History

**Customer Use Cases:**
- Scan QR Code / Navigate to Menu
- Browse Menu
- Add Item to Cart
- Remove Item from Cart
- Adjust Item Quantity
- Proceed to Checkout
- Pay via Stripe (extends Checkout)
- Pay at Counter (extends Checkout)
- View Order Confirmation
- Track Order Status

**Stripe Payment Gateway Use Cases:**
- Process Payment Intent (invoked by Pay via Stripe)
- Send Webhook Notification (invoked after payment completion)

**Relationships:**
- "Pay via Stripe" includes an interaction with the Stripe Payment Gateway actor.
- "Send Webhook Notification" triggers an internal system process that updates the order status from PENDING_PAYMENT to RECEIVED.
- "Update Order Status" (by Venue Owner) has an extend relationship with "Track Order Status" (for Customer), as the status change triggers a real-time notification to the customer.

### 4.7.2 Class Diagram

`[Diagram placeholder: Class Diagram — showing User, Venue, MenuCategory, MenuItem, Order, OrderItem, StripeEvent classes with relationships]`

The class diagram represents the persistent domain model as implemented in the Prisma schema. All entity identifiers are UUIDs. Timestamps (`createdAt`, `updatedAt`) are present on all entities but omitted below for brevity.

**Classes and Attributes:**

- **User** (`users`): `id: UUID [PK]`, `email: String [UNIQUE]`, `passwordHash: String`
- **Venue** (`venues`): `id: UUID [PK]`, `name: String`, `slug: String [UNIQUE]`, `logoUrl: String?`, `paymentMode: PaymentMode {PREPAY_REQUIRED, PAY_AT_COUNTER, BOTH}`, `ownerId: UUID [FK -> User]`
- **MenuCategory** (`menu_categories`): `id: UUID [PK]`, `venueId: UUID [FK -> Venue]`, `name: String`, `sortOrder: Int`
- **MenuItem** (`menu_items`): `id: UUID [PK]`, `venueId: UUID [FK]`, `categoryId: UUID [FK -> MenuCategory]`, `name: String`, `description: String?`, `price: Decimal(10,2)`, `imageUrl: String?`, `isAvailable: Boolean`, `sortOrder: Int`, `metadata: JSONB`
- **Order** (`orders`): `id: UUID [PK]`, `venueId: UUID [FK -> Venue]`, `status: OrderStatus {PENDING_PAYMENT, RECEIVED, PREPARING, READY, COMPLETED, CANCELLED}`, `paymentMethod: PaymentMethod {STRIPE, PAY_AT_COUNTER}`, `paymentIntentId: String?`, `totalAmount: Decimal(10,2)`, `referenceCode: String [UNIQUE]`, `customerName: String`
- **OrderItem** (`order_items`): `id: UUID [PK]`, `orderId: UUID [FK -> Order]`, `menuItemId: UUID? [FK -> MenuItem, ON DELETE SET NULL]`, `itemNameAtOrder: String`, `unitPriceAtOrder: Decimal(10,2)`, `quantity: Int`, `selectedModifiers: JSONB`
- **StripeEvent** (`stripe_events`): `id: UUID [PK]`, `stripeEventId: String [UNIQUE]`, `processedAt: DateTime`, `eventType: String`

**Relationships and Cardinalities:**

| Relationship                  | Cardinality | Cascade Behaviour   | Description                                                                                      |
|-------------------------------|-------------|---------------------|--------------------------------------------------------------------------------------------------|
| User -> Venue                 | 1..*        | --                  | One user owns zero or more venues.                                                               |
| Venue -> MenuCategory         | 1..*        | ON DELETE CASCADE   | One venue contains zero or more categories. Deleting a venue deletes all its categories.         |
| MenuCategory -> MenuItem      | 1..*        | ON DELETE CASCADE   | One category contains zero or more items. Deleting a category deletes all its items.             |
| Venue -> Order                | 1..*        | ON DELETE CASCADE   | One venue has zero or more orders. Deleting a venue deletes all its orders.                      |
| Order -> OrderItem            | 1..*        | --                  | One order contains one or more order items.                                                      |
| MenuItem -> OrderItem         | 0..*        | ON DELETE SET NULL  | One menu item may be referenced by zero or more order items. Deletion nullifies the reference.   |

The `ON DELETE SET NULL` behaviour on the `MenuItem -> OrderItem` relationship is a deliberate design decision: deleting a menu item must not destroy historical order data. The snapshot fields (`itemNameAtOrder`, `unitPriceAtOrder`) preserve the item's details at the time of purchase, while the nullable `menuItemId` foreign key maintains an optional linkage for analytics purposes.

The `StripeEvent` entity is intentionally isolated — it has no foreign key relationships with other entities. It serves purely as an idempotency guard, recording the Stripe event ID of each processed webhook to prevent duplicate order status transitions during Stripe's retry window (up to 72 hours).
