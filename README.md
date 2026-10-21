# AICTE Approval Intelligence
### Integrated AICTE Approval Workflow Automation, Compliance Monitoring and Alert Management System
**Problem Statement ID:** SIH26262 | **Category:** Software / Smart Automation  
**Department:** Ministry of Education's Innovation Cell (MIC) & All India Council for Technical Education (AICTE)  
**Status:** Hackathon Prototype (Demonstration Build)

---

## 1. Overview & Vision

**AICTE Approval Intelligence** is a centralized enterprise regulatory management portal built for the Smart India Hackathon (SIH26262). It automates and tracks the multi-stage approval lifecycle for technical institutions across India, enforces compliance with the official **Approval Process Handbook (APH 2026-27)**, detects Expert Visit Committee (EVC) scheduling conflicts, monitors expiring certificates (Fire Safety NOC, Land Lease, Building Plans), and computes explainable delay risk scores with AI assistance.

> **Important Regulatory Notice:** This application is a hackathon prototype designed to demonstrate workflow automation, compliance verification, and AI-assisted governance. All records, institutions, and expert profiles presented are fictional simulations. The system does not falsely claim live production integration or official governmental endorsement.

---

## 2. Key Modules & Functional Architecture

The portal provides 12 distinct, fully functional navigation modules:

1. **Overview Dashboard:**
   - 8 KPI cards: Total Applications, Under Review, Awaiting Institutional Action, Pending EVC, Overdue Cases, Compliance Due Soon, Expired Documents, Critical Alerts.
   - Stage-wise application pipeline visualization and status distribution charts (Recharts).
   - Priority work queue sorted by AI Delay Risk scores with one-click navigation to application dossiers.
   - Upcoming statutory deadlines and recent regulatory activity stream.

2. **Applications Register:**
   - Multi-parameter filtering (by Stage, State, Category, Status, Search).
   - Dynamic sorting, pagination, and CSV export of application records.
   - Application registration modal generating unique AICTE application identifiers.
   - Deep-dive dossier view featuring stage SLA tracking, delay factors, attached documents, compliance obligations, internal reviewer notes, and officer reassignment.
   - Strict workflow transition engine enforcing APH succession rules.

3. **Workflow Automation Monitor:**
   - Visual flowchart of the APH approval pipeline (Submitted → Scrutiny → Re-scrutiny → EVC Pending → EVC Completed → SAC/SHC Review → Decision Pending → Approved / Returned / Rejected).
   - Stage turnaround time analysis: Target SLA vs. actual processing days with bottleneck diagnostics.
   - Interactive transition validator: Test proposed stage transitions for any application against APH succession rules and active role privileges.

4. **Expert Visit Committee (EVC) Scheduling:**
   - Dual List View and Calendar Schedule view.
   - Committee member directory featuring faculty from IIT Bombay, NIT Trichy, Anna University, and CEPT.
   - **Automated Scheduling Conflict Detection:** Prevents assigning committee members who are already committed to other inspections on the same date.
   - Physical visit outcome recorder (Recommended, Deficiencies Noted, Not Recommended) and report verification tracker.

5. **Compliance & Undertakings Registry:**
   - Statutory compliance tracking across 8 categories: Fire Safety NOC, Land & Built-up Norms, Faculty Cadre & Pay, Anti-Ragging & ICC, SGRC/Omsperson, AISHE Disclosures, NBA/NAAC, and Financial FDRs.
   - Automated overdue flags for expired deadlines.
   - Regulatory verification drawer: Enforces role permissions (Institutional Representatives are blocked from self-verifying compliance).
   - Statutory extension request workflows.

6. **Document Registry & Document Intelligence:**
   - Central document repository with versioning, issue dates, and expiry tracking.
   - Expiry alert indicators (<30 days warning, Expired badges).
   - Simulated document ingestion pipeline with file type and size validation.
   - **Interactive OCR Document Inspector Modal:** Visual scanner simulating entity recognition (Institution title match, deed number, execution date, expiry date, confidence score) with mandatory human-in-the-loop verification.

