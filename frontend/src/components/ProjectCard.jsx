import React from "react";
import { LuFolder, LuCalendar, LuArrowRight, LuFolderOpen } from "react-icons/lu";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/userAuthStore";

const ProjectCard = ({ project,  }) => {
  const user = useAuthStore((state) => state.user);
  const isAdmin = user.role === "ADMIN";
  const navigate = useNavigate();

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition space-y-4 flex flex-col justify-between h-full">
      <div>
        <div className={`flex items-center gap-3 mb-3 ${isAdmin ? "text-indigo-600" : "text-indigo-600"}`}>
          {isAdmin ? <LuFolderOpen size={24} /> : <LuFolder size={24} />}
          <h3 className="text-xl font-semibold text-gray-800 truncate">
            {project.title}
          </h3>
        </div>
        
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {project.description || "No description provided."}
        </p>

        {isAdmin && (
          <div className="flex items-center text-gray-400 text-xs gap-1 mt-2">
            <LuCalendar size={14} />
            <span>
              Created on: {new Date(project.createdAt).toLocaleDateString()}
            </span>
          </div>
        )}
      </div>

      <div className={`pt-4 border-t border-gray-50 mt-auto`}>
        {isAdmin ? (
          <button
            onClick={() => navigate(`/admin/project-details/${project.id}`)}
            className="w-full bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition font-medium"
          >
            View Details
          </button>
        ) : (
          <Link
            to={`/projects/${project.id}/tasks`}
            className="text-indigo-600 text-sm font-bold flex items-center gap-1 hover:underline"
          >
            View Tasks <LuArrowRight size={16} />
          </Link>
        )}
      </div>
    </div>
  );
};

export default ProjectCard;