export const Theme = {
  colors: {
    background: '#FFFFFF',          // 60% Dominant: Clean crisp white background
    backgroundSecondary: '#F8F9FA', // Subtle off-white for sections/elevations
    surface: '#FFFFFF',             // Clean white card surfaces
    surfaceElevated: '#F3F4F6',     // Soft light elevated surfaces
    surfaceGlass: 'rgba(255, 255, 255, 0.95)',
    surfaceCard: '#FFFFFF',
    border: '#E5E7EB',              // Subtle clean light border
    borderLight: '#F3F4F6',

    primary: '#E11D48',             // 30% Secondary: Vibrant crimson red (brand, active nav, primary accents)
    primaryLight: '#FB7185',        // Soft red
    primaryDark: '#BE123C',         // Deep red

    secondary: '#FF7A00',           // 10% Accent: Warm electric orange (CTAs, rewards, highlights)
    accent: '#FF7A00',              // Warm Orange
    highlightStart: '#E11D48',      // Red
    highlightEnd: '#FF7A00',        // Orange

    cyan: '#E11D48',
    violet: '#E11D48',
    rose: '#E11D48',
    amber: '#FF7A00',
    emerald: '#10B981',             // Success state

    warning: '#FF7A00',             // Warm orange
    warningLight: '#FED7AA',
    success: '#10B981',             // Emerald Green
    danger: '#E11D48',              // Red

    coin: '#FF7A00',                // 10% Warm orange for coins and rewards
    coinLight: '#FED7AA',
    coinBg: 'rgba(255, 122, 0, 0.1)',
    coinBorder: 'rgba(255, 122, 0, 0.35)',

    text: '#111827',                // High-contrast primary dark typography on white
    textSecondary: '#4B5563',       // Secondary gray text
    textMuted: '#9CA3AF',           // Muted light gray text
    textInverse: '#FFFFFF',

    overlay: 'rgba(17, 24, 39, 0.55)',
    cardGlow: 'rgba(225, 29, 72, 0.12)',
    cardGlowOrange: 'rgba(255, 122, 0, 0.2)',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 40,
  },
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    full: 9999,
  },
  typography: {
    fontFamilies: {
      regular: 'System',
      medium: 'System',
      bold: 'System',
    },
  },
};
