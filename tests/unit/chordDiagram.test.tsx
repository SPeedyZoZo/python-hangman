// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { ChordDiagram } from '../../src/ui/ChordDiagram.tsx';

afterEach(cleanup);

describe('ChordDiagram (FR-CHD-1, FR-SET-1)', () => {
  it('describes the shape for screen readers', () => {
    render(<ChordDiagram id="Am" />);
    const img = screen.getByRole('img');
    expect(img.getAttribute('aria-label')).toBe(
      'A minor chord: string 6 muted, string 5 open, string 4 fret 2 finger 2, string 3 fret 2 finger 3, string 2 fret 1 finger 1, string 1 open',
    );
  });

  it('mirrors for left-handed players', () => {
    const xOfMute = (lefty: boolean) => {
      const { container } = render(<ChordDiagram id="Am" lefty={lefty} />);
      const mute = [...container.querySelectorAll('text.cd-mark')].find(
        (t) => t.textContent === '×',
      )!;
      const x = Number(mute.getAttribute('x'));
      cleanup();
      return x;
    };
    // The muted low E is on the left for right-handers and on the right for left-handers.
    expect(xOfMute(false)).toBeLessThan(60);
    expect(xOfMute(true)).toBeGreaterThan(60);
  });

  it('shows finger numbers', () => {
    const { container } = render(<ChordDiagram id="D" />);
    const fingers = [...container.querySelectorAll('text.cd-finger')].map((t) => t.textContent);
    expect(fingers).toEqual(['1', '3', '2']);
  });
});
