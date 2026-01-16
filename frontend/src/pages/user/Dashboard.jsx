import React from "react";
import api from "../../../api";
import { useEffect } from "react";
import { useState } from "react";
import ProjectCard from "../../components/ProjectCard";
import { LuFolderClock } from "react-icons/lu";
import Loader from "../../components/Loader";
function Dashboard() {
  const [myProjects, setMyProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleGetUserProject = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/user/user-projects`);
      setMyProjects(data.data);
    } catch (error) {
      console.log(error);
    }finally{
      setLoading(false);
    }
  };

  useEffect(() => {
    handleGetUserProject();
  }, []);

  if(loading){
    return <Loader variant="page" text="Fetching your projects..." />;
  }

return (
  <div className="p-4 md:p-10 min-h-screen bg-slate-50">
    <div className="mb-10">
      <h1 className="text-2xl font-bold text-slate-900">
        My Assigned Projects
      </h1>
      <p className="text-slate-500 mt-1 font-medium">Projects where you are a team member</p>
    </div>

    {myProjects.length === 0 ? (
      <div className="bg-indigo-50 p-10 rounded-full border border-indigo-100 text-indigo-700 text-center shadow-sm">
        <div className="text-4xl mb-4 inline-block bg-indigo-200 p-3 rounded-full animate-pulse"><LuFolderClock size={30} /></div>
        <p className="font-bold text-lg">You haven't been assigned to any projects yet.</p>
        <p className="text-indigo-400 text-sm mt-1">Once assigned, they will appear here.</p>
      </div>
    ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {myProjects.map((project) => (
          <ProjectCard key={project.id} project={project} isAdmin={false} />
        ))}
      </div>
    )}
  </div>
);
}
export default Dashboard;
