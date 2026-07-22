import React from 'react';

const paths = {
  dashboard: <><rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/></>,
  books: <><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z"/></>,
  categories: <><path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z"/></>,
  orders: <><path d="M6 3h12l2 4v14H4V7l2-4Z"/><path d="M4 7h16M9 11h6"/></>,
  users: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></>,
  carousel: <><rect x="3" y="5" width="18" height="14" rx="3"/><circle cx="8" cy="10" r="2"/><path d="m21 15-5-5L5 19"/></>,
  search: <><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></>,
  plus: <><path d="M12 5v14M5 12h14"/></>,
  menu: <><path d="M4 7h16M4 12h16M4 17h16"/></>,
  close: <><path d="m6 6 12 12M18 6 6 18"/></>,
  edit: <><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L8 18l-4 1 1-4Z"/></>,
  arrow: <><path d="m9 18 6-6-6-6"/></>,
  store: <><path d="M4 10v10h16V10"/><path d="M3 4h18l-2 6H5L3 4Z"/><path d="M8 20v-6h4v6"/></>,
  back: <><path d="M19 12H5"/><path d="m11 18-6-6 6-6"/></>,
  inventory: <><path d="m21 8-9-5-9 5 9 5 9-5Z"/><path d="m3 8 9 5v9l-9-5V8Z"/><path d="m21 8-9 5v9l9-5V8Z"/></>,
  revenue: <><circle cx="12" cy="12" r="9"/><path d="M8 8h8M12 8v9M9 12h6"/></>,
  trend: <><path d="M3 20h18"/><path d="m5 16 4-5 4 3 6-8"/></>,
  alert: <><path d="M10.3 3.5 2.7 17a2 2 0 0 0 1.8 3h15a2 2 0 0 0 1.8-3L13.7 3.5a2 2 0 0 0-3.4 0Z"/><path d="M12 9v4M12 17h.01"/></>
};

const AdminIcon = ({ name, size = 20 }) => (
  <svg className="admin-icon" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {paths[name] || paths.dashboard}
  </svg>
);

export default AdminIcon;
