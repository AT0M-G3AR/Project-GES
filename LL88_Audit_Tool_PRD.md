# Product Requirements Document (PRD)
## LL88 Audit Automation Tool
**Version:** 1.1  
**Prepared By:** Gaia Energy Solutions  
**Date:** March 2026  
**Status:** Draft — Ready for Development

---

## 1. Executive Summary

The LL88 Audit Automation Tool is a two-part software system built exclusively for **Gaia Energy Solutions** — a two-person field audit team subcontracted to perform NYC Local Law 88 lighting compliance inspections across residential, non-residential, and mixed commercial-use buildings throughout New York City.

The system consists of a **mobile-first data entry application** used on-site during building inspections, and a **desktop report generation dashboard** used back at the office to automatically produce finished spreadsheets and Word compliance reports.

The tool is designed to replace the current workflow — phone notes on-site, manual Google Sheet construction, and manually written Word reports — with a structured, automated pipeline that handles every building type Gaia Energy Solutions encounters in the field.

**Target time savings: 60–80% reduction in post-audit office hours per report.**

---

## 2. Problem Statement

### About Gaia Energy Solutions

Gaia Energy Solutions is a two-person operation subcontracted to complete NYC LL88 lighting audits on behalf of a larger firm. Both team members perform field work together and handle all post-audit office work themselves. The current process is highly manual, error-prone, and consumes a disproportionate amount of time relative to the revenue earned per audit — limiting the number of jobs the team can realistically complete per week.

### Current Workflow Pain Points

**On-Site Data Collection**
- Both auditors use unstructured phone note apps to capture room names, fixture types, wattages, quantities, control types, and square footage
- No standardization between the two team members leads to inconsistent notes requiring reconciliation after the visit
- Photos are taken separately with no automatic linkage to specific rooms
- The two auditors working simultaneously have no way to merge notes in real time — one auditor must later manually consolidate both sets of notes

**Post-Audit Office Work**
- All field notes must be manually transcribed into a Google Sheet
- Wtt/SqFt calculations (`Wattage × Qty / SqFt`) must be computed row by row
- Building Total SqFt and overall LPD must be summed and cross-checked manually
- The correct LPD code threshold must be looked up per building type and applied manually
- The Word report must be written from scratch each time, with boilerplate sections retyped repeatedly
- Photos must be manually sorted, labeled, and inserted into Appendix A
- A single report currently takes several hours of office work after a site visit

**Multi-Building-Type Complexity**
- Gaia Energy Solutions audits residential, non-residential, and mixed commercial-use buildings — each governed by different LPD thresholds under NYC ECC 2020
- Mixed-use buildings require separate LPD calculations for distinct space categories within the same structure
- Manually tracking and applying the correct code threshold for each job introduces compliance risk

### Business Impact
- High labor cost per audit relative to contract value
- Risk of LPD calculation or threshold errors that could affect compliance certification
- Bottleneck limits throughput — the team cannot scale without reducing per-audit effort
- Auditor burnout from repetitive manual work after long field days

---

## 3. Goals & Objectives

| Goal | Success Metric |
|---|---|
| Reduce post-audit office time | ≤ 30 minutes from field data to finished report |
| Eliminate manual formula entry | 100% of Wtt/SqFt and LPD calculations auto-computed |
| Automate report generation | Full Word report produced with one click |
| Support all building types | Correct LPD threshold auto-applied for residential, non-residential, and mixed-use |
| Standardize data collection | Both auditors capture data in identical structured format |
| Enable two-person real-time sync | Both auditors contribute to a single audit simultaneously |
| Auto-organize photos | Photos auto-tagged to rooms, auto-inserted into Appendix A |

---

## 4. Scope

### In Scope (v1.0)
- Mobile web app for structured on-site data entry (iOS and Android via browser)
- Support for all fixture and control types used in current Gaia Energy Solutions audits
- Photo capture with room-level tagging
- Two-auditor real-time sync on the same audit
- Automatic Wtt/SqFt, Total Watts, and Building LPD calculations
- Building type selection (Residential / Non-Residential / Mixed-Use) with automatic LPD threshold lookup from NYC ECC 2020 Building Area Method table
- PASS/FAIL evaluation against the correct code threshold per building/space type
- Mixed-use support: ability to define space-type zones within a single audit, each with independent LPD calculation and PASS/FAIL result
- Auto-generation of .xlsx spreadsheet formatted to match current audit template
- Auto-generation of .docx Word report using the Gaia Energy Solutions report template
- Cover page with dynamic address, BBL, and BIN fields
- Appendix A auto-populated with tagged photos and captions
- Audit history and search by address

