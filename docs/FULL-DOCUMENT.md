# Abstract

The traditional ordering process at small food venues — including independent restaurants, cafes, and food trucks — remains largely manual and inefficient. Customers typically queue to place orders verbally, staff transcribe these orders by hand, and payment is handled at the counter. This process introduces friction at every stage: long wait times during peak hours, order errors arising from miscommunication, and a complete absence of operational data for venue owners seeking to understand their business performance. Furthermore, printed menus are costly to update, and staff are occupied taking orders rather than preparing food.

Bite Byte addresses these inefficiencies by providing a QR code-based web ordering platform purpose-built for small venues. Customers scan a QR code at the venue, browse a digital menu, place their order, and pay — all from their smartphone browser without downloading an application or creating an account. The system targets a "scan to kitchen in under 60 seconds" experience, eliminating queues and reducing order errors to near zero.

The project was developed using an Agile methodology with iterative sprints, each delivering a functional increment: authentication and venue setup, a drag-and-drop menu builder with photo upload, guest checkout with Stripe payment integration, real-time order tracking via WebSocket, a live orders dashboard, and an analytics suite. The technology stack comprises Next.js and NestJS within a TypeScript monorepo, PostgreSQL via Prisma, Stripe for payments, Socket.IO for real-time communication, and Tailwind CSS with shadcn/ui for the interface.

The resulting platform successfully digitises the end-to-end ordering workflow, providing venue owners with real-time operational visibility and data-driven insights while delivering a frictionless ordering experience for their customers.

---

# Acknowledgement

I would like to express my sincere gratitude to my project supervisor, [Supervisor Name], for their continued guidance, constructive feedback, and support throughout the development of this project.

I am also grateful to the staff at [University Name] for providing the academic foundation and resources that made this work possible.

I would like to thank [any additional names — friends, family, testers, or colleagues] for their encouragement, patience, and willingness to test early versions of the platform and provide valuable feedback.

Finally, I acknowledge the open-source communities behind the technologies used in this project — including Next.js, NestJS, Prisma, and shadcn/ui — whose work made it possible to build a production-quality system within an academic timeframe.

[Your Name]
[Date]


---


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


---


# Chapter 2: Similar Product Comparison

## 2.1 Similar Product Comparison

Selecting appropriate competitors for comparison is essential to contextualising the design decisions behind Bite Byte. Two platforms were chosen based on their relevance to the QR code food ordering domain, their market presence, and their differing approaches to the same fundamental problem: enabling restaurants to accept digital orders efficiently.

**Square Online Ordering** is a product within the broader Square ecosystem, a financial technology company headquartered in San Francisco. Square Online Ordering allows restaurants, cafes, and food trucks to create a branded online ordering website that integrates directly with the Square Point of Sale (POS) system. It is relevant as a comparator because it represents the approach taken by large fintech incumbents — bundling ordering functionality into a comprehensive payment and business management suite. Square offers a free basic tier but charges per-transaction fees, and its ordering system is tightly coupled to the Square merchant account infrastructure. This coupling provides deep inventory and payment integration but introduces friction for venue owners who do not already use Square hardware or software.

**Mr Yum** is an Australian-founded QR code ordering platform designed specifically for the hospitality industry. Customers scan a QR code at their table, browse the venue's menu on their mobile device, and place and pay for orders without downloading an application. Mr Yum supports dine-in table ordering, takeaway, and delivery, and integrates with a range of third-party POS systems. It is relevant as a comparator because it most closely mirrors the core use case of Bite Byte — frictionless, scan-to-order experiences in physical venues. Mr Yum has been adopted by a number of larger hospitality groups, particularly across Australia and the United Kingdom, and represents the current market standard for dedicated QR ordering platforms.

These two competitors were selected because they occupy different positions in the market landscape. Square Online Ordering exemplifies the ecosystem-first approach, where ordering is one module within a broader business platform. Mr Yum exemplifies the ordering-first approach, where the QR code scanning and mobile ordering experience is the primary product. Bite Byte draws lessons from both: it aims to deliver the focused, frictionless ordering experience of Mr Yum while maintaining the self-service onboarding simplicity that Square offers to small businesses — without requiring vendor lock-in to either ecosystem.

The following table provides a high-level summary of the three platforms:

| Aspect | Square Online Ordering | Mr Yum | Bite Byte |
|---|---|---|---|
| **Primary model** | Online ordering website within POS ecosystem | QR code scan-to-order platform | QR code scan-to-order platform |
| **Target market** | Restaurants using Square POS | Hospitality venues (dine-in focus) | Restaurants and food trucks of all sizes |
| **Onboarding** | Self-service (requires Square account) | Sales-team assisted | Fully self-service |
| **Customer accounts** | Optional but encouraged | Not required | Not required (guest checkout) |
| **POS integration** | Native (Square POS only) | Third-party integrations | Standalone (built-in dashboard) |
| **Pricing** | Free tier + transaction fees | Subscription + transaction fees | Open-source / self-hosted |
| **Tech approach** | Proprietary monolith | Proprietary SaaS | Modern open-source stack (Next.js, NestJS) |
| **Real-time updates** | Polling-based | Polling-based | WebSocket push via Socket.IO |

---

## 2.2 Functional Comparison

This section compares four key functional areas across Square Online Ordering and Mr Yum, analysing the strengths and weaknesses of each approach and describing how Bite Byte addresses the identified shortcomings.

### 2.2.1 Function 1: User Registration and Onboarding

**Square Online Ordering**

Square Online Ordering requires the venue owner to first create a Square merchant account before any ordering functionality can be configured. The registration process begins on the Square website, where the user must provide business details including business name, type, address, and tax identification information. Following account creation, the user must navigate to the Square Online section of the dashboard, select a site template, and configure the ordering page. This involves uploading a logo, setting business hours, defining fulfilment methods (pickup, delivery, or both), and entering banking details for payment processing.

[Screenshot placeholder: Square Online registration page showing merchant account creation form]

