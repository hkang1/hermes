import { DarkLight, Mode, Theme } from '@/stores/theme';
import { RecordKey } from '@/types';
import { isColor, rgba2str, rgbaMix, str2rgba } from '@/utils/color';

import { camelCaseToKebab } from './string';

const STRONG_WEAK_DELTA = 25;

export const MATCH_MEDIA_SCHEME_DARK = '(prefers-color-scheme: dark)';
export const MATCH_MEDIA_SCHEME_LIGHT = '(prefers-color-scheme: light)';

export function generateStrongWeak(theme: Theme): Theme {
  const rgbaStrong = str2rgba(theme.strong);
  const rgbaWeak = str2rgba(theme.weak);

  for (const [ key, value ] of Object.entries(theme)) {
    const matches = key.match(/^(.+)(Strong|Weak)$/);
    if (matches?.length === 3 && value === undefined) {
      const isStrong = matches[2] === 'Strong';
      const baseKey = matches[1] as keyof Theme;
      const baseValue = theme[baseKey];
      if (baseValue && isColor(baseValue)) {
        const rgba = str2rgba(baseValue);
        const mixer = isStrong ? rgbaStrong : rgbaWeak;
        theme[key as keyof Theme] = rgba2str(
          rgbaMix(rgba, mixer, STRONG_WEAK_DELTA),
        );
      }
    }
  }

  return theme as Theme;
}

export function getCssVar(name: string): string {
  const varName = name.replace(/^(var\()?(.*?)\)?$/i, '$2');
  return window.getComputedStyle(document.body)?.getPropertyValue(varName);
}

export const getDarkLight = (mode: Mode, systemMode: Mode): DarkLight => {
  const resolvedMode =
    mode === Mode.System
      ? systemMode === Mode.System
        ? Mode.Light
        : systemMode
      : mode;
  return resolvedMode === Mode.Light ? DarkLight.Light : DarkLight.Dark;
};

export function getSystemMode(): Mode {
  const isDark = matchMedia?.(MATCH_MEDIA_SCHEME_DARK).matches;
  if (isDark) return Mode.Dark;

  const isLight = matchMedia?.(MATCH_MEDIA_SCHEME_LIGHT).matches;
  if (isLight) return Mode.Light;

  return Mode.System;
}

export function setThemeCssVars(theme: Theme) {
  Object.keys(theme).forEach((key) => {
    document.documentElement.style.setProperty(
      `--theme-${camelCaseToKebab(key)}`,
      (theme as Record<RecordKey, string>)[key],
    );
  });
}
