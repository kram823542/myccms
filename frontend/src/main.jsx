// import React from 'react';
// import ReactDOM from 'react-dom/client';
// import App from './App.jsx';

// ReactDOM.createRoot(document.getElementById('root')).render(
//   <React.StrictMode>
//     <App />
//   </React.StrictMode>
// );

import React from 'react';
import ReactDOM from 'react-dom/client';
import { Toaster } from 'react-hot-toast';
import App from './App.jsx';
import { theme } from './config/theme.js';
import './index.css';   // ✅ Tailwind CSS

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 3000,
        style: {
          background: theme.colors.toastSurface,
          color: theme.colors.textLight,
          fontSize: '13px',
          fontWeight: 600,
          border: `1px solid ${theme.colors.toastBorder}`,
          borderRadius: '10px',
        },
        success: {
          iconTheme: { primary: theme.colors.success, secondary: theme.colors.textLight },
        },
        error: {
          iconTheme: { primary: theme.colors.danger, secondary: theme.colors.textLight },
        },
      }}
    />
  </React.StrictMode>
);