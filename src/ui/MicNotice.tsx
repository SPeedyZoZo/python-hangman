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

const SHORT: Record<MicFailure, string> = {
  denied: 'Mic blocked: on-screen guitar',
  unavailable: 'No mic: on-screen guitar',
  insecure: 'Mic needs HTTPS: on-screen guitar',
  unsupported: 'No mic support: on-screen guitar',
};

/** Mic status pill. `compact` is used in the player, where screen space on phones is precious. */
export function MicNotice({
  mode,
  micError,
  compact = false,
}: {
  mode: EngineMode | null;
  micError: MicFailure | null;
  compact?: boolean;
}) {
  if (mode === 'mic') {
    return (
      <p className="pill pill-good" role="status">
        <Icon name="mic" size={16} /> {compact ? 'Mic on' : 'Listening through your microphone'}
      </p>
    );
  }
  const long = micError ? MESSAGES[micError] : 'On-screen guitar mode';
  return (
    <p className="pill pill-warn" role="status" title={long}>
      <Icon name="guitar" size={16} />{' '}
      {compact ? (micError ? SHORT[micError] : 'On-screen guitar mode') : long}
    </p>
  );
}