[Screenshot placeholder: Square Online dashboard showing ordering setup wizard]

The multi-step nature of this process introduces considerable friction. A venue owner who simply wants to allow customers to order from their phone must first establish a full Square merchant account, which includes identity verification and banking setup — steps that may take several business days to complete. The onboarding flow is designed for businesses that intend to adopt the entire Square ecosystem, making it disproportionately complex for those who only require ordering functionality. Furthermore, the process assumes a level of technical familiarity with dashboard navigation that may exclude less digitally confident small business owners.

**Mr Yum**

Mr Yum does not offer a publicly accessible self-service registration process. Venue onboarding is conducted through a sales team: prospective customers must submit an enquiry form or contact Mr Yum directly, after which a sales representative guides the venue through account setup, menu configuration, and QR code generation. This concierge-style onboarding ensures that venues are correctly configured and that the platform is integrated with the venue's existing POS system, but it introduces a significant barrier to entry for smaller businesses.

[Screenshot placeholder: Mr Yum website showing "Get Started" enquiry form]

[Screenshot placeholder: Mr Yum onboarding contact page]

The friction point here is temporal and procedural: a venue owner cannot begin using Mr Yum immediately. The sales-assisted model creates a dependency on Mr Yum's team availability, and the lack of self-service tooling means that the venue owner has limited control over the initial setup process. For a single-location food truck or a small cafe, the requirement to engage with a sales team may be a deterrent, particularly when the owner simply wants to trial digital ordering without a long-term commitment.

**Bite Byte's approach**

Bite Byte eliminates both friction points by offering fully self-service onboarding. A venue owner registers with an email address and password, creates a venue by entering the venue name and generating a URL slug, and can immediately begin building their menu using the drag-and-drop menu builder. There is no requirement for POS hardware, no sales team involvement, and no identity verification delay. The entire process from registration to a functional ordering page can be completed in under five minutes.

### 2.2.2 Function 2: Menu Management

**Square Online Ordering**

Square's menu management interface is integrated within the broader Square Dashboard, under the "Items" section. Menu items are created as part of Square's unified item library, meaning the same item definition is shared across the POS terminal, the online ordering site, and any other Square channel. Each item can have a name, description, price, image, variations (such as sizes), and modifier groups (such as add-ons or toppings). Items are organised into categories, and the display order can be adjusted within the online ordering configuration.

[Screenshot placeholder: Square Dashboard item editor showing fields for name, price, description, and image]

[Screenshot placeholder: Square Online menu category organisation interface]

The strength of this approach is inventory synchronisation: if an item is marked as sold out on the POS terminal, it is automatically reflected on the online ordering page. However, the menu editor itself is embedded within a complex dashboard that serves multiple purposes beyond menu management. The interface presents numerous options and settings that are irrelevant to menu editing — tax configurations, reporting toggles, inventory tracking parameters — which can overwhelm users who are solely focused on building their customer-facing menu. The category ordering mechanism is functional but lacks the intuitive directness of a visual drag-and-drop interface.

**Mr Yum**

Mr Yum provides a dedicated menu management dashboard where venue operators can create and organise their menu. The interface supports rich item definitions including descriptions, pricing, dietary tags (vegan, gluten-free, contains nuts, etc.), modifier groups, and high-quality images. Items are grouped into categories, and the platform supports scheduling — allowing different menus for breakfast, lunch, and dinner to be activated at different times of day. The visual presentation of the menu is a core focus, with Mr Yum investing heavily in the appearance of menu items on the customer-facing mobile interface.

[Screenshot placeholder: Mr Yum dashboard menu editor showing item creation with dietary tags]

[Screenshot placeholder: Mr Yum menu category management interface]

The strength of Mr Yum's menu management is its hospitality-specific design: dietary tags, modifier groups, and scheduled menus are features built specifically for the food and beverage industry. However, the initial menu setup is typically performed during the sales-assisted onboarding process, and ongoing changes may require familiarity with a dashboard that, while cleaner than Square's, still presents a moderate learning curve. The absence of drag-and-drop reordering for categories means that reorganising the menu structure requires manual position adjustments.

**Bite Byte's approach**

Bite Byte's menu builder is designed around a drag-and-drop interaction model using the @dnd-kit library. Categories can be created, renamed, reordered by dragging, and deleted directly from a single interface. Items within each category can be added via a dialog form, toggled between available and unavailable states with a single click, and edited or deleted inline. The interface is intentionally minimal — it presents only the controls relevant to menu construction, without the overhead of POS configuration, tax settings, or inventory management. This makes it accessible to venue owners who may not have prior experience with restaurant management software.

### 2.2.3 Function 3: Customer Ordering Experience

**Square Online Ordering**

The customer ordering experience on Square Online takes place through a branded website. Customers typically access the ordering page via a direct URL, a link on the restaurant's existing website, or a QR code that redirects to the ordering page. The ordering page displays the menu in a vertically scrollable format, organised by categories. Customers select items, optionally choose modifiers, and add them to a cart. At checkout, customers may be prompted to create a Square customer account or sign in, depending on the venue's configuration. Payment is processed through Square's payment infrastructure, supporting credit and debit cards.

[Screenshot placeholder: Square Online customer-facing ordering page on mobile device]

[Screenshot placeholder: Square Online checkout page showing account creation prompt]

The customer experience is functional and reliable, benefiting from Square's mature payment processing infrastructure. However, the potential requirement for customer account creation introduces friction in the ordering flow. For a dine-in customer who simply wants to order a meal, being asked to enter an email address and create a password is an unnecessary interruption. The website-based approach also means that the experience is not optimised specifically for the scan-from-table use case — it functions more as a general-purpose online ordering portal than a contextual in-venue ordering tool.

**Mr Yum**

Mr Yum's customer ordering experience is purpose-built for the QR code scan-to-order flow. The customer scans a QR code on their table, which opens the venue's menu directly in the mobile browser — no application download is required. The menu is presented in a visually rich, mobile-optimised format with high-quality images, dietary indicators, and clear pricing. Items can be added to a cart with modifier selections, and the checkout process is streamlined: customers enter their name and pay via credit card, Apple Pay, or Google Pay. No account creation is required.

