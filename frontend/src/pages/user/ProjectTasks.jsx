import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../../../api";
import TaskTable from "../../components/TaskTable";
import Loader from "../../components/Loader";

function ProjectTasks() {
  const { projectId } = useParams();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchProjectTasks = async (pageNum) => {
    setLoading(true);
    try {
      const { data } = await api.get(`/user/get-project-tasks/${projectId}`);
      setTasks(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectTasks();
  }, [projectId]);
  
  if (loading) {
    return <Loader variant="page" text="Loading project tasks..." />;
  }

  return (
    <div className="p-8 h-screen flex flex-col">
      <div className="mb-6 flex justify-between items-center shrink-0">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
          Project Tasks
        </h1>
        <Link
          to="/dashboard"
          className="text-indigo-600 font-bold hover:underline"
        >
          ← Back to Projects
        </Link>
      </div>

      <div className="flex-1 bg-white rounded-4xl shadow-xl border border-slate-100 overflow-y-auto no-scrollbar max-h-[600px] p-6">
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
    </div>
  );
}

export default ProjectTasks;
