# Chapter 7: Evaluation and Conclusion

## 7.1 Evaluation Against Aim and Objectives

### 7.1.1 Aim

The stated aim of this project was to design and develop a QR code-based food ordering platform that enables small venues to digitise their ordering process, reducing wait times and order errors while providing venue owners with real-time operational tools and business analytics.

This aim has been achieved. The completed platform allows venue owners to register an account, create one or more venues, build categorised menus with images and pricing, and generate a unique URL (suitable for encoding into a QR code) through which customers can browse the menu, add items to a cart, and place orders. Orders are transmitted to the venue in real time via WebSocket push notifications, enabling immediate preparation. Venue owners can track order status through a live dashboard and review historical performance through an analytics interface.

The evidence supporting this assessment includes:

- A fully functional ordering flow from menu browsing through to order placement and status tracking, tested across all User Acceptance Testing (UAT) cycles.
- Real-time order delivery to the venue dashboard within seconds of customer submission, verified through WebSocket integration testing.
- An analytics dashboard providing revenue summaries, order volume metrics, and status breakdowns.
- Support for multiple payment modes (Stripe prepayment and pay-at-counter), accommodating different venue preferences.

### 7.1.2 Objectives

Each project objective is evaluated individually below.

**Objective (a): Research existing solutions and identify the market gap for small venues.**

This objective was met. Research into existing solutions including Square for Restaurants, Mr Yum, and similar platforms identified that whilst enterprise-grade ordering systems exist, they typically impose high per-transaction fees, require lengthy onboarding processes, or demand hardware purchases that are prohibitive for small independent venues. Bite Byte addresses this gap by providing a lightweight, web-based solution that requires no specialist hardware and can be operational within minutes of account creation.

**Objective (b): Plan the project using Agile/Scrum with sprint-based delivery and MoSCoW prioritisation.**

This objective was met. The project was structured into four sprints, each delivering a coherent set of functionality: Sprint 1 (authentication and venue setup), Sprint 2 (menu builder with drag-and-drop reordering), Sprint 3 (customer ordering and Stripe payments), and Sprint 4 (real-time order tracking, analytics, and live dashboard). MoSCoW prioritisation was applied to the product backlog, ensuring that must-have features (authentication, menu management, ordering, payments) were delivered before should-have features (analytics, real-time updates) and could-have features (item modifiers, customer accounts) were deferred to future iterations.

**Objective (c): Design a monorepo architecture with REST API, WebSocket communication, and a Prisma schema supporting multi-tenant isolation.**

This objective was met. The Turborepo monorepo contains two applications (`apps/web` and `apps/api`) and shared packages (`packages/types` for Zod schemas, `packages/tsconfig` for shared TypeScript configuration). The NestJS API exposes RESTful endpoints for CRUD operations and a Socket.IO WebSocket gateway for real-time events. The Prisma schema enforces multi-tenant isolation through foreign key relationships: every `MenuCategory`, `MenuItem`, and `Order` is scoped to a specific `Venue`, which is in turn owned by a specific `User`. Authorization middleware ensures that venue owners can only access their own data.

**Objective (d): Develop the platform across four sprints delivering authentication, venue setup, menu builder, ordering, payments, real-time tracking, and analytics.**

This objective was met. All four sprints were completed, delivering the full feature set described above. Key technical achievements include:

- JWT-based authentication with secure password hashing (bcrypt).
- Drag-and-drop menu category reordering using @dnd-kit with server-side persistence.
- Stripe Payment Intent integration with webhook-driven order confirmation and idempotency protection via the `stripe_events` table.
- Socket.IO-based real-time order push from API to dashboard, replacing an initial polling implementation.
- An analytics dashboard with revenue, order volume, and status distribution metrics.

**Objective (e): Test the platform through UAT per sprint and functional test plans.**

This objective was met. User Acceptance Testing was conducted at the end of each sprint. Phase 2 UAT achieved 12 out of 12 test cases passing, covering venue creation, menu category management, menu item CRUD, drag-and-drop reordering, and image uploads. Phase 3 UAT verified the complete ordering flow including cart management, Stripe payment processing, pay-at-counter ordering, and order status tracking. All test cases passed, with issues identified during testing (such as the react-hook-form incompatibility) resolved within the same sprint.

**Objective (f): Evaluate the project against its aims, methodology choices, and personal growth.**

This objective is fulfilled by the present chapter.

## 7.2 Evaluation Against Justifications Made

### 7.2.1 Methodology: Agile/Scrum

The decision to adopt Agile/Scrum over the Waterfall methodology was justified on the grounds that iterative delivery would allow for flexibility, early feedback, and course correction. This justification proved well-founded.

