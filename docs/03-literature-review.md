# Chapter 3: Literature Review

## 3.1 Methodologies

### 3.1.1 Agile/Scrum

Agile software development is a collection of methodologies founded upon the principles outlined in the Agile Manifesto, published in 2001 by a group of seventeen software practitioners (Beck et al., 2001). The Manifesto prioritises individuals and interactions over processes and tools, working software over comprehensive documentation, customer collaboration over contract negotiation, and responding to change over following a rigid plan. These four values, supported by twelve guiding principles, have fundamentally reshaped how software teams approach product development, particularly in domains characterised by uncertainty and evolving requirements.

Scrum is the most widely adopted framework within the Agile family, formalised by Schwaber and Sutherland (2020) in the Scrum Guide. Scrum structures work into fixed-length iterations called sprints, typically lasting one to four weeks, during which a cross-functional team delivers a potentially shippable product increment. The framework defines three roles: the Product Owner, who maintains and prioritises the product backlog; the Scrum Master, who facilitates the process and removes impediments; and the Development Team, who self-organise to deliver the sprint goal. Key ceremonies include sprint planning, where the team selects backlog items for the upcoming sprint; daily standups (or daily scrums), which are time-boxed fifteen-minute synchronisation meetings; the sprint review, where the increment is demonstrated to stakeholders; and the sprint retrospective, where the team reflects on process improvements (Schwaber and Sutherland, 2020).

The benefits of Agile/Scrum are well documented in the literature. Dyba and Dingsoyr (2008) conducted a systematic review of empirical studies on Agile development and found consistent evidence that Agile methods improve customer satisfaction, reduce defect rates, and increase team morale compared to plan-driven approaches. The iterative nature of Scrum enables continuous delivery of working software, allowing stakeholders to provide feedback at regular intervals rather than only at the end of a lengthy development cycle. This feedback loop is particularly valuable for web applications, where user expectations and market conditions can shift rapidly. Furthermore, Agile's emphasis on adaptability to change means that new requirements discovered during development can be incorporated into subsequent sprints without derailing the entire project plan (Cohn, 2004).

Scrum's empirical process control, built on the pillars of transparency, inspection, and adaptation, provides a robust mechanism for managing complexity. Each sprint retrospective offers the team an opportunity to identify inefficiencies and implement corrective actions, fostering a culture of continuous improvement. This is especially advantageous for small teams working on full-stack web applications, where rapid iteration and tight feedback loops are essential for delivering a high-quality product (Rubin, 2012).

### 3.1.2 Waterfall Model

The Waterfall model is the earliest formalised software development methodology, originally described by Royce (1970) in his seminal paper on managing the development of large software systems. The model prescribes a linear, sequential progression through distinct phases: requirements gathering, system design, implementation, integration and testing, deployment, and maintenance. Each phase must be completed in its entirety before the next phase begins, and the output of one phase serves as the input for the subsequent phase. This sequential structure gives the model its characteristic "waterfall" appearance when represented diagrammatically.

The Waterfall model's strength lies in its simplicity and predictability. Because requirements are fully specified at the outset, project managers can produce detailed schedules, cost estimates, and resource plans with a high degree of confidence. The model also emphasises thorough documentation at each phase, which can be valuable for regulatory compliance, knowledge transfer, and long-term maintenance. For projects with well-understood, stable requirements — such as embedded systems in safety-critical domains or government contracts with fixed specifications — the Waterfall approach remains a viable and sometimes mandated methodology (Sommerville, 2015).

However, the Waterfall model has significant limitations, particularly for modern web application development. The assumption that requirements can be fully and accurately captured before any development begins is frequently unrealistic. Boehm (1981) demonstrated that the cost of correcting errors increases exponentially the later they are discovered in the development lifecycle, and the Waterfall model's deferred testing phase means that defects may not surface until a substantial portion of the system has been built. Furthermore, stakeholders do not see working software until late in the process, which increases the risk of delivering a product that fails to meet actual user needs. The lack of iterative feedback is a critical shortcoming for web applications that must adapt to user behaviour, browser changes, and shifting market demands (Pressman and Maxim, 2020).

### 3.1.3 Comparison of Methodologies

The following table provides a structured comparison of Agile/Scrum and Waterfall across key dimensions relevant to the Bite Byte project:

| Criterion | Agile/Scrum | Waterfall |
|---|---|---|
| **Flexibility** | High — requirements can evolve between sprints; backlog is continuously refined | Low — requirements are fixed at the outset; changes require formal change control |
| **Risk Management** | Risks identified early through iterative delivery and sprint retrospectives | Risks may remain hidden until testing phase; late discovery increases cost |
| **Stakeholder Involvement** | Continuous — stakeholders review working software each sprint | Limited — stakeholders typically involved at requirements and acceptance phases only |
| **Delivery Speed** | Incremental — working software delivered every 1–4 weeks | Deferred — first working version delivered only after all phases complete |
| **Documentation** | Lightweight and just-in-time; prioritises working software | Comprehensive and phase-gated; each phase produces detailed documentation |
| **Suitability for Web Apps** | Excellent — supports rapid iteration, A/B testing, and user feedback integration | Poor — web applications require frequent updates and responsiveness to user behaviour |
| **Team Size Requirements** | Optimised for small, cross-functional teams (3–9 members) | Scales to larger teams with specialised roles, but overhead increases coordination cost |

### 3.1.4 Recommendation for Methodology

Agile/Scrum is the recommended methodology for the Bite Byte project for several compelling reasons. First, Bite Byte is a web application with inherently evolving requirements. The platform must support multiple venues, each with distinct menus, pricing structures, and operational workflows. These requirements cannot be fully anticipated at the outset and will continue to emerge as venue owners and customers interact with the system. Agile's embrace of requirement evolution is therefore a natural fit.

