/**
 * FixtureRow — Single fixture row with bulb type, wattage, qty stepper, control.
 * FR-11 through FR-15: Fixture entry with live calculation.
 */
import { DEFAULT_BULB_TYPES, DEFAULT_CONTROL_TYPES } from '../shared/constants.js';
import { calcTotalWatts, calcWttPerSqFt } from '../shared/calculations.js';

export default function FixtureRow({ fixture, index, sqFt, onUpdate, onDelete }) {
  const totalWatts = calcTotalWatts(fixture.wattage, fixture.qty);
  const wttPerSqFt = calcWttPerSqFt(fixture.wattage, fixture.qty, sqFt);

  const set = (field) => (e) => {
    const val = e.target.type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value;
    onUpdate({ ...fixture, [field]: val });
  };

  return (
    <div className="fixture-row">
      <div className="fixture-row__header">
        <span className="fixture-row__number">Fixture {index + 1}</span>
        <button
          type="button"
          className="delete-icon-btn"
          onClick={onDelete}
          title="Remove fixture"
        >
          ✕
        </button>
      </div>

      <div className="fixture-row__grid">
        {/* Bulb Type */}
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Bulb Type</label>
          <select
            className="form-select"
            value={fixture.bulbType}
            onChange={set('bulbType')}
          >
            {DEFAULT_BULB_TYPES.map((bt) => (
              <option key={bt} value={bt}>{bt}</option>
            ))}
          </select>
        </div>

        {/* Wattage */}
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Wattage</label>
          <input
            className="form-input"
            type="number"
            min="0"
            step="1"
            placeholder="0"
            value={fixture.wattage || ''}
            onChange={set('wattage')}
          />
        </div>

        {/* Quantity */}
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Quantity</label>
          <div className="qty-stepper">
            <button
              type="button"
              className="qty-stepper__btn"
              onClick={() => onUpdate({ ...fixture, qty: Math.max(0, fixture.qty - 1) })}
            >
              −
            </button>
            <div className="qty-stepper__value">{fixture.qty}</div>
            <button
              type="button"
              className="qty-stepper__btn"
              onClick={() => onUpdate({ ...fixture, qty: fixture.qty + 1 })}
            >
              +
            </button>
          </div>
        </div>

        {/* Control Type */}
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Control</label>
          <select
            className="form-select"
            value={fixture.controlType}
            onChange={set('controlType')}
          >
            {DEFAULT_CONTROL_TYPES.map((ct) => (
              <option key={ct} value={ct}>{ct}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Computed values */}
      <div className="fixture-row__computed">
        <div>Total Watts: <strong>{totalWatts}</strong></div>
        <div>
          Wtt/SqFt: <strong>{wttPerSqFt != null ? wttPerSqFt.toFixed(2) : '—'}</strong>
        </div>
      </div>
    </div>
  );
}
