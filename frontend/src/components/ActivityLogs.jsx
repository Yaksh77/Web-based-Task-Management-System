import React from 'react'
import { LuCalendar, LuCheckCheck, LuFlag, LuHistory, LuMessageSquare, LuPlus, LuRefreshCw, LuTrash2, LuUserPlus } from 'react-icons/lu';

 const getLogStyles = (action) => {
  const text = action.toLowerCase();

  // Task Created
  if (text.includes("created") || text.includes("added the task")) {
    return {
      color: "text-green-600",
      bg: "bg-green-50",
      icon: <LuPlus size={14} />,
    };
  }

  // Task Deleted 
  if (text.includes("deleted") || text.includes("removed")) {
    return {
      color: "text-red-600",
      bg: "bg-red-50",
      icon: <LuTrash2 size={14} />,
    };
  }

  // Status Change
  if (text.includes("status"))
    return {
      color: "text-blue-600",
      bg: "bg-blue-50",
      icon: <LuRefreshCw size={14} />,
    };

  // Priority Change
  if (text.includes("priority"))
    return {
      color: "text-amber-600",
      bg: "bg-amber-50",
      icon: <LuFlag size={14} />,
    };

  // Assignment Change
  if (text.includes("assigned") || text.includes("reassigned"))
    return {
      color: "text-purple-600",
      bg: "bg-purple-50",
      icon: <LuUserPlus size={14} />,
    };

  // Comments
  if (text.includes("comment"))
    return {
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      icon: <LuMessageSquare size={14} />,
    };

    // Due sate change
    if(text.includes('due date')){
        return{
            color:"text-orange-600",
            bg:'bg-orange-50',
            icon:<LuCalendar size={14} />
        }
    }

  return {
    color: "text-gray-600",
    bg: "bg-gray-50",
    icon: <LuCheckCheck size={14} />,
  };
};

function ActivityLogs({logs}) {

  return (
     <div className="bg-white p-6 rounded-3xl shadow-md border border-gray-200">
            <h3 className="text-xl font-bold mb-8 text-gray-800 flex items-center gap-2">
              <LuHistory className="text-gray-400" /> Task Activity
            </h3>
    
            <div className="relative space-y-6">
              <div className="absolute left-[19px] top-2 bottom-2 w-0.5 bg-gray-100"></div>
    
              {logs?.map((log) => {
                const { color, bg, icon } = getLogStyles(log.action);
                return (
                  <div key={log.id} className="relative flex gap-4 group">
                    <div
                      className={`relative z-10 w-10 h-10 rounded-full ${bg} ${color} flex items-center justify-center border-4 border-white shadow-sm transition-transform group-hover:scale-110`}
                    >
                      {icon}
                    </div>
    
                    <div className="flex-1 pt-1">
                      <div className="flex justify-between items-start">
                        <p className="text-sm text-gray-800 leading-tight">
                          <span className="font-bold text-gray-900">
                            {log.userName}
                          </span>{" "}
                          <span className="text-gray-600">{log.action}</span>
                        </p>
                      </div>
                      <p className="text-[10px] text-gray-400 mt-1 font-medium uppercase tracking-wider">
                        {new Date(log.createdAt).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          hour: "2-digit",
                          year:"2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
  )
}

export default ActivityLogs