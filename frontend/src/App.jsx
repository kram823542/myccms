// import { BrowserRouter } from 'react-router-dom';
// import AppRouter from './app/router.jsx';
// import { theme } from './config/theme.js';

// export default function App() {
//   // Inject theme CSS variables globally
//   const cssVars = Object.entries(theme.colors)
//     .map(([key, val]) => `--color-${key}: ${val};`)
//     .join('\n');

//   return (
//     <>
//       <style>{`:root { ${cssVars} }`}</style>
//       <BrowserRouter>
//         <AppRouter />
//       </BrowserRouter>
//     </>
//   );
// }

import { BrowserRouter } from 'react-router-dom';
import AppRouter from './app/router.jsx';
import { theme } from './config/theme.js';

export default function App() {
  // Inject theme CSS variables globally
  const cssVars = Object.entries(theme.colors)
    .map(([key, val]) => `--color-${key}: ${val};`)
    .join('\n');

  return (
    <>
      <style>{`
        :root { ${cssVars} }
        body { margin: 0; font-family: system-ui, sans-serif; }

        /*  Floating sidebar offset for content */
        .clf-content {
          margin-left: 96px;
          transition: margin-left 0.3s ease;
        }
        body[data-sidebar="expanded"] .clf-content {
          margin-left: 242px;
        }
        @media (max-width: 900px) {
          .clf-content { margin-left: 0 !important; }
        }
      `}</style>
      <BrowserRouter>
        <AppRouter />
      </BrowserRouter>
    </>
  );
}