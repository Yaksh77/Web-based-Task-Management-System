import React, { useState } from "react";
import { LuPencil, LuTrash, LuEye, LuClipboardList } from "react-icons/lu";
import { Link } from "react-router-dom";
import ConfirmDelete from "./ConfirmDelete";

function TaskTable({
  tasks,
  onEdit,
  onDelete,
  visibleColumns = [
    "title",
    "priority",
    "dueDate",
    "status",
    "actions",
    "createdBy",
    "AssignedTo",
    "details",
  ],
}) {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const renderStatus = (status) => {
    const styles = {
      OVERDUE: "text-red-600 bg-red-50 border-red-100",
      COMPLETED: "text-emerald-600 bg-emerald-50 border-emerald-100",
      IN_TESTING: "text-indigo-600 bg-indigo-50 border-indigo-100",
      TODO: "text-slate-600 bg-slate-100 border-slate-200",
      IN_PROGRESS: "text-amber-600 bg-amber-50 border-amber-100",
    };
    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-bold border ${
          styles[status] || ""
        }`}
      >
        {status.replace("_", " ")}
      </span>
    );
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase">
              {visibleColumns.includes("title") && (
                <th className="p-4">Task & Project</th>
              )}
              {visibleColumns.includes("priority") && (
                <th className="p-4">Priority</th>
              )}
              {visibleColumns.includes("dueDate") && (
                <th className="p-4">Due Date</th>
              )}
              {visibleColumns.includes("status") && (
                <th className="p-4">Status</th>
              )}
              {visibleColumns.includes("createdBy") && (
                <th className="p-4">Created By</th>
              )}
              {visibleColumns.includes("assignedTo") && (
                <th className="p-4">Assigned To</th>
              )}
              {visibleColumns.includes("actions") && (
                <th className="p-4">Actions</th>
              )}
              {visibleColumns.includes("details") && (
                <th className="p-4">View</th>
              )}
            </tr>
          </thead>
          {tasks?.length > 0 ? (
            <tbody className="divide-y divide-gray-50">
              {tasks.map((task,index) => (
                <tr
                  key={index}
                  className={`${
                    task.status === "OVERDUE"
                      ? "bg-red-50/50"
                      : "hover:bg-gray-50/50"
                  } transition-colors`}
                >
                  {visibleColumns.includes("title") && (
                    <td className="p-4">
                      <div className="font-bold text-gray-800 truncate">
                        {task.title}
                      </div>
                      <div className="text-[10px] text-indigo-600 font-medium uppercase truncate">
                        {task.projectName || "General"}
                      </div>
                    </td>
                  )}

                  {visibleColumns.includes("priority") && (
                    <td className="p-4 text-xs font-bold text-gray-600">
                      {task.priority}
                    </td>
                  )}

                  {visibleColumns.includes("dueDate") && (
                    <td className="p-4 text-sm text-gray-600 italic">
                      {task.dueDate
                        ? new Date(task.dueDate).toLocaleDateString("en-GB")
                        : "No deadline"}
                    </td>
                  )}

                  {visibleColumns.includes("status") && (
                    <td className="p-4">{renderStatus(task.status)}</td>
                  )}

                  {visibleColumns.includes("createdBy") && (
                    <td className="p-4 text-sm text-gray-600 truncate">
                      {task.createdByName || "N/A"}
                    </td>
                  )}

                  {visibleColumns.includes("assignedTo") && (
                    <td className="p-4 text-sm text-gray-600">
                      {task.assignedToName || "Unassigned"}
                    </td>
                  )}

                  {visibleColumns.includes("actions") && (
                    <td className="p-4 flex gap-3">
                      <button
                        onClick={() => onEdit(task)}
                        className="p-2 text-indigo-600 hover:bg-indigo-100 rounded-lg cursor-pointer"
                      >
                        <LuPencil size={18} />
                      </button>
                      <button
                        onClick={() => {
                          setIsDeleteModalOpen(true);
                          setItemToDelete(task.id);
                        }}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg cursor-pointer"
                      >
                        <LuTrash size={18} />
                      </button>
                    </td>
                  )}

                  {visibleColumns.includes("details") && (
                    <td className="p-4">
                      <Link
                        to={`/tasks/${task.id}`}
                        className="text-indigo-600 hover:text-indigo-800 transition-colors"
                      >
                        <LuEye size={20} />
                      </Link>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          ) : (
            <tbody>
              <tr>
                <td
                  colSpan={visibleColumns.length}
                  className="py-24 text-center"
                >
                  <div className="flex flex-col items-center justify-center">
                    <div className="w-20 h-20 bg-indigo-50 text-indigo-400 rounded-full flex items-center justify-center mb-6 animate-pulse">
                      <LuClipboardList size={40} strokeWidth={1.5} />
                    </div>

                    <h3 className="text-xl font-black text-slate-900 tracking-tight">
                      No Tasks Available
                    </h3>

                    <p className="text-slate-400 text-sm mt-2 max-w-[250px] mx-auto leading-relaxed">
                      There are no tasks to display at the moment. Please check
                      back later.
                    </p>

                    <div className="mt-8 border-t border-slate-100 pt-3 w-48">
                      <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-[0.2em]">
                        Ready for more?
                      </span>
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          )}
        </table>
      </div>
      {isDeleteModalOpen && (
        <ConfirmDelete
          onConfirmDelete={() => {
            onDelete(itemToDelete);
            setIsDeleteModalOpen(false);
          }}
          onCancel={() => setIsDeleteModalOpen(false)}
        />
      )}
    </div>
  );
}

export default TaskTable;
