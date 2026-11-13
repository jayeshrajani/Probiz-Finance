"use client";

import dynamic from "next/dynamic";

// The admin is a client-only SPA (react-router HashRouter): /admin-panel#/login, /admin-panel#/dashboard, ...
const AdminRoot = dynamic(() => import("../../admin"), { ssr: false });

export default function AdminPanelPage() {
  return <AdminRoot />;
}
