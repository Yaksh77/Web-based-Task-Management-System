import React, { useState, useEffect } from "react";
import { LuPlus, LuPencil } from "react-icons/lu";
import api from "../../../api";
import { useAuthStore } from "../../store/userAuthStore";

function MyTasks() {
  const user = useAuthStore((state) => state.user);
  const [allUsers, setAllUsers] = useState([]);
  const [isCreatedModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "TODO",
    priority: "MEDIUM",
    dueDate: "",
    projectId: "",
    assignedUserId: "",
  });

  const [editFormData, setEditFormData] = useState({
    id: "",
    title: "",
    description: "",
    status: "TODO",
    priority: "MEDIUM",
    dueDate: "",
    projectId: "",
    assignedUserId: "",
  });
  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      status: "TODO",
      priority: "MEDIUM",
      dueDate: "",
      projectId: "",
      assignedUserId: "",
    });
    setErrors({});
  };
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData({
      ...editFormData,
      [name]: value,
    });
  };

  const validate = () => {
    let tempErrors = {};
    if (!formData.title.trim()) tempErrors.title = "Title is required.";
    if (!formData.projectId) tempErrors.projectId = "Please select a project.";
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const fetchUsers = async () => {
    try {
      const { data } = await api.get("/admin/get-all-users");
      setAllUsers(data.users);
      console.log(data.users);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchProjects = async () => {
    try {
      const { data } = await api.get("/user/user-projects");
      setProjects(data.projects);
      console.log(data.projects);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchMyTasks = async () => {
    try {
      const { data } = await api.get("/user/get-my-tasks");
      console.log(data.tasks);
      setTasks(data.tasks);
    } catch (error) {
      console.log(error);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const payload = {
        ...formData,
        createdBy: user.id,
        assignedUserId: formData.assignedUserId || user.id,
      };

      await api.post("/user/add-task", payload);
      setIsCreateModalOpen(false);
      fetchMyTasks();
      resetForm();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (task) => {
    console.log(tasks);

    setEditFormData({
      id: task.id,
      title: task.title,
      description: task.description || "",
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate
        ? new Date(task.dueDate).toISOString().split("T")[0]
        : "",
      projectId: task.projectId,
      assignedUserId: task.assignedUserId,
    });
    setIsEditModalOpen(true);
  };
  const handleUpdateTask = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.put(
        `/user/update-task/${editFormData.id}`,
        editFormData
      );
      console.log(data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchProjects();
    fetchMyTasks();
    fetchUsers();
  }, []);

  return (
    <div className="p-8 md:ml-60">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">My Task Management</h1>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition"
        >
          <LuPlus /> Create Task
        </button>
      </div>

      {/* Task List Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-4">Task & Project</th>
              <th className="p-4">Priority</th>
              <th className="p-4">Due Date</th>
              <th className="p-4">Status</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {tasks.map((task) => (
              <tr key={task.id} className="hover:bg-gray-50 transition">
                <td className="p-4">
                  <div className="font-bold text-gray-800">{task.title}</div>
                  <div className="text-xs text-blue-500 uppercase font-semibold">
                    {task.projectName}
                  </div>
                </td>
                <td className="p-4">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-bold ${
                      task.priority === "HIGH"
                        ? "bg-red-100 text-red-600"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {task.priority}
                  </span>
                </td>
                <td className="p-4 text-sm text-gray-500">
                  {task.dueDate
                    ? new Date(task.dueDate).toLocaleDateString()
                    : "N/A"}
                </td>
                <td className="p-4">
                  <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-bold">
                    {task.status}
                  </span>
                </td>
                <td className="p-4">
                  <button
                    onClick={() => openEditModal(task)}
                    className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-sm font-medium"
                  >
                    <LuPencil size={14} /> Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Section */}
      {isCreatedModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl overflow-y-auto max-h-[90vh]">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">
              Create Task
            </h2>
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Project
                </label>
                <select
                  name="projectId"
                  value={formData.projectId}
                  onChange={handleChange}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${
                    errors.projectId ? "border-red-500" : ""
                  }`}
                >
                  <option value="">-- Select Project --</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title}
                    </option>
                  ))}
                </select>
                {errors.projectId && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.projectId}
                  </p>
                )}
              </div>

              {user?.role === "ADMIN" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Assign To User
                  </label>
                  <select
                    name="assignedUserId"
                    value={formData.assignedUserId}
                    onChange={handleChange}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value={user.id}>Self (Admin)</option>
                    {allUsers.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.role})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Task Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className={`w-full p-3 border rounded-lg outline-none ${
                    errors.title ? "border-red-500" : ""
                  }`}
                  placeholder="Task Name"
                />
                {errors.title && (
                  <p className="text-red-500 text-xs mt-1">{errors.title}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Task Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className={`w-full p-3 border rounded-lg outline-none ${
                    errors.description ? "border-red-500" : ""
                  }`}
                  placeholder="Task Description"
                />
                {errors.description && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.description}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1">
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className="border p-3 rounded-lg text-sm"
                >
                  <option value="HIGH">High</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="LOW">Low</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Due Date
                </label>
                <input
                  type="date"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleChange}
                  className="w-full p-3 border rounded-lg"
                />
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="flex-1 px-4 py-2 border rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg"
                >
                  {/* {loading ? "Assigning..." : "Assign Task"} */}
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl overflow-y-auto max-h-[90vh]">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">
              Edit Task Details
            </h2>
            <form onSubmit={handleUpdateTask} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Assign To User
                </label>
                <select
                  name="assignedUserId"
                  value={editFormData.assignedUserId}
                  onChange={handleEditChange}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  {allUsers.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} {u.id === user.id ? "(You)" : `(${u.role})`}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Task Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={editFormData.title}
                  onChange={handleEditChange}
                  className={`w-full p-3 border rounded-lg outline-none ${
                    errors.title ? "border-red-500" : ""
                  }`}
                  placeholder="Task Name"
                />
                {errors.title && (
                  <p className="text-red-500 text-xs mt-1">{errors.title}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Task Description
                </label>
                <textarea
                  name="description"
                  value={editFormData.description}
                  onChange={handleEditChange}
                  className={`w-full p-3 border rounded-lg outline-none ${
                    errors.description ? "border-red-500" : ""
                  }`}
                  placeholder="Task Description"
                />
                {errors.description && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.description}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <select
                  name="status"
                  value={editFormData.status}
                  onChange={handleEditChange}
                  className="border p-3 rounded-lg text-sm"
                >
                  <option value="TODO">Todo</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="IN_TESTING">In Testing</option>
                  <option value="COMPLETED">Completed</option>
                </select>
                <select
                  name="priority"
                  value={editFormData.priority}
                  onChange={handleEditChange}
                  className="border p-3 rounded-lg text-sm"
                >
                  <option value="HIGH">High</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="LOW">Low</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Due Date
                </label>
                <input
                  type="date"
                  name="dueDate"
                  value={editFormData.dueDate}
                  onChange={handleEditChange}
                  className="w-full p-3 border rounded-lg"
                />
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 px-4 py-2 border rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg"
                >
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyTasks;
