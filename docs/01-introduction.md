# Chapter 1: Introduction

The food service industry has undergone significant technological transformation in recent years, with large restaurant chains and delivery platforms adopting digital ordering, automated kitchens, and data-driven operations. However, small independent venues — neighbourhood restaurants, cafes, market stalls, and food trucks — have been largely left behind by this digital shift. These businesses continue to rely on paper menus, verbal ordering, and manual payment processes that introduce inefficiency, errors, and a poor customer experience during busy periods.

Bite Byte is a QR code-based web ordering platform designed specifically for this underserved market. By enabling customers to scan a code, browse a digital menu, and place an order directly from their smartphone browser — without downloading an application or creating an account — Bite Byte eliminates the friction inherent in traditional ordering while giving venue owners real-time operational tools and business analytics they have never previously had access to. This chapter provides an overview of the current system being replaced, the business issues that motivate the project, an analysis of Bite Byte's strategic position, the proposed system scope, and the aims and objectives that guided its development.

## 1.1 Background of the Current System

The ordering process at small food venues has remained fundamentally unchanged for decades. A customer arrives at the venue, consults a printed menu or a handwritten board, decides what to order, queues at a counter or waits for a member of staff, communicates their order verbally, pays at the point of sale, and then waits for their food to be prepared and served or collected.

This process was adequate when customer volumes were low and expectations were modest. However, several factors have rendered it increasingly inadequate. First, consumer expectations have shifted. Customers accustomed to the convenience of digital ordering through platforms such as Deliveroo, Just Eat, and Uber Eats now find the friction of queuing and verbal ordering frustrating, even when dining in or visiting a food truck. Second, the COVID-19 pandemic accelerated demand for contactless interactions, and many customers now prefer to minimise face-to-face contact when placing orders. Third, small venue owners operate on thin margins and cannot afford the inefficiencies that manual ordering introduces — miscommunicated orders that must be remade, staff tied up at the counter instead of preparing food, and a complete lack of data about which items sell well, what peak hours look like, or how revenue trends over time.

Despite these pressures, the majority of small venues have not adopted digital ordering. The reasons are straightforward: existing solutions are either designed for large chains with complex requirements and corresponding price tags, or they are delivery-focused platforms that charge commission on every order and are poorly suited to in-venue dining. There is a clear gap in the market for a lightweight, affordable, and easy-to-adopt ordering platform that serves the specific needs of small independent venues.

## 1.2 Current Business Process

The typical ordering workflow at a small food venue follows a linear, manual process with several distinct stages, each of which introduces potential delays and errors.

**Arrival and menu consultation.** The customer arrives at the venue and locates the menu. In a sit-down restaurant, this is typically a printed menu at the table or handed over by staff. At a food truck or takeaway counter, it is usually a board mounted behind the counter or a laminated sheet. The customer reads through the available items, considers options, and makes a decision. If they have questions about ingredients, allergens, or portion sizes, they must ask a member of staff, who may or may not be immediately available.

**Queuing.** Once the customer has decided what to order, they must wait their turn. At a counter-service venue or food truck, this means joining a physical queue. During peak hours — lunchtime in a business district, evening service at a popular restaurant, or a busy market day for a food truck — this queue can become substantial. Customers waiting in the queue cannot place their order until they reach the front, creating a bottleneck that limits the venue's throughput.

**Verbal ordering.** When the customer reaches the counter, they communicate their order verbally to a member of staff. The staff member listens, may ask clarifying questions, and manually enters the order into a till, writes it on a ticket, or simply calls it through to the kitchen. This verbal exchange is the primary source of order errors: items may be misheard, modifications forgotten, or quantities recorded incorrectly, particularly in noisy environments such as busy kitchens or outdoor food markets.

**Payment.** The customer pays at the counter, typically by cash or card. The payment options available depend on the hardware the venue has invested in. Some food trucks accept only cash; others have a card terminal but no contactless capability. The payment stage adds further time to each transaction, extending the queue for subsequent customers.

**Waiting and collection.** After paying, the customer waits for their food to be prepared. In most small venues, there is no system for notifying the customer when their order is ready beyond calling out a name or number. The customer must remain within earshot of the counter, and missed calls result in food sitting idle and the customer remaining unaware.

This entire process is sequential and blocking: each customer must complete every stage before the next customer can begin. The venue's order throughput is therefore limited by the speed of the slowest stage — which is almost always the verbal ordering and payment interaction at the counter.

## 1.3 Current Business Issues

The manual ordering process described above gives rise to several concrete business issues that affect both venue owners and their customers.

