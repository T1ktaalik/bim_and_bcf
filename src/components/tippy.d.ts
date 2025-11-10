import { Instance } from 'tippy.js';

declare global {
  interface HTMLElement {
    _tippy?: Instance;
  }
}

export {};