Second, the project is being developed by a small team, which aligns with Scrum's recommendation of compact, cross-functional teams. The overhead of Waterfall's phase-gated documentation and formal change control processes would be disproportionate for a team of this size, consuming time that is better spent delivering working features. Scrum's lightweight ceremonies — sprint planning, daily standups, and retrospectives — provide sufficient structure without excessive bureaucracy.

Third, Bite Byte's phased architecture — spanning authentication, venue setup, menu management, customer ordering, payments, real-time operations, and analytics — maps naturally onto a series of sprints. Each phase delivers a testable, demonstrable increment that can be validated with stakeholders before proceeding. This incremental delivery model reduces the risk of building an entire system only to discover fundamental flaws in its design or usability.

Fourth, Agile enables the integration of user feedback at every stage. Venue owners can test the menu builder during Phase 2 and provide feedback that informs Phase 3 development. Customers can test the ordering flow before real-time features are built. This continuous feedback loop is essential for a platform that serves two distinct user groups — venue operators and their customers — each with different needs and expectations.

Finally, Agile/Scrum is widely recognised as the most suitable methodology for full-stack web development projects (VersionOne, 2022). The ability to deploy incremental updates, conduct rapid testing, and pivot based on user data is fundamental to modern web application success. For these reasons, Agile/Scrum was selected as the development methodology for Bite Byte.

---

## 3.2 Programming Languages

### 3.2.1 TypeScript (with Next.js + NestJS)

TypeScript is a statically typed superset of JavaScript developed by Microsoft (Hejlsberg, 2012). It extends JavaScript with optional type annotations, interfaces, enums, generics, and other features drawn from strongly typed languages, while compiling down to plain JavaScript that runs in any browser or Node.js environment. Since its initial release in 2012, TypeScript has experienced rapid adoption across the industry, with the 2023 Stack Overflow Developer Survey reporting it as one of the most popular and desired programming languages globally (Stack Overflow, 2023).

The Bite Byte project leverages TypeScript across the entire stack through two complementary frameworks: Next.js for the frontend and NestJS for the backend. Next.js, developed by Vercel, is a React-based framework that provides server-side rendering, static site generation, and — as of version 13 onwards — the App Router architecture with React Server Components and Server Actions (Vercel, 2024). Server Components allow rendering on the server without sending JavaScript to the client, significantly reducing bundle sizes and improving performance. Server Actions enable forms to submit directly to server-side functions, eliminating the need for separate API routes for many operations. The App Router's file-system-based routing, with support for layouts, loading states, and error boundaries, provides a structured and scalable approach to building complex user interfaces.

NestJS is a progressive Node.js framework for building efficient and scalable server-side applications (Mysliwiec, 2017). Inspired by Angular's architecture, NestJS employs decorators, dependency injection, and a modular structure that promotes separation of concerns and testability. Controllers handle incoming requests, services encapsulate business logic, and modules group related functionality. This architectural discipline is particularly valuable as the application grows, ensuring that the codebase remains maintainable and navigable. NestJS also provides first-class support for WebSockets via Socket.IO, which is essential for Bite Byte's real-time order tracking and live dashboard features.

A critical advantage of using TypeScript across both frontend and backend is end-to-end type safety. Shared type definitions and validation schemas — such as those created with libraries like Zod — can be used on both sides of the application boundary, ensuring that data flowing between the client and server conforms to a single source of truth. This eliminates an entire category of bugs related to data shape mismatches, which are common in projects that use different languages for the frontend and backend. Furthermore, the monorepo structure facilitated by Turborepo allows shared packages containing types, configurations, and utilities to be consumed by both applications, reducing duplication and inconsistency (Vercel, 2023).

The TypeScript ecosystem is exceptionally rich, with Prisma providing type-safe database queries that are generated directly from the database schema, Stripe's official TypeScript SDK offering comprehensive type definitions for payment processing, and Tailwind CSS paired with shadcn/ui delivering a robust component library with full TypeScript support. This cohesive ecosystem enables rapid development without sacrificing type safety or developer experience.

### 3.2.2 Python (with Django/Flask)

Python is a high-level, dynamically typed, interpreted programming language known for its readability, simplicity, and extensive standard library (Van Rossum and Drake, 2009). It consistently ranks among the most popular programming languages worldwide, driven by its accessibility to beginners and its dominance in fields such as data science, machine learning, and scientific computing. For web development, Python offers two primary frameworks: Django and Flask.

Django is a full-stack web framework that follows the "batteries included" philosophy, providing a built-in admin panel, an Object-Relational Mapping (ORM) layer, a template engine, authentication system, and URL routing out of the box (Django Software Foundation, 2024). Django's admin panel is particularly noteworthy, as it auto-generates a fully functional administrative interface from the data models, which can significantly accelerate development of back-office tools. The Django REST Framework (DRF) extends Django with powerful tools for building RESTful APIs, including serializers, viewsets, and browsable API documentation. Flask, by contrast, is a lightweight micro-framework that provides only the essentials — routing, request handling, and templating — leaving all other functionality to third-party extensions (Ronacher, 2010). Flask is well-suited for small APIs and microservices where Django's full-stack capabilities would be excessive.

For the Bite Byte project, Python with Django would be a viable choice for the backend API. Django's ORM provides robust database abstraction, its migration system handles schema evolution, and the Django REST Framework would capably serve the API endpoints required for menu management, order processing, and venue administration. However, several significant limitations make Python a suboptimal choice for this particular project.

First, Python's dynamic typing means that type mismatches between the frontend and backend cannot be caught at compile time. While type hints (PEP 484) and tools like mypy provide optional static analysis, they are not enforced at runtime and do not integrate with the React/TypeScript frontend. This creates a gap in the type safety chain that TypeScript naturally bridges. Second, building a React frontend alongside a Django backend requires maintaining two entirely separate codebases with no shared type definitions, increasing the risk of inconsistency and duplication. Third, Python's Global Interpreter Lock (GIL) imposes limitations on true concurrent execution within a single process, which can be a constraint for handling many simultaneous WebSocket connections in real-time features such as live order dashboards (Beazley, 2010). While this can be mitigated with asynchronous frameworks (e.g., Django Channels) or by running multiple worker processes, the approach is less straightforward than Node.js's event-driven, non-blocking I/O model, which handles WebSocket connections natively.

