import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../../../api";
import { LuFileDiff, LuMinus, LuPlus, LuUpload } from "react-icons/lu";
function ProjectDetails() {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [members, setMembers] = useState([]);
  const [assignUser, setAssignUser] = useState("");
  const [allUsers, setAllUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [updatedProject, setUpdatedProject] = useState({ title: "", description: "" });
  const navigate = useNavigate();

 const fetchProjectInfo = async () => {
    try {
      const { data } = await api.get(`/admin/get-project-details/${projectId}`);
      setProject(data.project);
      setUpdatedProject({ 
        title: data.project.title, 
        description: data.project.description 
      });
    } catch (error) {
      console.error("Error fetching project info:", error);
    }
  };

  const fetchProjectUsers = async (projectId) => {
    try {
      const { data } = await api.get(`/admin/get-project-users/${projectId}`);
      setMembers(data.usersInfo);
    } catch (error) {
      console.error("Error fetching project members:", error);
    }
  };

    const fetchProjectTasks = async () => {
      try {
        const {data} = await api.get(`/user/get-project-tasks/${projectId}`)
        console.log(data.tasks);
        
      } catch (error) {
        console.log(error);
      }
    }


  const handleUpdateProject = async (e) => {
    e.preventDefault(); 
    setLoading(true);
    try {
      await api.patch(`/admin/update-project/${projectId}`, updatedProject);
      setIsModalOpen(false);
      alert("Project updated successfully!");
      fetchProjectInfo(); 
    } catch (error) {
      console.error("Error updating project:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProject = async () => {
    try {
      await api.delete(`/admin/delete-project/${projectId}`);
      navigate('/admin/panel')
    } catch (error) {
      console.log(error);
    }
  }

  const fetchUsers = async () => {
    try {
      const { data } = await api.get("/admin/get-all-users");
      console.log(data);
      setAllUsers(data.users || []);
      
    } catch (err) {
      console.error("Failed to fetch users", err);
    } 
}
    
  useEffect(() => {
    if (projectId) {
      fetchProjectInfo(); 
      fetchProjectUsers(projectId);
      fetchUsers();
      fetchProjectTasks()
    }
  }, [projectId]); 

  const assignUserToProject = async (userId) => {
    try {
      const response = await api.post("/admin/assign-user", {
        userId,
        projectId,
      });
      console.log(response.data);
      
      fetchProjectUsers(projectId);
    } catch (error) {
      console.error("Error assigning user to project:", error);
    }
  };

  return (
    <div className="p-8 lg:ml-65 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-end gap-3">
         <button
                  onClick={() => setIsModalOpen(true)}
                  className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  <LuFileDiff size={20} /> Update Project
                </button>
         <button
         onClick={handleDeleteProject}
                  className="flex items-center gap-2 bg-red-700 text-white px-4 py-2 rounded-lg hover:bg-red-800 transition"
                >
                  <LuMinus size={20} /> Delete Project
                </button>
      </div>
      <h1 className="text-3xl font-bold mb-2">{project?.title}</h1>
      <p className="text-gray-600 mb-8">{project?.description}</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-xl font-semibold mb-4">Project Members</h2>
          <ul>
            {members?.map((member) => (
              <li key={member.id} className="py-2 border-b">
                {member.name}
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
          className="bg-blue-600 text-white px-4 py-2 rounded">
            Assign
          </button>
        </div>
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
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Enter project name"
                  value={updatedProject.title}
                  onChange={(e) =>
                    setUpdatedProject({ ...updatedProject, title: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none h-28"
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
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? "Updating..." : "Update"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProjectDetails;
