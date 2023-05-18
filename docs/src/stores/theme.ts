import { observable, Observable, WritableObservable } from 'micro-observables';

import { THEME_BASE, THEME_DARK, THEME_LIGHT } from '@/constants/theme';
import { ValueOf } from '@/types';
import {
  generateStrongWeak,
  getDarkLight,
  getSystemMode,
  MATCH_MEDIA_SCHEME_DARK,
  MATCH_MEDIA_SCHEME_LIGHT,
} from '@/utils/theme';

export const Mode = {
  Dark: 'dark',
  Light: 'light',
  System: 'system',
} as const;

export type Mode = ValueOf<typeof Mode>;

/**
 * DarkLight is a resolved form of `Mode` where we figure out
 * what `Mode.System` should ultimate resolve to (`Dark` vs `Light).
 */
export const DarkLight = {
  Dark: 'dark',
  Light: 'light',
} as const;

export type DarkLight = ValueOf<typeof DarkLight>;

export type Theme = Record<keyof typeof THEME_BASE, string>;

const themeDark: Theme = generateStrongWeak(
  Object.assign({}, THEME_BASE, THEME_DARK),
);

const themeLight: Theme = generateStrongWeak(
  Object.assign({}, THEME_BASE, THEME_LIGHT),
);

class ThemeStore {
  #systemMode: WritableObservable<Mode> = observable(getSystemMode());
  #userMode: WritableObservable<Mode> = observable(Mode.System);

  public readonly darkLight = Observable.select(
    [ this.#userMode, this.#systemMode ],
    (userMode, systemMode) => getDarkLight(userMode, systemMode),
  );

  public readonly theme = this.darkLight.select((darkLight) => {
    return darkLight === DarkLight.Dark ? themeDark : themeLight;
  });

  constructor() {
    matchMedia?.(MATCH_MEDIA_SCHEME_DARK).addEventListener(
      'change',
      this.handleSchemeChange.bind(this),
    );
    matchMedia?.(MATCH_MEDIA_SCHEME_LIGHT).addEventListener(
      'change',
      this.handleSchemeChange.bind(this),
    );
  }

  protected handleSchemeChange(event: MediaQueryListEvent) {
    if (!event.matches) this.#systemMode.set(getSystemMode());
  }
}

export default new ThemeStore();
