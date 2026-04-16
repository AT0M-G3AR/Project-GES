/**
 * PhotoCapture — Camera capture + photo gallery for a location.
 * FR-16 through FR-19: Photo capture, tagging, caption, local storage.
 *
 * Demo mode: stores photos as base64 data URLs in localStorage.
 */
import { useRef } from 'react';
import { createPhoto } from '../shared/dataModel.js';

export default function PhotoCapture({ photos = [], locationName, onAddPhoto, onUpdatePhoto, onDeletePhoto }) {
  const fileRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Compress before storing: resize to max 800px, JPEG 70% quality.
    // Raw phone photos are 3–5 MB; this brings them down to ~50–150 KB,
    // keeping localStorage writes fast and within quota.
    const MAX_PX = 800;
    const QUALITY = 0.7;

    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      let { width, height } = img;
      if (width > MAX_PX || height > MAX_PX) {
        if (width >= height) {
          height = Math.round((height * MAX_PX) / width);
          width = MAX_PX;
        } else {
          width = Math.round((width * MAX_PX) / height);
          height = MAX_PX;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      canvas.getContext('2d').drawImage(img, 0, 0, width, height);

      const compressed = canvas.toDataURL('image/jpeg', QUALITY);
      const photo = createPhoto({
        storageUrl: compressed,
        caption: locationName || 'Photo',
      });
      onAddPhoto(photo);
    };

    img.src = objectUrl;

    // Reset so the same file can be re-selected
    e.target.value = '';
  };

  return (
    <div>
      <label className="form-label">Photos</label>
      <div className="photo-grid">
        {photos.map((photo, i) => (
          <div key={photo.id} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div className="photo-thumb" title={photo.caption}>
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
            <input
              className="form-input"
              style={{ padding: '6px 8px', fontSize: '12px' }}
              type="text"
              placeholder="Caption"
              value={photo.caption}
              onChange={(e) => onUpdatePhoto && onUpdatePhoto(photo.id, { ...photo, caption: e.target.value })}
            />
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
    </div>
  );
}