**Long queues during peak hours.** Because every order must pass through the single bottleneck of the counter, queues build rapidly during busy periods. Customers who see a long queue may choose to leave entirely, representing lost revenue for the venue. Those who stay experience frustration and a diminished perception of the venue, reducing the likelihood of repeat visits. The venue's revenue during peak hours is capped by the speed at which a single staff member (or a small number of staff) can process orders at the counter.

**Order errors from verbal communication.** Verbal ordering is inherently error-prone. Background noise, accents, unfamiliar menu item names, and the pressure of a busy service all contribute to miscommunication. When an order is prepared incorrectly, the venue must either remake the item — incurring additional food cost and preparation time — or risk a dissatisfied customer. Studies in hospitality management consistently identify order accuracy as one of the strongest predictors of customer satisfaction, and manual verbal ordering is the weakest link in this chain.

**No data or analytics for venue owners.** Small venues operating on manual processes have virtually no access to operational data. They cannot easily determine which menu items are most popular, what their revenue was on a given day compared to the previous week, what their peak hours are, or how changes to the menu affect sales. All of these insights require data capture at the point of order, which simply does not occur in a manual process. Without data, venue owners make decisions based on intuition rather than evidence, leading to suboptimal menu composition, staffing levels, and pricing.

**Limited payment options.** The payment methods available to customers are constrained by the hardware the venue has purchased and the payment providers they have relationships with. Many small venues, particularly food trucks, have limited payment infrastructure. This creates friction for customers who prefer a specific payment method and can result in lost sales when a customer does not have the accepted form of payment available.

**Inability to update menus in real-time.** Printed menus are expensive to produce and cannot be updated dynamically. When a venue runs out of an ingredient, adds a seasonal special, or adjusts pricing, the printed menu becomes inaccurate. Staff must then verbally communicate changes to customers, adding to the ordering interaction time and creating opportunities for confusion. Food trucks, which frequently change their offerings based on location, event, and ingredient availability, are particularly affected by this limitation.

**Staff bottleneck.** In a small venue, the same staff members who prepare food are often also responsible for taking orders and processing payments. Every minute spent at the counter is a minute not spent in the kitchen. This dual role limits the venue's overall capacity: the kitchen could produce more food, but the counter interaction constrains how many orders can be received. Separating the ordering process from staff involvement would free them to focus entirely on food preparation, increasing throughput without increasing headcount.

## 1.4 SWOT Analysis

A SWOT analysis provides a structured evaluation of Bite Byte's strategic position, examining internal strengths and weaknesses alongside external opportunities and threats.

### 1.4.1 Strengths

**No application download required.** Bite Byte is a progressive web application accessed entirely through the customer's smartphone browser. Unlike native mobile applications, which require the customer to find, download, and install an app before they can place an order, Bite Byte is immediately accessible via a QR code scan. This eliminates the single largest barrier to adoption for customer-facing ordering platforms: the friction of app installation. Research consistently shows that the majority of customers will not download a venue-specific app for a one-time visit, making browser-based solutions significantly more accessible.

**Zero friction for customers.** Bite Byte does not require customers to create an account, provide an email address, or log in before placing an order. The ordering flow is designed around guest checkout, mirroring the simplicity of the traditional walk-up ordering experience while adding the convenience of digital interaction. This design decision directly supports the project's target of "scan to kitchen in under 60 seconds."

**Real-time order tracking.** Once an order is placed, customers can track its status in real-time through a WebSocket connection. This eliminates the need for customers to wait within earshot of the counter and provides transparency about when their food will be ready. For venue owners, real-time order visibility through a live dashboard enables better kitchen management and workload distribution.

**Multi-venue support.** The platform is designed from the outset to support venue owners who operate multiple locations — for example, a food truck operator with several vehicles or a restaurant owner with multiple branches. Each venue has its own menu, QR code, orders, and analytics, all managed from a single authenticated account. This multi-venue architecture differentiates Bite Byte from simpler solutions that assume a one-to-one relationship between an account and a venue.

**Modern technology stack.** Bite Byte is built on a contemporary, well-supported technology stack: Next.js for the frontend, NestJS for the backend API, PostgreSQL for data persistence, and TypeScript throughout. This choice of technologies ensures long-term maintainability, strong community support, and access to a large ecosystem of libraries and tooling. The monorepo structure with Turborepo enables efficient development and consistent code sharing across the frontend and backend.

### 1.4.2 Weaknesses

**Requires internet connectivity.** Both the customer ordering experience and the venue owner dashboard require an active internet connection. Unlike a paper menu, which functions regardless of connectivity, Bite Byte cannot operate in environments where network coverage is unreliable or unavailable. This is a meaningful limitation for food trucks operating at outdoor events, festivals, or rural markets where mobile data coverage may be inconsistent.

