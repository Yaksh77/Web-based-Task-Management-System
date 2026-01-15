import React, { useState } from "react";
import Sidebar from "./Sidebar";
import { useAuthStore } from "../store/userAuthStore";
import Navbar from "../components/Navbar";

function MainLayout({ children }) {
  const user = useAuthStore((state) => state.user);
  // This is used for to open and close sidebar
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="flex bg-slate-50 min-h-screen relative text-slate-900">
      {user && <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
          user ? "lg:ml-64" : "ml-0"
        }`}
      >
        <Navbar toggleSidebar={toggleSidebar} />
        <main className="p-4 md:p-8 max-w-7xl mx-auto w-full">{children}</main>
      </div>
    </div>
  );
}

export default MainLayout;