### Out of Scope (v1.0)
- Native iOS/Android app (PWA browser-based is sufficient for v1)
- AI/ML fixture identification from photos
- Integration with NYC DOB filing systems
- Space-by-Space LPD method (Building Area Method only in v1)
- Multi-building portfolio dashboards
- Engineer signature/stamp automation (remains manual)
- Client billing or invoice generation

---

## 5. Users

Gaia Energy Solutions consists of exactly two people. Both perform field work and both produce reports. There is no separation between "field user" and "office user" — the same two people do everything.

### Both Users (Field + Office)
- Use the mobile app on-site during building inspections
- Use the desktop dashboard to review, finalize, and generate reports back at the office
- Are not software developers — the tool must be intuitive with zero training required
- Need the mobile interface to be operable with one hand while measuring rooms or counting fixtures
- Need confidence that all compliance calculations are correct before signing off on a report

---

## 6. Functional Requirements

### 6.1 Mobile Data Entry App

#### Audit Setup
- FR-01: User can create a new audit by entering: Building Address, BBL, BIN, Building Type, Audit Date, Auditor Name(s)
- FR-02: Building Type selection includes: Residential (Multi-family), Non-Residential, and Mixed-Use; this selection drives the LPD threshold applied in calculations
- FR-03: For Non-Residential audits, user selects the applicable Building Area Type from the NYC ECC 2020 classification list (see Section 6.2)
- FR-04: For Mixed-Use audits, the user defines two or more space zones within the audit, each assigned a Building Area Type independently
- FR-05: User can resume an in-progress audit from an audit list screen
- FR-06: Both auditors can join the same audit session simultaneously and see each other's entries in real time

#### Room / Location Entry
- FR-07: User can add a new location with a name (free text) and optional square footage
- FR-08: For Mixed-Use audits, each location is assigned to one of the defined space zones
- FR-09: When square footage is left blank or entered as `-`, the system stores null and omits the row from LPD calculations — preserving the current behavior for secondary fixture rows in the same location
- FR-10: Locations are displayed in entry order and can be reordered or deleted

#### Fixture Entry (per Location)
- FR-11: For each location, user can add one or more fixture rows
- FR-12: Each fixture row captures: Bulb Type (dropdown), Wattage (numeric), Quantity (numeric stepper), Control Type (dropdown)
- FR-13: Bulb Type dropdown default list: CFL bulb, Floodlight, LED bulb, LED 4ft tube, LED 4ft fixture, 4in LED, 6in LED, 8in LED, LED 2x2 panel, LED 2x4 panel — with ability to add custom types that persist across audits
- FR-14: Control Type dropdown: Switch, Breaker, Sensor, Timer — with ability to add custom types
- FR-15: Wtt/SqFt is calculated and displayed live: `(Wattage × Qty) / SqFt`; displays `-` when SqFt is null

#### Photo Capture
- FR-16: User can attach one or more photos to any location from within the app
- FR-17: Each photo is automatically tagged with: location name, zone (if mixed-use), audit ID, timestamp
- FR-18: User can add a custom caption to each photo (defaults to location name if left blank)
- FR-19: Photos are stored and synced to the audit record — not just the local device

#### Validation & Completeness
- FR-20: App displays a completeness indicator showing how many locations have square footage entered vs. total locations
- FR-21: App warns the user before marking an audit complete if any fixture row has missing required fields

---

### 6.2 Calculations Engine

#### Core Calculations
- FR-22: Total Watts per row = `Wattage × Qty`
- FR-23: Wtt/SqFt per row = `Total Watts / SqFt` (null if SqFt is blank)
- FR-24: Zone/Building Total SqFt = sum of all non-null SqFt values (each unique location counted once)
- FR-25: Zone/Building LPD = `Sum of all Total Watts for rows with SqFt / Total SqFt`
- FR-26: All calculations update in real time as data is entered