The sprint-based structure enabled the identification and resolution of significant technical issues within individual sprints rather than at the end of the project. A notable example occurred during Sprint 2, when the react-hook-form library was discovered to be incompatible with Next.js server actions. The `handleSubmit` and `requestSubmit()` pattern produced silent failures when used with the `action={formAction}` pattern required by `useActionState`. Because the sprint was scoped to menu management, this issue was identified during development, all forms were converted to plain `action={formAction}` bindings within the same sprint, and the fix was verified through UAT before progressing to Sprint 3. Under a Waterfall approach, this issue might not have surfaced until system testing, requiring costly rework across multiple modules.

Similarly, the discovery of the @dnd-kit hydration mismatch (where `DndContext` generated mismatched `aria-describedby` attributes between server and client renders) was identified and resolved by passing a stable `id` prop to `DndContext`. The iterative nature of Agile allowed such issues to be treated as learning opportunities that improved subsequent sprints.

UAT at the end of each sprint provided confidence that completed features were stable before building upon them. This incremental validation reduced the risk of late-stage integration failures.

### 7.2.2 Programming Language: TypeScript

The decision to use TypeScript across the full stack (Next.js frontend and NestJS backend) was justified on the basis of type safety, shared schemas, and developer productivity. This justification proved correct.

The shared `packages/types` package contains Zod schemas that define the shape of data exchanged between the frontend and backend. These schemas serve a dual purpose: runtime validation (ensuring that API requests and responses conform to expected structures) and compile-time type inference (providing autocompletion and type checking in the IDE). This eliminated an entire category of bugs related to mismatched data shapes between client and server.

TypeScript's type system also proved valuable in the NestJS backend, where decorators such as `@Body()`, `@Param()`, and `@Query()` benefit from typed DTOs. The Prisma client generates fully typed database access methods from the schema, meaning that a change to the database schema (such as adding a new column) immediately surfaces type errors in any code that does not account for the change.

The use of a single language across the stack reduced context switching and enabled code sharing. For example, the `OrderStatus` enum is defined once in the Prisma schema and used consistently across both applications, preventing discrepancies between frontend status display logic and backend status transition logic.

### 7.2.3 Database: PostgreSQL

The decision to use PostgreSQL over MongoDB was justified on the grounds that the relational data model suits the application's domain, ACID transactions are necessary for payment processing, and the `Decimal` type handles monetary values correctly. This justification proved sound.

The data model is inherently relational: users own venues, venues contain categories, categories contain items, and orders reference items. PostgreSQL's foreign key constraints enforce referential integrity, preventing orphaned records. The cascade delete rules (e.g., deleting a venue automatically deletes its categories, items, and orders) simplify data management without requiring application-level cleanup logic.

ACID transactions proved essential for payment processing. When a Stripe webhook confirms payment, the API must atomically update the order status and record the Stripe event ID for idempotency. PostgreSQL's transactional guarantees ensure that these operations either both succeed or both fail, preventing inconsistent states such as a paid order remaining in `PENDING_PAYMENT` status.

The `Decimal(10, 2)` column type stores monetary values without the floating-point precision errors that would occur with `FLOAT` or `DOUBLE` types. This is critical for financial correctness: a menu item priced at 9.99 must remain exactly 9.99 through storage, retrieval, and arithmetic operations.

The `JSONB` columns on `MenuItem` (metadata) and `OrderItem` (selected_modifiers) provide a pragmatic extensibility mechanism. Whilst the v1 application stores empty objects and arrays in these columns, the schema is ready for v2 item modifiers without requiring a migration that alters the table structure.

## 7.3 Personal Evaluation

### 7.3.1 Technical Skills

This project provided substantial opportunities for technical skill development across the full stack. [Personalise the following paragraphs to reflect your own experience.]

Working with Next.js App Router and server components represented a significant learning curve. The distinction between server and client components, the use of `useActionState` for form handling, and the cache invalidation patterns (`revalidatePath`, `router.refresh()`) required a deep understanding of Next.js data flow. This knowledge was reinforced through practical problem-solving, such as resolving the react-hook-form incompatibility and implementing the callback ref pattern to prevent infinite effect loops.

The integration of Stripe payment processing demanded careful attention to security and reliability. Implementing webhook signature verification, idempotency protection through the `stripe_events` table, and the Payment Intent flow provided experience with production-grade payment systems. Understanding the distinction between client-side Stripe Elements (which handle sensitive card data) and server-side Payment Intent creation (which controls the payment amount and metadata) was particularly valuable.

Real-time programming with Socket.IO and the NestJS WebSocket gateway introduced concepts of persistent connections, event-driven architecture, and the challenges of maintaining connection state across page navigations. The migration from an initial polling-based implementation to WebSocket push demonstrated the performance and user experience benefits of real-time communication.

Monorepo management with Turborepo and pnpm workspaces provided experience in structuring large codebases for maintainability, sharing code between applications, and configuring build pipelines that respect inter-package dependencies.

