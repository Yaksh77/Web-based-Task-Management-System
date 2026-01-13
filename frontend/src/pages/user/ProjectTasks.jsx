import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../../../api";
import TaskTable from "../../components/TaskTable";

function ProjectTasks() {
  const { projectId } = useParams(); 
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    const fetchProjectTasks = async () => {
      try {
        const { data } = await api.get(`/user/get-project-tasks/${projectId}`);
        console.log(data);
        
        setTasks(data.tasks);
      } catch (err) { console.error(err); }
    };
    fetchProjectTasks();
  }, [projectId]);

  return (
    <div className="p-8">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Project Tasks</h1>
        <Link to="/dashboard" className="text-blue-600 hover:underline">← Back to Projects</Link>
      </div>

    <TaskTable
      tasks={tasks}
      visibleColumns={[
        "title",
        "priority",
        "dueDate",
        "status",
        "assignedTo",
      ]}
    />
    </div>
  );
}

export default ProjectTasks