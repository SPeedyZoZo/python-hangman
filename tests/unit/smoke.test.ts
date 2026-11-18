import { describe, expect, it } from 'vitest';
import { App } from '../../src/app/App.tsx';

describe('scaffold', () => {
  it('exports the App component', () => {
    expect(typeof App).toBe('function');
  });
});
