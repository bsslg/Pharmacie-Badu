/* =========================================================
   PHARMACIE BADU
   STYLE.CSS
   ========================================================= */

:root {
  --primary: #0f766e;
  --primary-dark: #115e59;
  --primary-light: #ccfbf1;

  --success: #16a34a;
  --success-light: #dcfce7;

  --warning: #d97706;
  --warning-light: #fef3c7;

  --danger: #dc2626;
  --danger-light: #fee2e2;

  --info: #2563eb;
  --info-light: #dbeafe;

  --dark: #172033;
  --text: #334155;
  --muted: #64748b;

  --background: #f4f7f9;
  --white: #ffffff;
  --border: #e2e8f0;

  --sidebar-width: 260px;

  --shadow-sm: 0 2px 8px rgba(15, 23, 42, 0.06);
  --shadow-md: 0 8px 25px rgba(15, 23, 42, 0.08);
  --radius: 14px;
}

/* =========================================================
   RESET
   ========================================================= */

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  scroll-behavior: smooth;
}

body {
  font-family:
    Inter,
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    Roboto,
    Arial,
    sans-serif;

  background: var(--background);
  color: var(--text);
  min-height: 100vh;
}

button,
input,
select,
textarea {
  font: inherit;
}

button {
  cursor: pointer;
}

input,
select,
textarea {
  width: 100%;
}

a {
  color: inherit;
  text-decoration: none;
}

/* =========================================================
   UTILITAIRES
   ========================================================= */

.hidden {
  display: none !important;
}

.full-width {
  width: 100%;
}

.full {
  grid-column: 1 / -1;
}

/* =========================================================
   LOADING
   ========================================================= */

.loading-screen {
  position: fixed;
  inset: 0;
  z-index: 9999;

  background: #f8fafc;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  text-align: center;
}

.loading-logo {
  width: 80px;
  height: 80px;

  border-radius: 22px;

  background: var(--primary);
  color: white;

  display: flex;
  align-items: center;
  justify-content: center;

  font-size: 25px;
  font-weight: 900;

  margin-bottom: 20px;

  box-shadow: var(--shadow-md);
}

.loading-screen h2 {
  color: var(--dark);
  margin-bottom: 8px;
}

.loading-screen p {
  color: var(--muted);
}

/* =========================================================
   APPLICATION
   ========================================================= */

.app-container {
  min-height: 100vh;
}

.app-container.hidden {
  display: none;
}

/* =========================================================
   SIDEBAR
   ========================================================= */

.sidebar {
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;

  width: var(--sidebar-width);

  background: #102a2b;
  color: white;

  z-index: 1000;

  display: flex;
  flex-direction: column;

  overflow-y: auto;
}

/* BRAND */

.brand {
  display: flex;
  align-items: center;

  padding: 24px 20px 18px;

  border-bottom: 1px solid rgba(255,255,255,0.08);
}

.brand-logo {
  width: 48px;
  height: 48px;

  border-radius: 14px;

  background: var(--primary);

  display: flex;
  align-items: center;
  justify-content: center;

  font-size: 16px;
  font-weight: 900;

  margin-right: 12px;
}

.brand-text {
  display: flex;
  flex-direction: column;
}

.brand-text strong {
  font-size: 15px;
  letter-spacing: 1px;
}

.brand-text span {
  font-size: 18px;
  font-weight: 900;
  color: #5eead4;
}

/* STATUS */

.pharmacy-status {
  margin: 18px 20px;

  display: flex;
  align-items: center;
  gap: 8px;

  color: #a7f3d0;
  font-size: 12px;
}

.status-dot {
  width: 8px;
  height: 8px;

  background: #22c55e;

  border-radius: 50%;

  box-shadow: 0 0 0 4px rgba(34,197,94,0.12);
}

/* MENU */

.sidebar-menu {
  display: flex;
  flex-direction: column;

  padding: 0 12px;

  gap: 4px;
}

.menu-item {
  border: 0;
  background: transparent;

  color: #cbd5e1;

  display: flex;
  align-items: center;

  width: 100%;

  padding: 12px 14px;

  border-radius: 10px;

  text-align: left;

  transition: 0.2s ease;
}

.menu-item:hover {
  background: rgba(255,255,255,0.07);
  color: white;
}

.menu-item.active {
  background: var(--primary);
  color: white;

  box-shadow: 0 5px 15px rgba(15,118,110,0.25);
}

.menu-icon {
  width: 28px;
  font-size: 18px;
}

.menu-item span:last-child {
  font-size: 14px;
  font-weight: 600;
}

/* SIDEBAR FOOTER */

