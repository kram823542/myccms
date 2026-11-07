import { theme } from '../../config/theme.js';

export default function ResponsiveTable({ children, minWidth = 800 }) {
  return (
    <div
      style={{
        background: theme.colors.surface,
        borderRadius: theme.radius.md,
        boxShadow: theme.shadow.sm,
        width: '100%',
        maxWidth: '100%',
        overflowX: 'auto',
        overflowY: 'hidden',
        WebkitOverflowScrolling: 'touch',
      }}
      className="responsive-table-wrap"
    >
      <style>{`
        .responsive-table-wrap { scrollbar-width: thin; scrollbar-color: ${theme.colors.muted}40 transparent; }
        .responsive-table-wrap::-webkit-scrollbar { height: 6px; }
        .responsive-table-wrap::-webkit-scrollbar-track { background: transparent; }
        .responsive-table-wrap::-webkit-scrollbar-thumb { background: ${theme.colors.muted}40; border-radius: 3px; }
        .responsive-table { width: 100%; border-collapse: collapse; font-size: 14px; min-width: ${minWidth}px; }
        .responsive-table th, .responsive-table td { white-space: nowrap; }
      `}</style>
      <table className="responsive-table">{children}</table>
    </div>
  );
}
