export const theme = {
  colors: {
    //  PRIMARY & SECONDARY (Wine Red & Cocoa Brown)
    primary: '#7F011F',       // Deep Wine Red: Sidebar Active, Main Headers, Primary Buttons
    secondary: '#704214',     // Cocoa Brown: Secondary Buttons, Action Highlights
    accent: '#D4A373',        // Warm Gold: Badges, Star ratings, subtle icons

    //  BACKGROUND COLORS
    background: '#FDFBF7',    // Soothing Off-White: Har page ka main background
    surface: '#FFFFFF',       // Pure White: Cards, Tables, Modals (Clean look)
    surfaceAlt: '#F5EBD0',
    cardBg: '#F5EBD0',        // Light Sand: Inner cards, summary sections (Premium touch)

    //  TEXT COLORS
    text: '#1A1513',          // Dark Espresso: Main text (High legibility aur crisp)
    muted: '#7A6E67',         // Warm Grey: Subtitles, labels, hints
    textLight: '#FFFFFF',     // Pure White: Jab Wine/Brown background par text likhna ho
    codeSurface: '#F1F5F9',
    toastSurface: '#1A1513',
    toastBorder: '#3D3632',
    overlay: 'rgba(26, 21, 19, 0.6)',
    overlayStrong: 'rgba(26, 21, 19, 0.75)',
    overlaySubtle: 'rgba(26, 21, 19, 0.08)',

    //  STATUS COLORS
    success: '#10B981',       // Vibrant Green
    successSurface: '#DCFCE7',
    warning: '#F59E0B',       // Amber Gold
    danger: '#EF4444',        // Crimson Red
    dangerSurface: '#FEE2E2',
    info: '#3B82F6',          // Cyan Blue

    //  BORDERS & SIDEBAR
    border: '#EFE9DF',        // Soft warm border
    sidebarBg: '#FFFFFF',     // Sidebar Background (White)
    sidebarText: '#1A1513',   // Sidebar Text
    sidebarActive: '#7F011F', // Sidebar Highlight (Wine Red)

    //  BOTTOM BAR COLORS (Mobile Navigation)
    bbDarkBrown: '#704214',   // Cocoa Brown (Bottom bar bg)
    bbLightLilac: '#FDFBF7',  // Off-White (Bottom bar text/icons)
    bbIndigo: '#7F011F',      // Wine Red (Bottom bar active state)
    bbLightCream: '#F5EBD0',  // Light Sand
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
    sm: '0 1px 3px rgba(127, 1, 31, 0.05)',
    md: '0 4px 6px -1px rgba(112, 66, 20, 0.08), 0 2px 4px -1px rgba(112, 66, 20, 0.04)',
    lg: '0 10px 15px -3px rgba(127, 1, 31, 0.1), 0 4px 6px -2px rgba(127, 1, 31, 0.05)',
  },
};