.sidebar-footer {
  margin-top: auto;

  padding: 18px;

  border-top: 1px solid rgba(255,255,255,0.08);
}

.user-mini {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-avatar {
  width: 38px;
  height: 38px;

  border-radius: 50%;

  background: #134e4a;

  display: flex;
  align-items: center;
  justify-content: center;

  font-weight: 800;
}

.user-mini strong {
  display: block;
  font-size: 13px;
}

.user-mini small {
  display: block;
  color: #94a3b8;
  font-size: 11px;
  margin-top: 2px;
}

/* =========================================================
   MAIN
   ========================================================= */

.main-content {
  margin-left: var(--sidebar-width);

  min-height: 100vh;

  padding: 0 30px 40px;
}

/* =========================================================
   TOPBAR
   ========================================================= */

.topbar {
  height: 82px;

  display: flex;
  align-items: center;
  justify-content: space-between;

  border-bottom: 1px solid var(--border);

  margin-bottom: 28px;
}

.page-title h1 {
  font-size: 24px;
  color: var(--dark);
  margin-bottom: 4px;
}

.page-title p {
  color: var(--muted);
  font-size: 13px;
}

.topbar-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.icon-btn {
  width: 42px;
  height: 42px;

  border: 1px solid var(--border);

  background: white;

  border-radius: 10px;

  position: relative;

  font-size: 18px;
}

.icon-btn:hover {
  background: #f8fafc;
}

.notification-badge {
  position: absolute;

  top: -4px;
  right: -4px;

  min-width: 18px;
  height: 18px;

  padding: 0 4px;

  border-radius: 20px;

  background: var(--danger);
  color: white;

  font-size: 10px;
  font-weight: 800;

  display: flex;
  align-items: center;
  justify-content: center;
}

.mobile-menu-btn {
  display: none;

  border: 0;
  background: transparent;

  font-size: 24px;

  color: var(--dark);
}

/* =========================================================
   BUTTONS
   ========================================================= */

.primary-btn,
.secondary-btn,
.danger-btn,
.text-btn {
  border: 0;
  border-radius: 9px;

  padding: 10px 16px;

  font-weight: 700;

  transition: 0.2s ease;
}

.primary-btn {
  background: var(--primary);
  color: white;
}

.primary-btn:hover {
  background: var(--primary-dark);
  transform: translateY(-1px);
}

.secondary-btn {
  background: #e2e8f0;
  color: var(--dark);
}

.secondary-btn:hover {
  background: #cbd5e1;
}

.danger-btn {
  background: var(--danger-light);
  color: var(--danger);
}

.danger-btn:hover {
  background: #fecaca;
}

.text-btn {
  padding: 4px;
  background: transparent;
  color: var(--primary);
}

.text-btn:hover {
  text-decoration: underline;
}

/* =========================================================
   CONTENT SECTIONS
   ========================================================= */

.content-section {
  display: none;
}

.content-section.active {
  display: block;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;

  margin-bottom: 22px;
}

.section-header h2 {
  color: var(--dark);
  font-size: 22px;

  margin-bottom: 5px;
}

.section-header p {
  color: var(--muted);
  font-size: 13px;
}

/* =========================================================
   WELCOME
   ========================================================= */

.welcome-card {
  background:
    linear-gradient(
      135deg,
      #0f766e,
      #134e4a
    );

  color: white;

  border-radius: 18px;

  padding: 28px;

  display: flex;
  justify-content: space-between;
  align-items: center;

  margin-bottom: 22px;

  overflow: hidden;

  position: relative;

  box-shadow: var(--shadow-md);
}

.welcome-card::after {
  content: "";

  position: absolute;

  width: 220px;
  height: 220px;

  right: -80px;
  top: -100px;

  border-radius: 50%;

  background: rgba(255,255,255,0.06);
}

.welcome-label {
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 2px;

  opacity: 0.75;
}

.welcome-card h2 {
  font-size: 28px;

  margin: 6px 0 8px;
}

.welcome-card p {
  color: #ccfbf1;
  font-size: 13px;
}

.welcome-icon {
  font-size: 65px;
  position: relative;
  z-index: 2;
}

/* =========================================================
   STATS
   ========================================================= */

.stats-grid {
  display: grid;

  grid-template-columns:
    repeat(4, minmax(0, 1fr));

  gap: 16px;

  margin-bottom: 22px;
}

.stat-card {
  background: white;

  border: 1px solid var(--border);

  border-radius: var(--radius);

  padding: 20px;

  display: flex;
  align-items: center;

  gap: 14px;

  box-shadow: var(--shadow-sm);
}

.stat-icon {
  width: 48px;
  height: 48px;

  border-radius: 12px;

  display: flex;
  align-items: center;
  justify-content: center;

  font-size: 21px;

  flex-shrink: 0;
}

.stat-icon.revenue {
  background: var(--success-light);
}

.stat-icon.sales {
  background: var(--info-light);
}

.stat-icon.expenses {
  background: var(--danger-light);
}

.stat-icon.profit {
  background: var(--primary-light);
}

.stat-content {
  min-width: 0;
}

.stat-content span {
  display: block;

  color: var(--muted);

  font-size: 12px;

  margin-bottom: 5px;
}

.stat-content strong {
  display: block;

  color: var(--dark);

  font-size: 18px;

  white-space: nowrap;
}

.stat-content small {
  color: var(--muted);
  font-size: 10px;
}

/* =========================================================
   PANELS
   ========================================================= */

.panel {
  background: white;

  border: 1px solid var(--border);

  border-radius: var(--radius);

  box-shadow: var(--shadow-sm);

  margin-bottom: 22px;

  overflow: hidden;
}

.panel-header {
  padding: 18px 20px;

  display: flex;
  align-items: center;
  justify-content: space-between;

  gap: 15px;

  border-bottom: 1px solid var(--border);
}

.panel-header h3 {
  color: var(--dark);
  font-size: 15px;

  margin-bottom: 3px;
}

.panel-header p {
  color: var(--muted);
  font-size: 11px;
}

/* =========================================================
   DASHBOARD GRID
   ========================================================= */

.dashboard-grid {
  display: grid;

  grid-template-columns:
    repeat(2, minmax(0, 1fr));

  gap: 22px;

  margin-bottom: 22px;
}

/* =========================================================
   CASH SUMMARY
   ========================================================= */

.cash-summary {
  padding: 22px;
}

.cash-main {
  margin-bottom: 20px;
}

.cash-main span {
  display: block;

  color: var(--muted);

  font-size: 12px;

  margin-bottom: 5px;
}

.cash-main strong {
  display: block;

  font-size: 28px;

  color: var(--dark);
}

.cash-details {
  display: grid;
  grid-template-columns: repeat(2, 1fr);

  gap: 12px;
}

.cash-details div {
  background: #f8fafc;

  border-radius: 10px;

  padding: 12px;
}

.cash-details span {
  display: block;

  color: var(--muted);

  font-size: 11px;

  margin-bottom: 5px;
}

.cash-details strong {
  color: var(--dark);

  font-size: 13px;
}

.dashboard-grid .full-width {
  margin: 0 22px 22px;

  width: calc(100% - 44px);
}

/* =========================================================
   ALERTS
   ========================================================= */

.alerts-list {
  padding: 8px 20px 18px;
}

.alert-item {
  display: flex;

  align-items: center;

  gap: 10px;

  padding: 11px 0;

  border-bottom: 1px solid var(--border);
}

.alert-item:last-child {
  border-bottom: 0;
}

.alert-item-icon {
  width: 34px;
  height: 34px;

  border-radius: 9px;

  display: flex;
  align-items: center;
  justify-content: center;

  background: var(--warning-light);
}

.alert-item.danger .alert-item-icon {
  background: var(--danger-light);
}

.alert-item-info {
  flex: 1;
}

.alert-item-info strong {
  display: block;

  color: var(--dark);

  font-size: 12px;
}

.alert-item-info span {
  display: block;

  color: var(--muted);

  font-size: 10px;

  margin-top: 2px;
}

.empty-state {
  text-align: center;

  padding: 28px 15px;

  color: var(--muted);
}

.empty-state div {
  font-size: 28px;
  margin-bottom: 8px;
}

.empty-state p {
  font-size: 12px;
}

/* =========================================================
   TABLE
   ========================================================= */

.table-container {
  width: 100%;
  overflow-x: auto;
}

table {
  width: 100%;

  border-collapse: collapse;

  min-width: 760px;
}

thead {
  background: #f8fafc;
}

th {
  color: var(--muted);

  font-size: 11px;

  font-weight: 800;

  text-transform: uppercase;

  letter-spacing: 0.4px;

  padding: 12px 16px;

  text-align: left;

  white-space: nowrap;
}

td {
  padding: 13px 16px;

  border-top: 1px solid var(--border);

  color: var(--text);

  font-size: 12px;

  vertical-align: middle;
}

tbody tr:hover {
  background: #f8fafc;
}

.empty-table {
  text-align: center;

  color: var(--muted);

  padding: 35px !important;
}

.table-product {
  display: flex;
  align-items: center;
  gap
