import React from "react";
import Header from '../components/Header'
import { Outlet } from "react-router-dom";
import './Layout.css'
function Layout() {
  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <div style={{ flexShrink: 0 }}>
        <Header />
      </div>
      <div style={{ flex: 1, backgroundColor: "#f0f2f5" }}>
        <Outlet />
      </div>
    </div>
  );
}

export default Layout;