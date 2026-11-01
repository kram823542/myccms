// export const theme = {
//   colors: {
//     primary: '#16081b',       // Deep Forest Teal (Trustworthy, rich & premium)
//     secondary: '#0B6E4F',     // Emerald Mint (Actionable & dynamic)
//     accent: '#D4A373',        // Warm Champagne Gold (Subtle accent/badges)

//     background: '#F3F5F4',    // Very soft Cool Mint Grey (Modern subtle backdrop)
//     surface: '#faf6f9',       // Clean White Cards

//     text: '#121311',          // Deep Obsidian Charcoal (High legibility)
//     muted: '#526058',         // Slate Sage (Elegant subtitles/labels)

//     success: '#16A34A',       // Vibrant Green
//     warning: '#D97706',       // Amber Gold
//     danger: '#DC2626',        // Crimson Red
//     info: '#0284C7',          // Cyan Blue

//     border: '#0aaa5a',        // Soft Mineral Border
//     sidebarBg: '#faf6f9',     // Ultra Deep Midnight Teal
//     sidebarText: '#500c41',   // Soft Sage Text
//     sidebarActive: '#3a2338', // Deep Teal Highlight

//     // ✅ NAYA: BottomBar ke liye special colors
//     bbDarkBrown: '#3d3a35',
//     bbLightLilac: '#F4EFF6',
//     bbIndigo: '#474C80',
//     bbLightCream: '#F8F7E2',
//   },
//   radius: {
//     sm: '8px',
//     md: '12px',
//     lg: '18px',
//   },
//   spacing: (n) => `${n * 4}px`,
//   shadow: {
//     sm: '0 2px 4px rgba(9, 35, 39, 0.04)',
//     md: '0 6px 16px rgba(9, 35, 39, 0.07)',
//     lg: '0 16px 32px rgba(9, 35, 39, 0.10)',
//   },
// };

// export const theme = {
//   colors: {
//     // ✅ PRIMARY & SECONDARY (Deep Wine & Cocoa)
//     primary: '#7F011F',       // Deep Wine Red: Sidebar Active, Main Headers, Primary Buttons
//     secondary: '#704214',     // Cocoa Brown: Secondary Buttons, Action Highlights
//     accent: '#BC9980',        // Soft Sand (From image 8): Badges, Active borders

//     // ✅ BACKGROUND COLORS (Light & Soothing)
//     background: '#F5EBD0',    // Light Sand: Har page ka main background (Very soft on eyes)
//     surface: '#FFFFFF',       // Pure White: Cards, Tables, Modals ke liye (Professional look)
//     cardBg: '#FFF3E6',        // Apricot Cream: Inner cards, special sections ke liye

//     // ✅ TEXT COLORS
//     text: '#381932',          // Dark Plum: Main text (High contrast, easy to read)
//     muted: '#4C4638',         // Dark Olive (From image 8): Subtitles, labels, hints
//     textLight: '#F5EBD0',     // Light Sand: Jab Wine/Brown background par text likhna ho

//     // ✅ STATUS COLORS (Standard professional colors)
//     success: '#10B981',       // Vibrant Green
//     warning: '#F59E0B',       // Amber Gold
//     danger: '#EF4444',        // Crimson Red
//     info: '#0284C7',          // Cyan Blue

//     // ✅ BORDERS & SIDEBAR
//     border: '#EADBC8',        // Soft Sand Border: Cards aur sections ko divide karne ke liye
//     sidebarBg: '#FFFFFF',     // Sidebar Background (Clean White)
//     sidebarText: '#381932',   // Sidebar Text (Dark Plum)
//     sidebarActive: '#7F011F', // Sidebar Highlight (Deep Wine)

//     // ✅ BOTTOM BAR COLORS (Mobile Navigation)
//     bbDarkBrown: '#704214',   // Cocoa Brown (Bottom bar bg)
//     bbLightLilac: '#F5EBD0',  // Light Sand (Bottom bar text/icons)
//     bbIndigo: '#7F011F',      // Wine Red (Bottom bar active state)
//     bbLightCream: '#FFF3E6',  // Apricot Cream 
//   },
//   radius: {
//     sm: '8px',
//     md: '12px',
//     lg: '18px',
//   },
//   spacing: (n) => `${n * 4}px`,
//   shadow: {
//     // Shadows ko soft rakha hai taaki professional look aaye
//     sm: '0 1px 3px rgba(127, 1, 31, 0.05)',
//     md: '0 4px 6px -1px rgba(112, 66, 20, 0.1), 0 2px 4px -1px rgba(112, 66, 20, 0.06)',
//     lg: '0 10px 15px -3px rgba(112, 66, 20, 0.1), 0 4px 6px -2px rgba(112, 66, 20, 0.05)',
//   },
// };

export const theme = {
  colors: {
    // ✅ PRIMARY & SECONDARY (Wine Red & Cocoa Brown)
    primary: '#7F011F',       // Deep Wine Red: Sidebar Active, Main Headers, Primary Buttons
    secondary: '#704214',     // Cocoa Brown: Secondary Buttons, Action Highlights
    accent: '#D4A373',        // Warm Gold: Badges, Star ratings, subtle icons

    // ✅ BACKGROUND COLORS
    background: '#FDFBF7',    // Soothing Off-White: Har page ka main background
    surface: '#FFFFFF',       // Pure White: Cards, Tables, Modals (Clean look)
    cardBg: '#F5EBD0',        // Light Sand: Inner cards, summary sections (Premium touch)

    // ✅ TEXT COLORS
    text: '#1A1513',          // Dark Espresso: Main text (High legibility aur crisp)
    muted: '#7A6E67',         // Warm Grey: Subtitles, labels, hints
    textLight: '#FFFFFF',     // Pure White: Jab Wine/Brown background par text likhna ho

    // ✅ STATUS COLORS
    success: '#10B981',       // Vibrant Green
    warning: '#F59E0B',       // Amber Gold
    danger: '#EF4444',        // Crimson Red
    info: '#3B82F6',          // Cyan Blue

    // ✅ BORDERS & SIDEBAR
    border: '#EFE9DF',        // Soft warm border
    sidebarBg: '#FFFFFF',     // Sidebar Background (White)
    sidebarText: '#1A1513',   // Sidebar Text
    sidebarActive: '#7F011F', // Sidebar Highlight (Wine Red)

    // ✅ BOTTOM BAR COLORS (Mobile Navigation)
    bbDarkBrown: '#704214',   // Cocoa Brown (Bottom bar bg)
    bbLightLilac: '#FDFBF7',  // Off-White (Bottom bar text/icons)
    bbIndigo: '#7F011F',      // Wine Red (Bottom bar active state)
    bbLightCream: '#F5EBD0',  // Light Sand
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