### 7.3.2 Project Management

[Personalise the following paragraphs to reflect your own experience.]

Managing the project through four sprints developed skills in task decomposition, effort estimation, and prioritisation. Breaking large features (such as "customer ordering") into discrete, implementable tasks (cart state management, order submission, Stripe integration, order confirmation page) made the work manageable and provided clear progress indicators.

MoSCoW prioritisation proved an effective framework for making scope decisions under time pressure. When considering whether to implement item modifiers in Sprint 3, the must-have classification of core ordering functionality took precedence, and modifiers were deferred to a future iteration with the JSONB schema columns serving as a preparatory step.

Time management across the four sprints required balancing feature development with testing, documentation, and deployment configuration. The discipline of completing UAT before progressing to the next sprint, whilst occasionally tempting to skip, consistently proved its value by catching issues early.

### 7.3.3 Problem-Solving

[Personalise the following paragraphs to reflect your own experience.]

Several significant technical challenges were encountered and resolved during development, each contributing to problem-solving skills:

- **React-hook-form incompatibility**: The discovery that react-hook-form's `handleSubmit` pattern silently fails with Next.js server actions required systematic debugging. The solution (converting all forms to plain `action={formAction}` bindings with `useActionState`) was applied consistently across the entire application, establishing a pattern documented for future reference.

- **@dnd-kit hydration mismatch**: Server-rendered `aria-describedby` attributes did not match client-rendered values, causing React hydration errors. The root cause was traced to `DndContext` generating random IDs, and the fix (passing a stable `id` prop) was both simple and instructive about the constraints of server-side rendering with interactive libraries.

- **Stripe webhook idempotency**: Understanding that Stripe may retry webhook deliveries for up to 72 hours required implementing the `stripe_events` table to record processed event IDs and skip duplicates. This introduced the concept of idempotent event processing, a pattern applicable to any webhook-driven integration.

- **Cart SSR hydration**: The shopping cart uses `localStorage` for persistence, which is unavailable during server-side rendering. The solution involved initialising the cart with an empty state on the server and hydrating from `localStorage` in a `useEffect` hook, with an SSR-safety guard to prevent hydration mismatches.

- **Infinite effect loops**: Inline arrow function callbacks passed as props created new references on every render, causing `useEffect` hooks that depended on them to fire continuously. The callback ref pattern (storing the callback in a `useRef` and excluding it from the dependency array) resolved this whilst maintaining correct behaviour.

## 7.4 Future Amendments

The Bite Byte platform provides a solid foundation upon which numerous enhancements could be built in future iterations. The following features represent the most impactful additions:

**Item modifiers and customisation.** The database schema already includes JSONB columns (`metadata` on `MenuItem` and `selected_modifiers` on `OrderItem`) designed to store modifier definitions and customer selections respectively. A future version could allow venue owners to define modifier groups (e.g., "Choose your size: Small, Medium, Large") with optional price adjustments, and customers to select modifiers when adding items to their cart.

**Customer accounts with order history.** Currently, customers place orders without creating an account. Adding optional customer accounts would enable order history viewing, saved favourite items, and faster checkout with pre-filled details. This could be implemented using email-based authentication or social login providers.

**Loyalty programmes and rewards.** Building on customer accounts, a loyalty system could offer points-based rewards, stamp cards, or percentage discounts for repeat customers. This would incentivise customer retention and provide venue owners with customer engagement metrics.

**Delivery integration.** Integration with third-party delivery platforms (such as Deliveroo or Uber Eats) via their APIs would enable venues to offer delivery alongside dine-in and takeaway ordering. This would require additional order types, delivery address capture, and real-time delivery tracking.

**Table reservation system.** A reservation module would allow customers to book tables in advance, with integration into the ordering system to enable pre-ordering before arrival. This would suit sit-down restaurants and reduce wait times during peak hours.

**Inventory management with stock tracking.** Real-time stock tracking would allow venue owners to set stock levels for menu items, with automatic availability toggling when stock reaches zero. This would prevent customers from ordering items that are out of stock.

**Multi-language support (i18n).** Implementing internationalisation using Next.js's built-in i18n routing would make the platform accessible to non-English-speaking customers and venue owners, significantly expanding the addressable market.

**Native mobile application.** A React Native application sharing business logic with the existing Next.js frontend could provide a more polished mobile experience with push notifications, offline menu caching, and device-native payment integrations such as Apple Pay and Google Pay.

**POS system integration.** Integration with point-of-sale systems (such as Square, Clover, or SumUp) would allow orders placed through Bite Byte to appear directly in the venue's existing POS workflow, reducing the need for manual order entry.

