import React from "react";
import { useAuthStore } from "../../store/userAuthStore";
import api from "../../../api";
import { useEffect } from "react";
import { useState } from "react";
import { LuArrowRight, LuFolder } from "react-icons/lu";
import { useNavigate } from "react-router-dom";
function Dashboard() {
  const [myProjects, setMyProjects] = useState([]);

  const handleGetUserProject = async () => {
    try {
      const { data } = await api.get(`/user/user-projects`);
      console.log(data.projects);
      setMyProjects(data.projects);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    handleGetUserProject();
  }, []);
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">
        My Assigned Projects
      </h1>

      {myProjects.length === 0 ? (
        <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 text-blue-700">
          You haven't been assigned to any projects yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {myProjects.map((project) => (
            <div
              key={project.id}
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition"
            >
              <div className="flex items-center gap-3 mb-4 text-blue-600">
                <LuFolder size={24} />
                <h3 className="text-xl font-semibold text-gray-800 truncate">
                  {project.title}
                </h3>
              </div>
              <p className="text-gray-600 text-sm mb-6 line-clamp-2">
                {project.description}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
export default Dashboard;
