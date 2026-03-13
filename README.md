# Project-GES# LL88 Audit Automation Tool

> Built for **Gaia Energy Solutions** — automate NYC Local Law 88 lighting compliance audits across residential, non-residential, and mixed-use buildings, from on-site data collection to finished Word report.

Built for a two-person field audit team tired of transcribing notes into spreadsheets and rewriting the same Word report over and over. This tool replaces phone notes and manual office work with a structured mobile app and a one-click report generator.

---

## What It Does

**On-site:** Open the mobile app, add rooms, tap to select fixture types and counts, enter square footage, snap photos. Your teammate does the same on their phone — data merges in real time.

**Back at the office:** Open the dashboard, review the auto-calculated LPD and PASS/FAIL result, click Generate. You get a completed Google Sheet and a finished Word report — cover page, lighting table, LPD analysis, photos in Appendix A — all formatted to the Efficient ECM LLC template.

---

## Project Structure

```
ll88-audit-tool/
├── mobile/                  # React PWA — on-site data entry app
│   ├── src/
│   │   ├── components/
│   │   │   ├── AuditSetup.jsx        # New audit form (address, BBL, BIN)
│   │   │   ├── LocationList.jsx      # Room/location list view
│   │   │   ├── LocationEntry.jsx     # Add/edit a single location
│   │   │   ├── FixtureRow.jsx        # Fixture counter row (bulb type, watts, qty, control)
│   │   │   ├── PhotoCapture.jsx      # Camera + photo tagging
│   │   │   └── AuditSummary.jsx      # Live LPD and completeness view
│   │   ├── hooks/
│   │   │   ├── useAudit.js           # Audit CRUD operations
│   │   │   ├── useSync.js            # Real-time Firestore sync
│   │   │   └── useCalculations.js    # Wtt/SqFt, LPD, PASS/FAIL logic
│   │   ├── firebase.js               # Firebase config
│   │   └── App.jsx
│   └── public/
│       └── manifest.json             # PWA manifest
│
├── dashboard/               # Desktop report generation UI
│   ├── src/
│   │   ├── components/
│   │   │   ├── AuditList.jsx         # All audits with search/filter
│   │   │   ├── DataReview.jsx        # Edit data before generating
│   │   │   ├── ResultsBadge.jsx      # PASS/FAIL display
│   │   │   └── GeneratePanel.jsx     # Export buttons
│   │   ├── generators/
│   │   │   ├── spreadsheetGenerator.js   # Builds .xlsx output
│   │   │   └── reportGenerator.js        # Builds .docx output
│   │   └── App.jsx
│
├── shared/                  # Shared logic used by both apps
│   ├── calculations.js      # Core LPD calculation engine
│   ├── dataModel.js         # Shared data types / schema
│   └── constants.js         # Bulb types, control types, code thresholds
│
├── scripts/                 # Utility scripts
│   └── seedFixtureLibrary.js    # Pre-populates fixture type dropdown defaults
│
├── .env.example             # Required environment variables (see Setup)
├── .gitignore
├── package.json
└── README.md
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Mobile App | React (PWA) |
| Desktop Dashboard | React |
| Database | Firebase Firestore |
| Photo Storage | Firebase Storage |
| Auth | Firebase Authentication (Google Sign-In) |
| Spreadsheet Export | SheetJS (xlsx) |
| Word Report Export | docx.js |
| Hosting | Vercel (or Firebase Hosting) |
| Real-Time Sync | Firestore real-time listeners |

---

## Getting Started

### Prerequisites

- Node.js 18+
- A Firebase project ([create one here](https://console.firebase.google.com))
- Git

### 1. Clone the repo

```bash
git clone https://github.com/your-org/ll88-audit-tool.git
cd ll88-audit-tool
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Copy the example env file and fill in your Firebase credentials:

```bash
cp .env.example .env
```

```env
# .env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 4. Set up Firebase

In your Firebase console:

1. Enable **Firestore** (start in test mode for development)
2. Enable **Firebase Storage**
3. Enable **Authentication** → Google Sign-In provider
4. Deploy Firestore security rules from `firestore.rules`

```bash
npm install -g firebase-tools
firebase login
firebase deploy --only firestore:rules
```

### 5. Run the development server

```bash
npm run dev
```

The mobile app runs at `http://localhost:5173` — open this on your phone's browser (same WiFi network) during development.

