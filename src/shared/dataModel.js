/**
 * LL88 Audit Tool — Data Model
 * Factory functions for creating audit data objects with defaults and auto-IDs.
 */
import { v4 as uuidv4 } from 'uuid';

/**
 * Create a new Audit record.
 */
export function createAudit(overrides = {}) {
  return {
    id: uuidv4(),
    address: '',
    bbl: '',
    bin: '',
    buildingType: 'residential',       // residential | non-residential | mixed-use
    buildingAreaType: 'Multifamily',   // NYC ECC 2020 classification
    zones: [],                          // Zone[] — populated for mixed-use only
    auditDate: new Date().toISOString().split('T')[0],
    auditors: [],
    meteringType: 'directly-metered',
    status: 'in-progress',
    locations: [],
    // Computed fields (recalculated live)
    buildingTotalSqFt: 0,
    buildingLPD: 0,
    codeAllowance: 0,
    passFailResult: null,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    ...overrides,
  };
}

/**
 * Create a new Zone (mixed-use only).
 */
export function createZone(overrides = {}) {
  return {
    id: uuidv4(),
    name: '',
    buildingAreaType: 'Office',
    codeAllowance: 0,                  // auto-looked-up
    totalSqFt: 0,                       // computed
    zoneLPD: 0,                         // computed
    passFailResult: null,
    ...overrides,
  };
}

/**
 * Create a new Location (room/area).
 */
export function createLocation(overrides = {}) {
  return {
    id: uuidv4(),
    name: '',
    sqFt: null,                         // null = not applicable / secondary row
    zoneId: null,                       // links to zone for mixed-use
    fixtures: [],
    photos: [],
    // Computed
    totalWatts: 0,
    wttPerSqFt: null,
    ...overrides,
  };
}

/**
 * Create a new Fixture row.
 */
export function createFixture(overrides = {}) {
  return {
    id: uuidv4(),
    bulbType: 'LED bulb',
    wattage: 0,
    qty: 1,
    controlType: 'Switch',
    totalWatts: 0,                      // computed: wattage × qty
    ...overrides,
  };
}

/**
 * Create a new Photo record.
 */
export function createPhoto(overrides = {}) {
  return {
    id: uuidv4(),
    locationId: '',
    zoneId: null,
    storageUrl: '',
    caption: '',
    timestamp: new Date().toISOString(),
    ...overrides,
  };
}
