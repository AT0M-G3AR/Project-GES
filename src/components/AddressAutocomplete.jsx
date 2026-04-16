/**
 * AddressAutocomplete — Address input with Google Places autocomplete.
 * Gracefully falls back to a plain text input if no API key is configured.
 *
 * Requires VITE_GOOGLE_PLACES_API_KEY in environment.
 * When a suggestion is selected, it calls onSelect({ address, placeId }).
 */
import { useState, useEffect, useRef, useCallback } from 'react';

const API_KEY = import.meta.env.VITE_GOOGLE_PLACES_API_KEY || '';
let _placesScriptLoaded = false;
let _placesScriptLoading = false;

function loadPlacesScript() {
  return new Promise((resolve, reject) => {
    if (_placesScriptLoaded && window.google?.maps?.places) {
      resolve();
      return;
    }
    if (_placesScriptLoading) {
      // Wait for ongoing load
      const check = setInterval(() => {
        if (_placesScriptLoaded) {
          clearInterval(check);
          resolve();
        }
      }, 100);
      return;
    }
    _placesScriptLoading = true;
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      _placesScriptLoaded = true;
      _placesScriptLoading = false;
      resolve();
    };
    script.onerror = () => {
      _placesScriptLoading = false;
      reject(new Error('Failed to load Google Places'));
    };
    document.head.appendChild(script);
  });
}

export default function AddressAutocomplete({
  value,
  onChange,
  onSelect,
  id = 'address',
  placeholder = '123 Example St, New York, NY 10001',
  required = false,
  autoFocus = false,
}) {
  const inputRef = useRef(null);
  const autocompleteRef = useRef(null);
  const [hasApi, setHasApi] = useState(false);

  useEffect(() => {
    if (!API_KEY) return;

    let cancelled = false;

    loadPlacesScript()
      .then(() => {
        if (cancelled || !inputRef.current) return;

        const ac = new window.google.maps.places.Autocomplete(inputRef.current, {
          types: ['address'],
          componentRestrictions: { country: 'us' },
          fields: ['formatted_address', 'place_id', 'address_components'],
        });

        ac.addListener('place_changed', () => {
          const place = ac.getPlace();
          if (place?.formatted_address) {
            onChange?.({ target: { value: place.formatted_address } });
            onSelect?.({
              address: place.formatted_address,
              placeId: place.place_id,
              components: place.address_components,
            });
          }
        });

        autocompleteRef.current = ac;
        setHasApi(true);
      })
      .catch(() => {
        // Silently fall back to plain input
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="address-autocomplete">
      <input
        ref={inputRef}
        id={id}
        className="form-input"
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        autoFocus={autoFocus}
        autoComplete="off"
      />
      {!API_KEY && (
        <div className="form-hint" style={{ marginTop: '4px', fontSize: '0.75rem', opacity: 0.6 }}>
          💡 Set VITE_GOOGLE_PLACES_API_KEY for address suggestions
        </div>
      )}
    </div>
  );
}