---

## Data Model

```javascript
// Audit
{
  id: string,
  address: string,
  bbl: string,
  bin: string,
  buildingType: "residential" | "non-residential" | "mixed",
  auditDate: timestamp,
  auditors: string[],
  status: "in-progress" | "complete",
  locations: Location[]
}

// Location (room/area)
{
  id: string,
  name: string,
  sqFt: number | null,        // null renders as "-" in outputs
  fixtures: Fixture[],
  photos: Photo[]
}

// Fixture row
{
  id: string,
  bulbType: string,           // e.g. "LED 4ft tube", "8in LED"
  wattage: number,
  qty: number,
  controlType: string         // "Switch" | "Breaker" | "Sensor" | "Timer"
}

// Photo
{
  id: string,
  locationId: string,
  storageUrl: string,
  caption: string,
  timestamp: datetime
}
```

---

## Calculation Logic

All core calculations live in `shared/calculations.js`.

```javascript
// Wtt/SqFt per fixture row
wttPerSqFt = (wattage * qty) / sqFt   // null if sqFt is null

// Total Watts per row
totalWatts = wattage * qty

// Building (or Zone) LPD
buildingLPD = sum(totalWatts for all rows where sqFt !== null)
              / sum(unique sqFt values)

// PASS/FAIL — code allowance is looked up by building area type
// Examples: Multifamily = 0.49, Office = 0.82, Retail = 1.26
codeAllowance = LPD_THRESHOLDS[buildingAreaType]
result = buildingLPD <= codeAllowance ? "PASS" : "FAIL"

// Mixed-use: computed per zone, audit passes only if ALL zones pass
zones.every(zone => zone.result === "PASS") ? "PASS" : "FAIL"
```

> **Note:** When a location has multiple fixture rows, SqFt is only counted once in the Building Total (on the first row). Secondary rows for the same location have `sqFt: null`.

The full NYC ECC 2020 LPD threshold table (31 building area types) is defined in `shared/constants.js` and referenced by the calculation engine at runtime.

---

## Generated Outputs

### Spreadsheet (.xlsx)

Columns match the current audit template exactly:

| Location | Area SqFt | Bulb Type | Bulb Wattage | Qty | Control | Wtt/SqFt | Total Watts | Notes |
|---|---|---|---|---|---|---|---|---|

- Wtt/SqFt and Total Watts are auto-calculated
- Building Total row appended at the bottom
- PASS/FAIL and code comparison printed below the table

### Word Report (.docx)

Follows the Efficient ECM LLC report format:

- **Cover Page** — Address, "NYC Local Law 88 / Lighting Upgrades & Sub-Metering", building photo, Prepared By block
- **Section 1: Introduction** — Scope of Work, Items Considered, Procedure Followed, LL88 background (standard boilerplate, address injected dynamically)
- **Section 2: Lighting Systems Upgrades** — NYC ECC version, method, full lighting inventory table, LPD result, PASS/FAIL certification statement
- **Section 3: Power Distribution** — Metering description (text varies by metering type selected), sub-metering compliance statement
- **Appendix A: Existing Building Conditions** — All audit photos, 2 per row, captioned
- **Appendix B: LL88 Professional Attestation Form** — Placeholder page for manual form insertion

All reports use **Gaia Energy Solutions** branding — logo in header, company address in footer.

---

## Build Phases

| Phase | Scope | Target |
|---|---|---|
| **Phase 1** | Mobile data entry app with Firestore sync and photo capture | Week 1–2 |
| **Phase 2** | Calculation engine + spreadsheet (.xlsx) generator | Week 3 |
| **Phase 3** | Word report (.docx) generator with photo insertion | Week 4–5 |

---

## Contributing

1. Create a feature branch: `git checkout -b feature/your-feature-name`
2. Make your changes
3. Run tests: `npm test`
4. Submit a pull request with a clear description of what changed

---

## Environment Variables Reference

| Variable | Description |
|---|---|
| `VITE_FIREBASE_API_KEY` | Firebase project API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase auth domain |
| `VITE_FIREBASE_PROJECT_ID` | Firestore project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase Storage bucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | FCM sender ID |
| `VITE_FIREBASE_APP_ID` | Firebase App ID |

---

## License

Proprietary — Gaia Energy Solutions. All rights reserved.
