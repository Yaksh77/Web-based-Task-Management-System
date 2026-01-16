import React, { useState } from "react";
import ConfirmDelete from "./ConfirmDelete";

function Users({ allUsers, user, handleChangeUserRole, handleDeleteUser }) {
  const [deleteUser, setDeleteUser] = useState(null);
  const [deleteUserId, setDeleteUserId] = useState(null);
  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow">
      <table className="min-w-full table-auto">
        <thead>
          <tr className="bg-gray-100 text-left text-sm font-semibold text-gray-600">
            <th className="p-4">Name</th>
            <th className="p-4">Email</th>
            <th className="p-4">Role</th>
            <th className="p-4 text-center">Action</th>
            <th className="p-4 text-center">Edit</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {allUsers?.map((currentUser) => {
            const isSelf = currentUser.id === user?.id;

            return (
              <tr key={currentUser.id} className="hover:bg-gray-50">
                <td className="p-4 font-medium text-gray-900">
                  {currentUser.name}{" "}
                  {isSelf && (
                    <span className="text-blue-500 text-xs">(You)</span>
                  )}
                </td>
                <td className="p-4 text-gray-500">{currentUser.email}</td>
                <td className="p-4">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-bold ${
                      currentUser.role === "ADMIN"
                        ? "bg-purple-100 text-purple-700"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {currentUser.role}
                  </span>
                </td>

                <td className="p-4 text-center">
                  {isSelf ? (
                    <span className="text-gray-400 text-sm italic">
                      No Action
                    </span>
                  ) : (
                    <button
                      onClick={() => {
                        const nextRole =
                          currentUser.role === "ADMIN" ? "USER" : "ADMIN";
                        handleChangeUserRole(currentUser.id, nextRole);
                      }}
                      className={`text-sm font-semibold px-3 py-1 rounded border transition ${
                        currentUser.role === "ADMIN"
                          ? "border-orange-500 text-orange-500 hover:bg-orange-50"
                          : "border-green-500 text-green-500 hover:bg-green-50"
                      }`}
                    >
                      {currentUser.role === "ADMIN"
                        ? "Demote to USER"
                        : "Promote to ADMIN"}
                    </button>
                  )}
                </td>

                <td className="p-4 text-center">
                  {isSelf ? (
                    <span className="text-gray-400 text-sm italic">
                      Protected
                    </span>
                  ) : (
                    <button
                      onClick={() => {
                        setDeleteUserId(currentUser.id);
                        setDeleteUser(true);
                      }}
                      className="text-sm font-semibold px-3 py-1 rounded border transition border-red-500 text-red-500 hover:bg-red-50"
                    >
                      Remove
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {deleteUser && (
        <ConfirmDelete
          onConfirmDelete={() => handleDeleteUser(deleteUserId)}
          onCancel={setDeleteUser}
        />)  
      }
    </div>
  );
}

export default Users;