**Dependent on customer having a smartphone.** The platform assumes that every customer has a smartphone capable of scanning a QR code and rendering a modern web application. While smartphone penetration in the United Kingdom exceeds 90% of the adult population, this still excludes a segment of potential customers — particularly older individuals who may not carry a smartphone or may be unfamiliar with QR code scanning. Venues using Bite Byte would need to maintain a fallback ordering method for these customers.

**No offline mode.** The application does not currently support offline functionality. If connectivity is lost during the ordering process, the customer's progress may be lost. Progressive web application technologies such as service workers could potentially address this limitation in future iterations, but the current version does not implement offline caching or queuing.

**Limited to food ordering.** Bite Byte is purpose-built for food ordering and does not extend into adjacent functionality such as table reservations, waitlist management, loyalty programmes, or delivery logistics. While this narrow focus enables a simpler and more polished core experience, it means that venue owners requiring these additional capabilities would need to use separate systems alongside Bite Byte, potentially creating operational complexity.

### 1.4.3 Opportunities

**Growing demand for contactless ordering.** The COVID-19 pandemic fundamentally shifted consumer expectations around contactless service. Even as the immediate health concerns have receded, the preference for reduced physical interaction during ordering has persisted. QR code-based ordering, which was a novelty before 2020, is now familiar to the majority of diners. This cultural shift creates a favourable environment for platforms like Bite Byte that facilitate contactless ordering without requiring app installation.

**Underserved market segment.** The small venue and food truck market is poorly served by existing digital ordering solutions. Enterprise platforms such as Toast and Square for Restaurants are designed for larger operations and carry price points and complexity that are prohibitive for a sole trader running a food truck. Delivery platforms such as Deliveroo and Just Eat charge commissions of 15-35% per order, making them uneconomical for in-venue ordering. Bite Byte's positioning as a lightweight, affordable solution for this specific segment addresses a genuine gap in the market.

**Potential for feature expansion.** The platform's architecture supports future expansion into adjacent features that would increase its value proposition. Customer accounts and loyalty programmes could drive repeat business for venues. Integration with third-party point-of-sale systems could reduce the operational overhead of running Bite Byte alongside existing till systems. A marketplace or discovery feature could help customers find nearby venues using the platform, creating network effects that benefit all participating venues.

**Integration possibilities.** The API-first architecture of Bite Byte's backend creates opportunities for integration with external systems. Point-of-sale integration would allow orders placed through Bite Byte to appear automatically on the venue's existing till system. Delivery platform integration could enable venues to manage both in-venue and delivery orders from a single dashboard. Accounting software integration could automate revenue reporting and tax calculations.

### 1.4.4 Threats

**Competition from established platforms.** Several well-funded companies operate in the broader food ordering technology space. Square for Restaurants, Toast, and Mr Yum all offer digital ordering capabilities, backed by significant marketing budgets, established brand recognition, and large sales teams. While these platforms are primarily targeting larger venues and may not directly compete for Bite Byte's target market of small independent venues, they could choose to move downmarket at any time, leveraging their existing infrastructure and brand to capture the small venue segment.

**Venue owner technology resistance.** Small venue owners — particularly those who have operated successfully for years using traditional methods — may resist adopting a digital ordering platform. Common objections include the perceived complexity of setting up and managing the system, concerns about reliability, reluctance to change established workflows, and scepticism about the return on investment. Overcoming this resistance requires demonstrating clear, immediate value with minimal setup effort, which places significant demands on the platform's onboarding experience and ease of use.

**Internet reliability in outdoor and event settings.** Food trucks and market stalls — a key segment of Bite Byte's target market — frequently operate in locations where internet connectivity is unreliable. Outdoor events, rural markets, and festival grounds may have poor mobile data coverage, making it difficult or impossible for customers to access the platform. While this is an infrastructure limitation outside Bite Byte's control, it nevertheless constrains the platform's usefulness for a significant portion of its intended audience.

**Stripe fee concerns for low-margin venues.** Bite Byte integrates Stripe for payment processing, which charges a per-transaction fee (typically 1.4% + 20p for European cards). For venues operating on thin margins — particularly food trucks selling low-value items — these transaction fees may be perceived as unacceptably high. The inclusion of a pay-at-counter option mitigates this concern by allowing customers to pay in cash or via the venue's own card terminal, but the Stripe fees remain a potential objection during venue onboarding.

## 1.5 Proposed System Scope