**Kitchen display system (KDS).** A dedicated kitchen-facing interface optimised for large displays would present incoming orders with clear item lists, preparation timers, and completion marking. This would replace printed order tickets and improve kitchen efficiency.

**Advanced analytics.** Trend analysis, sales forecasting, peak hour identification, and popular item recommendations based on historical order data would provide venue owners with actionable business intelligence.

## 7.5 Limitations

An honest assessment of the platform's current limitations is essential for contextualising its achievements and guiding future development.

**Web-only platform.** Bite Byte is a progressive web application accessed through a browser. It does not offer a native mobile application for iOS or Android. Whilst the responsive design provides a mobile-optimised experience, it cannot match the performance, offline capabilities, or system integration (push notifications, biometric authentication) of a native application.

**Internet connectivity required.** Both customers and venue owners require an active internet connection to use the platform. There is no offline mode: if a customer loses connectivity during the ordering process, their cart state is preserved in `localStorage` but the order cannot be submitted until connectivity is restored. Venues in areas with unreliable internet would face operational disruptions.

**English language only.** The user interface, menu content, and all system messages are in English. No internationalisation framework has been implemented. Venues serving non-English-speaking customers would need to provide translations manually within their menu item names and descriptions.

**No customer accounts.** Customers place orders as guests, providing only their name. There is no mechanism for customers to view past orders, save payment methods, or receive personalised recommendations. This simplifies the ordering flow but limits opportunities for customer engagement and retention.

**No delivery support.** The platform supports dine-in and takeaway ordering but does not offer delivery. There is no integration with delivery platforms, no delivery address capture, and no delivery tracking. Venues requiring delivery functionality would need to use a separate system.

**Limited to food and beverage ordering.** The platform is designed specifically for food and beverage venues. Whilst the menu structure could theoretically accommodate other product types, features such as the order status workflow (Received, Preparing, Ready) are food-service-specific.

**Dependence on third-party services.** The platform relies on Vercel (hosting), Railway (hosting and database), and Stripe (payments). Service outages, pricing changes, or policy modifications by any of these providers would directly impact the platform's availability and cost structure. Mitigating this risk would require abstracting service dependencies behind interfaces that allow provider substitution.

**No item modifiers.** Customers cannot customise menu items (e.g., choosing toppings, selecting sizes, or specifying dietary modifications). Whilst the database schema includes JSONB columns prepared for this feature, the user interface and business logic for modifier management and selection have not been implemented.

**No accessibility audit.** Whilst the application uses semantic HTML and Tailwind CSS's accessibility utilities, a formal accessibility audit against WCAG 2.1 guidelines has not been conducted. Keyboard navigation and screen reader compatibility may have gaps, particularly in interactive components such as the drag-and-drop menu builder.

## 7.6 Conclusion

This project set out to address a genuine market need: providing small, independent food and beverage venues with an affordable, easy-to-use digital ordering solution. The research phase confirmed that existing platforms either target enterprise clients with correspondingly high costs and complexity, or offer limited functionality insufficient for a complete ordering workflow. Bite Byte was designed to occupy the space between these extremes, offering a full-featured platform that a venue owner can set up and begin using within minutes.

The platform was developed over four sprints using Agile/Scrum methodology, which proved well-suited to the project's scope and constraints. Each sprint delivered a working, tested increment of functionality: authentication and venue management in Sprint 1, the menu builder with drag-and-drop reordering in Sprint 2, customer ordering with Stripe payment integration in Sprint 3, and real-time order tracking with analytics in Sprint 4. User Acceptance Testing at the end of each sprint provided continuous quality assurance and caught issues early in the development cycle.

The technology choices made at the outset of the project were validated through implementation. TypeScript's full-stack type safety, facilitated by shared Zod schemas, prevented data shape mismatches between the frontend and backend. PostgreSQL's relational model, ACID transactions, and Decimal type proved essential for the application's data integrity and financial correctness requirements. The split deployment architecture (Vercel for the Next.js frontend, Railway for the NestJS backend and PostgreSQL database) accommodated the distinct runtime requirements of each application layer, particularly the need for persistent WebSocket connections.

The project is not without limitations. The absence of native mobile applications, customer accounts, item modifiers, and delivery integration represents functionality that would be expected in a production-ready commercial product. However, these limitations were acknowledged from the outset through MoSCoW prioritisation, and the architecture has been designed to accommodate their future addition. The JSONB columns for item modifiers, the modular monorepo structure, and the clean separation between frontend and backend all facilitate incremental enhancement.

In summary, Bite Byte successfully demonstrates that a modern, full-stack web application can provide small venues with the tools to digitise their ordering process. The platform reduces wait times through direct digital ordering, minimises order errors by eliminating verbal communication, and provides venue owners with real-time visibility into their operations. Whilst further development would be required before commercial deployment, the project achieves its stated aim and provides a robust foundation for future iteration.
