import React, { useState } from "react";
import { LuPencil, LuTrash, LuEye } from "react-icons/lu";
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
      OVERDUE: "text-red-700 bg-red-200 border-red-200",
      COMPLETED: "text-green-700 bg-green-200 border-green-200",
      IN_TESTING: "text-purple-700 bg-purple-50 border-purple-100",
      TODO: "text-blue-700 bg-blue-50 border-blue-100",
      IN_PROGRESS: "text-orange-700 bg-orange-50 border-orange-100",
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
          <tbody className="divide-y divide-gray-50">
            {tasks.map((task) => (
              <tr
                key={task.id}
                className={`${
                  task.status === "OVERDUE"
                    ? "bg-red-50/50"
                    : "hover:bg-gray-50/50"
                } transition-colors`}
              >
                {visibleColumns.includes("title") && (
                  <td className="p-4">
                    <div className="font-bold text-gray-800 truncate">{task.title}</div>
                    <div className="text-[10px] text-blue-500 font-medium uppercase truncate">
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
                      className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg cursor-pointer"
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
                      className="text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      <LuEye size={20} />
                    </Link>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
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
