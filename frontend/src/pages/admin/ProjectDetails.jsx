import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../../../api";
import {
  LuFileDiff,
  LuMinus,
  LuPlus,
  LuTrash,
  LuTrash2,
  LuUpload,
} from "react-icons/lu";
import ConfirmDelete from "../../components/ConfirmDelete";
import toast from "react-hot-toast";
import TaskTable from "../../components/TaskTable";
import Loader from "../../components/Loader";
function ProjectDetails() {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [assignUser, setAssignUser] = useState("");
  const [allUsers, setAllUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userDeleteModalOpen, setUserDeleteModalOpen] = useState(false);
  const [toDeleteMember, setToDeleteMember] = useState(null);
  const [updatedProject, setUpdatedProject] = useState({
    title: "",
    description: "",
  });
  const navigate = useNavigate();

  const fetchProjectInfo = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/admin/get-project-details/${projectId}`);
      setProject(data.data);
      setUpdatedProject({
        title: data.data.title,
        description: data.data.description,
      });
    } catch (error) {
      console.error("Error fetching project info:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProjectUsers = async (projectId) => {
    try {
      const { data } = await api.get(`/admin/get-project-users/${projectId}`);
      setMembers(data.data.usersInfo);
    } catch (error) {
      console.error("Error fetching project members:", error);
    }
  };

  const fetchProjectTasks = async () => {
    try {
      const { data } = await api.get(`/user/get-project-tasks/${projectId}`);
      setTasks(data.tasks);
    } catch (error) {
      console.log(error);
    }
  };

  const handleUpdateProject = async (e) => {
    e.preventDefault();
    try {
      const response = await api.patch(
        `/admin/update-project/${projectId}`,
        updatedProject
      );
      if (response.status === 200)
        toast.success("Project updated successfully!");
      setIsModalOpen(false);
      fetchProjectInfo();
    } catch (error) {
      console.error("Error updating project:", error);
      toast.error("Failed to update project. Please try again.");
    }
  };

  const handleDeleteProject = async () => {
    try {
      const response = await api.delete(`/admin/delete-project/${projectId}`);
      if (response) toast.success("Project deleted successfully!");
      navigate("/admin/panel");
    } catch (error) {
      console.log(error);
      toast.error("Failed to delete project. Please try again.");
    }
  };

  const fetchUsers = async () => {
    try {
      const { data } = await api.get("/admin/get-all-users?limit=100");
      setAllUsers(data.data.users || []);
    } catch (err) {
      console.error("Failed to fetch users", err);
    }
  };

  const assignUserToProject = async (userId) => {
    try {
      const response = await api.post("/admin/assign-user", {
        userId,
        projectId,
      });
      if (response.status === 200) toast.success("User assigned successfully!");
      fetchProjectUsers(projectId);
    } catch (error) {
      console.error("Error assigning user to project:", error);
      toast.error("Failed to assign user. Please try again.");
    }
  };

  const handleRemoveMember = async (memberToRemove) => {
    try {
      const response = await api.delete(
        `/admin/remove-user/${projectId}/${memberToRemove.id}`
      );
      if (response.status === 200) {
        toast.success("Member removed successfully!");
        setUserDeleteModalOpen(false);
        fetchProjectUsers(projectId);
      }
    } catch (error) {
      console.error("Error removing member:", error);
      toast.error("Failed to remove member. Please try again.");
    }
  };

  useEffect(() => {
    if (projectId) {
      fetchProjectInfo();
      fetchProjectUsers(projectId);
      fetchUsers();
      fetchProjectTasks();
    }
  }, [projectId]);

  if (loading) {
    return <Loader variant="page" text="Fetching Project Details..." />;
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-end gap-3">
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
        >
          <LuFileDiff size={20} /> Update Project
        </button>
        <button
          onClick={() => setDeleteModalOpen(true)}
          className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
        >
          <LuTrash2 size={20} /> Delete Project
        </button>
      </div>
      <h1 className="text-3xl font-bold mb-2">{project?.title}</h1>
      <p className="text-gray-600 mb-8">{project?.description}</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-xl font-semibold mb-4">Project Members</h2>
          <ul className="overflow-y-auto max-h-[200px]">
            {members?.map((member) => (
              <li
                key={member.id}
                className="py-2 border-b border-gray-300 flex justify-between items-center"
              >
                <p>{member.name}</p>
                <button
                  onClick={() => {
                    setUserDeleteModalOpen(true);
                    setToDeleteMember(member);
                  }}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                >
                  <LuTrash size={16} />
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-xl font-semibold mb-4">Assign New Member</h2>
          <select
            className="w-full p-2 border rounded mb-4"
            value={assignUser}
            onChange={(e) => setAssignUser(e.target.value)}
          >
            {allUsers.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>
          <button
            onClick={() => assignUserToProject(assignUser)}
            className="bg-indigo-600 text-white px-4 py-2 rounded"
          >
            Assign
          </button>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mt-10 mb-4 ml-1">Project Tasks</h2>
      </div>

      <div className="flex-1 bg-white rounded-4xl shadow-xl border border-slate-100 overflow-y-auto no-scrollbar relative max-h-[600px] p-6">
        <TaskTable
          tasks={tasks}
          visibleColumns={[
            "title",
            "priority",
            "dueDate",
            "status",
            "assignedTo",
            "details",
          ]}
        />
      </div>

      {isModalOpen && (
        <div className="fixed inset-0  bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">
              Update Project
            </h2>
            <form onSubmit={handleUpdateProject} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Project Title
                </label>
                <input
                  type="text"
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="Enter project name"
                  value={updatedProject.title}
                  onChange={(e) =>
                    setUpdatedProject({
                      ...updatedProject,
                      title: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none h-28"
                  placeholder="What is this project about?"
                  value={updatedProject.description}
                  onChange={(e) =>
                    setUpdatedProject({
                      ...updatedProject,
                      description: e.target.value,
                    })
                  }
                />
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
                  {loading ? "Updating..." : "Update"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteModalOpen && (
        <ConfirmDelete
          deleteModalOpen={deleteModalOpen}
          setDeleteModalOpen={setDeleteModalOpen}
          onConfirmDelete={handleDeleteProject}
          onCancel={() => setDeleteModalOpen(false)}
        />
      )}

      {userDeleteModalOpen && (
        <ConfirmDelete
          deleteModalOpen={userDeleteModalOpen}
          setDeleteModalOpen={setUserDeleteModalOpen}
          onConfirmDelete={() => handleRemoveMember(toDeleteMember)}
          onCancel={() => setUserDeleteModalOpen(false)}
        />
      )}
    </div>
  );
}

export default ProjectDetails;