### 3.2.3 Comparison of Programming Languages

| Criterion | TypeScript (Next.js + NestJS) | Python (Django) |
|---|---|---|
| **Type Safety** | Static typing enforced at compile time; shared types across frontend and backend | Dynamic typing; optional type hints via mypy, not enforced at runtime |
| **Full-Stack Capability** | Single language for frontend, backend, and shared packages | Requires separate frontend framework (React/Vue); no shared types with frontend |
| **Real-Time Support (WebSocket)** | Native event-driven I/O; Socket.IO first-class in NestJS | Django Channels adds async support, but GIL limits true concurrency |
| **Ecosystem / Packages** | npm is the largest package registry; Prisma, Stripe SDK, shadcn/ui all TypeScript-first | PyPI is extensive; Django REST Framework, Celery, excellent data science libraries |
| **Learning Curve** | Moderate — TypeScript adds complexity over JavaScript; framework conventions to learn | Low — Python syntax is beginner-friendly; Django conventions are well-documented |
| **Performance** | V8 engine with JIT compilation; excellent for I/O-bound workloads | Interpreted; adequate for web APIs but slower for compute-intensive tasks |
| **Deployment Options** | Vercel (Next.js), Railway/Render (NestJS), serverless-friendly | Heroku, Railway, PythonAnywhere; Django requires WSGI/ASGI server configuration |
| **Shared Code (Frontend/Backend)** | Full sharing via monorepo; Zod schemas, types, and utilities | Not possible — languages differ; must duplicate validation logic |

### 3.2.4 Recommendation for Programming Language

TypeScript was selected as the sole programming language for the Bite Byte project, used across both the Next.js frontend and NestJS backend. This decision is justified by several factors that are directly aligned with the project's technical requirements.

The most compelling advantage is end-to-end type safety. By using TypeScript throughout the stack, the project benefits from compile-time verification that data structures conform to their expected shapes at every boundary — from database queries (via Prisma's generated types) through API responses to React component props. Shared Zod validation schemas ensure that the same validation rules are applied on both the client and server, eliminating an entire class of bugs that arise from duplicated or divergent validation logic. In a system that handles financial transactions (menu prices, order totals, payment processing), this level of type safety is not merely convenient but essential for correctness.

Next.js's App Router represents the current state of the art in React application architecture. Server Components reduce the JavaScript sent to the client, improving performance on mobile devices — a critical consideration for a QR-code-based ordering system where customers access the platform on their phones. Server Actions simplify form handling by enabling direct server-side execution without separate API endpoints, reducing boilerplate and improving developer productivity. These features have no equivalent in the Python/Django ecosystem, which would require a separate React application with its own build pipeline and deployment configuration.

NestJS's modular architecture, with its decorator-based controller definitions and dependency injection container, provides a level of structural discipline that scales well as the application grows. Its first-class WebSocket support via the `@WebSocketGateway` decorator integrates seamlessly with Socket.IO, enabling the real-time order status updates and live dashboard features that are central to Bite Byte's value proposition. Node.js's event-driven, non-blocking I/O model is inherently well-suited to maintaining many concurrent WebSocket connections, which is the primary I/O pattern for real-time features.

Finally, the monorepo structure enabled by Turborepo and pnpm workspaces allows both applications to share TypeScript configurations, ESLint rules, and utility packages. This reduces duplication, ensures consistency, and simplifies the development workflow. Using a single language across the entire stack also reduces cognitive overhead for the development team, who do not need to context-switch between different languages, paradigms, and toolchains.

---

## 3.3 Database

### 3.3.1 PostgreSQL

PostgreSQL is an advanced, open-source relational database management system (RDBMS) with over 35 years of active development (The PostgreSQL Global Development Group, 2024). It is widely regarded as the most feature-rich open-source relational database available, supporting advanced capabilities including JSONB columns for semi-structured data, full-text search, Common Table Expressions (CTEs), window functions, and Row Level Security (RLS) policies. PostgreSQL is fully ACID-compliant (Atomicity, Consistency, Isolation, Durability), ensuring that database transactions are processed reliably even in the event of system failures — a non-negotiable requirement for any application that handles financial data.

For the Bite Byte project, PostgreSQL is accessed via Prisma ORM, which generates a fully type-safe query client from the database schema defined in a declarative schema file. Prisma's migration system tracks schema changes over time, enabling reproducible database evolution across development, staging, and production environments. The generated Prisma Client provides autocompletion, type checking, and compile-time validation of all database queries, ensuring that queries referencing non-existent columns or incorrect types are caught before runtime (Prisma, 2024). This integration with TypeScript's type system extends the end-to-end type safety chain from the database layer through to the user interface.

PostgreSQL's support for Row Level Security (RLS) is particularly relevant to Bite Byte's multi-tenant architecture, where multiple venue owners share the same database but must only access their own data. RLS policies can enforce row-level access control directly at the database level, providing an additional layer of security beyond application-level authorisation checks. While Bite Byte currently implements tenant isolation through application-level query filtering (using `venueId` in Prisma queries), the option to migrate to RLS policies in the future provides architectural headroom for enhanced security.

The database is hosted on Neon, a serverless PostgreSQL platform that provides features such as database branching, auto-scaling, and a generous free tier suitable for development and small-scale production workloads (Neon, 2024). Neon's serverless architecture means that the database scales automatically based on demand, eliminating the need for manual capacity planning. Its branching feature enables developers to create isolated database copies for testing schema migrations or new features without affecting the production database.

PostgreSQL's `Decimal` type (mapped to Prisma's `Decimal` field type) is essential for handling financial data such as menu item prices and order totals. Unlike floating-point types, which can introduce rounding errors in arithmetic operations, the `Decimal` type provides exact decimal representation, ensuring that financial calculations are precise. This is a critical requirement for a platform that processes payments and must display accurate prices to customers (Bloch, 2018).

