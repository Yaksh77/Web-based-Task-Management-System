import React from "react";
import { LuMessageSquare, LuPencil, LuSend, LuTrash } from "react-icons/lu";

function TaskComments({
  comments,
  user,
  handleAddComment,
  newComment,
  setNewComment,
  handleDeleteComment,
  editingCommentId,
  setEditingCommentId,
  editedComment,
  setEditedComment,
  handleUpdateComment,
  editInputRef,
}) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-200">
      <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
        <LuMessageSquare className="text-blue-600" /> Comments
      </h3>

      <form onSubmit={handleAddComment} className="mb-6 relative">
        <textarea
          className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          placeholder="Write a comment..."
          rows="3"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
        />
        <button
          type="submit"
          className="absolute right-3 bottom-3 bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700"
        >
          <LuSend size={20} />
        </button>
      </form>

      <div className="border rounded-2xl border-gray-200 divide-y divide-gray-100 space-y-4 p-4 max-h-96 overflow-y-auto">
        {comments?.map((c) => (
          <div
            key={c.id}
            className="p-3 bg-gray-50 rounded-xl border border-gray-200"
          >
            <div className="flex justify-between items-center mb-1">
              <span className="font-bold text-md text-blue-600">{c.user}</span>
              <span className="text-[10px] text-gray-400">
                {new Date(c.createdAt).toLocaleString()}
              </span>
            </div>

            <div className="flex justify-between items-center gap-4">
              {editingCommentId === c.id ? (
                <input
                  ref={editInputRef}
                  type="text"
                  className="w-full p-2 bg-white border border-blue-400 rounded-lg outline-none shadow-sm"
                  value={editedComment}
                  onChange={(e) => setEditedComment(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleUpdateComment(c.id);
                    if (e.key === "Escape") setEditingCommentId(null);
                  }}
                  autoFocus
                />
              ) : (
                <p className="text-gray-700 w-full">{c.description}</p>
              )}

              {(user.role === "ADMIN" || user.id === c.userId) && (
                <div className="flex items-center gap-3">
                  <button
                    className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors cursor-pointer"
                    onClick={() => handleDeleteComment(c.id)}
                    title="Delete"
                  >
                    <LuTrash size={16} />
                  </button>

                  <button
                    onClick={() => {
                      if (editingCommentId === c.id) {
                        handleUpdateComment(c.id);
                      } else {
                        startEditing(c);
                      }
                    }}
                    className="text-blue-500 hover:bg-blue-50 p-1.5 rounded-lg transition-colors cursor-pointer"
                  >
                    {editingCommentId === c.id ? (
                      <LuSend size={16} />
                    ) : (
                      <LuPencil size={16} />
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TaskComments;
