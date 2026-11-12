import PixelIcon from './PixelIcon.jsx';

// Notificación de logro tipo consola: aparece arriba, dura 3 segundos.
// Se reinicia la animación cambiando la `key` desde App.
export default function Logro({ titulo, xp }) {
  return (
    <div className="logro" role="status" aria-live="polite">
      <span className="logro-trofeo"><PixelIcon nombre="trofeo" tamano={22} color="#13212c" /></span>
      <span className="logro-texto">
        <small>Logro desbloqueado · +{xp} XP</small>
        <strong>{titulo}</strong>
      </span>
    </div>
  );
}
