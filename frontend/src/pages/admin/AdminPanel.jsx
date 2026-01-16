import React, { useState, useEffect } from "react";
import api from "../../../api";
import { LuPlus, LuFolderOpen, LuCalendar, LuUsers } from "react-icons/lu";
import { useNavigate } from "react-router-dom";
import Pagination from "../../components/Pagination";
import ProjectCard from "../../components/ProjectCard";
import toast from "react-hot-toast";
import Loader from "../../components/Loader";

function AdminDashboard() {
  const [projects, setProjects] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({ title: "", description: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    let tempErrors = {};

    if (!formData.title.trim()) {
      tempErrors.title = "Title is required.";
    }
    if (!formData.description.trim()) {
      tempErrors.description = "Description is required.";
    }
    console.log(errors);

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };
  const fetchProjects = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/admin/get-all-projects", {
        params: {
          page: currentPage,
          limit: 8,
        },
      });
      setProjects(data.data.projects);
      setTotalPages(data.pagination.totalPages);
    } catch (err) {
      console.error("Error fetching projects", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [currentPage]);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!validate()) {
      return;
    }
    setLoading(true);
    try {
      const response = await api.post("/admin/create-project", formData);

      if (response.status === 201) {
        toast.success("Project created successfully!");
      }
      setIsModalOpen(false);
      setFormData({ title: "", description: "" });
      fetchProjects();
    } catch (err) {
      console.log(err);
      toast.error("Failed to create project. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader variant="page" text="Fetching Projects..." />;
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen space-y-9">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Manage Projects</h1>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
        >
          <LuPlus size={20} /> Create Project
        </button>
      </div>

      {/* Project Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={(page) => setCurrentPage(page)}
      />

      {/* --- Create Project Modal --- */}
      {isModalOpen && (
        <div className="fixed inset-0  bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">
              Add New Project
            </h2>
            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Project Title
                </label>
                <input
                  type="text"
                  name="title"
                  className={`w-full p-3 border rounded-lg outline-none transition ${
                    errors.title
                      ? "border-red-500 focus:ring-red-200"
                      : "focus:ring-indigo-400 focus:border-indigo-400"
                  }`}
                  placeholder="Enter project name"
                  value={formData.title}
                  onChange={handleChange}
                />
                {errors.title && (
                  <p className="text-red-500 text-xs mt-1 ml-1">
                    {errors.title}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  className={`w-full p-3 border rounded-lg outline-none transition ${
                    errors.description
                      ? "border-red-500 focus:ring-red-200"
                      : "focus:ring-indigo-400 focus:border-indigo-400"
                  }`}
                  placeholder="What is this project about?"
                  value={formData.description}
                  onChange={handleChange}
                />
                {errors.description && (
                  <p className="text-red-500 text-xs mt-1 ml-1">
                    {errors.description}
                  </p>
                )}
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                >
                  {loading ? <Loader /> : "Create Project"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