### 3.3.2 MongoDB

MongoDB is a document-oriented NoSQL database that stores data in flexible, JSON-like documents rather than in the rigid rows and columns of a relational database (MongoDB, Inc., 2024). Each document can have a different structure, and fields can vary from document to document, which provides considerable flexibility during early development when the data model is still evolving. MongoDB's query language supports rich document queries, aggregation pipelines, and geospatial operations, and its horizontal scaling capabilities via sharding make it well-suited for applications that must handle very large volumes of unstructured or semi-structured data.

MongoDB has gained significant popularity in the web development community, partly due to the MEAN/MERN stack (MongoDB, Express, Angular/React, Node.js) and the simplicity of storing JavaScript objects directly in the database without an Object-Relational Mapping layer. For prototyping and applications with genuinely unstructured data — such as content management systems, social media feeds, or IoT data ingestion — MongoDB's schema flexibility is a genuine advantage. Mongoose, the most popular MongoDB ODM (Object-Document Mapper) for Node.js, provides schema validation and middleware hooks, though it lacks the compile-time type safety of Prisma's generated client (Mongoose, 2024).

However, MongoDB presents several significant disadvantages for the Bite Byte project. First, Bite Byte's data model is inherently relational. Venues contain categories, categories contain menu items, items appear in orders, and orders belong to customers and venues. These relationships are naturally expressed through foreign keys and joins in a relational database, but must be managed through embedding or manual reference resolution in MongoDB. Embedding nested documents (e.g., storing all menu items within a venue document) creates data duplication and makes updates complex, while using references requires multiple queries or aggregation pipelines to resolve relationships — negating MongoDB's purported simplicity advantage.

Second, while MongoDB has added multi-document ACID transaction support in version 4.0, these transactions incur significant performance overhead and are generally discouraged for routine operations (MongoDB, Inc., 2024). For a platform that processes Stripe payments and must maintain consistency between order records and payment states, the robust, battle-tested transaction support of PostgreSQL is preferable. Third, MongoDB does not provide a native equivalent to PostgreSQL's Row Level Security, meaning that multi-tenant data isolation must be implemented entirely at the application level, increasing the risk of data leakage through programming errors. Fourth, Prisma's MongoDB support, while available, is less mature than its PostgreSQL support, with certain features such as migrations behaving differently or being unavailable (Prisma, 2024).

### 3.3.3 Comparison of Databases

| Criterion | PostgreSQL | MongoDB |
|---|---|---|
| **Data Integrity** | Strong — enforced by foreign keys, constraints, and triggers | Flexible — schema validation optional; no native foreign key enforcement |
| **ACID Compliance** | Full ACID compliance; transactions are first-class | Multi-document ACID transactions added in v4.0; performance overhead |
| **Query Flexibility** | SQL with CTEs, window functions, subqueries; JSONB for semi-structured data | Rich document queries and aggregation pipelines; flexible but no joins |
| **Multi-Tenant Support** | Row Level Security (RLS) policies enforce isolation at database level | No native RLS; isolation must be implemented at application level |
| **ORM Tooling (Prisma)** | Mature, full-featured support; type-safe migrations and queries | Supported but less mature; migration behaviour differs |
| **Scalability** | Vertical scaling with read replicas; Neon provides serverless auto-scaling | Horizontal scaling via sharding; designed for distributed workloads |
| **Real-Time Capabilities** | LISTEN/NOTIFY for pub/sub; logical replication for change data capture | Change Streams for real-time event streaming from the oplog |
| **Financial Data Handling** | Native `DECIMAL`/`NUMERIC` types with exact precision | No native decimal type; relies on `Decimal128` or integer-based workarounds |
| **Schema Enforcement** | Strict schema enforced by table definitions and constraints | Optional schema validation; documents can vary in structure |

### 3.3.4 Recommendation of Database

PostgreSQL was selected as the database for Bite Byte, and this choice is justified by the fundamental characteristics of the application's data model and operational requirements.

The most decisive factor is the relational nature of Bite Byte's data. The platform's core entities — venues, menu categories, menu items, orders, and order items — form a clear hierarchical and relational structure. A venue has many categories, a category has many items, an order belongs to a venue and contains many order items, and each order item references a menu item. These relationships are naturally and efficiently expressed through PostgreSQL's foreign keys, joins, and referential integrity constraints. Attempting to model these relationships in MongoDB would require either denormalisation (with its attendant update anomalies) or manual reference resolution (negating the simplicity argument for document databases).

ACID compliance is non-negotiable for Bite Byte's payment processing workflow. When a customer places an order, the system must atomically create an order record, create associated order items, and process the Stripe payment. If any step fails, the entire transaction must be rolled back to maintain data consistency. PostgreSQL's mature transaction support, refined over decades of production use, provides the reliability required for financial operations. While MongoDB now supports multi-document transactions, PostgreSQL's implementation is more performant and better tested for this use case.

Row Level Security provides an additional layer of defence for multi-tenant data isolation. Although Bite Byte currently enforces tenant isolation through application-level filtering (including `venueId` in all Prisma queries), the ability to enforce isolation at the database level via RLS policies provides a safety net against application-level bugs that might inadvertently expose one venue's data to another. This defence-in-depth approach is consistent with security best practices for multi-tenant SaaS applications (OWASP, 2023).

Prisma's PostgreSQL integration is mature and fully featured, providing type-safe query generation, declarative schema definitions, and a robust migration system. The `Decimal` field type maps directly to PostgreSQL's `NUMERIC` type, ensuring exact decimal arithmetic for menu prices and order totals — a requirement that MongoDB cannot satisfy as cleanly. Additionally, PostgreSQL's JSONB column type provides the flexibility to store semi-structured data (such as future menu item modifiers or customisation options) without sacrificing the relational model for the core data.

