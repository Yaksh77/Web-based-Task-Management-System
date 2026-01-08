// src/pages/Dashboard.jsx
//  id: serial('id').primaryKey(),
//   title: varchar('title', { length: 255 }).notNull(),
//   description: text('description'),
//   status: statusEnum('status').default('TODO'),
//   priority: priorityEnum('priority').default('MEDIUM'),
//   dueDate: timestamp('dueDate'),
//   createdBy: integer('createdBy').references(() => users.id, { onDelete: 'set null' }),
//   createdAt: timestamp('createdAt').defaultNow(),
import React from "react";
import { useAuthStore } from "../../store/userAuthStore";
import api from "../../../api";
import { useEffect } from "react";
import { useState } from "react";
import { LuArrowRight, LuFolder } from "react-icons/lu";
function Dashboard() {
  const user = useAuthStore((state) => state.user);
  const [myProjects,setMyProjects] = useState([])

  const handleGetUserProject = async ()=>{
    try {
        const {data} = await api.get(`/user/user-projects`)    
        console.log(data.projects);
         
        setMyProjects(data.projects)     
        console.log(myProjects);
            
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(()=>{
    handleGetUserProject()
  },[])
  return (
   <div className="p-8 md:ml-60">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">My Assigned Projects</h1>
      
      {myProjects.length === 0 ? (
        <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 text-blue-700">
          You haven't been assigned to any projects yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {myProjects.map((project) => (
            <div key={project.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition">
              <div className="flex items-center gap-3 mb-4 text-blue-600">
                <LuFolder size={24} />
                <h3 className="text-xl font-semibold text-gray-800 truncate">{project.title}</h3>
              </div>
              <p className="text-gray-600 text-sm mb-6 line-clamp-2">{project.description}</p>
              
              <button 
                onClick={() => navigate(`/project/${project.id}/tasks`)}
                className="w-full flex items-center justify-center gap-2 bg-gray-50 text-gray-700 py-2 rounded-lg hover:bg-blue-600 hover:text-white transition font-medium"
              >
                View Tasks <LuArrowRight size={18} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
export default Dashboard;