[Screenshot placeholder: Mr Yum mobile menu browsing experience after QR code scan]

[Screenshot placeholder: Mr Yum mobile checkout page showing payment options]

Mr Yum's customer experience is widely regarded as best-in-class within the QR ordering space. The absence of account creation, the mobile-first design, and the speed of the scan-to-order flow all contribute to a low-friction experience. The primary limitation from a competitive standpoint is that Mr Yum is a proprietary platform — venues are dependent on Mr Yum's infrastructure, pricing, and feature roadmap, with limited ability to customise the ordering experience beyond the options provided by the platform.

**Bite Byte's approach**

Bite Byte follows Mr Yum's model of frictionless guest checkout: customers scan a QR code, browse the menu, add items to a cart, and pay — with no account creation required. Bite Byte supports both Stripe-powered card payments and a "pay at counter" option for venues that prefer to handle payment manually. The cart is persisted in the browser's localStorage on a per-venue basis, ensuring that customers do not lose their selections if they navigate away and return. The menu page is a server-rendered Next.js page, providing fast initial load times and strong SEO characteristics for venues that share their menu link online.

### 2.2.4 Function 4: Order Management and Dashboard

**Square Online Ordering**

Order management in Square Online is handled through the Square Dashboard and, for venues with hardware, the Square POS terminal. When a customer places an online order, it appears in the "Orders" section of the dashboard and can optionally trigger a notification on the POS terminal or a connected kitchen printer. Orders display the customer's name, items ordered, special instructions, fulfilment method, and payment status. The venue operator can update the order status (new, in progress, ready, completed) and communicate with the customer via automated email notifications.

[Screenshot placeholder: Square Dashboard order management view showing order list and status controls]

[Screenshot placeholder: Square POS terminal showing incoming online order notification]

The strength of Square's order management is its deep integration with the POS system: online orders and in-person orders are managed through a unified interface, providing the venue with a single view of all order activity. The analytics capabilities are also comprehensive, with Square offering detailed reporting on sales, popular items, peak hours, and customer data. However, the order status updates rely on the venue operator manually changing the status in the dashboard, and customer-facing status updates are delivered via email rather than in real time — meaning the customer must check their email or refresh the page to learn that their order is ready.

**Mr Yum**

Mr Yum provides a real-time order management dashboard for venue operators. Incoming orders are displayed as they arrive, with details including table number, items ordered, and total amount. The interface is designed for speed and clarity, with large status buttons that allow staff to accept, prepare, and complete orders with minimal interaction. Mr Yum also offers integration with kitchen display systems (KDS), allowing orders to be routed directly to kitchen screens without manual intervention. For multi-location venues, orders can be managed at the individual venue level.

[Screenshot placeholder: Mr Yum venue operator order management dashboard showing incoming orders]

[Screenshot placeholder: Mr Yum kitchen display system integration showing order queue]

Mr Yum's order management is well-suited to high-volume environments where speed of acknowledgement and preparation is critical. The kitchen display integration eliminates the need for printed tickets in some configurations, reducing waste and improving kitchen workflow. However, the real-time capabilities of the customer-facing order tracking are limited — customers typically see a confirmation page after placing their order but do not receive granular status updates (e.g., "being prepared", "ready for pickup") in real time without refreshing the page.

**Bite Byte's approach**

Bite Byte implements a live orders dashboard that uses WebSocket connections via Socket.IO to push order updates to both venue operators and customers in real time. When a customer places an order, it appears instantly on the venue operator's dashboard without requiring a page refresh. When the operator updates the order status, the customer's order tracking page updates immediately via the same WebSocket channel. This bidirectional real-time communication eliminates the latency inherent in polling-based or email-based status update systems. The dashboard also includes an analytics view with order history, revenue summaries, and item popularity metrics.

---

## 2.3 Functional Evaluation

The following table summarises the functional comparison across all four areas, evaluating each competitor on a qualitative scale.

| Function | Square Online Ordering | Mr Yum | Bite Byte |
|---|---|---|---|
| **Registration / Onboarding** | Self-service but requires full merchant account setup; multi-step, multi-day process with identity verification | Sales-team assisted; no self-service option; barrier for small businesses | Fully self-service; email registration to live menu in under five minutes; no vendor lock-in |
| **Menu Management** | Integrated with POS item library; powerful but complex; UI overloaded with non-menu settings | Hospitality-focused; dietary tags and scheduling; limited reordering UX | Drag-and-drop category and item reordering; minimal, focused interface; instant availability toggles |
| **Customer Ordering** | Website-based; functional but may require account creation; not optimised for in-venue scanning | QR scan-to-order; mobile-first; no account required; excellent UX | QR scan-to-order; guest checkout; localStorage cart persistence; server-rendered for fast load |
| **Order Management** | Deep POS integration; unified in-person and online orders; email-based customer updates | Real-time dashboard; KDS integration; limited customer-facing status updates | WebSocket-powered bidirectional real-time updates; instant dashboard and customer status sync |

**Strengths and weaknesses identified:**

Square Online Ordering's greatest strength is ecosystem integration. For venues that have already adopted Square's POS hardware and payment processing, the addition of online ordering is a natural extension that provides unified reporting, inventory synchronisation, and a single vendor relationship. Its greatest weakness in the context of QR code ordering is that it was not designed for this use case — the ordering experience is a web portal rather than a contextual in-venue tool, and the onboarding process assumes a level of commitment to the Square ecosystem that may be inappropriate for small, independent venues.

Mr Yum's greatest strength is its customer ordering experience. The scan-to-order flow is refined, visually appealing, and genuinely frictionless for the end customer. Its menu management tools are well-suited to the hospitality industry, with features such as dietary tags and menu scheduling that reflect a deep understanding of venue operator needs. Its greatest weakness is accessibility for smaller businesses: the sales-assisted onboarding model and subscription pricing create barriers that exclude food trucks, pop-up kitchens, and small cafes that cannot justify the cost or the engagement with a sales process.