Finally, hosting on Neon provides serverless PostgreSQL with automatic scaling, database branching for development workflows, and a connection pooler that handles connection management transparently. This combination of PostgreSQL's reliability and Neon's operational convenience makes it the optimal database choice for Bite Byte.

---

## 3.4 Agile Feasibility Study

### 1. Alignment with Project Goals

The Bite Byte platform is a multi-venue QR code food ordering system that must serve two distinct user groups — venue owners who manage menus and monitor orders, and customers who browse menus, place orders, and make payments. The platform's requirements span authentication, venue administration, menu management, real-time ordering, payment processing, live dashboards, and analytics. This breadth of functionality, combined with the need to serve both user groups effectively, creates a degree of complexity and uncertainty that demands an iterative development approach.

Agile/Scrum aligns directly with these goals by enabling the team to deliver the platform in discrete, testable increments. Rather than attempting to specify and build the entire system at once, the project is structured as a series of phases — each corresponding to one or more sprints — that progressively build upon the foundation laid by earlier work. Phase 1 establishes the project scaffold and monorepo structure. Phase 2 delivers authentication, venue setup, and the menu builder. Phase 3 adds customer ordering and Stripe payment integration. Phase 4 introduces real-time WebSocket-driven features and analytics. Each phase produces a working, deployable increment that can be demonstrated, tested, and validated before the team proceeds (Schwaber and Sutherland, 2020).

This alignment between Agile's iterative philosophy and Bite Byte's phased architecture ensures that the project maintains momentum, delivers value early, and retains the flexibility to adapt as requirements are refined through stakeholder feedback and real-world testing.

### 2. Stakeholder Involvement

A distinguishing feature of Agile/Scrum is the emphasis on continuous stakeholder engagement throughout the development process. In the context of Bite Byte, the primary stakeholders are venue owners (who will use the dashboard to manage menus and monitor orders) and end customers (who will use the QR code ordering interface on their mobile devices).

Scrum's sprint review ceremony provides a structured opportunity to demonstrate working features to stakeholders and gather feedback. After Phase 2, venue owners can test the authentication flow, venue creation process, and menu builder, providing feedback on usability, missing features, and workflow improvements. This feedback directly informs the product backlog and shapes the priorities for subsequent sprints. Similarly, after Phase 3, customers can test the ordering flow — scanning a QR code, browsing the menu, adding items to their cart, and completing a Stripe payment — providing feedback that may reveal usability issues not apparent during development.

This continuous feedback loop reduces the risk of delivering a product that fails to meet user expectations, which is a common failure mode in Waterfall projects where stakeholders only interact with the system at the requirements phase and final acceptance phase (Highsmith, 2002). By involving stakeholders at every sprint boundary, Agile/Scrum ensures that the product evolves in response to real user needs rather than assumptions.

### 3. Sprint-Based Incremental Delivery

Bite Byte's architecture is naturally decomposed into incremental delivery phases that map onto Scrum sprints. Each phase delivers a coherent set of features that build upon the previous phase's output:

- **Phase 1 (Foundation):** Project scaffold, monorepo setup with Turborepo and pnpm, initial Next.js and NestJS configuration, CI/CD pipeline, database provisioning on Neon.
- **Phase 2 (Auth + Venue Setup + Menu Builder):** User registration and login, venue creation and configuration, menu category management with drag-and-drop reordering, menu item CRUD with availability toggles.
- **Phase 3 (Customer Ordering + Payments):** Public menu display via QR code URLs, shopping cart with localStorage persistence, Stripe checkout integration, order creation and confirmation.
- **Phase 4 (Real-Time Operations + Analytics):** WebSocket-driven live order dashboard, order status management, real-time customer order tracking, analytics and order history.

This incremental structure ensures that each phase delivers a testable, demonstrable product increment. Phase 2 produces a functional menu management system that can be used independently. Phase 3 adds customer-facing ordering on top of the existing menu system. Phase 4 adds operational tools on top of the existing ordering system. At no point does the team invest effort in features that depend on unbuilt foundations, reducing integration risk and ensuring that the project delivers value progressively.

### 4. Risk Management

Agile/Scrum provides multiple mechanisms for identifying, assessing, and mitigating risks throughout the development lifecycle. Sprint retrospectives, conducted at the end of each sprint, offer a formal opportunity for the team to reflect on what went well, what went poorly, and what actions should be taken to improve. This regular cadence of reflection ensures that risks and issues are surfaced early, before they compound into larger problems.

The Minimum Viable Product (MVP) approach inherent in Agile development also serves as a risk mitigation strategy. By focusing each sprint on delivering the minimum set of features required to achieve the sprint goal, the team avoids scope creep — the gradual expansion of requirements that is a leading cause of project delays and budget overruns in software projects (The Standish Group, 2020). Features that are not essential to the current phase are captured in the product backlog for future consideration, ensuring that they are not lost but also not allowed to derail the current sprint.

Technical risks are also mitigated through Agile's emphasis on working software. By deploying and testing each increment in a production-like environment, the team discovers integration issues, performance bottlenecks, and usability problems early. For example, integrating Stripe payment processing in Phase 3 can be tested end-to-end before Phase 4 development begins, ensuring that any issues with payment handling are resolved before real-time features add additional complexity.

### 5. Resource Optimisation

Bite Byte is developed by a small team, making efficient resource utilisation essential. Scrum's self-organising team model empowers team members to take ownership of tasks, reducing the management overhead associated with traditional project management approaches. The daily standup provides a lightweight synchronisation mechanism that keeps the team aligned without consuming excessive time.

The monorepo structure, facilitated by Turborepo and pnpm workspaces, enables significant resource optimisation through code reuse. Shared TypeScript configurations, ESLint rules, and utility packages are maintained in a single location and consumed by both the Next.js frontend and NestJS backend. This eliminates duplication, ensures consistency, and reduces the maintenance burden. Prisma's schema-driven type generation further reduces manual effort by automatically producing type-safe database query interfaces from the schema definition.