### Key Features

Bite Byte delivers a comprehensive set of features across two user roles: venue owners (authenticated dashboard users) and customers (unauthenticated guest users).

**Authentication and account management.** Venue owners register with an email and password, authenticated via JSON Web Tokens (JWT). Sessions are managed securely, and all dashboard functionality is protected behind authentication.

**Multi-venue management.** Authenticated users can create and manage multiple venues, each with its own name, slug (used in the public menu URL), and configuration. The dashboard provides a venue selector for switching between venues.

**Drag-and-drop menu builder.** Each venue has a fully customisable menu organised into categories (e.g., Starters, Mains, Drinks). Categories and items can be reordered via drag-and-drop. Menu items include a name, description, price, optional photo upload, and an availability toggle that allows items to be hidden from the public menu without deleting them.

**QR code generation.** Each venue is assigned a unique URL based on its slug, and the platform generates a QR code that links directly to the venue's public menu page. Venue owners can download and print this QR code for display at their venue.

**Guest ordering.** Customers access the menu by scanning the QR code or navigating directly to the venue's URL. They can browse categories, add items to a cart, and proceed to checkout — all without creating an account or logging in.

**Dual payment modes.** At checkout, customers can choose to pay online via Stripe (credit/debit card) or select the pay-at-counter option to pay in person using cash or the venue's own card terminal. This flexibility accommodates venues and customers with varying payment preferences.

**Real-time order tracking.** After placing an order, customers see a live status page that updates in real-time via WebSocket (Socket.IO). Order statuses progress through stages such as received, preparing, and ready, providing transparency and reducing anxiety about wait times.

**Live orders dashboard.** Venue owners access a real-time dashboard showing all incoming and active orders. New orders appear instantly via WebSocket, and owners can update order statuses with a single click. This dashboard is designed to function as a kitchen display system for small venues.

**Analytics dashboard.** The platform provides venue owners with analytics including total revenue, order volume over time, top-selling items, and daily trends. These insights enable data-driven decisions about menu composition, pricing, and staffing.

**Order history.** Both the live dashboard and a dedicated history view allow venue owners to review past orders, providing an audit trail and enabling retrospective analysis of business performance.

### Target Audience

**Primary: Small venue owners and food truck operators.** The platform is designed for sole traders, small partnerships, and micro-businesses operating one or more food venues. These users typically have limited technical expertise, no dedicated IT staff, and constrained budgets. Bite Byte's value proposition for this audience is operational efficiency, reduced order errors, and access to business data they have never previously had.

**Secondary: Customers (diners).** The end consumers who scan the QR code and place orders. This audience is broad and diverse, ranging from tech-savvy young adults to older diners who may be less familiar with digital ordering. The guest checkout model — no account, no app, no login — is specifically designed to minimise barriers for this audience.

### Scope of Deliverables

The project delivers the following artefacts:

- A fully functional web application comprising a Next.js frontend and a NestJS backend API, deployed to production infrastructure (Vercel and Railway respectively).
- A PostgreSQL database with a complete schema supporting venues, menus, categories, items, orders, and order items, managed through Prisma migrations.
- A real-time ordering system using WebSocket (Socket.IO) for live order updates on both the customer-facing status page and the venue owner dashboard.
- Payment integration with Stripe, supporting online card payments alongside a pay-at-counter fallback.
- An analytics dashboard providing revenue, order volume, and item popularity metrics.
- Project documentation including this report, system architecture documentation, and user acceptance testing records.

### Limitations

The following items are explicitly outside the scope of this project:

- **No native mobile application.** Bite Byte is a web application only. While it is responsive and functions well on mobile browsers, it is not distributed through the Apple App Store or Google Play Store.
- **No delivery integration.** The platform supports in-venue ordering only. It does not include delivery logistics, driver management, or integration with third-party delivery services.
- **No table reservation system.** The platform does not support booking tables or managing a waitlist.
- **No inventory management.** While venue owners can toggle item availability, the platform does not track stock levels, generate purchase orders, or integrate with supplier systems.
- **Single language.** The interface and all content are in English only. Internationalisation and localisation are not included in this version.
- **No customer accounts.** Ordering is guest-only by design. Customers cannot create accounts, view order history, or save payment methods. This is a deliberate design decision to minimise friction, but it does preclude features such as loyalty programmes and personalised recommendations.

## 1.6 Aim and Objectives

### Aim

To design and develop a QR code-based food ordering platform that enables small food venues to digitise their ordering process, reducing customer wait times and order errors while providing venue owners with real-time operational tools and data-driven business analytics.

### Objectives

#### a) Research and Analysis