Bite Byte draws from the strengths of both competitors while addressing their respective weaknesses:

- **From Square Online**, Bite Byte adopts the principle of self-service onboarding — enabling venue owners to register and configure their ordering system without third-party assistance. However, Bite Byte eliminates the requirement for a full merchant account and multi-day verification process, reducing onboarding time from days to minutes.
- **From Mr Yum**, Bite Byte adopts the QR code scan-to-order model and the principle of guest checkout without account creation. However, Bite Byte extends the real-time capabilities beyond what Mr Yum offers, using WebSocket push notifications to provide instant, bidirectional order status updates to both venue operators and customers.
- **Unique to Bite Byte** is the combination of a drag-and-drop menu builder, fully self-service onboarding, real-time WebSocket order tracking, and an open-source technology stack that avoids vendor lock-in. The use of modern web technologies (Next.js, NestJS, Socket.IO) enables a responsive, performant experience without the overhead of proprietary infrastructure.

---

## 2.4 Non-functional Comparison

This section evaluates Square Online Ordering and Mr Yum against three of Jakob Nielsen's ten usability heuristics (Nielsen, 1994), examining how each platform addresses fundamental principles of user interface design.

### 2.4.1 Principle 1: Visibility of System Status

Nielsen's first heuristic states that "the design should always keep users informed about what is going on, through appropriate feedback within a reasonable time" (Nielsen, 1994). In the context of food ordering, this principle is particularly critical at two points: during the order placement process (confirming that the order has been received) and during the order fulfilment process (communicating preparation and readiness status).

**Square Online Ordering**

Square Online provides adequate visibility of system status during the ordering and checkout process. When a customer adds an item to their cart, the cart icon updates with a badge count, providing immediate visual feedback. During checkout, a loading indicator is displayed while the payment is being processed, and upon successful payment, a confirmation page is shown with the order number and a summary of items ordered. However, post-checkout visibility is limited: the customer receives an email confirmation but does not have access to a real-time order status page. To learn whether their order is being prepared or is ready for collection, the customer must either wait for an email update (which depends on the venue operator manually changing the order status) or physically approach the counter to enquire.

[Screenshot placeholder: Square Online cart icon with item count badge after adding an item]

[Screenshot placeholder: Square Online order confirmation page showing order number and summary]

For venue operators, the Square Dashboard provides clear visibility of incoming orders through a notification system, and the order list view displays current status for each order. However, the reliance on manual status updates means that the system status visible to the customer is only as current as the operator's last interaction with the dashboard.

**Mr Yum**

Mr Yum provides strong visibility of system status during the ordering process. Adding items to the cart produces immediate visual feedback with animation, the cart total updates in real time, and the checkout flow includes clear progress indicators. Upon successful payment, the customer is presented with a confirmation screen that includes the order number and an estimated preparation time where available. The confirmation page may also display a status indicator showing whether the order has been received by the venue.

[Screenshot placeholder: Mr Yum order confirmation screen showing order status and estimated time]

[Screenshot placeholder: Mr Yum cart animation when adding an item]

However, ongoing visibility after the initial confirmation is limited. The customer does not receive push notifications or real-time status changes on the confirmation page. To check whether their order status has changed, the customer would need to refresh the page or navigate back to the order status view. This is a common limitation in web-based ordering platforms that do not implement WebSocket or server-sent event connections for real-time communication.

**Bite Byte's approach**

Bite Byte addresses the visibility gap identified in both competitors by implementing WebSocket-based real-time status updates via Socket.IO. After placing an order, the customer's browser maintains a persistent WebSocket connection to the server. When the venue operator updates the order status (e.g., from "received" to "preparing" to "ready"), the change is pushed immediately to the customer's browser without requiring a page refresh. This provides continuous, up-to-the-second visibility of system status throughout the entire order lifecycle — from placement through preparation to readiness — directly adhering to Nielsen's first heuristic.

### 2.4.2 Principle 2: Consistency and Standards

Nielsen's fourth heuristic states that "users should not have to wonder whether different words, situations, or actions mean the same thing" (Nielsen, 1994). Consistency in visual design, interaction patterns, terminology, and navigation structure reduces cognitive load and enables users to transfer knowledge from one part of the interface to another.

**Square Online Ordering**

Square Online benefits from the mature Square Design System, which enforces visual and interaction consistency across all Square products. Buttons, form fields, typography, colour palettes, and spacing follow a unified specification. This means that a venue operator who is familiar with the Square POS terminal or the Square Dashboard will find the Online Ordering configuration interface immediately recognisable. Terminology is consistent — "Items", "Categories", "Orders", "Customers" — and navigation patterns follow the standard left-sidebar layout used across the Square Dashboard.

[Screenshot placeholder: Square Dashboard navigation sidebar showing consistent menu structure across products]

[Screenshot placeholder: Square Online Ordering settings page demonstrating design system consistency]

However, the consistency of the Square ecosystem can be a disadvantage for users who are not already within that ecosystem. The design system is optimised for Square's broad product range (payments, payroll, banking, appointments, and ordering), which means the interface includes navigation elements, settings panels, and terminology that are irrelevant to a user who only wants to manage food orders. The consistency is internal to Square rather than aligned with the user's mental model of a food ordering platform.

**Mr Yum**

Mr Yum employs a modern, mobile-first design language that is consistent within its own platform. The customer-facing menu interface uses a card-based layout with consistent typography, image aspect ratios, and interaction patterns (tap to view details, tap to add to cart, swipe to navigate categories). The venue operator dashboard follows a clean, minimalist design with consistent use of colour to indicate status (e.g., green for active orders, grey for completed). Navigation is straightforward, with a top-level menu that separates orders, menu management, and settings.

[Screenshot placeholder: Mr Yum customer-facing menu showing consistent card layout across categories]