Additionally, the selection of managed services — Neon for PostgreSQL, Vercel for Next.js deployment, Railway for NestJS deployment, and Stripe for payment processing — offloads operational concerns such as database administration, SSL certificate management, and PCI compliance, allowing the team to focus its limited resources on feature development rather than infrastructure management.

### 6. Scalability and Future Growth

Bite Byte's architecture is designed with extensibility in mind, and Agile/Scrum's iterative approach supports the gradual introduction of new features without disrupting existing functionality. The modular structure of both the Next.js frontend (with its file-system-based routing and component architecture) and the NestJS backend (with its module-based dependency injection) ensures that new features can be added as self-contained modules without modifying existing code.

Potential future enhancements include menu item modifiers and customisation options (e.g., "extra cheese", "no onions"), customer loyalty programmes, delivery integration, multi-language support, and advanced analytics with predictive ordering patterns. Each of these features can be developed as an independent sprint or set of sprints, leveraging the existing infrastructure without requiring a fundamental redesign. PostgreSQL's JSONB column type provides a mechanism for storing semi-structured modifier data alongside the relational schema, and NestJS's module system allows new API domains to be added without modifying existing modules.

This forward-looking architectural flexibility, combined with Agile's support for evolving requirements, ensures that Bite Byte can grow and adapt in response to market demands and user feedback without incurring the technical debt that often accompanies rapid feature addition in monolithic systems.

### 7. Legal and Ethical Compliance

Agile/Scrum's iterative approach provides opportunities to address legal and ethical compliance requirements incrementally, ensuring that compliance is built into the product rather than bolted on at the end. Each sprint can incorporate compliance-related user stories alongside feature stories, and the sprint review provides a checkpoint for verifying that compliance requirements are being met.

For Bite Byte, the primary legal compliance requirements relate to data protection (GDPR and the Data Protection Act 2018), payment card industry standards (PCI DSS), and consumer rights legislation. By integrating Stripe as the payment processor, the project delegates PCI DSS compliance to a Level 1 certified service provider, ensuring that no payment card data touches the Bite Byte servers. This architectural decision, made early in the project and validated during sprint reviews, significantly reduces the compliance burden and risk exposure.

GDPR compliance is addressed through data minimisation — the system collects only the customer's name for order identification and does not require account creation for placing orders. Privacy impact assessments can be conducted at each sprint boundary, and any compliance gaps identified during retrospectives can be prioritised in the product backlog for the next sprint. This iterative approach to compliance is more effective than attempting to address all legal requirements in a single phase, as it ensures that compliance considerations evolve alongside the product's features and data handling practices.

---

## 3.5 Legal, Ethical, Social and Professional Issues

### 3.5.1 Legal Issues

The Bite Byte platform operates within a legal framework that encompasses data protection, payment processing, consumer rights, and electronic commerce regulations. Each of these areas imposes specific obligations that must be addressed in the system's design and operation.

**Data Protection: GDPR and the Data Protection Act 2018.** The General Data Protection Regulation (GDPR) (European Parliament and Council, 2016) and the UK's Data Protection Act 2018 establish comprehensive requirements for the collection, processing, and storage of personal data. Bite Byte collects personal data from two categories of users: venue owners (who provide names, email addresses, and business details during registration) and customers (who provide their names when placing orders). Under Article 6 of the GDPR, the lawful basis for processing this data is the performance of a contract — venue owners enter a service agreement by registering, and customers provide their names to fulfil their food orders. The system must implement appropriate technical and organisational measures to protect this data, including encryption in transit (enforced via HTTPS), secure password hashing (using bcrypt or Argon2), and access controls that prevent unauthorised access to personal data. Data subjects have rights under Articles 15–22 of the GDPR, including the right of access, the right to rectification, the right to erasure ("right to be forgotten"), and the right to data portability. The system's architecture must support these rights, for example by providing mechanisms for venue owners to export or delete their data upon request.

**PCI DSS Compliance.** The Payment Card Industry Data Security Standard (PCI DSS) applies to any system that processes, stores, or transmits payment card data (PCI Security Standards Council, 2022). Bite Byte's architectural decision to use Stripe as its payment processor is specifically designed to avoid PCI DSS scope. Stripe's client-side integration (Stripe Elements or Checkout) ensures that payment card data is transmitted directly from the customer's browser to Stripe's servers, never passing through or being stored on Bite Byte's infrastructure. This places Bite Byte under the simplest PCI compliance category (SAQ A), requiring only that the system serves its payment pages over HTTPS and uses Stripe's official SDKs without modification. This architecture-level compliance decision is documented and validated during development, ensuring that no future feature inadvertently introduces payment card data handling into the application.

