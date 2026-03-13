/**
 * PhotoCapture — Camera capture + photo gallery for a location.
 * FR-16 through FR-19: Photo capture, tagging, caption, local storage.
 *
 * Demo mode: stores photos as base64 data URLs in localStorage.
 */
import { useState, useRef } from 'react';
import { createPhoto } from '../shared/dataModel.js';

export default function PhotoCapture({ photos = [], locationName, onAddPhoto, onDeletePhoto }) {
  const fileRef = useRef(null);
  const [caption, setCaption] = useState('');

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const photo = createPhoto({
        storageUrl: reader.result,  // base64 data URL in demo mode
        caption: caption || locationName || 'Photo',
      });
      onAddPhoto(photo);
      setCaption('');
    };
    reader.readAsDataURL(file);

    // Reset input so the same file can be re-selected
    e.target.value = '';
  };

  return (
    <div>
      <label className="form-label">Photos</label>
      <div className="photo-grid">
        {photos.map((photo, i) => (
          <div key={photo.id} className="photo-thumb" title={photo.caption}>
            <img src={photo.storageUrl} alt={photo.caption || `Photo ${i + 1}`} />
            <button
              type="button"
              className="delete-icon-btn"
              style={{
                position: 'absolute',
                top: 2,
                right: 2,
                background: 'rgba(0,0,0,0.6)',
                borderRadius: '50%',
                width: 22,
                height: 22,
                fontSize: '12px',
                color: '#fff',
              }}
              onClick={() => onDeletePhoto(photo.id)}
            >
              ✕
            </button>
          </div>
        ))}

        {/* Add photo button */}
        <div className="photo-add" onClick={() => fileRef.current?.click()}>
          <span className="photo-add__icon">📷</span>
          <span>Add</span>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        capture="environment"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      {/* Caption input (optional, shown when there are photos) */}
      {photos.length > 0 && (
        <div className="form-group" style={{ marginTop: '12px', marginBottom: 0 }}>
          <input
            className="form-input"
            type="text"
            placeholder="Caption for next photo (optional)"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
          />
        </div>
      )}
    </div>
  );
}