[Screenshot placeholder: Mr Yum operator dashboard showing consistent colour-coded order status indicators]

Mr Yum's consistency extends to its adherence to platform conventions: the mobile ordering experience follows established patterns for mobile commerce (bottom-anchored cart button, swipeable category tabs, full-screen item detail views), which means customers can navigate the interface using familiar mobile interaction patterns without instruction. This alignment with external standards, as well as internal consistency, represents a strong application of Nielsen's heuristic.

**Bite Byte's approach**

Bite Byte achieves consistency through the use of shadcn/ui, a component library built on Radix UI primitives and styled with Tailwind CSS. All interface elements — buttons, dialogs, form inputs, cards, dropdowns, and toast notifications — are drawn from a unified component library, ensuring visual and behavioural consistency across the venue operator dashboard and the customer-facing ordering interface. The use of a standardised component library also ensures consistency with broader web conventions, as shadcn/ui components follow established accessibility patterns and interaction behaviours that users will recognise from other modern web applications.

### 2.4.3 Principle 3: Error Prevention

Nielsen's fifth heuristic states that "even better than good error messages is a careful design which prevents a problem from occurring in the first place" (Nielsen, 1994). In food ordering, error prevention is critical at several points: preventing customers from ordering unavailable items, preventing invalid form submissions during checkout, and preventing venue operators from misconfiguring their menus.

**Square Online Ordering**

Square Online provides error prevention primarily through its integration with the POS inventory system. When an item is marked as sold out on the POS terminal, it is automatically removed from or marked as unavailable on the online ordering page, preventing customers from ordering items that cannot be fulfilled. During checkout, form validation prevents submission of incomplete or malformed payment information — card number format, expiry date, and CVV are validated on the client side before submission. Address validation for delivery orders checks that the delivery address falls within the venue's defined delivery radius.

[Screenshot placeholder: Square Online showing an item marked as sold out on the ordering page]

[Screenshot placeholder: Square Online checkout form showing inline validation errors for payment fields]

However, error prevention on the venue operator side is less robust. The complexity of the Square Dashboard means that misconfiguration is possible — for example, a venue operator might inadvertently disable online ordering by changing a setting in an unrelated section of the dashboard, or might set conflicting business hours between the POS and the online ordering page. The breadth of configuration options, while powerful, increases the surface area for operator error.

**Mr Yum**

Mr Yum implements error prevention through several mechanisms. On the customer side, items that are marked as unavailable by the venue operator are visually distinguished (greyed out or labelled as "sold out") and cannot be added to the cart. The cart validates item availability at checkout time, preventing orders that include items that have become unavailable since they were added to the cart. Modifier selections enforce minimum and maximum constraints (e.g., "choose at least 1 sauce, maximum 3"), preventing invalid item configurations.

[Screenshot placeholder: Mr Yum menu showing sold-out item with greyed-out appearance and "Sold Out" label]

[Screenshot placeholder: Mr Yum modifier selection showing minimum/maximum constraints]

On the venue operator side, the menu management interface validates required fields (item name, price) and prevents the creation of malformed menu items. The sales-assisted onboarding process itself serves as an error prevention mechanism — by having Mr Yum staff configure the initial setup, common misconfiguration errors are avoided. However, this shifts the error prevention burden from the software to a human process, which is not scalable and introduces dependency on the quality of the onboarding interaction.

**Bite Byte's approach**

Bite Byte implements error prevention through Zod schema validation on both the client and server sides. All form submissions — registration, venue creation, menu item creation, and order placement — are validated against Zod schemas before processing. This ensures that invalid data is rejected with clear, specific error messages before it reaches the database. On the customer side, items can be toggled between available and unavailable states with a single click on the venue operator's dashboard, and unavailable items are visually distinguished on the public menu page. The use of TypeScript throughout the stack provides compile-time type safety that prevents a category of runtime errors related to data shape mismatches between the frontend and backend.

---

## 2.5 Non-functional Evaluation

The following table summarises the non-functional evaluation of both competitors against the three selected Nielsen heuristics, rated on a qualitative scale of Strong, Adequate, or Limited.

| Heuristic | Square Online Ordering | Mr Yum | Bite Byte |
|---|---|---|---|
| **Visibility of System Status** | Adequate — clear feedback during ordering and checkout; limited post-checkout visibility; relies on email for status updates; no real-time push | Adequate — strong feedback during ordering; confirmation screen with order status; limited real-time updates post-confirmation; requires manual refresh | Strong — real-time WebSocket push for all order status changes; continuous visibility from placement to readiness; no refresh required |
| **Consistency and Standards** | Strong — mature design system; consistent across Square ecosystem; may overwhelm users outside the ecosystem with irrelevant options | Strong — modern mobile-first design; consistent internal patterns; aligns with established mobile commerce conventions | Strong — shadcn/ui component library ensures visual and behavioural consistency; Radix UI primitives provide accessible, standards-compliant interactions |
| **Error Prevention** | Adequate — POS inventory sync prevents sold-out orders; checkout validation; complex dashboard increases operator misconfiguration risk | Adequate — sold-out item handling; modifier constraints; sales-assisted onboarding prevents initial misconfiguration but is not scalable | Strong — Zod schema validation on client and server; TypeScript compile-time safety; single-click availability toggles; minimal configuration surface reduces operator error |

**Evaluation summary:**

Both Square Online Ordering and Mr Yum demonstrate professional, well-engineered approaches to the usability heuristics examined. Square's greatest non-functional strength is the consistency provided by its design system, which benefits users who operate within the Square ecosystem. Its greatest non-functional weakness is the limited visibility of system status after order placement — the reliance on email-based status updates creates a gap between the customer's desire to know the state of their order and the system's ability to communicate it.

Mr Yum's greatest non-functional strength is its alignment with mobile commerce conventions, which makes the customer ordering experience intuitive and familiar. Its greatest non-functional weakness is the same visibility gap observed in Square — while the initial confirmation screen is well-designed, ongoing status visibility is limited by the absence of real-time push communication.