#### LPD Code Thresholds — NYC ECC 2020, Building Area Method

The tool automatically applies the correct threshold based on the Building Type and Building Area Type selected at audit setup:

| Building Area Type | Code Allowance (W/SqFt) |
|---|---|
| **Residential** | |
| Multifamily | 0.49 |
| Dormitory | 0.61 |
| Hotel / Motel | 1.00 |
| **Office & Civic** | |
| Office | 0.82 |
| Courthouse | 1.05 |
| Fire Station | 0.71 |
| Police Station | 0.87 |
| Post Office | 0.87 |
| Town Hall | 0.92 |
| **Retail & Commercial** | |
| Retail | 1.26 |
| Automotive Facility | 0.82 |
| Warehouse | 0.66 |
| Workshop | 1.38 |
| Manufacturing Facility | 1.17 |
| **Dining & Hospitality** | |
| Dining: Bar / Lounge / Leisure | 1.07 |
| Dining: Cafeteria / Fast Food | 0.90 |
| Dining: Family | 0.89 |
| **Health & Education** | |
| Health Care Clinic | 0.90 |
| Hospital | 1.05 |
| School / University | 0.87 |
| **Assembly & Recreation** | |
| Convention Center | 1.01 |
| Gymnasium | 1.01 |
| Exercise Center | 0.72 |
| Sports Arena | 1.03 |
| Performing Arts Theater | 1.39 |
| Motion Picture Theater | 0.76 |
| Museum | 1.02 |
| Religious Building | 1.05 |
| Library | 1.19 |
| **Other** | |
| Parking Garage | 0.21 |
| Transportation | 0.70 |
| Penitentiary | 0.97 |

- FR-27: For Residential and single-type Non-Residential audits: one LPD is computed for the entire building and compared against the single applicable threshold
- FR-28: For Mixed-Use audits: a separate LPD is computed per defined zone, each compared against its own threshold; the audit PASSES only if all zones pass
- FR-29: Result = PASS if Building/Zone LPD ≤ Code Allowance; FAIL otherwise
- FR-30: The code allowance in use is always displayed alongside the result so auditors can verify the correct threshold was applied

---

### 6.3 Desktop Dashboard

- FR-31: Both auditors can access the dashboard to view all audits, filterable by address, building type, date, and status
- FR-32: Auditor can open any audit and see a full data review screen before generating outputs
- FR-33: Auditor can edit any field in the data review screen before generating
- FR-34: Dashboard displays Building LPD, Code Allowance, and PASS/FAIL prominently; for mixed-use, all zones are shown with individual PASS/FAIL status

#### Spreadsheet Generation
- FR-35: One-click export to downloadable .xlsx in the exact column format: Location | Area SqFt | Bulb Type | Bulb Wattage | Qty | Control | Wtt/SqFt | Total Watts | Notes
- FR-36: Building Total row (or per-zone subtotal rows for mixed-use) auto-appended with summed SqFt and LPD
- FR-37: Rows with null SqFt display `-` in the Area SqFt column
- FR-38: PASS/FAIL result, Code Allowance, and Building Condition LPD printed below the table

#### Word Report Generation
- FR-39: One-click generation of a complete .docx report using the Gaia Energy Solutions template
- FR-40: Cover page auto-populated with: Building Address, "NYC Local Law 88 — Lighting Upgrades & Sub-Metering", building photo (first photo in audit), "Prepared By: Gaia Energy Solutions" block
- FR-41: Section 1 (Introduction) uses standard boilerplate, with building address and BBL/BIN dynamically inserted
- FR-42: Section 2 (Lighting Systems Upgrades) includes: NYC ECC 2020 version, Building Area Method notation, building area type(s), full lighting inventory table, LPD result paragraph, PASS/FAIL certification statement
- FR-43: For Mixed-Use reports, Section 2 renders a separate table and LPD result block per zone
- FR-44: Section 3 (Power Distribution) auto-filled based on metering type selected at audit setup; certification language adjusts accordingly
- FR-45: Appendix A auto-populated with all tagged audit photos arranged 2-per-row with captions
- FR-46: Appendix B placeholder page generated for manual attestation form insertion
- FR-47: Report uses Gaia Energy Solutions branding: logo in header, company address in footer, page numbers throughout

