import React from "react";
import Sidebar from "./Sidebar";
import { useAuthStore } from "../store/userAuthStore";
import Navbar from "./Navbar";
function MainLayout({ children }) {
  const user = useAuthStore((state) => state.user);
  return (
    <div className="flex bg-gray-50 min-h-screen">
      {user && <Sidebar />}
      <main className={`flex-1 ml-${user ? "64" : "0"} `}>
        <Navbar />
        {children}
      </main>
    </div>
  );
}

export default MainLayout;