Bite Byte adopts the following principles from each competitor's non-functional design:

- **From Square Online**, Bite Byte adopts the principle of design system consistency, implementing this through shadcn/ui rather than a proprietary design system. This provides the same benefit of visual and behavioural uniformity without the ecosystem lock-in.
- **From Mr Yum**, Bite Byte adopts the mobile-first design approach and the convention-aligned interaction patterns that make the ordering experience immediately accessible to customers.
- **Unique to Bite Byte** is the use of WebSocket push notifications (via Socket.IO) to deliver real-time visibility of system status — directly addressing the primary non-functional weakness identified in both competitors. Additionally, the use of Zod schema validation across the full stack provides a more rigorous approach to error prevention than either competitor's client-side validation alone, catching invalid data at both the form submission boundary and the API boundary.

In summary, Bite Byte's non-functional design is informed by the strengths of both competitors while specifically targeting their shared weakness: the absence of real-time, push-based communication between the ordering system and the end user. By implementing WebSocket connections as a core architectural decision rather than an afterthought, Bite Byte delivers a measurably stronger adherence to Nielsen's visibility of system status heuristic — arguably the most critical usability principle in an application where customers are waiting for physical goods to be prepared and delivered.

---

### References

Nielsen, J. (1994). *10 Usability Heuristics for User Interface Design*. Nielsen Norman Group. https://www.nngroup.com/articles/ten-usability-heuristics/


---


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


---


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


---


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


---


# Chapter 6: Deployment

## 6.1 Deployment Architecture

The Bite Byte platform employs a split deployment architecture, distributing the frontend and backend across two specialised cloud platforms. The Next.js frontend is hosted on Vercel, whilst the NestJS API and PostgreSQL database are hosted on Railway. This architectural decision was driven by the distinct runtime requirements of each application layer.

Vercel is purpose-built for Next.js applications, offering zero-configuration deployments, automatic edge caching via its global CDN, and serverless function execution for server-side rendering and API routes. These capabilities align precisely with the frontend's need for fast page loads, static asset delivery, and server component rendering.

Railway, by contrast, provides persistent container-based hosting suited to long-running processes. The NestJS API maintains persistent WebSocket connections via Socket.IO for real-time order updates, a requirement fundamentally incompatible with Vercel's serverless model, which enforces short execution timeouts. Railway also offers managed PostgreSQL databases with automatic provisioning, removing the need for separate database hosting.

The resulting topology is as follows:

```
+-------------------------------------------------------------+
|                        Client Browser                        |
|                                                              |
|   +---------------------+     +-----------------------+      |
|   |  Next.js Frontend   |     |  WebSocket (Socket.IO)|      |
|   |  (Vercel CDN)       |     |  (Railway)            |      |
|   +----------+----------+     +------------+----------+      |
+--------------|-------------------------------|----------------+
               | HTTPS                         | WSS
               v                               v
+--------------------------+    +------------------------------+
|       Vercel             |    |          Railway             |
|  +--------------------+  |    |  +------------------------+ |
|  |   Next.js App      |  |    |  |    NestJS API          | |
|  |  (Server Comps,    |--+----+->|  (REST + WebSocket     | |
|  |   Server Actions)  |  |    |  |   Gateway)             | |
|  +--------------------+  |    |  +------------+-----------+ |
|  +--------------------+  |    |               |             |
|  |  Vercel Blob       |  |    |  +------------v-----------+ |
|  |  (Image Storage)   |  |    |  |  PostgreSQL 16         | |
|  +--------------------+  |    |  |  (Managed Database)    | |
|                          |    |  +------------------------+ |
+--------------------------+    +------------------------------+
```

`[Diagram placeholder: Deployment architecture diagram -- recreate the above in a presentation tool]`

This separation of concerns ensures that each platform handles what it does best: Vercel delivers frontend assets with minimal latency, whilst Railway maintains the persistent processes and stateful connections that the backend requires.

## 6.2 Frontend Deployment (Vercel)

### 6.2.1 Deployment Mechanism

The Next.js frontend is deployed to Vercel via Git-based continuous deployment. The Vercel project is connected directly to the GitHub repository, monitoring the `main` branch for changes. When a commit is pushed to `main`, Vercel automatically triggers a new production deployment. The build process executes the following steps:

1. Vercel detects the monorepo structure and identifies `apps/web` as the Next.js application.
2. Dependencies are installed using `pnpm install` with Turborepo-aware caching.
3. The Next.js application is built using `next build`, which compiles server components, generates static pages, and bundles client-side JavaScript.
4. The build output is distributed across Vercel's global edge network.

### 6.2.2 Preview Deployments

For every pull request opened against the `main` branch, Vercel generates a unique preview deployment with its own URL. This enables review of frontend changes in an isolated environment before merging, providing a valuable quality assurance step. Preview deployments share the same environment variable configuration as production but can be configured with distinct API endpoints if required.

### 6.2.3 Environment Variables

The following environment variables are configured in the Vercel dashboard:

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_API_URL` | Points to the Railway-hosted NestJS API (e.g., `https://api.example.railway.app/api`) |
| `API_URL` | Server-side API URL (used by server actions when `NEXT_PUBLIC_API_URL` is not appropriate) |
| `BLOB_READ_WRITE_TOKEN` | Authentication token for Vercel Blob storage (menu item images) |

The `NEXT_PUBLIC_` prefix ensures the API URL is available in client-side code, enabling the `fetchPublicApi` utility to make requests from both server components and client components.

### 6.2.4 CDN and Edge Caching

Vercel's CDN automatically caches static assets (JavaScript bundles, CSS, images) at edge locations worldwide. Next.js server components leverage incremental static regeneration where appropriate, and the `revalidatePath` calls within server actions ensure that stale data is purged from the cache following mutations such as menu updates or venue creation.

### 6.2.5 Image Storage (Vercel Blob)

