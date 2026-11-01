// import { Outlet } from 'react-router-dom';
// import { theme } from '../config/theme.js';

// export default function AuthLayout() {
//   return (
//     <div
//       style={{
//         minHeight: '100vh',
//         display: 'flex',
//         background: theme.colors.background || '#f1f5f9',
//         fontFamily: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
//         overflowX: 'hidden',
//       }}
//     >
//       {/* LEFT SIDE: Image & Branding (Desktop Only) */}
//       <div
//         className="auth-left-panel"
//         style={{
//           flex: '1.2',
//           display: 'none',
//           position: 'relative',
//           background: theme.colors.primary || '#0f172a',
//           overflow: 'hidden',
//           alignItems: 'center',
//           justifyContent: 'center',
//           padding: '48px',
//         }}
//       >
//         {/* ✅ WATERCOLOR IMAGE PRESERVED: /SHG.jpeg */}
//         <img
//           src="/SHG.jpeg"
//           alt="SHG Background"
//           style={{
//             position: 'absolute',
//             inset: 0,
//             width: '100%',
//             height: '100%',
//             objectFit: 'cover',
//             opacity: 0.85,
//             transition: 'transform 0.8s ease-in-out',
//           }}
//         />

//         {/* Gradient Overlay for Readability */}
//         <div
//           style={{
//             position: 'absolute',
//             inset: 0,
//             background: `linear-gradient(135deg, ${theme.colors.primary || '#0f172a'}D9 0%, ${theme.colors.primary || '#0f172a'}66 50%, rgba(0, 0, 0, 0.75) 100%)`,
//           }}
//         />

//         {/* Glassmorphic Branding Card */}
//         <div style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: 520 }}>
//           <div
//             className="brand-glass-card"
//             style={{
//               background: 'rgba(255, 255, 255, 0.12)',
//               backdropFilter: 'blur(16px)',
//               WebkitBackdropFilter: 'blur(16px)',
//               padding: '44px 36px',
//               borderRadius: '24px',
//               border: '1px solid rgba(255, 255, 255, 0.22)',
//               boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
//               textAlign: 'left',
//               color: theme.colors.surface || '#ffffff',
//             }}
//           >
//             <div
//               style={{
//                 display: 'inline-flex',
//                 alignItems: 'center',
//                 gap: '8px',
//                 padding: '6px 14px',
//                 borderRadius: '9999px',
//                 background: 'rgba(255, 255, 255, 0.18)',
//                 fontSize: '12px',
//                 fontWeight: 600,
//                 letterSpacing: '0.05em',
//                 textTransform: 'uppercase',
//                 marginBottom: '20px',
//                 border: '1px solid rgba(255, 255, 255, 0.25)',
//               }}
//             >
//               <span
//                 style={{
//                   width: '8px',
//                   height: '8px',
//                   borderRadius: '50%',
//                   background: '#10B981',
//                   boxShadow: '0 0 8px #10B981',
//                 }}
//               />
//               Official Portal
//             </div>

//             <h1
//               style={{
//                 color: theme.colors.surface || '#ffffff',
//                 fontSize: 'clamp(28px, 3.5vw, 42px)',
//                 fontWeight: 800,
//                 margin: '0 0 16px 0',
//                 lineHeight: 1.15,
//                 letterSpacing: '-0.02em',
//                 textShadow: '0 2px 10px rgba(0,0,0,0.2)',
//               }}
//             >
//               Satbarwa CLF
//             </h1>

//             <p
//               style={{
//                 color: `${theme.colors.surface || '#ffffff'}EE`,
//                 fontSize: '15px',
//                 lineHeight: 1.65,
//                 margin: 0,
//                 fontWeight: 400,
//               }}
//             >
//               Community Level Federation Management System. Streamline workforce operations, employee attendance, leaves tracking, and analytics reports all in one unified platform.
//             </p>
//           </div>
//         </div>
//       </div>

//       {/* RIGHT SIDE: Login Form / Outlet Container */}
//       <div
//         style={{
//           flex: 1,
//           display: 'flex',
//           flexDirection: 'column',
//           alignItems: 'center',
//           justifyContent: 'center',
//           padding: '32px 20px',
//           background: theme.colors.surface || '#ffffff',
//           position: 'relative',
//         }}
//       >
//         {/* Mobile Header */}
//         <div className="mobile-brand-header">
//           <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 800, color: theme.colors.primary || '#0f172a' }}>
//             Satbarwa CLF
//           </h2>
//           <p style={{ margin: '4px 0 0', fontSize: '13px', opacity: 0.7 }}>
//             Federation Management System
//           </p>
//         </div>

