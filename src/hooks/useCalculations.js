/**
 * useCalculations — React hook wrapping the calculation engine.
 * Recalculates LPD values live as audit data changes.
 */
import { useMemo } from 'react';
import {
  calcTotalWatts,
  calcWttPerSqFt,
  calcBuildingLPD,
  calcTotalSqFt,
  getCodeAllowance,
  calcPassFail,
} from '../shared/calculations.js';

export function useCalculations(audit) {
  return useMemo(() => {
    if (!audit) {
      return {
        totalSqFt: 0,
        buildingLPD: 0,
        codeAllowance: null,
        passFailResult: null,
        locationStats: [],
      };
    }

    const locations = audit.locations || [];
    const totalSqFt = calcTotalSqFt(locations);
    const buildingLPD = calcBuildingLPD(locations);
    const codeAllowance = getCodeAllowance(audit.buildingAreaType);
    const passFailResult = calcPassFail(buildingLPD, codeAllowance);

    const locationStats = locations.map((loc) => {
      const locTotalWatts = (loc.fixtures || []).reduce(
        (sum, f) => sum + calcTotalWatts(f.wattage, f.qty),
        0
      );
      return {
        id: loc.id,
        name: loc.name,
        sqFt: loc.sqFt,
        totalWatts: locTotalWatts,
        wttPerSqFt: calcWttPerSqFt(locTotalWatts, 1, loc.sqFt), // already total
        fixtureCount: (loc.fixtures || []).length,
      };
    });

    return {
      totalSqFt,
      buildingLPD,
      codeAllowance,
      passFailResult,
      locationStats,
    };
  }, [audit]);
}
