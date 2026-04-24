# IITI Frontend

A role-based student management and institute operations platform built with Next.js for Imasha International Training Institute (Pvt) Ltd — a TVEC-registered, ISO 9001:2015 certified heavy vehicle training institute based in Pannipitiya, Sri Lanka.

This frontend application provides the public, students, and administrative staff with a unified digital experience covering course discovery, online enrollment, payment tracking, results, certificates, and job vacancy management.

This application delivers:

- Role-Based Access Control (RBAC) across Super Admin, Admin, Front Desk, and Student roles
- Public marketing website with animated UI and online application form
- Student self-registration and multi-step enrollment workflow
- Admin dashboard with KPI analytics, charts, and full CRUD operations
- Student portal with course, payment, result, and certificate access
- Payment management with manual recording and installment scheduling
- Results entry and bulk publish to the student portal
- Certificate generation with QR-linked verification page
- Job vacancy board with photo, qualifications, and application management
- Registration offers with auto-expire logic per course
- Intake date scheduling and adjustment with notes
- Temporary password dispatch from admin to student
- Online enrollment approval and suspension workflows
- Excel-based legacy data migration tool
- Audit log viewer and system settings panel (Super Admin)

---

## Tech Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **shadcn/ui** (Radix UI)
- **Zustand** (state management with persistence)
- **React Hook Form + Zod** (form handling and validation)
- **TanStack Table v8** (data tables)
- **Recharts** (analytics charts)
- **Framer Motion** (animations and scroll reveals)
- **react-countup** (animated statistics)
- **qrcode.react** (QR certificate display)
- **Sonner** (toast notifications)
- **Lucide React** (iconography)
- Mock data with localStorage persistence — no backend required

---

## Design Philosophy

An institute management system earns trust when:

- roles are enforced at every level of the interface
- restricted actions are hidden, not just blocked
- students can access only their own data
- administrative operations are auditable
- the public face reflects institutional credibility

This frontend is intentionally designed to:

- hide navigation items the current role cannot access
- reflect the full RBAC permission matrix in every UI decision
- present a professional, accreditation-grade public website
- give staff fast, clear operational feedback
- simulate production-grade workflows without a live backend

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm, yarn, or pnpm

---

## Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd iiti-frontend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment

Create a local env file from template:

```bash
copy .env.example .env.local
```

Set the backend API URL used by server-side proxy routes:

```env
API_BASE_URL=http://localhost:8000/api/v1
```

Security notes:
- Use `API_BASE_URL` (server-side only), not `NEXT_PUBLIC_API_URL`.
- Do not commit `.env.local`.
- Keep credentials/secrets out of frontend public env vars.

---

## Running the Server

```bash
npm run dev
```

Navigate to:

```
http://localhost:3000
```

---

## Application Sections

This project hosts four distinct route groups within a single Next.js application:

- `(public)` — Marketing website, course pages, online application, contact, job board
- `(auth)` — Login, registration
- `(portal)` — Student dashboard, payments, results, certificates, jobs
- `(admin)` — Full administrative panel with all CRUD modules

Additionally, `/verify/[token]` serves as a public QR certificate verification landing page.

---

## Permissions-Driven UI

The system enforces authorization using:

- A centralized permission map in `lib/permissions.ts`
- `<RoleGuard permission="...">` component wrapping all restricted UI elements
- Role-filtered sidebar navigation
- Layout-level auth guards with Zustand session state

This ensures:

> **No user can see or trigger an action they are not authorized to perform.**