/**
 * LL88 Audit Tool — Shared Constants
 * NYC ECC 2020 Building Area Method LPD thresholds,
 * bulb types, control types, and building classifications.
 */

// ── Building Types ──────────────────────────────────────────
export const BUILDING_TYPES = ['residential', 'non-residential', 'mixed-use'];

// ── Building Area Type Categories (NYC ECC 2020) ────────────
export const BUILDING_AREA_CATEGORIES = {
  'Residential': [
    'Multifamily',
    'Dormitory',
    'Hotel / Motel',
  ],
  'Office & Civic': [
    'Office',
    'Courthouse',
    'Fire Station',
    'Police Station',
    'Post Office',
    'Town Hall',
  ],
  'Retail & Commercial': [
    'Retail',
    'Automotive Facility',
    'Warehouse',
    'Workshop',
    'Manufacturing Facility',
  ],
  'Dining & Hospitality': [
    'Dining: Bar / Lounge / Leisure',
    'Dining: Cafeteria / Fast Food',
    'Dining: Family',
  ],
  'Health & Education': [
    'Health Care Clinic',
    'Hospital',
    'School / University',
  ],
  'Assembly & Recreation': [
    'Convention Center',
    'Gymnasium',
    'Exercise Center',
    'Sports Arena',
    'Performing Arts Theater',
    'Motion Picture Theater',
    'Museum',
    'Religious Building',
    'Library',
  ],
  'Other': [
    'Parking Garage',
    'Transportation',
    'Penitentiary',
  ],
};

// Flat list of all building area types
export const BUILDING_AREA_TYPES = Object.values(BUILDING_AREA_CATEGORIES).flat();

// ── LPD Thresholds — NYC ECC 2020, Building Area Method ─────
// Code Allowance in W/SqFt
export const LPD_THRESHOLDS = {
  'Multifamily':                   0.49,
  'Dormitory':                     0.61,
  'Hotel / Motel':                 1.00,
  'Office':                        0.82,
  'Courthouse':                    1.05,
  'Fire Station':                  0.71,
  'Police Station':                0.87,
  'Post Office':                   0.87,
  'Town Hall':                     0.92,
  'Retail':                        1.26,
  'Automotive Facility':           0.82,
  'Warehouse':                     0.66,
  'Workshop':                      1.38,
  'Manufacturing Facility':        1.17,
  'Dining: Bar / Lounge / Leisure': 1.07,
  'Dining: Cafeteria / Fast Food': 0.90,
  'Dining: Family':                0.89,
  'Health Care Clinic':            0.90,
  'Hospital':                      1.05,
  'School / University':           0.87,
  'Convention Center':             1.01,
  'Gymnasium':                     1.01,
  'Exercise Center':               0.72,
  'Sports Arena':                  1.03,
  'Performing Arts Theater':       1.39,
  'Motion Picture Theater':        0.76,
  'Museum':                        1.02,
  'Religious Building':            1.05,
  'Library':                       1.19,
  'Parking Garage':                0.21,
  'Transportation':                0.70,
  'Penitentiary':                  0.97,
};

// ── Default Bulb Types (FR-13) ──────────────────────────────
export const DEFAULT_BULB_TYPES = [
  'LED bulb',
  'LED 4ft tube',
  'LED 4ft fixture',
  '4in LED',
  '6in LED',
  '8in LED',
  'LED 2x2 panel',
  'LED 2x4 panel',
  'CFL bulb',
  'Floodlight',
];

// ── Control Types (FR-14) ───────────────────────────────────
export const DEFAULT_CONTROL_TYPES = [
  'Switch',
  'Breaker',
  'Sensor',
  'Timer',
];

// ── Metering Types (Section 3 of report) ────────────────────
export const METERING_TYPES = [
  'directly-metered',
  'sub-metered',
  'not-applicable',
];

// ── Audit Statuses ──────────────────────────────────────────
export const AUDIT_STATUSES = ['in-progress', 'complete'];