**Consumer Rights Act 2015.** The Consumer Rights Act 2015 governs the sale of goods and services to consumers in the United Kingdom. For Bite Byte, this legislation requires that menu prices displayed to customers are accurate and inclusive of any applicable charges, that customers receive clear confirmation of their orders, and that the goods described (menu items) match what is actually delivered. The system supports these requirements by displaying real-time menu data (reflecting the venue owner's current prices and availability), providing order confirmation screens, and maintaining order records that can be referenced in the event of a dispute.

**Cookie and localStorage Regulations.** The Privacy and Electronic Communications Regulations 2003 (PECR), as amended, require that users are informed about and consent to the use of cookies and similar technologies for non-essential purposes. Bite Byte uses localStorage to persist shopping cart state on the customer's device. Since this storage is strictly necessary for the functioning of the ordering service (the user has explicitly chosen to add items to their cart), it falls under the exemption for storage that is "strictly necessary for the provision of an information society service explicitly requested by the subscriber or user" (Regulation 6(4), PECR). However, if analytics cookies or third-party tracking are introduced in the future, a cookie consent mechanism would be required.

### 3.5.2 Ethical Issues

Beyond legal compliance, the Bite Byte platform raises several ethical considerations that have been addressed in its design and operation.

**Transparent Pricing.** Ethical pricing practices require that customers can clearly understand the total cost of their order before committing to payment. Bite Byte displays individual item prices on the menu, provides a running total in the shopping cart, and shows the final amount on the Stripe checkout page. No hidden fees, service charges, or surcharges are added by the platform itself, though venue owners retain the ability to set their own prices. This transparency is essential for maintaining customer trust and aligns with the BCS (British Computer Society) Code of Conduct requirement to have "due regard for the legitimate rights of Third Parties" (BCS, 2022).

**Accessibility.** The Web Content Accessibility Guidelines (WCAG) 2.1, published by the World Wide Web Consortium (W3C, 2018), establish standards for making web content accessible to people with disabilities. As a platform that customers access on their mobile devices — often in environments with varying lighting conditions and noise levels — accessibility is both an ethical imperative and a practical necessity. The use of shadcn/ui components, which are built on Radix UI primitives with WAI-ARIA compliance, provides a foundation of accessible interactive elements. Tailwind CSS's utility-first approach supports responsive design across different screen sizes and orientations. However, ongoing accessibility auditing is required to ensure that custom components and dynamic content (such as real-time order status updates) meet WCAG 2.1 AA standards.

**Data Minimisation.** The principle of data minimisation — collecting only the personal data that is necessary for the specified purpose — is both a GDPR requirement and an ethical best practice. Bite Byte implements data minimisation by design: customers are required to provide only their name when placing an order, and no account creation is necessary. The system does not collect email addresses, phone numbers, or location data from customers, and the shopping cart is stored locally on the customer's device rather than on the server. This approach respects customer privacy while still providing sufficient information for the venue to identify and fulfil the order.

**Fair Treatment of Venue Owners.** As a platform that mediates between venue owners and their customers, Bite Byte has an ethical obligation to treat venue owners fairly. This includes providing transparent information about any fees or charges associated with using the platform, ensuring that venue owners retain control over their own data (including menu content, pricing, and order history), and providing tools for venue owners to manage their presence on the platform without unreasonable restrictions. The system's architecture supports this by giving venue owners full administrative control over their venues, menus, and operational settings.

### 3.5.3 Social Issues

The introduction of QR code food ordering technology into dining environments has broader social implications that warrant consideration.

**Digital Divide.** Not all customers have access to smartphones or are comfortable using digital interfaces to place food orders. Elderly customers, individuals with certain disabilities, and those from lower socioeconomic backgrounds may be disproportionately affected by the shift from human-mediated to technology-mediated ordering. While Bite Byte provides an efficient ordering channel, venues should be encouraged to maintain alternative ordering methods (such as verbal orders to staff) to ensure that all customers can access their services. The platform's documentation should advise venue owners on inclusive service provision, and the system's design should not assume that QR code ordering is the sole ordering channel.

**Reduction of Human Interaction.** Dining is traditionally a social activity that includes interaction between customers and serving staff. The introduction of self-service ordering via QR codes reduces this interaction, which may diminish the dining experience for customers who value personal service and human connection. Research by Kimes (2008) on self-service technology in hospitality has shown that customer acceptance varies significantly based on context, with some customers appreciating the efficiency while others perceive reduced service quality. Bite Byte should be positioned as a tool that augments rather than replaces human service, freeing staff to focus on hospitality and food delivery rather than order-taking.

**Employment and Job Displacement.** The automation of order-taking through digital platforms raises concerns about the impact on employment in the hospitality sector. If QR code ordering reduces the need for front-of-house staff to take orders, this could lead to reduced hours or job losses for workers in an already precarious employment sector (CIPD, 2023). However, the counter-argument is that QR code ordering can improve operational efficiency, reduce errors, and enable venues to serve more customers with the same staff — potentially improving the viability of small businesses and preserving jobs that might otherwise be lost to closure. The net employment impact depends on how venue owners choose to deploy the technology and whether efficiency gains are reinvested in improved service or used to reduce staffing.

**Environmental Benefits.** QR code ordering eliminates the need for printed paper menus, which must be regularly updated, reprinted, and disposed of. For venues that change their menus frequently (daily specials, seasonal items, price updates), the environmental benefit of digital menus is meaningful. The reduction in paper waste, ink consumption, and associated logistics contributes to a more sustainable hospitality operation. Additionally, the accuracy of digital ordering may reduce food waste by ensuring that orders are captured correctly, minimising the preparation of incorrect items.

### 3.5.4 Professional Issues

As a software engineering project, Bite Byte is subject to professional standards and best practices that govern the conduct of computing professionals.

**BCS Code of Conduct.** The British Computer Society's Code of Conduct (BCS, 2022) establishes four principles for computing professionals: public interest, professional competence and integrity, duty to relevant authority, and duty to the profession. Bite Byte's development adheres to these principles by prioritising user safety and data security (public interest), maintaining code quality and following established engineering practices (professional competence), ensuring transparent communication about capabilities and limitations (integrity), and contributing to the advancement of software engineering through well-documented, maintainable code (duty to the profession). The use of TypeScript's static type system, comprehensive error handling, and structured architecture reflects a commitment to professional competence in software engineering.

**Software Engineering Best Practices.** The Bite Byte project follows established software engineering best practices that promote code quality, maintainability, and reliability. The codebase adheres to consistent coding standards enforced by ESLint, ensuring uniform formatting and catching common programming errors at development time. The monorepo structure with Turborepo provides reproducible builds and clear dependency management between packages. Database schema changes are managed through Prisma migrations, ensuring that the database structure is version-controlled and reproducible across environments. Environment-specific configuration is managed through environment variables, following the twelve-factor app methodology (Wiggins, 2017), ensuring that sensitive credentials are never committed to version control.

**Version Control and Code Quality.** Git is used for version control, with a structured commit history that documents the evolution of the codebase. Meaningful commit messages, following conventional commit format, provide a searchable record of changes and their rationale. The branching strategy supports parallel development of features without destabilising the main codebase, and pull requests provide a mechanism for code review before changes are merged. These practices ensure that the codebase remains navigable, auditable, and maintainable over time.

**Security-First Development.** Security considerations are integrated into every phase of development rather than treated as an afterthought. Authentication is implemented using industry-standard practices, with passwords hashed using cryptographic algorithms and sessions managed through secure, HTTP-only tokens. API endpoints are protected by authentication middleware that verifies the caller's identity and authorisation before processing requests. Input validation, implemented through Zod schemas on both the client and server, prevents injection attacks and ensures that only well-formed data reaches the database layer. The delegation of payment processing to Stripe eliminates the most significant security risk — handling payment card data — by ensuring that sensitive financial information never enters the application's infrastructure. These security practices reflect a professional commitment to protecting users' data and maintaining the integrity of the system.

---

## References

Beck, K. et al. (2001) *Manifesto for Agile Software Development*. Available at: https://agilemanifesto.org/ (Accessed: 15 March 2026).

BCS (2022) *BCS Code of Conduct*. Available at: https://www.bcs.org/membership-and-registrations/become-a-member/bcs-code-of-conduct/ (Accessed: 15 March 2026).

Beazley, D. (2010) 'Understanding the Python GIL', *PyCon 2010*. Available at: https://dabeaz.com/python/UnderstandingGIL.pdf (Accessed: 15 March 2026).

Bloch, J. (2018) *Effective Java*. 3rd edn. Boston: Addison-Wesley.

Boehm, B. W. (1981) *Software Engineering Economics*. Englewood Cliffs, NJ: Prentice-Hall.

CIPD (2023) *The Impact of Technology on Jobs and Skills*. London: Chartered Institute of Personnel and Development. [Citation needed]

Cohn, M. (2004) *User Stories Applied: For Agile Software Development*. Boston: Addison-Wesley.

Django Software Foundation (2024) *Django Documentation*. Available at: https://docs.djangoproject.com/ (Accessed: 15 March 2026).

Dyba, T. and Dingsoyr, T. (2008) 'Empirical studies of agile software development: A systematic review', *Information and Software Technology*, 50(9-10), pp. 833-859.

European Parliament and Council (2016) *Regulation (EU) 2016/679 (General Data Protection Regulation)*. Official Journal of the European Union.

Hejlsberg, A. (2012) *Introducing TypeScript*. Microsoft Channel 9. Available at: https://www.typescriptlang.org/ (Accessed: 15 March 2026).

Highsmith, J. (2002) *Agile Software Development Ecosystems*. Boston: Addison-Wesley.

Kimes, S. E. (2008) 'The role of technology in restaurant revenue management', *Cornell Hospitality Quarterly*, 49(3), pp. 297-309.

MongoDB, Inc. (2024) *MongoDB Documentation*. Available at: https://www.mongodb.com/docs/ (Accessed: 15 March 2026).

Mongoose (2024) *Mongoose Documentation*. Available at: https://mongoosejs.com/ (Accessed: 15 March 2026).

Mysliwiec, K. (2017) *NestJS Documentation*. Available at: https://docs.nestjs.com/ (Accessed: 15 March 2026).

Neon (2024) *Neon Documentation*. Available at: https://neon.tech/docs/ (Accessed: 15 March 2026).

OWASP (2023) *OWASP Multi-Tenant Security Cheat Sheet*. Available at: https://cheatsheetseries.owasp.org/ (Accessed: 15 March 2026).

PCI Security Standards Council (2022) *PCI DSS Quick Reference Guide*. Available at: https://www.pcisecuritystandards.org/ (Accessed: 15 March 2026).

Pressman, R. S. and Maxim, B. R. (2020) *Software Engineering: A Practitioner's Approach*. 9th edn. New York: McGraw-Hill.

Prisma (2024) *Prisma Documentation*. Available at: https://www.prisma.io/docs/ (Accessed: 15 March 2026).

Ronacher, A. (2010) *Flask Documentation*. Available at: https://flask.palletsprojects.com/ (Accessed: 15 March 2026).

Royce, W. W. (1970) 'Managing the development of large software systems', *Proceedings of IEEE WESCON*, pp. 1-9.

Rubin, K. S. (2012) *Essential Scrum: A Practical Guide to the Most Popular Agile Process*. Upper Saddle River, NJ: Addison-Wesley.

Schwaber, K. and Sutherland, J. (2020) *The Scrum Guide*. Available at: https://scrumguides.org/ (Accessed: 15 March 2026).

Sommerville, I. (2015) *Software Engineering*. 10th edn. Harlow: Pearson.

Stack Overflow (2023) *2023 Developer Survey*. Available at: https://survey.stackoverflow.co/2023/ (Accessed: 15 March 2026).

The PostgreSQL Global Development Group (2024) *PostgreSQL Documentation*. Available at: https://www.postgresql.org/docs/ (Accessed: 15 March 2026).

The Standish Group (2020) *CHAOS 2020: Beyond Infinity*. Boston: The Standish Group International. [Citation needed]

Van Rossum, G. and Drake, F. L. (2009) *Python 3 Reference Manual*. Scotts Valley, CA: CreateSpace.

Vercel (2023) *Turborepo Documentation*. Available at: https://turbo.build/repo/docs (Accessed: 15 March 2026).

Vercel (2024) *Next.js Documentation*. Available at: https://nextjs.org/docs (Accessed: 15 March 2026).

VersionOne (2022) *16th State of Agile Report*. Available at: https://digital.ai/resource-center/analyst-reports/state-of-agile-report/ (Accessed: 15 March 2026). [Citation needed]

W3C (2018) *Web Content Accessibility Guidelines (WCAG) 2.1*. Available at: https://www.w3.org/TR/WCAG21/ (Accessed: 15 March 2026).

Wiggins, A. (2017) *The Twelve-Factor App*. Available at: https://12factor.net/ (Accessed: 15 March 2026).