To conduct a thorough investigation of the existing food ordering technology landscape, identifying the solutions currently available to small venues and evaluating their suitability, cost, and limitations. This research encompasses both direct competitors (platforms specifically targeting in-venue QR code ordering) and adjacent solutions (delivery platforms, enterprise POS systems) to understand why small venues remain underserved. Requirements gathering draws on the identified gaps to define a feature set that addresses the specific needs of small venue owners and their customers.

#### b) Planning

To create a comprehensive project plan following an Agile methodology with Scrum-inspired practices. The development work is organised into iterative sprints, each delivering a functional increment of the platform. Feature prioritisation is guided by the MoSCoW method (Must have, Should have, Could have, Won't have), ensuring that the core ordering workflow is delivered first and ancillary features are added in subsequent sprints. Sprint planning, regular reviews, and retrospectives provide structure and enable course correction throughout the development lifecycle.

#### c) Design

To design the system architecture, database schema, and user interface before commencing development. The architecture design encompasses the monorepo structure, the separation between the Next.js frontend and NestJS backend API, the database schema modelled in Prisma, and the real-time communication layer using Socket.IO. User interface design includes wireframes and component hierarchies for both the venue owner dashboard and the customer-facing ordering experience. Use case diagrams, sequence diagrams, and entity-relationship diagrams provide formal documentation of the system's behaviour and data model.

#### d) Development

To implement the platform iteratively across multiple sprints, with each sprint delivering a tested, functional increment. The development phases progress through authentication and account management, venue creation and configuration, the menu builder with drag-and-drop reordering and photo upload, the customer-facing ordering flow with cart management and checkout, Stripe payment integration, real-time order tracking via WebSocket, the live orders dashboard for venue owners, and the analytics dashboard. Each phase builds upon the previous, and the system is deployable at the end of every sprint.

#### e) Testing

To conduct rigorous testing at multiple levels throughout the development process. Functional testing verifies that individual features behave as specified. User acceptance testing (UAT) is performed at the end of each sprint against a defined set of acceptance criteria, ensuring that the delivered functionality meets the requirements. Integration testing verifies that the frontend, backend API, database, payment provider, and WebSocket layer function correctly as a cohesive system. End-to-end testing validates complete user journeys — from scanning a QR code to receiving a prepared order — across the full technology stack.

#### f) Evaluation

To critically evaluate the completed system against the original aims and objectives, assessing the extent to which each has been achieved. This evaluation includes reflection on the methodology choices — whether Agile/Scrum was appropriate for the project, what worked well, and what could be improved. The evaluation also identifies areas for future development, including features that were descoped, architectural improvements that became apparent during development, and potential market opportunities that emerged during the project.

## 1.7 Overview of the Remaining Chapters

The remainder of this report is organised into six chapters, each addressing a distinct aspect of the project.

**Chapter 2: Similar Product Comparison** examines existing food ordering platforms and compares their features, pricing, and target markets with Bite Byte. This chapter evaluates solutions including Square Online Ordering and Mr Yum, identifying the specific gaps in the market that Bite Byte addresses. The comparison covers both functional features and non-functional qualities assessed against Nielsen's usability heuristics.

**Chapter 3: Literature Review** surveys the academic and industry literature relevant to the project. Topics include software development methodologies (Agile/Scrum versus Waterfall), programming language selection (TypeScript versus Python), database technology (PostgreSQL versus MongoDB), and legal, ethical, social, and professional considerations. The literature review provides the theoretical foundation for the design and implementation decisions made throughout the project.

**Chapter 4: System Requirements and Architecture** presents the formal requirements specification, system architecture, and design documentation. This chapter includes functional and non-functional requirements, MoSCoW prioritisation, the sprint plan, a risk register, use case diagrams, and class diagrams. The requirements are organised by functional area: user management, venue management, menu management, ordering, order management, and analytics.

**Chapter 5: Development and Testing** provides a detailed account of the implementation process, organised by sprint. Each sprint section describes the features developed, use case and class diagrams specific to that sprint, screen designs with descriptions, functional test plans with results, and a summary of challenges encountered and resolved.

**Chapter 6: Deployment** documents the production deployment architecture, including the hosting platforms (Vercel for the frontend, Railway for the backend and database), environment configuration, continuous deployment pipelines, and operational considerations such as CORS, WebSocket support, and database migrations.

**Chapter 7: Evaluation and Conclusion** provides a critical evaluation of the completed project against its original aims and objectives, reflects on the methodology and technology choices, discusses personal development, identifies limitations and future amendments, and concludes with a summary of the project's achievements.
