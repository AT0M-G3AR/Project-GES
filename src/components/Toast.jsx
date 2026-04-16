import { useToast } from '../shared/ToastContext';

export default function Toast() {
  const { toast } = useToast();

  if (!toast.visible && !toast.message) return null;

  return (
    <div className={`toast ${toast.visible ? 'toast--visible' : 'toast--hidden'}`}>
      <div className="toast__content">
        <span className="toast__icon">✓</span>
        <span className="toast__message">{toast.message}</span>
      </div>
    </div>
  );
}
