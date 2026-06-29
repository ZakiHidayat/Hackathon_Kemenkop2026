# 🌾 KORPUS — Implementation Overview

> **Orkestrator Keanggotaan Digital & Hilirisasi Komoditas untuk Koperasi Desa**
> Hackathon SIMKopDes 2026 · Pilar 2: Keterlibatan Masyarakat dalam Berkoperasi

---

## 1. Project Context & Problem Domain

KORPUS addresses the structural failure of **83,000 legally-registered Koperasi Desa (Kopdes)** to onboard Indonesia's **270 million rural population** — currently stuck at only **~2 million members**. Three root causes are targeted:

| # | Root Cause | KORPUS Intervention |
|---|-----------|---------------------|
| 1 | No inclusive digital onboarding infrastructure for low-literacy grassroot users | Frictionless NIK + WhatsApp OTP registration |
| 2 | Trust deficit from opaque profit-sharing governance | Encrypted, tamper-proof SHU auto-distribution |
| 3 | Disconnected farmer-to-downstream commodity chain | End-to-end commodity tracker with smart contract logic |

---

## 2. System Architecture (High-Level)

```
┌─────────────────────────────────────────────────────────────────┐
│                        KORPUS PLATFORM                         │
├─────────────────┬──────────────────────┬────────────────────────┤
│   PILAR 1       │      PILAR 2         │       PILAR 3          │
│ Inklusi Digital │ Ekosistem Transaksi  │ Tracker & Smart        │
│ (Onboarding)    │ (Celengan & POS)     │ Contract Logic         │
├─────────────────┴──────────────────────┴────────────────────────┤
│                     SHARED SERVICES                             │
│  Auth (NIK+OTP) · Wallet Engine · QR Identity · Notification   │
├─────────────────────────────────────────────────────────────────┤
│                     INFRASTRUCTURE                              │
│  API Gateway · Database · Queue · 3G-Optimized Delivery        │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. Feature Pillars & Implementation Strategy

### Pilar 1: 🟢 Inklusi Digital Tanpa Hambatan (Frictionless Onboarding)

**Goal:** Instant cooperative membership activation for grassroot users.

**Key Features:**
- NIK (Dukcapil) integration for identity verification
- WhatsApp OTP-based authentication (no email required)
- Digital Cooperative Identity via QR Code
- Visual-first, low-literacy-friendly UI design

**Implementation Approach:**
- **Frontend:** Mobile-first responsive web app with large visual elements, minimal text input, icon-driven navigation. Optimized for low-bandwidth (3G) environments with aggressive asset compression and offline-capable PWA patterns.
- **Backend:** RESTful API service handling NIK validation (mock/simulated Dukcapil endpoint for hackathon), OTP dispatch via WhatsApp Business API (or Twilio/Fonnte as proxy), and QR code generation per member.
- **Data:** Member profile store with cooperative association mapping.

---

### Pilar 2: 💳 Ekosistem Transaksi Terpusat (Celengan & POS)

**Goal:** Empower farmers with a unified transaction & savings wallet, and equip Kopdes managers with a modern Point of Sales system.

**Key Features:**
- **Celengan (Wallet):** Mobile wallet for deposits, transactions, and real-time downstream fund disbursement
- **POS System:** Inventory digitization, sales recording, and automated reporting for Kopdes management
- Real-time transaction ledger

**Implementation Approach:**
- **Frontend:** Dual-view interface — *Member View* (simple wallet dashboard, transaction history, savings tracker) and *Admin/Pengurus View* (POS terminal, inventory management, financial reports).
- **Backend:** Transaction engine with atomic operations, balance management, and audit trail logging. POS module for CRUD inventory + sales aggregation.
- **Data:** Transactional database with strict ACID compliance. Ledger table for immutable transaction history.

---

### Pilar 3: 📊 Tracker Komoditas & Smart Contract Logic

**Goal:** Full traceability from raw harvest to downstream product, with tamper-proof automated SHU (profit-sharing) distribution.

**Key Features:**
- Commodity lifecycle tracker (raw → processed → sold)
- Automated SHU calculation locked at RAT (Rapat Anggota Tahunan)
- Encrypted distribution algorithm — immutable post-lock
- Lightweight design for 3G network operation

**Implementation Approach:**
- **Frontend:** Visual pipeline/timeline UI showing commodity transformation stages. SHU dashboard with per-member breakdown.
- **Backend:** State-machine based commodity tracker (status transitions: `HARVESTED → COLLECTED → PROCESSED → DISTRIBUTED → SOLD`). SHU engine that calculates profit distribution based on contribution weight, locked via cryptographic hash after RAT approval — adopting smart-contract *principles* without requiring blockchain infrastructure.
- **Data:** Commodity batch records, price tracking, and SHU distribution snapshots.

---

## 4. Proposed Tech Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| **Frontend** | React.js (Vite) + TanStack Router | Fast SPA, team skill alignment, modern DX |
| **Styling** | Tailwind CSS / Vanilla CSS | Rapid prototyping for hackathon timeline |
| **Backend API** | Go (Gin) or Python (FastAPI) | High-performance, team expertise |
| **Database** | PostgreSQL | ACID compliance for financial transactions |
| **Cache/Session** | Redis | OTP storage, session management, rate limiting |
| **Auth** | NIK mock API + WhatsApp OTP (Fonnte/Twilio) | Grassroot-friendly, no-email auth |
| **QR Generation** | Server-side QR lib (e.g., `go-qrcode` / `qrcode` Python) | Digital cooperative identity |
| **Deployment** | Docker + VPS | Simple, cost-effective for hackathon demo |
| **Communication** | REST (JSON) | 3G-friendly, lightweight payloads |

---

## 5. Data Model (Core Entities)

```
┌──────────────┐     ┌──────────────┐     ┌──────────────────┐
│   Member     │────▶│  Koperasi    │◀────│  Pengurus        │
│              │     │  (Kopdes)    │     │  (Admin)         │
│ - nik        │     │ - name       │     │ - role           │
│ - name       │     │ - location   │     │ - permissions    │
│ - phone_wa   │     │ - status     │     └──────────────────┘
│ - qr_code    │     └──────┬───────┘
│ - joined_at  │            │
└──────┬───────┘            │
       │              ┌─────▼────────┐     ┌──────────────────┐
       │              │  Commodity   │────▶│  SHU             │
       │              │  Batch       │     │  Distribution    │
       │              │ - type       │     │ - period         │
       │              │ - status     │     │ - amount         │
       │              │ - weight     │     │ - hash_lock      │
       │              │ - price      │     │ - is_locked      │
       │              └──────────────┘     └──────────────────┘
       │
  ┌────▼─────────┐
  │  Wallet      │     ┌──────────────────┐
  │  (Celengan)  │────▶│  Transaction     │
  │ - balance    │     │  Ledger          │
  │ - member_id  │     │ - type           │
  └──────────────┘     │ - amount         │
                       │ - timestamp      │
                       │ - ref_id         │
                       └──────────────────┘