---

## 7. Non-Functional Requirements

| Requirement | Specification |
|---|---|
| Mobile performance | App loads in < 3 seconds on a standard LTE connection |
| Offline capability | Data entry works fully offline; syncs automatically when connection is restored |
| Data persistence | No audit data is lost if the app is closed mid-entry |
| Photo storage | Photos compressed to ≤ 2MB each before upload without visible quality loss |
| Report generation speed | Word report generated in < 30 seconds |
| Browser support | iOS Safari 15+, Android Chrome 100+, Desktop Chrome / Edge / Firefox |
| Security | All data stored under authenticated Gaia Energy Solutions accounts only |
| Scalability | System supports up to 500 audits stored per account |
| Accuracy | All LPD calculations must match manual formula results to 2 decimal places |

---

## 8. Technical Architecture

### Recommended Stack

| Layer | Technology |
|---|---|
| Mobile App | React (PWA) |
| Desktop Dashboard | React |
| Database | Firebase Firestore |
| Photo Storage | Firebase Storage |
| Auth | Firebase Authentication (Google Sign-In) |
| Spreadsheet Export | SheetJS (.xlsx) |
| Word Report Export | docx.js |
| Hosting | Vercel or Firebase Hosting |
| Real-Time Sync | Firestore real-time listeners |

### Build Phases

**Phase 1 — Mobile Data Entry (Week 1–2)**
- Audit setup with building type + area type selection
- Room/location entry with fixture rows and live LPD preview
- Photo capture with room tagging
- Firestore sync for real-time two-person collaboration
- Offline mode with auto-sync on reconnect

**Phase 2 — Calculation Engine + Spreadsheet Generator (Week 3)**
- Full LPD engine with all NYC ECC 2020 thresholds
- Mixed-use zone-level calculation logic
- One-click .xlsx export matching current spreadsheet format

**Phase 3 — Word Report Generator (Week 4–5)**
- docx.js report template with all dynamic fields
- Per-zone section rendering for mixed-use
- Photo insertion into Appendix A
- Gaia Energy Solutions branding applied throughout

---

## 9. Data Model

```
Audit {
  id: string
  address: string
  bbl: string
  bin: string
  buildingType: "residential" | "non-residential" | "mixed-use"
  buildingAreaType: string           // e.g. "Multifamily", "Office", "Retail"
  zones: Zone[]                      // populated for mixed-use only
  auditDate: date
  auditors: string[]
  meteringType: string               // "directly-metered" | "sub-metered" | etc.
  status: "in-progress" | "complete"
  locations: Location[]
  buildingTotalSqFt: number          // computed
  buildingLPD: number                // computed
  codeAllowance: number              // auto-looked-up from buildingAreaType
  passFailResult: "PASS" | "FAIL"    // computed
}

Zone {                               // Mixed-use only
  id: string
  name: string                       // e.g. "Residential Common Areas", "Ground Floor Retail"
  buildingAreaType: string
  codeAllowance: number              // auto-looked-up
  totalSqFt: number                  // computed
  zoneLPD: number                    // computed
  passFailResult: "PASS" | "FAIL"
}

Location {
  id: string
  name: string
  sqFt: number | null
  zoneId: string | null              // links to zone for mixed-use
  fixtures: Fixture[]
  photos: Photo[]
  totalWatts: number                 // computed
  wttPerSqFt: number | null          // computed
}

Fixture {
  id: string
  bulbType: string
  wattage: number
  qty: number
  controlType: string
  totalWatts: number                 // computed: wattage × qty
}

Photo {
  id: string
  locationId: string
  zoneId: string | null
  storageUrl: string
  caption: string
  timestamp: datetime
}
```

---

## 10. UI/UX Requirements

