import React from "react";

function ConfirmDelete({ onConfirmDelete, onCancel }) {
  return (
    <div className="fixed inset-0  bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          Are you sure you want to delete this item?
        </h2>
        <div className="flex gap-3 mt-6">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-50"
          >
            {" "}
            Cancel
          </button>
          <button
            type="button"
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            onClick={onConfirmDelete}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDelete;