```

---

## 6. User Roles & Access

| Role | Access | Description |
|------|--------|-------------|
| **Anggota (Member)** | Wallet, commodity tracker, SHU view, profile | Grassroot farmer / cooperative member |
| **Pengurus (Admin)** | POS, member management, commodity input, SHU configuration, reports | Kopdes management staff |
| **Super Admin** | All Kopdes oversight, system configuration | Platform-level administrator (hackathon scope: optional) |

---

## 7. Development Phases (Hackathon Timeline)

### Phase 1: Foundation & Auth
- [ ] Project scaffolding (monorepo or separate frontend/backend)
- [ ] Database schema & migrations
- [ ] Auth flow: NIK validation + WhatsApp OTP
- [ ] QR code identity generation
- [ ] Basic member registration & profile

### Phase 2: Core Features
- [ ] Wallet (Celengan) — deposit, balance, transaction history
- [ ] POS system — inventory CRUD, sales recording
- [ ] Commodity batch tracker — status pipeline UI

### Phase 3: Smart Logic & Polish
- [ ] SHU auto-calculation engine
- [ ] SHU hash-lock mechanism (RAT approval flow)
- [ ] Admin dashboard & reports
- [ ] 3G optimization pass (lazy loading, compressed assets, minimal JS)

### Phase 4: Demo & Presentation
- [ ] End-to-end demo flow
- [ ] Seed data for realistic demonstration
- [ ] README & documentation finalization

---

## 8. Key Design Principles

1. **3G-First:** Every feature must work on low-bandwidth networks. No heavy JS frameworks on critical paths. Compressed assets. Server-side rendering where possible.
2. **Grassroot-Friendly:** Visual-heavy UI, minimal text input, large touch targets. Bahasa Indonesia throughout.
3. **Trust by Design:** Every financial operation is logged immutably. SHU distribution is cryptographically locked and auditable.
4. **Offline-Resilient:** Critical flows (viewing wallet balance, QR identity) should work with cached data via PWA/service workers.
5. **Hackathon-Pragmatic:** Prioritize a working demo over perfect architecture. Mock external APIs (Dukcapil, WhatsApp) where needed.

---

## 9. Target Metrics (Success Criteria)

| Indicator | Current State | KORPUS Target |
|-----------|--------------|---------------|
| Kopdes member participation | ~2M / 270M population | **≥30% rural population** |
| Digitally-active Kopdes | Minimal | **83,000 Kopdes** digitized |
| SHU distribution transparency | Manual / manipulation-prone | **Automated & encrypted** |
| New member onboarding | Clerical, high-literacy required | **Instant via NIK + OTP WA** |

---

## 10. Visi Akhir

> *Mendongkrak partisipasi masyarakat grassroot hingga menyentuh minimal **30% dari total penduduk desa secara nasional**, mengonversi **83.000 Kopdes** menjadi mesin penggerak ekonomi raksasa yang aktif. Melalui KORPUS, kita tidak sekadar mengejar angka keanggotaan, melainkan memastikan jutaan petani beralih menjadi **aktor utama** dalam panggung ketahanan pangan, memperkokoh kemandirian bangsa, dan mempercepat terwujudnya **Visi Indonesia Emas 2045**.*

---

*KORPUS · Hackathon SIMKopDes 2026*
