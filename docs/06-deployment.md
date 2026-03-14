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