//         {/* Form Container */}
//         <div
//           style={{
//             width: '100%',
//             maxWidth: 420,
//             background: theme.colors.surface || '#ffffff',
//             padding: '20px 8px',
//             boxSizing: 'border-box',
//           }}
//         >
//           <Outlet />
//         </div>
//       </div>

//       <style>{`
//         @media (min-width: 900px) {
//           .auth-left-panel {
//             display: flex !important;
//           }
//           .mobile-brand-header {
//             display: none !important;
//           }
//         }

//         @media (max-width: 899px) {
//           .mobile-brand-header {
//             display: block;
//             text-align: center;
//             margin-bottom: 24px;
//           }
//         }
//       `}</style>
//     </div>
//   );
// }



// import { Outlet } from 'react-router-dom';
// import { theme } from '../config/theme.js';

// export default function AuthLayout() {
//   return (
//     <div
//       style={{
//         minHeight: '100vh',
//         display: 'flex',
//         background: theme.colors.background || '#f1f5f9',
//         fontFamily: "'Plus Jakarta Sans', 'Inter', system-ui, -apple-system, sans-serif",
//         overflowX: 'hidden',
//       }}
//     >
//       {/* ✅ Modern Google Font Import */}
//       <style>{`
//         @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
//       `}</style>

//       {/* LEFT SIDE: Image & Branding (Desktop Only) */}
//       <div
//         className="auth-left-panel"
//         style={{
//           flex: '1.2',
//           display: 'none',
//           position: 'relative',
//           background: theme.colors.primary || '#0f172a',
//           overflow: 'hidden',
//           alignItems: 'center',
//           justifyContent: 'center',
//           padding: '48px',
//         }}
//       >
//         <img
//           src="/SHG.jpeg"
//           alt="SHG Background"
//           style={{
//             position: 'absolute',
//             inset: 0,
//             width: '100%',
//             height: '100%',
//             objectFit: 'cover',
//             opacity: 0.85,
//             transition: 'transform 0.8s ease-in-out',
//           }}
//         />

//         {/* Gradient Overlay for Readability */}
//         <div
//           style={{
//             position: 'absolute',
//             inset: 0,
//             background: `linear-gradient(135deg, ${theme.colors.primary || '#0f172a'}E6 0%, ${theme.colors.primary || '#0f172a'}99 50%, rgba(0, 0, 0, 0.85) 100%)`,
//           }}
//         />

//         {/* Glassmorphic Branding Card */}
//         <div style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: 520 }}>
//           <div
//             className="brand-glass-card"
//             style={{
//               background: 'rgba(255, 255, 255, 0.1)',
//               backdropFilter: 'blur(20px)',
//               WebkitBackdropFilter: 'blur(20px)',
//               padding: '44px 36px',
//               borderRadius: '24px',
//               border: '1px solid rgba(255, 255, 255, 0.2)',
//               boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
//               textAlign: 'left',
//               color: theme.colors.surface || '#ffffff',
//             }}
//           >
//             <div
//               style={{
//                 display: 'inline-flex',
//                 alignItems: 'center',
//                 gap: '8px',
//                 padding: '6px 14px',
//                 borderRadius: '9999px',
//                 background: 'rgba(255, 255, 255, 0.15)',
//                 fontSize: '12px',
//                 fontWeight: 600,
//                 letterSpacing: '0.05em',
//                 textTransform: 'uppercase',
//                 marginBottom: '20px',
//                 border: '1px solid rgba(255, 255, 255, 0.2)',
//               }}
//             >
//               <span
//                 style={{
//                   width: '8px',
//                   height: '8px',
//                   borderRadius: '50%',
//                   background: '#10B981',
//                   boxShadow: '0 0 8px #10B981',
//                 }}
//               />
//               Official Portal
//             </div>

//             <h1
//               style={{
//                 color: theme.colors.surface || '#ffffff',
//                 fontSize: 'clamp(36px, 4vw, 52px)',
//                 fontWeight: 800,
//                 margin: '0 0 8px 0',
//                 lineHeight: 1.1,
//                 letterSpacing: '-0.02em',
//                 textShadow: '0 2px 10px rgba(0,0,0,0.2)',
//               }}
//             >
//               MYCCMS
//             </h1>

//             <h2
//               style={{
//                 color: `${theme.colors.surface || '#ffffff'}DD`,
//                 fontSize: '16px',
//                 fontWeight: 600,
//                 margin: '0 0 24px 0',
//                 letterSpacing: '0.01em',
//               }}
//             >
//               CLF Cadder Management System
//             </h2>

