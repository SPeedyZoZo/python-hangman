import type { EngineMode, MicFailure } from '../audio/AudioEngine.ts';
import { Icon } from './Icon.tsx';

const MESSAGES: Record<MicFailure, string> = {
  denied:
    'Microphone access was blocked, so you are using the on-screen guitar. You can allow the mic in your browser settings.',
  unavailable: 'No microphone was found, so you are using the on-screen guitar.',
  insecure:
    'The microphone needs a secure (HTTPS) connection, so you are using the on-screen guitar.',
  unsupported: 'This browser cannot use the microphone, so you are using the on-screen guitar.',
};

export function MicNotice({
  mode,
  micError,
}: {
  mode: EngineMode | null;
  micError: MicFailure | null;
}) {
  if (mode === 'mic') {
    return (
      <p className="pill pill-good" role="status">
        <Icon name="mic" size={16} /> Listening through your microphone
      </p>
    );
  }
  return (
    <p className="pill pill-warn" role="status">
      <Icon name="guitar" size={16} /> {micError ? MESSAGES[micError] : 'On-screen guitar mode'}
    </p>
  );
}
