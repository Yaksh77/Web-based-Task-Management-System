import React, { useState, useEffect } from "react";
import {
  LuPlus,
  LuPencil,
  LuTrash,
  LuBadgeAlert,
  LuLock,
} from "react-icons/lu";
import api from "../../../api";
import { useAuthStore } from "../../store/userAuthStore";

function MyTasks() {
  const user = useAuthStore((state) => state.user);
  const [isCreatedModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [originalStatus, setOriginalStatus] = useState("");
  const [projects, setProjects] = useState([]);
  const [errors, setErrors] = useState({});
  const [projectMembers, setProjectMembers] = useState([]);

  const today = new Date().toISOString().split("T")[0];
  const statusOptions = ["TODO", "IN_PROGRESS", "IN_TESTING", "COMPLETED"];
  const STATUS_FLOW = {
    TODO: "IN_PROGRESS",
    IN_PROGRESS: "IN_TESTING",
    IN_TESTING: "COMPLETED",
    COMPLETED: null,
  };

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "MEDIUM",
    dueDate: "",
    projectId: "",
    assignedUserId: "",
  });

  const [editFormData, setEditFormData] = useState({
    id: "",
    title: "",
    description: "",
    status: "",
    priority: "",
    dueDate: "",
    projectId: "",
    assignedUserId: "",
  });

  const validate = (data) => {
    let tempErrors = {};
    if (!data.title?.trim()) tempErrors.title = "Title is required.";
    if (!data.description?.trim())
      tempErrors.description = "Description is required.";
    if (!data.projectId) tempErrors.projectId = "Please select a project.";
    if (!data.dueDate) tempErrors.dueDate = "Due date is required.";

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const fetchProjects = async () => {
    try {
      const { data } = await api.get(`/user/user-projects`);
      setProjects(data.projects);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchMyTasks = async () => {
    try {
      const { data } = await api.get("/user/get-my-tasks");
      console.log(data);

      setTasks(data.tasks);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchProjects();
    fetchMyTasks();
  }, []);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!validate(formData)) return;

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
      setFormData({
        title: "",
        description: "",
        status: "TODO",
        priority: "MEDIUM",
        dueDate: "",
        projectId: "",
        assignedUserId: "",
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = async (task) => {
    setErrors({});
    try {
      const { data } = await api.get(
        `/user/user-projects?currentProjectId=${task.projectId}`
      );
      setProjects(data.projects);
    } catch (error) {
      console.log(error);
    }
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
    setOriginalStatus(task.status);
    setIsEditModalOpen(true);
  };

  const handleUpdateTask = async (e) => {
    e.preventDefault();
    if (!validate(editFormData)) return;

    setLoading(true);
    try {
      await api.put(`/user/update-task/${editFormData.id}`, editFormData);
      setIsEditModalOpen(false);
      fetchMyTasks();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      try {
        await api.delete(`/user/delete-task/${taskId}`);
        fetchMyTasks();
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  useEffect(() => {
    const fetchProjectMembers = async () => {
      const pId = isEditModalOpen ? editFormData.projectId : formData.projectId;
      if (!pId || pId === "Select Project") return;
      if (pId) {
        try {
          // whenever the user selects the project in edit modal the members of only that will be fetched
          // beacuse every project has different members
          const { data } = await api.get(`/user/project-members/${pId}`);
          console.log(data);

          setProjectMembers(data.projectMembers);
        } catch (err) {
          console.error("Error fetching members", err);
        }
      }
    };
    fetchProjectMembers();
  }, [editFormData.projectId, formData.projectId, isEditModalOpen]);

  return (
    <div className="p-4 md:p-8 min-h-screen bg-gray-50">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">My Tasks</h1>
          <p className="text-gray-500 mt-1">
            Manage and track your project responsibilities
          </p>
        </div>
        <button
          onClick={() => {
            setErrors({});
            setIsCreateModalOpen(true);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-lg shadow-blue-200 transition-all active:scale-95"
        >
          <LuPlus size={20} /> Create New Task
        </button>
      </div>

      {/* Task List Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Task & Project
                </th>
                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Priority
                </th>
                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Due Date
                </th>
                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {tasks.map((task) => (
                <tr
                  key={task.id}
                  className={`
                     ${
                       task.status === "OVERDUE"
                         ? "hover:bg-red-100 bg-red-50 rounded-lg"
                         : ""
                     }
                    `}
                >
                  <td className="p-4">
                    <div className="font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
                      {task.title}
                    </div>
                    <div className="text-xs text-blue-500 font-medium uppercase mt-0.5 tracking-tight">
                      {task.projectName || "General"}
                    </div>
                  </td>
                  <td className="p-4">
                    <span
                      className={`bg-gray-50 text-gray-600 border border-gray-100 px-3 py-1 rounded-full text-xs font-bold`}
                    >
                      {task.priority}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-gray-600 font-medium italic">
                    {task.dueDate
                      ? new Date(task.dueDate).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })
                      : "No deadline"}
                  </td>
                  <td className="p-4">
                    <span
                      className={`bg-blue-50 text-blue-700 border border-blue-100 px-3 py-1 rounded-full text-xs font-bold   ${
                        task.status === "OVERDUE"
                          ? "text-red-700 bg-red-200 border-red-200"
                          : task.status === "COMPLETED"
                          ? "text-green-700 bg-green-200 border-green-200"
                          : ""
                      }`}
                    >
                      {task.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className={`p-4 flex gap-3 items-center`}>
                    {task.status === "OVERDUE" ||
                    task.status === "COMPLETED" ? (
                      <span
                        className="p-2 text-gray-500"
                        title="Locked: Overdue tasks cannot be edited"
                      >
                        <LuLock size={18} className="text-gray-500" />{" "}
                      </span>
                    ) : (
                      <button
                        onClick={() => openEditModal(task)}
                        className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer"
                        title="Edit"
                      >
                        <LuPencil size={18} />
                      </button>
                    )}

                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                      title="Delete"
                    >
                      <LuTrash size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {tasks.length === 0 && (
            <div className="p-10 text-center text-gray-400 font-medium">
              No tasks found. Start by creating one!
            </div>
          )}
        </div>
      </div>

      {/* Reusable Modal */}
      {(isCreatedModalOpen || isEditModalOpen) && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 md:p-8 w-full max-w-md shadow-2xl h-full max-h-[90vh] overflow-y-auto no-scrollbar">
            <h2 className="text-2xl font-bold mb-6 text-gray-900 flex items-center gap-2">
              {isEditModalOpen ? (
                <LuPencil className="text-blue-600" />
              ) : (
                <LuPlus className="text-blue-600" />
              )}
              {isEditModalOpen ? "Edit Task Details" : "Create New Task"}
            </h2>

            <form
              onSubmit={isEditModalOpen ? handleUpdateTask : handleCreateTask}
              className="space-y-5"
            >
              {/* Project Selection */}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase ml-1">
                  Project
                </label>
                <select
                  name="projectId"
                  value={
                    isEditModalOpen
                      ? editFormData.projectId
                      : formData.projectId
                  }
                  onChange={(e) =>
                    isEditModalOpen
                      ? setEditFormData({
                          ...editFormData,
                          projectId: e.target.value,
                        })
                      : handleChange(e)
                  }
                  className={`w-full mt-1.5 p-3 bg-gray-50 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                    errors.projectId
                      ? "border-red-400 ring-1 ring-red-100"
                      : "border-gray-200"
                  }`}
                >
                  <option>Select Project</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title}
                    </option>
                  ))}
                </select>
                {errors.projectId && (
                  <p className="text-red-500 text-[10px] mt-1.5 flex items-center gap-1 font-semibold">
                    <LuBadgeAlert size={12} />
                    {errors.projectId}
                  </p>
                )}
              </div>

              {/* Assign Selection */}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase ml-1">
                  Assign To
                </label>
                <select
                  name="assignedUserId"
                  value={
                    isEditModalOpen
                      ? editFormData.assignedUserId
                      : formData.assignedUserId
                  }
                  onChange={(e) =>
                    isEditModalOpen
                      ? setEditFormData({
                          ...editFormData,
                          assignedUserId: e.target.value,
                        })
                      : handleChange(e)
                  }
                  className="w-full mt-1.5 p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                >
                  <option value={user.id}>Myself</option>
                  {projectMembers
                    .filter((u) => u.id !== user.id)
                    .map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name}
                      </option>
                    ))}
                </select>
              </div>

              {/* Task Title */}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase ml-1">
                  Task Title
                </label>
                <input
                  type="text"
                  name="title"
                  placeholder="What needs to be done?"
                  value={isEditModalOpen ? editFormData.title : formData.title}
                  onChange={(e) =>
                    isEditModalOpen
                      ? setEditFormData({
                          ...editFormData,
                          title: e.target.value,
                        })
                      : handleChange(e)
                  }
                  className={`w-full mt-1.5 p-3 bg-gray-50 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                    errors.title ? "border-red-400" : "border-gray-200"
                  }`}
                />
                {errors.title && (
                  <p className="text-red-500 text-[10px] mt-1.5 flex items-center gap-1 font-semibold">
                    <LuBadgeAlert size={12} />
                    {errors.title}
                  </p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase ml-1">
                  Description
                </label>
                <textarea
                  name="description"
                  rows="3"
                  placeholder="Add more context here..."
                  value={
                    isEditModalOpen
                      ? editFormData.description
                      : formData.description
                  }
                  onChange={(e) =>
                    isEditModalOpen
                      ? setEditFormData({
                          ...editFormData,
                          description: e.target.value,
                        })
                      : handleChange(e)
                  }
                  className={`w-full mt-1.5 p-3 bg-gray-50 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                    errors.description ? "border-red-400" : "border-gray-200"
                  }`}
                />
              </div>

              {/* Date, Status, Priority Grid */}
              <div className="grid grid-cols-2 gap-4">
                {isEditModalOpen && (
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase ml-1">
                      Status
                    </label>
                    <select
                      name="status"
                      value={editFormData.status}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          status: e.target.value,
                        })
                      }
                      className="w-full mt-1.5 p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {statusOptions.map((optValue) => {
                        const isCurrent = optValue === originalStatus;
                        const isNext = optValue === STATUS_FLOW[originalStatus];

                        return (
                          <option
                            key={optValue}
                            value={optValue}
                            disabled={!isCurrent && !isNext}
                          >
                            {optValue.replace("_", " ")}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                )}
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase ml-1">
                    Priority
                  </label>
                  <select
                    name="priority"
                    value={
                      isEditModalOpen
                        ? editFormData.priority
                        : formData.priority
                    }
                    onChange={(e) =>
                      isEditModalOpen
                        ? setEditFormData({
                            ...editFormData,
                            priority: e.target.value,
                          })
                        : handleChange(e)
                    }
                    className="w-full mt-1.5 p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="HIGH">High</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="LOW">Low</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase ml-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    name="dueDate"
                    min={today}
                    value={
                      isEditModalOpen ? editFormData.dueDate : formData.dueDate
                    }
                    onChange={(e) =>
                      isEditModalOpen
                        ? setEditFormData({
                            ...editFormData,
                            dueDate: e.target.value,
                          })
                        : handleChange(e)
                    }
                    className={`w-full mt-1.5 p-3 bg-gray-50 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                      errors.dueDate ? "border-red-400" : "border-gray-200"
                    }`}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreateModalOpen(false);
                    setIsEditModalOpen(false);
                  }}
                  className="flex-1 px-4 py-3 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-100 font-bold disabled:opacity-50 transition-all active:scale-95 cursor-pointer"
                >
                  {loading
                    ? "Processing..."
                    : isEditModalOpen
                    ? "Update Task"
                    : "Create Task"}
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