//             {/* ✅ NAYA: Impactful Description */}
//             <p
//               style={{
//                 color: `${theme.colors.surface || '#ffffff'}E6`,
//                 fontSize: '15px',
//                 lineHeight: 1.7,
//                 margin: '0 0 28px 0',
//                 fontWeight: 400,
//               }}
//             >
//               A digital ecosystem designed to empower women and strengthen Community Level Federations (CLFs). We streamline workforce operations, track employee progress, manage attendance, and provide deep analytical reports—all in one unified, transparent platform to foster rural livelihood and growth.
//             </p>

//             {/* ✅ NAYA: Social Media Icons */}
//             <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
//               {/* Facebook */}
//               <a href="#" style={{ color: '#ffffff', opacity: 0.8, transition: 'opacity 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.opacity = 1} onMouseLeave={(e) => e.currentTarget.style.opacity = 0.8}>
//                 <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
//               </a>
//               {/* Twitter / X */}
//               <a href="#" style={{ color: '#ffffff', opacity: 0.8, transition: 'opacity 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.opacity = 1} onMouseLeave={(e) => e.currentTarget.style.opacity = 0.8}>
//                 <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
//               </a>
//               {/* Instagram */}
//               <a href="#" style={{ color: '#ffffff', opacity: 0.8, transition: 'opacity 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.opacity = 1} onMouseLeave={(e) => e.currentTarget.style.opacity = 0.8}>
//                 <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" /></svg>
//               </a>
//               {/* LinkedIn */}
//               <a href="#" style={{ color: '#ffffff', opacity: 0.8, transition: 'opacity 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.opacity = 1} onMouseLeave={(e) => e.currentTarget.style.opacity = 0.8}>
//                 <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
//               </a>
//             </div>

//           </div>
//         </div>
//       </div>

//       {/* RIGHT SIDE: Login Form / Outlet Container */}
//       <div
//         style={{
//           flex: 1,
//           display: 'flex',
//           flexDirection: 'column',
//           alignItems: 'center',
//           justifyContent: 'center',
//           padding: '32px 20px',
//           background: theme.colors.surface || '#ffffff',
//           position: 'relative',
//         }}
//       >
//         {/* Mobile Header */}
//         <div className="mobile-brand-header">
//           <h2 style={{ 
//             margin: 0, 
//             fontSize: '34px', 
//             fontWeight: 800, 
//             color: theme.colors.primary || '#0f172a',
//             letterSpacing: '-0.02em',
//             fontFamily: "'Plus Jakarta Sans', sans-serif"
//           }}>
//             MYCCMS
//           </h2>
//           <p style={{ 
//             margin: '4px 0 0', 
//             fontSize: '13px', 
//             opacity: 0.7,
//             fontWeight: 600,
//             letterSpacing: '0.01em',
//             fontFamily: "'Plus Jakarta Sans', sans-serif"
//           }}>
//             CLF Cadder Management System
//           </p>
//         </div>

//         {/* Form Container */}
//         <div
//           style={{
//             width: '100%',
//             maxWidth: 420,
//             background: theme.colors.surface || '#ffffff',
//             padding: '20px 8px',
//             boxSizing: 'border-box',
//           }}
//         >
//           <Outlet />
//         </div>
//       </div>

//       <style>{`
//         @media (min-width: 900px) {
//           .auth-left-panel {
//             display: flex !important;
//           }
//           .mobile-brand-header {
//             display: none !important;
//           }
//         }

//         @media (max-width: 899px) {
//           .mobile-brand-header {
//             display: block;
//             text-align: center;
//             margin-bottom: 24px;
//           }
//         }
//       `}</style>
//     </div>
//   );
// }


import { Outlet } from 'react-router-dom';
import { theme } from '../config/theme.js';

