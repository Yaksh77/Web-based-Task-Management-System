import React, { useState } from "react";
import { useEffect } from "react";
import api from "../../../api";
import { useAuthStore } from "../../store/userAuthStore";
import Users from "../../components/Users";
import Pagination from "../../components/Pagination";
import toast from "react-hot-toast";
import { LuPlus, LuSearch, LuUserPlus } from "react-icons/lu";
import Loader from "../../components/Loader";

function ManageUsers() {
  const [allUsers, setAllUsers] = useState([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const user = useAuthStore((state) => state.user);
  const [search, setSearch] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [deleteUser, setDeleteUser] = useState(false);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    role: "USER",
  });

  useEffect(() => {
    const delay = setTimeout(() => {
      setSearchTerm(search);
    }, 500);
    return () => clearTimeout(delay);
  }, [search]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handleFetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/admin/get-all-users", {
        params: {
          page: currentPage,
          limit: 3,
          search: searchTerm,
        },
      });
      setAllUsers(data.data.users || []);
      setTotalPages(data.pagination.totalPages);
    } catch (err) {
      console.error("Failed to fetch users", err);
    }
    finally {
      setLoading(false);
    }
  };
  const handleChangeUserRole = async (userId, newRole) => {
    try {
      const response = await api.patch("/user/update-role", {
        userId,
        newRole,
      });
      if (response.status === 200) {
        toast.success("User role updated successfully");
        handleFetchUsers();
      }
    } catch (err) {
      console.log(err);
      toast.error("Failed to update user role");
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post("/admin/create-user", newUser);
      if (response.status === 201) {
        toast.success("User created successfully");
        setIsCreateModalOpen(false);
        handleFetchUsers();
      }
    } catch (err) {
      console.log(err);
      toast.error("Failed to create user");
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      const response = await api.delete(`/user/delete-user/${userId}`);
      if (response.status === 200) {
        toast.success("User deleted successfully");
        handleFetchUsers();
      }
    } catch (err) {
      console.log(err);
      toast.error("Failed to delete user");
    }
  };

  useEffect(() => {
    handleFetchUsers();
  }, [currentPage,searchTerm]);

  if(loading){
    return <Loader variant="page" text="Fetching Users..." />
  }
  
  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold mb-6">User Management</h2>
        <button
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-lg shadow-indigo-200 transition-all active:scale-95"
          onClick={() => setIsCreateModalOpen(true)}
        >
          <LuPlus /> Add User
        </button>
      </div>

      {/* <div className="overflow-x-auto bg-white rounded-lg shadow">
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
                        onClick={() => handleDeleteUser(currentUser.id)}
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
      </div> */}

      <div className="flex items-center gap-4 w-[50%] md:w-auto mb-5">
        <div className="relative flex-1 md:w-64 group">
          <LuSearch className="absolute left-3.5 top-3 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 text-sm transition-all shadow-sm"
          />
        </div>
      </div>

      <Users
        allUsers={allUsers}
        user={user}
        handleChangeUserRole={handleChangeUserRole}
        handleDeleteUser={handleDeleteUser}
      />

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={(page) => setCurrentPage(page)}
      />

      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 md:p-8 w-full max-w-md shadow-2xl h-full max-h-[70vh] overflow-y-auto no-scrollbar">
            {/* Modal Header */}
            <h2 className="text-2xl font-bold mb-6 text-gray-900 flex items-center gap-2">
              <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600">
                <LuUserPlus size={24} />
              </div>
              Create New User
            </h2>

            <form onSubmit={handleCreateUser} className="space-y-5">
              {/* Name Field */}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase ml-1">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="Enter user's name"
                  value={newUser.name}
                  onChange={(e) =>
                    setNewUser({ ...newUser, name: e.target.value })
                  }
                  className="w-full mt-1.5 p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  required
                />
              </div>

              {/* Email Field */}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase ml-1">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="email@example.com"
                  value={newUser.email}
                  onChange={(e) =>
                    setNewUser({ ...newUser, email: e.target.value })
                  }
                  className="w-full mt-1.5 p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  required
                />
              </div>

              {/* Password Field */}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase ml-1">
                  Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={newUser.password}
                  onChange={(e) =>
                    setNewUser({ ...newUser, password: e.target.value })
                  }
                  className="w-full mt-1.5 p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  required
                />
              </div>

              {/* Role Selection */}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase ml-1">
                  Role
                </label>
                <select
                  value={newUser.role}
                  onChange={(e) =>
                    setNewUser({ ...newUser, role: e.target.value })
                  }
                  className="w-full mt-1.5 p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer font-medium"
                >
                  <option value="USER">USER</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="flex-1 px-4 py-3 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-100 font-bold transition-all active:scale-95 cursor-pointer"
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManageUsers;
