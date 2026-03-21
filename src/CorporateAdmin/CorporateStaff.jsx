import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthContext } from '../context/AuthContext';
import {
    UserGroupIcon,
    UserPlusIcon,
    TrashIcon,
    ArrowPathIcon
} from '@heroicons/react/24/outline';

const CorporateStaff = () => {
    const { user } = useContext(AuthContext);
    const [managers, setManagers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [newManager, setNewManager] = useState({
        name: "",
        email: "",
        password: "",
    });

    // Reuse existing API endpoint structure for fetching managers?
    // The existing 'fetchManagers' in ManagerAdmin.jsx calls `/api/manager/club-admin/managers`
    // We should check if that endpoint supports corporate admin. 
    // It filters by `clubId`, which we are reusing for Corporate Admin userId.
    // So `clubId` = `user._id` (Corporate Admin ID).
    // Let's assume it works or we might need to verify the endpoint permissions.

    const fetchManagers = async () => {
        try {
            setLoading(true);
            if (!user?._id) return;

            // Reusing existing manager fetch logic
            const response = await axios.get(`/api/manager/club-admin/managers?clubId=${user._id}`);
            const managersData = Array.isArray(response.data) ? response.data : [];
            setManagers(managersData);
        } catch (err) {
            console.error("Error fetching managers:", err);
            // toast.error("Failed to fetch managers.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchManagers();
    }, [user]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewManager((prev) => ({ ...prev, [name]: value }));
    };

    const generatePassword = () => {
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%";
        let password = "";
        for (let i = 0; i < 10; i++) {
            password += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setNewManager((prev) => ({ ...prev, password }));
    };

    const handleAddManager = async (e) => {
        e.preventDefault();
        if (!newManager.name || !newManager.email || !newManager.password) {
            toast.error("All fields are required");
            return;
        }

        try {
            setIsAdding(true);

            // Use the new endpoint we created in CorporateController: /api/corporate/manager
            // Payload: { name, email, password, userId: corporateAdminId }

            await axios.post('/api/corporate/manager', {
                ...newManager,
                userId: user._id
            });

            toast.success("Manager added successfully! Credentials sent via email.");
            setNewManager({ name: "", email: "", password: "" });
            fetchManagers();
        } catch (err) {
            toast.error(err.response?.data?.message || err.response?.data?.error || "Failed to add manager");
        } finally {
            setIsAdding(false);
        }
    };

    const handleDeleteManager = async (id) => {
        if (!window.confirm("Are you sure you want to delete this manager?")) return;
        try {
            // Reusing existing delete endpoint: /api/manager/managers/:id
            await axios.delete(`/api/manager/managers/${id}`);
            toast.success("Manager deleted successfully");
            fetchManagers();
        } catch (err) {
            toast.error("Failed to delete manager");
        }
    };

    return (
        <div className="space-y-6">
            <ToastContainer position="top-right" autoClose={3000} />

            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Staff Management</h1>
                    <p className="text-gray-600">Add managers to organize tournaments for your company.</p>
                </div>
                <button
                    onClick={fetchManagers}
                    className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition"
                    title="Refresh List"
                >
                    <ArrowPathIcon className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            {/* Add Manager Form */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center text-gray-800">
                    <UserPlusIcon className="w-5 h-5 mr-2 text-blue-600" />
                    Add New Manager
                </h2>
                <form onSubmit={handleAddManager} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                        <input
                            type="text"
                            name="name"
                            value={newManager.name}
                            onChange={handleInputChange}
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                            placeholder="Manager Name"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                            type="email"
                            name="email"
                            value={newManager.email}
                            onChange={handleInputChange}
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                            placeholder="email@company.com"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <div className="flex">
                            <input
                                type="text"
                                name="password"
                                value={newManager.password}
                                onChange={handleInputChange}
                                className="w-full rounded-l-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                                placeholder="Manager Password"
                            />
                            <button
                                type="button"
                                onClick={generatePassword}
                                className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 hover:bg-gray-100"
                                title="Generate Password"
                            >
                                ⚡
                            </button>
                        </div>
                    </div>
                    <button
                        type="submit"
                        disabled={isAdding}
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                        {isAdding ? "Adding..." : "Add Manager"}
                    </button>
                </form>
            </div>

            {/* Managers List */}
            <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                    <h3 className="text-lg font-medium leading-6 text-gray-900 flex items-center">
                        <UserGroupIcon className="w-5 h-5 mr-2" />
                        Active Managers
                    </h3>
                </div>
                <ul className="divide-y divide-gray-200">
                    {loading ? (
                        <li className="px-6 py-4 text-center text-gray-500">Loading...</li>
                    ) : managers.length === 0 ? (
                        <li className="px-6 py-8 text-center text-gray-500">
                            No managers found. Add one above to get started.
                        </li>
                    ) : (
                        managers.map((manager) => (
                            <li key={manager._id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition">
                                <div className="flex items-center">
                                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg">
                                        {manager.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="ml-4">
                                        <div className="text-sm font-medium text-gray-900">{manager.name}</div>
                                        <div className="text-sm text-gray-500">{manager.email}</div>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${manager.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                                        {manager.isActive ? "Active" : "Inactive"}
                                    </span>
                                    <button
                                        onClick={() => handleDeleteManager(manager._id)}
                                        className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded-full transition"
                                        title="Delete Manager"
                                    >
                                        <TrashIcon className="w-5 h-5" />
                                    </button>
                                </div>
                            </li>
                        ))
                    )}
                </ul>
            </div>
        </div>
    );
};

export default CorporateStaff;