export default function AuthLayout() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        background: theme.colors.background || '#f8fafc',
        fontFamily: "'Fredoka', 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
        overflowX: 'hidden',
      }}
    >
      {/* Google Font (Fredoka) & Italic Styling */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600;1,700&display=swap');
        
        .social-icon {
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .social-icon:hover {
          transform: translateY(-2px);
          opacity: 1 !important;
          color: ${theme.colors.primary || '#38bdf8'} !important;
        }

        /* Italic font applied to all headings and brand titles */
        .brand-title, h1, h2 {
          font-family: 'Fredoka', sans-serif !important;
          font-style: italic !important;
        }
      `}</style>

      {/* LEFT SIDE: Image & Branding (Desktop Only) */}
      <div
        className="auth-left-panel"
        style={{
          flex: '1.25',
          display: 'none',
          position: 'relative',
          background: theme.colors.primary || '#090d16',
          overflow: 'hidden',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '48px',
        }}
      >
        <img
          src="/SHG.jpeg"
          alt="SHG Background"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: 0.55,
            filter: 'contrast(1.05) saturate(1.1)',
            transform: 'scale(1.02)',
          }}
        />

        {/* Gradient Overlay using theme colors */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `linear-gradient(135deg, ${theme.colors.primary || '#0f172a'}F2 0%, ${theme.colors.primary || '#0f172a'}BF 60%, ${theme.colors.primary || '#0f172a'}E0 100%)`,
          }}
        />

        {/* Glassmorphic Branding Card */}
        <div style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: 520 }}>
          <div
            className="brand-glass-card"
            style={{
              background: 'rgba(15, 23, 42, 0.45)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              padding: '44px 38px',
              borderRadius: '24px',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
              textAlign: 'left',
              color: theme.colors.surface || '#ffffff',
            }}
          >
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 14px',
                borderRadius: '9999px',
                background: 'rgba(56, 189, 248, 0.15)',
                fontSize: '11.5px',
                fontWeight: 600,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                marginBottom: '22px',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                color: theme.colors.accent || '#38bdf8',
                fontStyle: 'italic',
              }}
            >
              <span
                style={{
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  background: theme.colors.success || '#34d399',
                  boxShadow: `0 0 10px ${theme.colors.success || '#34d399'}`,
                }}
              />
              Official Portal Ecosystem
            </div>

            <h1
              style={{
                color: theme.colors.surface || '#ffffff',
                fontSize: 'clamp(36px, 4vw, 50px)',
                fontWeight: 700,
                margin: '0 0 6px 0',
                lineHeight: 1.1,
                letterSpacing: '0.02em',
              }}
            >
              MYCCMS
            </h1>

            <h2
              style={{
                color: theme.colors.accent || '#38bdf8',
                fontSize: '14.5px',
                fontWeight: 600,
                margin: '0 0 22px 0',
                letterSpacing: '0.03em',
                textTransform: 'uppercase',
              }}
            >
              Cluster Level Federation Management System
            </h2>

            {/* Crisp Readable Description */}
            <p
              style={{
                color: 'rgba(255, 255, 255, 0.85)',
                fontSize: '14.5px',
                lineHeight: 1.7,
                margin: '0 0 30px 0',
                fontWeight: 400,
                fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}
            >
              A digital ecosystem designed to empower women and strengthen <strong style={{ color: '#fff', fontWeight: 600 }}>Cluster Level Federations (CLFs)</strong>. We streamline workforce operations, track employee progress, manage attendance, and provide deep analytical reports—all in one unified, transparent platform to foster rural livelihood and growth.
            </p>

            {/* Social Media Icons */}
            <div style={{ display: 'flex', gap: 18, alignItems: 'center', borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '20px' }}>
              <a href="#" className="social-icon" style={{ color: theme.colors.surface || '#ffffff', opacity: 0.7, display: 'flex' }}>
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
              </a>
              <a href="#" className="social-icon" style={{ color: theme.colors.surface || '#ffffff', opacity: 0.7, display: 'flex' }}>
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
              </a>
              <a href="#" className="social-icon" style={{ color: theme.colors.surface || '#ffffff', opacity: 0.7, display: 'flex' }}>
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" /></svg>
              </a>
              <a href="#" className="social-icon" style={{ color: theme.colors.surface || '#ffffff', opacity: 0.7, display: 'flex' }}>
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
              </a>
            </div>

          </div>
        </div>
      </div>

      {/* RIGHT SIDE: Login Form / Outlet Container */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '32px 24px',
          background: theme.colors.surface || '#ffffff',
          position: 'relative',
        }}
      >
        {/* Mobile Header */}
        <div className="mobile-brand-header" style={{ textAlign: 'center', marginBottom: '20px' }}>
          <h2 style={{ 
            margin: 0, 
            fontSize: '32px', 
            fontWeight: 700, 
            color: theme.colors.text || '#0f172a',
            letterSpacing: '0.02em',
          }}>
            MYCCMS
          </h2>
          <p style={{ 
            margin: '6px 0 0', 
            fontSize: '11.5px', 
            color: theme.colors.muted || '#64748b',
            fontWeight: 600,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            fontFamily: "'Plus Jakarta Sans', sans-serif"
          }}>
            Cluster Level Federation Management System
          </p>
        </div>

        {/* Form Container */}
        <div
          style={{
            width: '100%',
            maxWidth: 420,
            background: theme.colors.surface || '#ffffff',
            padding: '16px 4px',
            boxSizing: 'border-box',
          }}
        >
          <Outlet />
        </div>
      </div>

      <style>{`
        @media (min-width: 900px) {
          .auth-left-panel {
            display: flex !important;
          }
          .mobile-brand-header {
            display: none !important;
          }
        }

        @media (max-width: 899px) {
          .mobile-brand-header {
            display: block;
            text-align: center;
            margin-bottom: 28px;
          }
        }
      `}</style>
    </div>
  );
}