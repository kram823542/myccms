export const theme = {
  colors: {
    // PRIMARY & SECONDARY
    primary: '#7F011F',
    secondary: '#061235',
    accent: '#D4A373',

    // BACKGROUND COLORS
    background: 'var(--bg-color)',
    surface: 'var(--surface-color)',
    surfaceAlt: 'var(--surface-color)',
    cardBg: 'var(--surface-color)',

    // TEXT COLORS
    text: 'var(--text-color)',
    muted: 'var(--text-muted)',
    textLight: '#FFFFFF',
    codeSurface: 'var(--bg-color)',
    toastSurface: 'var(--surface-color)',
    toastBorder: 'var(--border-color)',
    overlay: 'rgba(0, 0, 0, 0.5)',
    overlayStrong: 'rgba(0, 0, 0, 0.7)',
    overlaySubtle: 'rgba(0, 0, 0, 0.05)',

    // STATUS COLORS
    success: '#10B981',
    successSurface: 'var(--surface-color)',
    warning: '#F59E0B',
    danger: '#EF4444',
    dangerSurface: 'var(--surface-color)',
    info: '#3B82F6',

    // BORDERS & SIDEBAR
    border: 'var(--border-color)',
    sidebarBg: 'var(--surface-color)',
    sidebarText: 'var(--text-color)',
    sidebarActive: '#7F011F',

    // BOTTOM BAR COLORS
    bbDarkBrown: '#704214',
    bbLightLilac: 'var(--bg-color)',
    bbIndigo: '#7F011F',
    bbLightCream: 'var(--bg-color)',
    
    // PRINT COLORS (Fixed)
    printText: '#000000',
    printSurface: '#FFFFFF',
    printBorder: '#000000',
    printHeader: '#F3F4F6',
    printTotal: '#F9FAFB',
    printPreview: '#D1D5DB',
    printAccentGreen: '#82C828',
    printAccentOrange: '#E05A10',
  },
  radius: {
    sm: '8px',
    md: '12px',
    lg: '18px',
  },
  spacing: (n) => `${n * 4}px`,
  shadow: {
    sm: '0 1px 3px rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.08)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
  },
};