7. **Alerts & Escalations Management:**
   - Multi-category alert inbox (Critical, High, Medium, Low).
   - Stable deduplication preventing duplicate alerts across page reloads.
   - Direct alert acknowledgement and resolution.
   - Escalation workflows to higher regulatory authorities (Chairman AICTE, Standing Complaints Committee).
   - Simulated SMS & Email dispatch preview for officer notifications.

8. **Regulatory Analytics & Reports:**
   - Inflow trends vs. regulatory clearances over time.
   - Officer workload distribution (active vs. approved cases).
   - Statutory compliance health distribution.
   - Stage-wise pendency breakdown.
   - Printable dossier view and CSV executive summary export.

9. **AI Assistant & APH Knowledge Core:**
   - **Explainable Delay Risk Engine:** Detailed breakdown of factors contributing to delays (stage days vs. SLA, document discrepancies, unresolved compliance items).
   - **Grounded APH Handbook Assistant:** Grounded semantic search across APH 2026-27 clauses (Land norms, Cadre ratio 1:2:6, EVC SOPs, Deficiencies 15-day window, SHC appeals). Includes verifiable citations.
   - **Operational Natural Language Queries:** Instant execution of structured queries (overdue applications, compliance due in 7 days, expired documents, upcoming visits).

10. **User & Role-Based Access Control (RBAC):**
    - 7 simulated demo roles: System Administrator, Approval Officer, Scrutiny Reviewer, EVC Coordinator, Compliance Officer, Institutional Representative, Read-Only Auditor.
    - Interactive role switcher in the top navigation bar and user management page.
    - Immediate server-like authorization enforcement across the application (e.g., Institutional Reps cannot see other colleges' dossiers or verify their own compliance).

11. **System Audit Trail & Accountability:**
    - Immutable-style event logging capturing timestamps, actor identities, roles, action types, record IDs, previous states, and new states.
    - Filterable by actor, record type, and action type with CSV export.

12. **Settings & System Administration:**
    - Configurable stage turnaround SLA targets (editable in days).
    - Configurable expiration reminder windows (30d, 14d, 7d, 3d, 1d).
    - Escalation trigger threshold configurations.
    - One-click "Reset Demo Database" button to restore pristine simulation state anytime.

---

## 3. Technology Stack

- **Framework:** React 19 + TypeScript (Vite bundler)
- **Styling & Design System:** Tailwind CSS with custom enterprise palette:
  - Deep Navy (`#0f172a`, `#1e293b`)
  - Government Regulatory Blue (`#1d4ed8`, `#2563eb`)
  - Restrained Teal (`#0d9488`) for verified/success states
  - Amber (`#d97706`) for deadlines approaching
  - Crimson Red (`#dc2626`) for critical/overdue breaches
  - Neutral card surfaces with subtle borders
- **Icons:** Lucide React
- **Data Visualization:** Recharts (Bar, Line, and Donut charts)
- **State Management:** Reactive React Context with LocalStorage persistence

---

## 4. Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm (v9 or higher)

### Installation & Launch Commands

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the local development server:**
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173/` in your browser.

3. **Build and preview production bundle:**
   ```bash
   npm run build
   npm run preview
   ```

---

## 5. Demo Walkthrough Guide for Evaluators

1. **Dashboard:** Review executive KPI cards, application stage distribution, and delay risk priority work queue.
2. **Applications:** Filter by state or stage, click on an application (e.g., `AICTE/2026/1-4829103`), view delay factors, and advance stage or reassign officer.
3. **EVC Scheduling:** Switch to Calendar Schedule or propose a visit; test assigning an expert on an already booked date to observe real-time conflict detection.
4. **Document Registry & OCR:** Click "Inspect OCR" on any document to launch the visual AI field extractor and test the human verification workflow.
5. **Role Switching:** Use the top-right profile dropdown to switch to "Institutional Representative" and observe that the portal immediately restricts access to only their institution's files and disables unauthorized verification controls.
6. **AI Assistant:** Search for "cadre ratio" or "land requirement" in the APH Handbook tab to inspect grounded clause citations.
7. **Reset:** Click "Reset Demo Data" in the top banner anytime to return all records to their baseline state.