- Mobile interface must be operable with one hand — all primary actions thumb-reachable
- Minimum 16px font for all input labels on mobile
- Fixture quantity uses large +/- tap buttons, not a keyboard number field
- Bulb Type and Control Type dropdowns show most-used types at the top
- Building type and area type selection is the most prominent step at audit setup — it drives the entire calculation
- PASS shown in green, FAIL shown in red, throughout app and dashboard
- For mixed-use audits, each zone has a distinct color label so locations are easy to visually distinguish
- No login friction — both auditors should reach the data entry screen within 2 taps of opening the app

---

## 11. Success Criteria

The v1.0 release is considered successful when:

1. A complete LL88 audit (20–50 rooms, any building type) can be fully entered on-site with no additional note-taking required
2. A finished, correctly formatted Word report is generated in under 30 minutes of office time after returning from the site
3. All LPD calculations match manual formula results to 2 decimal places
4. The correct code threshold is automatically applied for every building type Gaia Energy Solutions encounters — residential, non-residential, and mixed-use
5. Mixed-use audits produce per-zone LPD results and per-zone PASS/FAIL in both the spreadsheet and report
6. Both auditors can work in the app simultaneously without data conflicts
7. Zero compliance-relevant data is lost due to app closure or loss of connectivity

---

## 12. Open Questions

| # | Question | Owner | Status |
|---|---|---|---|
| 1 | For mixed-use buildings, should the audit support more than 2 zones? (e.g. residential floors + retail ground floor + parking garage) | Gary | Open |
| 2 | Should the tool support multi-building audits under one address (e.g. 200 and 210 as separate sub-entries in one report)? | Gary | Open |
| 3 | Is the Appendix B attestation form static, or does it need dynamic fields filled from audit data? | Gary | Open |
| 4 | Should offline photo capture be supported (save to device, upload when back on WiFi), or is real-time upload required? | Dev | Open |
| 5 | Is .xlsx / .docx download the target output, or should the tool push directly to Google Drive? | Gary | Open |
| 6 | Does the Gaia Energy Solutions report branding need to exactly replicate an existing template, or is a new clean design acceptable? | Gary | Open |

---

## 13. Appendix A — Spreadsheet Column Reference

| Column | Description | Formula |
|---|---|---|
| Location | Room/area name | Manual entry |
| Area SqFt | Room square footage | Manual (null = `-`) |
| Bulb Type | Fixture type | Dropdown |
| Bulb Wattage | Watts per fixture | Manual |
| Qty | Number of fixtures | Manual |
| Control | Switch / Breaker / Sensor / Timer | Dropdown |
| Wtt/SqFt | Lighting power density | `(Wattage × Qty) / SqFt` |
| Total Watts | Total wattage for row | `Wattage × Qty` |
| Notes | Optional observations | Manual |

**Building Total Row:**
- SqFt = Sum of all unique location SqFt values (per-zone subtotals for mixed-use)
- Wtt/SqFt = Sum of applicable Total Watts / Building (or Zone) Total SqFt

---

## 14. Appendix B — NYC ECC 2020 LPD Thresholds Reference

Full Building Area Method allowance table used by the calculation engine:

| Building Area Type | W/SqFt Allowance |
|---|---|
| Multifamily | 0.49 |
| Dormitory | 0.61 |
| Hotel / Motel | 1.00 |
| Office | 0.82 |
| Courthouse | 1.05 |
| Fire Station | 0.71 |
| Police Station | 0.87 |
| Post Office | 0.87 |
| Town Hall | 0.92 |
| Retail | 1.26 |
| Automotive Facility | 0.82 |
| Warehouse | 0.66 |
| Workshop | 1.38 |
| Manufacturing Facility | 1.17 |
| Dining: Bar / Lounge / Leisure | 1.07 |
| Dining: Cafeteria / Fast Food | 0.90 |
| Dining: Family | 0.89 |
| Health Care Clinic | 0.90 |
| Hospital | 1.05 |
| School / University | 0.87 |
| Convention Center | 1.01 |
| Gymnasium | 1.01 |
| Exercise Center | 0.72 |
| Sports Arena | 1.03 |
| Performing Arts Theater | 1.39 |
| Motion Picture Theater | 0.76 |
| Museum | 1.02 |
| Religious Building | 1.05 |
| Library | 1.19 |
| Parking Garage | 0.21 |
| Transportation | 0.70 |
| Penitentiary | 0.97 |
