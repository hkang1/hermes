export const THEME_BASE = {
  name: 'base',

  // Font styles.
  fontFamily: 'Inter, system-ui, Avenir, Helvetica, Arial, sans-serif',
  fontFamilyCode: 'monospace',

  // Palette colors for strong/weak calculations.
  strong: undefined,
  weak: undefined,

  // Brand colors.
  brand: 'rgba(247, 123, 33, 1.0)',
  brandStrong: undefined,
  brandWeak: undefined,

  // Area and surface styles.
  background: undefined,
  backgroundStrong: undefined,
  backgroundWeak: undefined,
  backgroundOn: undefined,
  backgroundOnStrong: undefined,
  backgroundOnWeak: undefined,
  backgroundBorder: undefined,
  backgroundBorderStrong: undefined,
  backgroundBorderWeak: undefined,
  stage: undefined,
  stageStrong: undefined,
  stageWeak: undefined,
  stageOn: undefined,
  stageOnStrong: undefined,
  stageOnWeak: undefined,
  stageBorder: undefined,
  stageBorderStrong: undefined,
  stageBorderWeak: undefined,
  surface: undefined,
  surfaceStrong: undefined,
  surfaceWeak: undefined,
  surfaceOn: undefined,
  surfaceOnStrong: undefined,
  surfaceOnWeak: undefined,
  surfaceBorder: undefined,
  surfaceBorderStrong: undefined,
  surfaceBorderWeak: undefined,
  float: undefined,
  floatStrong: undefined,
  floatWeak: undefined,
  floatOn: undefined,
  floatOnStrong: undefined,
  floatOnWeak: undefined,
  floatBorder: undefined,
  floatBorderStrong: undefined,
  floatBorderWeak: undefined,

  // Interactive styles.
  ix: undefined,
  ixStrong: undefined,
  ixWeak: undefined,
  ixActive: undefined,
  ixInactive: undefined,
  ixOn: undefined,
  ixOnStrong: undefined,
  ixOnWeak: undefined,
  ixOnActive: undefined,
  ixOnInactive: undefined,
  ixBorder: undefined,
  ixBorderStrong: undefined,
  ixBorderWeak: undefined,
  ixBorderActive: undefined,
  ixBorderInactive: undefined,

  // Specialized and unique styles.
  density: '2',
  targetFocus: '0px 0px 4px rgba(0, 155, 222, 0.12)',
  borderRadius: '4px',
  borderRadiusStrong: '8px',
  borderRadiusWeak: '2px',
  strokeWidth: '1px',
  strokeWidthStrong: '3px',
  strokeWidthWeak: '0.5px',
  elevation: undefined,
  elevationStrong: undefined,
  elevationWeak: undefined,
  overlay: undefined,
  overlayStrong: undefined,
  overlayWeak: undefined,

  // Status styles.
  statusActive: 'rgba(0, 155, 222, 1.0)',
  statusActiveStrong: undefined,
  statusActiveWeak: undefined,
  statusActiveOn: 'rgba(255, 255, 255, 1.0)',
  statusActiveOnStrong: undefined,
  statusActiveOnWeak: undefined,
  statusCritical: 'rgba(204, 0, 0, 1.0)',
  statusCriticalStrong: undefined,
  statusCriticalWeak: undefined,
  statusCriticalOn: 'rgba(255, 255, 255, 1.0)',
  statusCriticalOnStrong: undefined,
  statusCriticalOnWeak: undefined,
  statusInactive: 'rgba(102, 102, 102, 1.0)',
  statusInactiveStrong: undefined,
  statusInactiveWeak: undefined,
  statusInactiveOn: 'rgba(255, 255, 255, 1.0)',
  statusInactiveOnStrong: undefined,
  statusInactiveOnWeak: undefined,
  statusPending: 'rgba(102, 102, 204, 1.0)',
  statusPendingStrong: undefined,
  statusPendingWeak: undefined,
  statusPendingOn: 'rgba(255, 255, 255, 1.0)',
  statusPendingOnStrong: undefined,
  statusPendingOnWeak: undefined,
  statusPotential: 'rgba(255, 255, 255, 0)',
  statusSuccess: 'rgba(0, 153, 0, 1.0)',
  statusSuccessStrong: undefined,
  statusSuccessWeak: undefined,
  statusSuccessOn: 'rgba(255, 255, 255, 1.0)',
  statusSuccessOnStrong: undefined,
  statusSuccessOnWeak: undefined,
  statusWarning: 'rgba(204, 153, 0, 1.0)',
  statusWarningStrong: undefined,
  statusWarningWeak: undefined,
  statusWarningOn: 'rgba(255, 255, 255, 1.0)',
  statusWarningOnStrong: undefined,
  statusWarningOnWeak: undefined,
};

