import React, { useState, useEffect } from "react";
import {
  LuPlus,
  LuPencil,
  LuTrash,
  LuBadgeAlert,
  LuLock,
  LuSearch,
  LuCross,
  LuFolderClosed,
  LuX,
} from "react-icons/lu";
import api from "../../../api";
import { useAuthStore } from "../../store/userAuthStore";
import TaskTable from "../../components/TaskTable";
import TaskFilters from "../../components/TaskFilters";
import Pagination from "../../components/Pagination";
import toast from "react-hot-toast";
import Loader from "../../components/Loader";

function MyTasks() {
  const user = useAuthStore((state) => state.user);
  const [isCreatedModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [originalStatus, setOriginalStatus] = useState("");
  const [projects, setProjects] = useState([]);
  const [errors, setErrors] = useState({});
  const [projectMembers, setProjectMembers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    status: "ALL",
    priority: "ALL",
    sortBy: "createdAt",
    sortOrder: "desc",
  });

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

      setProjects(data.data);
    } catch (error) {
      console.error(error);
    }
  };


  const fetchMyTasks = async () => {
    setLoading(true);
    try {
      const queryParams = {
        page: currentPage,
        limit: 3,
        ...filters,
      };
      if (searchTerm && searchTerm.trim() !== "") {
        queryParams.search = searchTerm;
      }

      if (queryParams.status === "ALL") delete queryParams.status;
      if (queryParams.priority === "ALL") delete queryParams.priority;

      const { data } = await api.get("/user/get-my-tasks", {
        params: queryParams,
      });
      console.log(data);
      

      setTasks(data.data);
      setTotalPages(data.pagination.totalPages);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    fetchMyTasks();
  }, [currentPage, filters, searchTerm]);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!validate(formData)) return;

    try {
      const payload = {
        ...formData,
        createdBy: user.id,
        assignedUserId: formData.assignedUserId || user.id,
      };
      const response = await api.post("/user/add-task", payload);
      if (response.status === 201) toast.success("Task created successfully!");
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
      toast.error("Failed to create task. Please try again.");
    } finally {
    }
  };

  const openEditModal = async (task) => {
    setErrors({});
    try {
      const { data } = await api.get(
        `/user/user-projects?currentProjectId=${task.projectId}`
      );
      setProjects(data.data);
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
      const response = await api.put(
        `/user/update-task/${editFormData.id}`,
        editFormData
      );
      if (response.status === 200) toast.success("Task updated successfully!");
      setIsEditModalOpen(false);
      fetchMyTasks();
    } catch (error) {
      console.error(error);
      toast.error("Failed to update task. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      const response = await api.delete(`/user/delete-task/${taskId}`);
      if (response.status === 200) toast.success("Task deleted successfully!");
      fetchMyTasks();
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete task. Please try again.");
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
          setProjectMembers(data.data);
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
          {user.role === "ADMIN" ? (
            <h1 className="text-2xl font-bold text-gray-800">
              Task Management Panel
            </h1>
          ) : (
            <h1 className="text-2xl font-bold text-gray-800">My Tasks</h1>
          )}
          <p className="text-gray-500 mt-1">
            Manage and track your project responsibilities
          </p>
        </div>
        {user.role === "USER" && projects.length === 0 ? (
          <button
            disabled
            className="bg-gray-300 text-gray-600 px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-lg transition-all cursor-not-allowed"
          >
            <LuLock size={20} /> Create New Task
          </button>
        ) : (
          <button
            onClick={() => {
              setErrors({});
              setIsCreateModalOpen(true);
            }}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-lg shadow-indigo-200 transition-all active:scale-95"
          >
            <LuPlus size={20} /> Create New Task
          </button>
        )}
      </div>

      {/* Filters */}
      <TaskFilters
        filters={filters}
        setFilters={setFilters}
        setSearchTerm={setSearchTerm}
      />

      {/* Task List Table */}

      {loading ? (
        <Loader variant="section" text="Loading your tasks..." />
      ) : (
        <>
          <TaskTable
            tasks={tasks}
            onEdit={openEditModal}
            onDelete={handleDeleteTask}
            visibleColumns={[
              "title",
              "priority",
              "dueDate",
              "status",
              "createdBy",
              "assignedTo",
              "actions",
              "viewDetails",
              "details",
            ]}
          />
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => setCurrentPage(page)}
          />{" "}
        </>
      )}

      {/* Reusable Modal */}
      {(isCreatedModalOpen || isEditModalOpen) && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 md:p-8 w-full max-w-md shadow-2xl h-full max-h-[80vh] overflow-y-auto no-scrollbar">
           <div className="flex justify-between items-center mb-2 relative">
              <h2 className="text-2xl font-bold mb-6 text-gray-900 flex items-center gap-2">
              {isEditModalOpen ? (
                <LuPencil className="text-indigo-600 bg-indigo-50 rounded-full" />
              ) : (
                <LuPlus className="text-indigo-600 bg-indigo-50 rounded-full" />
              )}
              {isEditModalOpen ? "Edit Task Details" : "Create New Task"}
            </h2>
            <div className=" hover:bg-red-100 p-2 absolute top-0 right-2 cursor-pointer rounded-full text-red-400 transition-all">
              <LuX  
                onClick={() => {
                  setIsCreateModalOpen(false);
                  setIsEditModalOpen(false);
                }}
                size={20}
              />
            </div>
           </div>


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
                  className={`w-full mt-1.5 p-3 bg-gray-50 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${
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
                  className="w-full mt-1.5 p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
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
                  className={`w-full mt-1.5 p-3 bg-gray-50 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${
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
                  className={`w-full mt-1.5 p-3 bg-gray-50 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${
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
                      className="w-full mt-1.5 p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500"
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
                    className="w-full mt-1.5 p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500"
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
                    className={`w-full mt-1.5 p-3 bg-gray-50 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${
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
                  className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-100 font-bold disabled:opacity-50 transition-all active:scale-95 cursor-pointer"
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
