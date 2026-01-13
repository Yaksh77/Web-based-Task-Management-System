import "./App.css";
import { Route, Router, Routes } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProtectedRoute from "./components/ProtectedRoute";
import Dashboard from "./pages/user/Dashboard";
import AdminPanel from "./pages/admin/AdminPanel";
import { useAuthStore } from "./store/userAuthStore";
import ManageUsers from "./pages/admin/ManageUsers";
import ProjectDetails from "./pages/admin/ProjectDetails";
import MainLayout from "./components/MainLayout";
import MyTasks from "./pages/user/MyTasks";
import TaskDetails from "./pages/user/TaskDetails";
import ProjectTasks from "./pages/user/ProjectTasks";
import { Toaster } from "react-hot-toast";

function App() {
  const user = useAuthStore((state) => state.user);
  return (
    <MainLayout>
      <Toaster position="top-center" reverseOrder={false} />
      <Routes>
        <Route
          path="/"
          element={<ProtectedRoute allowedRoles={["ADMIN", "USER"]} />}
        />

        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route element={<ProtectedRoute allowedRoles={["ADMIN", "USER"]} />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/my-tasks" element={<MyTasks />} />
          <Route path="/tasks/:taskId" element={<TaskDetails />} />
          <Route path="/projects/:projectId/tasks" element={<ProjectTasks />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
          <Route path="/admin/panel" element={<AdminPanel />} />
          <Route path="/admin/manage-users" element={<ManageUsers />} />
          <Route
            path="/admin/project-details/:projectId"
            element={<ProjectDetails />}
          />
        </Route>

        <Route
          path="/unauthorized"
          element={<h1>You are not allowed here!</h1>}
        />
        <Route path="*" element={<h1>404 Not Found</h1>} />
      </Routes>
    </MainLayout>
  );
}

export default App;