export const THEME_DARK = {
  name: 'dark',

  // Palette colors for strong/weak calculations.
  strong: 'rgba(255, 255, 255, 1.0)',
  weak: 'rgba(0, 0, 0, 1.0)',

  // Area and surface styles.
  background: 'rgba(21, 21, 23, 1.0)',
  backgroundOn: 'rgba(237, 237, 237, 1.0)',
  backgroundBorder: undefined,
  stage: 'rgba(35, 36, 38, 1.0)',
  stageOn: 'rgba(186, 186, 186, 1.0)',
  stageBorder: 'rgba(61, 61, 61, 1.0)',
  surface: 'rgba(48, 49, 50, 1.0)',
  surfaceOn: 'rgba(255, 247, 239, 1.0)',
  surfaceBorder: 'rgba(85, 85, 85, 1.0)',
  float: 'rgba(60, 61, 62, 1.0)',
  floatOn: 'rgba(206, 206, 206, 1.0)',
  floatBorder: 'rgba(90, 91, 92, 1.0)',

  // Interactive styles.
  ix: 'rgba(21, 21, 23, 1.0)',
  ixActive: 'rgba(17, 27, 38, 1.0)',
  ixInactive: 'rgba(49, 49, 49, 1.0)',
  ixOn: 'rgba(209, 209, 209, 1.0)',
  ixOnActive: 'rgba(23, 125, 220, 1.0)',
  ixOnInactive: 'rgba(80, 80, 80, 1.0)',
  ixBorder: 'rgba(67, 67, 67, 1.0)',
  ixBorderActive: 'rgba(23, 125, 220, 1.0)',
  ixBorderInactive: 'rgba(80, 80, 80, 1.0)',
  ixCancel: 'rgba(115,115,115,1)',

  // Specialized and unique styles.
  overlay: 'rgba(0, 0, 0, 0.75)',
  overlayStrong: 'rgba(0, 0, 0, 1.0)',
  overlayWeak: 'rgba(0, 0, 0, 0.5)',
  elevation: '0px 6px 12px rgba(255, 255, 255, 0.06)',
  elevationStrong: '0px 12px 24px rgba(255, 255, 255, 0.06)',
  elevationWeak: '0px 2px 4px rgba(255, 255, 255, 0.12)',
};

export const THEME_LIGHT = {
  name: 'light',

  // Palette colors for strong/weak calculations.
  strong: 'rgba(0, 0, 0, 1.0)',
  weak: 'rgba(255, 255, 255, 1.0)',

  // Area and surface styles.
  background: 'rgba(240, 240, 240, 1.0)',
  backgroundOn: 'rgba(18, 18, 18, 1.0)',
  backgroundBorder: undefined,
  stage: 'rgba(246, 246, 246, 1.0)',
  stageOn: 'rgba(69, 69, 69, 1.0)',
  stageBorder: 'rgba(194, 194, 194, 1.0)',
  surface: 'rgba(250, 250, 250, 1.0)',
  surfaceOn: 'rgba(0, 8, 16, 1.0)',
  surfaceBorder: 'rgba(212, 212, 212, 1.0)',
  float: 'rgba(255, 255, 255, 1.0)',
  floatOn: 'rgba(49, 49, 49, 1.0)',
  floatBorder: 'rgba(225, 225, 225, 1.0)',

  // Interactive styles.
  ix: 'rgba(255, 255, 255, 1.0)',
  ixActive: 'rgba(231, 247, 255, 1.0)',
  ixInactive: 'rgba(245, 245, 245, 1.0)',
  ixOn: 'rgba(38, 38, 38, 1.0)',
  ixOnActive: 'rgba(0, 155, 222, 1.0)',
  ixOnInactive: 'rgba(217, 217, 217, 1.0)',
  ixBorder: 'rgba(217, 217, 217, 1.0)',
  ixBorderActive: 'rgba(0, 155, 222, 1.0)',
  ixBorderInactive: 'rgba(217, 217, 217, 1.0)',
  ixCancel: 'rgba(89,89,89,1)',

  // Specialized and unique styles.
  overlay: 'rgba(255, 255, 255, 0.75)',
  overlayStrong: 'rgba(255, 255, 255, 1.0)',
  overlayWeak: 'rgba(255, 255, 255, 0.5)',
  elevation: '0px 6px 12px rgba(0, 0, 0, 0.12)',
  elevationStrong: '0px 12px 24px rgba(0, 0, 0, 0.12)',
  elevationWeak: '0px 2px 4px rgba(0, 0, 0, 0.24)',
};
