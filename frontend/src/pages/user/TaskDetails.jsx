import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import api from "../../../api";
import { useAuthStore } from "../../store/userAuthStore";
import ActivityLogs from "../../components/ActivityLogs";
import TaskComments from "../../components/TaskComments";

function TaskDetails() {
  const { user } = useAuthStore();
  const { taskId } = useParams();
  const [data, setData] = useState([]);
  const [comments, setComments] = useState([]);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [logs, setLogs] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [editedComment, setEditedComment] = useState("");

  const fetchDetails = async () => {
    try {
      const { data } = await api.get(`/user/task/${taskId}`);
      setData(data.task);
      setComments(data.taskComments);
      setLogs(data.logs);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      const result = await api.delete(`/user/delete-comment/${commentId}`);
      fetchDetails();
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, []);

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      await api.post("/user/add-comment", { taskId, description: newComment });
      setNewComment("");
      fetchDetails();
    } catch (err) {
      alert(err.response.data.message);
    }
  };

  const handleUpdateComment = async (commentId) => {
    try {
      const result = await api.patch(`/user/update-comment/${commentId}`, {
        description: editedComment,
      });
      setEditingCommentId(null);
      setEditedComment("");
      fetchDetails();
    } catch (error) {
      console.log(error);
    }
  };

  const startEditing = (comment) => {
    setEditingCommentId(comment.id);
    setEditedComment(comment.description);
  };

  if (!data) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-4 md:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8 ">
      <div className="lg:col-span-2 space-y-4">
        <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">{data.title}</h1>
          <p className="mt-4 text-gray-600 leading-relaxed">
            {data.description}
          </p>
        </div>

        {/* Comment Section */}
        {/* <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-200">
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
                  <span className="font-bold text-md text-blue-600">
                    {c.user}
                  </span>
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
                            setEditingCommentId(null);
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
        </div> */}

        <TaskComments
          comments={comments}
          user={user}
          newComment={newComment}
          setNewComment={setNewComment}
          editingCommentId={editingCommentId}
          editedComment={editedComment}
          setEditingCommentId={setEditingCommentId}
          setEditedComment={setEditedComment}
          handleAddComment={handleAddComment}
          handleDeleteComment={handleDeleteComment}
          handleUpdateComment={handleUpdateComment}
          startEditing={startEditing}
          editInputRef={useRef(null)}
        />
      </div>

      {/* Activity Logs */}
      {/* <div className="bg-white p-6 rounded-3xl shadow-md border border-gray-200">
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
      </div> */}
      <ActivityLogs logs={logs} />
    </div>
  );
}

export default TaskDetails;