Menu item images are stored using Vercel Blob, a managed object storage service. When a venue owner uploads an image for a menu item, it is sent to Vercel Blob via the client-side upload API, which returns a persistent URL. This URL is stored in the `image_url` column of the `menu_items` table. Vercel Blob provides automatic CDN distribution, ensuring images load quickly regardless of the customer's geographic location.

`[Screenshot placeholder: Vercel deployment dashboard showing recent deployments, build status, and domain configuration]`

## 6.3 Backend Deployment (Railway)

### 6.3.1 Deployment Mechanism

The NestJS API is deployed to Railway using automatic deployments triggered by pushes to the `main` branch on GitHub. Railway uses Nixpacks, an automatic build system that detects the application type and generates an appropriate build configuration. For the Bite Byte API, Nixpacks identifies the Node.js application within `apps/api`, installs dependencies, compiles the TypeScript source, and generates the Prisma client.

The application entry point is configured to run `node dist/main.js` after the build process completes. Railway assigns a public URL with automatic HTTPS termination, which the frontend uses as the `NEXT_PUBLIC_API_URL`.

### 6.3.2 Environment Variables

The following environment variables are configured in the Railway service settings:

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string (automatically injected by Railway when linking the database service) |
| `STRIPE_SECRET_KEY` | Stripe API secret key for payment processing |
| `STRIPE_WEBHOOK_SECRET` | Webhook signing secret for verifying Stripe event authenticity |
| `CORS_ORIGIN` | Allowed origin for CORS (set to the Vercel production URL) |
| `JWT_SECRET` | Secret key for signing JSON Web Tokens used in authentication |
| `PORT` | Port on which the NestJS application listens (Railway sets this automatically) |

### 6.3.3 WebSocket Support

Railway supports persistent WebSocket connections, which is essential for the Socket.IO gateway used in real-time order tracking. The NestJS application initialises a WebSocket gateway alongside the HTTP server, enabling venue owners to receive live order updates and customers to track their order status in real time. Railway's container-based hosting maintains these persistent connections without the timeout limitations imposed by serverless platforms.

### 6.3.4 Stripe Webhook Configuration

The Stripe dashboard is configured to send webhook events to the Railway-hosted endpoint at `https://<railway-url>/api/orders/webhook`. The `STRIPE_WEBHOOK_SECRET` environment variable is used to verify the signature of incoming webhook payloads, preventing spoofed events. The `rawBody: true` option in the NestJS application factory ensures the raw request body is available for signature verification, as Stripe requires the exact byte sequence for HMAC validation.

`[Screenshot placeholder: Railway deployment dashboard showing service status, deployment logs, and environment variables]`

## 6.4 Database Deployment

### 6.4.1 PostgreSQL on Railway

The production database is a managed PostgreSQL 16 instance provisioned through Railway. Railway handles database provisioning, automated backups, and connection management. The `DATABASE_URL` connection string is automatically injected into the API service's environment when the database is linked.

### 6.4.2 Prisma Migrations

Database schema changes are managed through Prisma Migrate. During deployment, migrations are applied using:

```bash
npx prisma migrate deploy
```

This command executes all pending migrations in sequence, ensuring the production database schema matches the application's expectations. Unlike `prisma migrate dev` (used in local development), `prisma migrate deploy` does not generate new migrations or prompt for confirmation, making it suitable for automated deployment pipelines.

The migration history is stored in `apps/api/prisma/migrations/`, with each migration directory containing a `migration.sql` file and a timestamp-based identifier. This provides a complete, auditable history of schema changes.

### 6.4.3 Connection Management

Railway's managed PostgreSQL provides built-in connection pooling through PgBouncer, which manages a pool of database connections and distributes them across incoming requests. This prevents connection exhaustion under high load, as the NestJS API can reuse existing connections rather than establishing new ones for each request.

### 6.4.4 Backup Strategy

Railway's managed PostgreSQL service provides automated daily backups with point-in-time recovery. This ensures that in the event of data loss or corruption, the database can be restored to any point within the retention window. For additional safety, manual backups can be triggered before significant schema migrations using `pg_dump`.

`[Screenshot placeholder: Railway database dashboard showing connection details, metrics, and backup status]`

## 6.5 Domain and Networking

### 6.5.1 CORS Configuration

Cross-Origin Resource Sharing (CORS) is configured in the NestJS application to permit requests from the Vercel-hosted frontend. The `CORS_ORIGIN` environment variable specifies the allowed origin, and the configuration enables credentials to support cookie-based authentication:

```typescript
app.enableCors({
  origin: process.env.CORS_ORIGIN ?? 'http://localhost:3000',
  credentials: true,
});
```

In production, `CORS_ORIGIN` is set to the Vercel deployment URL (e.g., `https://bite-byte.vercel.app`). During local development, it defaults to `http://localhost:3000`, the Next.js development server address.

### 6.5.2 HTTPS and SSL

Both Vercel and Railway provide automatic HTTPS with SSL/TLS certificate provisioning and renewal via Let's Encrypt. All traffic between the client browser and both the frontend and backend is encrypted in transit. This is particularly important for:

- **Authentication**: JWT tokens are transmitted via HTTP headers and must not be intercepted.
- **Payment data**: Whilst Stripe handles card details directly (the application never sees raw card numbers), the communication between the frontend and the Stripe Payment Intent creation endpoint must be encrypted.
- **Personal data**: Customer names and order details are protected in transit, supporting compliance with the Data Protection Act 2018.

### 6.5.3 WebSocket Connections

WebSocket connections from the client browser connect directly to the Railway-hosted NestJS application. Socket.IO handles the connection upgrade from HTTP to WebSocket automatically, with fallback to HTTP long-polling if WebSocket connections are blocked by network intermediaries. The connection URL is derived from `NEXT_PUBLIC_API_URL`, ensuring consistency between REST API calls and WebSocket connections.

## 6.6 Deployment Process

The end-to-end deployment process follows a streamlined workflow that minimises manual intervention:

```
+----------------+     +----------------+     +------------------------+
|  Developer     |     |   GitHub       |     |  Vercel (Frontend)     |
|  pushes to     |---->|   main         |---->|  Auto-build + deploy   |
|  main branch   |     |   branch       |     |  CDN distribution      |
+----------------+     +--------+-------+     +------------------------+
                                |
                                |             +------------------------+
                                +------------>|  Railway (Backend)     |
                                              |  Nixpacks build        |
                                              |  Prisma migrate        |
                                              |  Container start       |
                                              +------------------------+
```

The detailed steps are as follows:

1. **Code push**: The developer pushes committed changes to the `main` branch on GitHub. Both Vercel and Railway monitor this branch for changes.
2. **Frontend build (Vercel)**: Vercel detects the push, installs dependencies with Turborepo caching, builds the Next.js application, and distributes the output to edge locations. Typical build time is under two minutes.
3. **Backend build (Railway)**: Railway detects the push, uses Nixpacks to build the NestJS application, generates the Prisma client, and compiles TypeScript to JavaScript.
4. **Database migration**: Prisma migrations are applied to the production database as part of the deployment pipeline, ensuring the schema is up to date before the new application version begins serving requests.
5. **Health check**: Railway performs a health check against the application's HTTP endpoint. If the health check passes, traffic is routed to the new deployment; if it fails, the previous deployment remains active.
6. **Stripe webhook**: The Stripe webhook endpoint (`/api/orders/webhook`) is configured once in the Stripe dashboard and does not require reconfiguration between deployments, as the Railway URL remains stable.

`[Diagram placeholder: Deployment pipeline diagram showing the complete flow from Git push to production]`

### 6.6.1 Local Development Environment

For local development, the project uses a Docker Compose configuration to run a PostgreSQL instance on port 5433, avoiding conflicts with any locally installed PostgreSQL. Both the Next.js and NestJS applications are started using `pnpm dev`, which leverages Turborepo to run both development servers concurrently with hot module replacement enabled. This ensures that developers can iterate rapidly without needing to redeploy.

### 6.6.2 Rollback Strategy

Both Vercel and Railway maintain a history of previous deployments. In the event of a failed deployment or a production issue, the previous deployment can be promoted to production through the respective platform dashboards. This provides a rapid rollback mechanism that does not require code changes or a new build.


---


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


---


# References

Agile Alliance (2001) *Manifesto for Agile Software Development*. Available at: https://agilemanifesto.org/ (Accessed: 10 March 2026).

British Computer Society (2022) *BCS Code of Conduct*. Available at: https://www.bcs.org/membership-and-registrations/become-a-member/bcs-code-of-conduct/ (Accessed: 12 March 2026).

Consumer Rights Act 2015, c. 15. Available at: https://www.legislation.gov.uk/ukpga/2015/15/contents (Accessed: 10 March 2026).

Data Protection Act 2018, c. 12. Available at: https://www.legislation.gov.uk/ukpga/2018/12/contents (Accessed: 10 March 2026).

European Parliament and Council of the European Union (2016) 'Regulation (EU) 2016/679 of the European Parliament and of the Council of 27 April 2016 on the protection of natural persons with regard to the processing of personal data and on the free movement of such data (General Data Protection Regulation)', *Official Journal of the European Union*, L 119, pp. 1-88.

Meta Platforms, Inc. (2024) *React Documentation*. Available at: https://react.dev/ (Accessed: 8 March 2026).

Mozilla Developer Network (2024) 'WebSockets API', *MDN Web Docs*. Available at: https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API (Accessed: 11 March 2026).

NestJS (2024) *NestJS Documentation*. Available at: https://docs.nestjs.com/ (Accessed: 8 March 2026).

Nielsen, J. (1994) '10 Usability Heuristics for User Interface Design', *Nielsen Norman Group*. Available at: https://www.nngroup.com/articles/ten-usability-heuristics/ (Accessed: 12 March 2026).

Payment Card Industry Security Standards Council (2022) *Payment Card Industry Data Security Standard (PCI DSS) v4.0*. Available at: https://www.pcisecuritystandards.org/ (Accessed: 11 March 2026).

PostgreSQL Global Development Group (2024) *PostgreSQL 16 Documentation*. Available at: https://www.postgresql.org/docs/16/ (Accessed: 9 March 2026).

Prisma (2024) *Prisma Documentation*. Available at: https://www.prisma.io/docs (Accessed: 9 March 2026).

Railway (2024) *Railway Documentation*. Available at: https://docs.railway.app/ (Accessed: 11 March 2026).

Rauch, G. (2024) 'Socket.IO Documentation', *Socket.IO*. Available at: https://socket.io/docs/v4/ (Accessed: 10 March 2026).

Royce, W.W. (1970) 'Managing the Development of Large Software Systems', *Proceedings of IEEE WESCON*, 26(8), pp. 1-9.

Schwaber, K. and Sutherland, J. (2020) *The Scrum Guide: The Definitive Guide to Scrum: The Rules of the Game*. Available at: https://scrumguides.org/scrum-guide.html (Accessed: 8 March 2026).

Stripe, Inc. (2024) *Stripe API Documentation*. Available at: https://docs.stripe.com/ (Accessed: 9 March 2026).

Tailwind Labs (2024) *Tailwind CSS Documentation*. Available at: https://tailwindcss.com/docs (Accessed: 10 March 2026).

TypeScript (2024) *TypeScript Documentation*. Available at: https://www.typescriptlang.org/docs/ (Accessed: 8 March 2026).

Vercel, Inc. (2024) *Next.js Documentation*. Available at: https://nextjs.org/docs (Accessed: 8 March 2026).

Vercel, Inc. (2024) *Vercel Documentation*. Available at: https://vercel.com/docs (Accessed: 11 March 2026).

Vercel, Inc. (2024) *Turborepo Documentation*. Available at: https://turbo.build/repo/docs (Accessed: 10 March 2026).

Zod (2024) *Zod Documentation*. Available at: https://zod.dev/ (Accessed: 9 March 2026).


---


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
