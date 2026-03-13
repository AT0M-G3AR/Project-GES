/**
 * LL88 Audit Tool — Calculation Engine
 * Core LPD calculations per NYC ECC 2020 Building Area Method.
 *
 * FR-22 through FR-30 from the PRD.
 */
import { LPD_THRESHOLDS } from './constants.js';

/**
 * Total Watts for a single fixture row.
 * FR-22: Total Watts = Wattage × Qty
 */
export function calcTotalWatts(wattage, qty) {
  return (wattage || 0) * (qty || 0);
}

/**
 * Wtt/SqFt for a single fixture row.
 * FR-23: Wtt/SqFt = Total Watts / SqFt  (null if SqFt is blank/null)
 */
export function calcWttPerSqFt(wattage, qty, sqFt) {
  if (sqFt == null || sqFt <= 0) return null;
  return calcTotalWatts(wattage, qty) / sqFt;
}

/**
 * Look up the NYC ECC 2020 code allowance for a given Building Area Type.
 */
export function getCodeAllowance(buildingAreaType) {
  return LPD_THRESHOLDS[buildingAreaType] ?? null;
}

/**
 * Calculate Building LPD across all locations.
 * FR-24: Total SqFt = sum of all non-null SqFt values (each location counted once)
 * FR-25: Building LPD = Sum(Total Watts for rows with SqFt) / Total SqFt
 *
 * NOTE: When a location has multiple fixture rows, SqFt is counted only once
 * on the first row. Subsequent rows for the same location have sqFt: null.
 * For this calculation, we sum totalWatts across ALL fixtures in a location
 * that has a valid sqFt, and divide by the sum of sqFt.
 */
export function calcBuildingLPD(locations) {
  let totalWatts = 0;
  let totalSqFt = 0;

  for (const loc of locations) {
    if (loc.sqFt != null && loc.sqFt > 0) {
      totalSqFt += loc.sqFt;
      for (const fix of loc.fixtures) {
        totalWatts += calcTotalWatts(fix.wattage, fix.qty);
      }
    }
  }

  if (totalSqFt === 0) return 0;
  return roundTo(totalWatts / totalSqFt, 2);
}

/**
 * Calculate LPD for a single zone (mixed-use).
 * Same logic as buildingLPD but filtered to locations matching zoneId.
 */
export function calcZoneLPD(locations, zoneId) {
  const zoneLocations = locations.filter((loc) => loc.zoneId === zoneId);
  return calcBuildingLPD(zoneLocations);
}

/**
 * Calculate total SqFt for a set of locations.
 */
export function calcTotalSqFt(locations) {
  let total = 0;
  for (const loc of locations) {
    if (loc.sqFt != null && loc.sqFt > 0) {
      total += loc.sqFt;
    }
  }
  return total;
}

/**
 * Calculate zone-level total SqFt.
 */
export function calcZoneTotalSqFt(locations, zoneId) {
  return calcTotalSqFt(locations.filter((loc) => loc.zoneId === zoneId));
}

/**
 * PASS / FAIL determination.
 * FR-29: PASS if LPD ≤ Code Allowance; FAIL otherwise.
 */
export function calcPassFail(lpd, codeAllowance) {
  if (codeAllowance == null || codeAllowance <= 0) return null;
  return lpd <= codeAllowance ? 'PASS' : 'FAIL';
}

/**
 * Mixed-use overall result.
 * FR-28: Audit PASSES only if ALL zones pass.
 */
export function calcMixedUseResult(zones) {
  if (!zones || zones.length === 0) return null;
  return zones.every((z) => z.passFailResult === 'PASS') ? 'PASS' : 'FAIL';
}

/**
 * Recalculate all computed fields for an entire audit.
 * Returns a new audit object with updated computed values.
 */
export function recalcAudit(audit) {
  const updated = { ...audit };

  // Update each location's computed fields
  updated.locations = updated.locations.map((loc) => {
    const totalWatts = loc.fixtures.reduce(
      (sum, f) => sum + calcTotalWatts(f.wattage, f.qty),
      0
    );
    const wttPerSqFt = loc.sqFt != null && loc.sqFt > 0
      ? roundTo(totalWatts / loc.sqFt, 2)
      : null;

    return {
      ...loc,
      totalWatts,
      wttPerSqFt,
      fixtures: loc.fixtures.map((f) => ({
        ...f,
        totalWatts: calcTotalWatts(f.wattage, f.qty),
      })),
    };
  });

  if (updated.buildingType === 'mixed-use' && updated.zones.length > 0) {
    // Per-zone calculations
    updated.zones = updated.zones.map((zone) => {
      const zoneLPD = calcZoneLPD(updated.locations, zone.id);
      const codeAllowance = getCodeAllowance(zone.buildingAreaType);
      return {
        ...zone,
        totalSqFt: calcZoneTotalSqFt(updated.locations, zone.id),
        zoneLPD,
        codeAllowance,
        passFailResult: calcPassFail(zoneLPD, codeAllowance),
      };
    });
    updated.buildingTotalSqFt = calcTotalSqFt(updated.locations);
    updated.buildingLPD = calcBuildingLPD(updated.locations);
    updated.codeAllowance = null; // mixed-use uses per-zone
    updated.passFailResult = calcMixedUseResult(updated.zones);
  } else {
    // Single building type
    updated.buildingTotalSqFt = calcTotalSqFt(updated.locations);
    updated.buildingLPD = calcBuildingLPD(updated.locations);
    updated.codeAllowance = getCodeAllowance(updated.buildingAreaType);
    updated.passFailResult = calcPassFail(updated.buildingLPD, updated.codeAllowance);
  }

  updated.updatedAt = Date.now();
  return updated;
}

// ── Helpers ─────────────────────────────────────────────────
function roundTo(num, decimals) {
  const factor = Math.pow(10, decimals);
  return Math.round(num * factor) / factor;
}
