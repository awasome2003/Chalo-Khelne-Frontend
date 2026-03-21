import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { UserGroupIcon, BuildingOfficeIcon, TrophyIcon } from '@heroicons/react/24/outline';
import axios from 'axios';

const CorporateDashboard = () => {
    const { user } = useContext(AuthContext);
    const [stats, setStats] = useState({
        totalManagers: 0,
        companySize: "--",
        totalTournaments: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            if (!user?._id) return;

            try {
                setLoading(true);
                // 1. Fetch Managers Count
                const managersRes = await axios.get(`/api/manager/club-admin/managers?clubId=${user._id}`);
                const managersCount = Array.isArray(managersRes.data) ? managersRes.data.length : 0;

                // 2. Fetch Corporate Profile for Company Size
                let companySize = "--";
                try {
                    const profileRes = await axios.get(`/api/corporate/${user._id}`);
                    if (profileRes.data && profileRes.data.corporateProfile) {
                        companySize = profileRes.data.corporateProfile.companySize || "--";
                    }
                } catch (profileErr) {
                    console.error("Error fetching corporate profile:", profileErr);
                }

                // 3. Fetch Tournaments Count
                let tournamentsCount = 0;
                try {
                    const tournRes = await axios.get(`/api/tournaments/corporate/${user._id}`);
                    if (tournRes.data && tournRes.data.success) {
                        tournamentsCount = tournRes.data.tournaments.length;
                    }
                } catch (err) {
                    console.error("Error fetching tournaments count:", err);
                }

                setStats({
                    totalManagers: managersCount,
                    companySize: companySize,
                    totalTournaments: tournamentsCount
                });
            } catch (error) {
                console.error("Error fetching dashboard stats:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [user]);

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.name || "Corporate Admin"}!</h1>
                <p className="text-gray-600 mt-2">Manage your corporate staff and tournaments from here.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Stat 1 */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex items-center">
                    <div className="p-3 bg-blue-100 rounded-full mr-4">
                        <UserGroupIcon className="w-8 h-8 text-blue-600" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Total Managers</p>
                        <p className="text-2xl font-bold text-gray-900">{loading ? "..." : stats.totalManagers}</p>
                    </div>
                </div>

                {/* Stat 2 */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex items-center">
                    <div className="p-3 bg-purple-100 rounded-full mr-4">
                        <BuildingOfficeIcon className="w-8 h-8 text-purple-600" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Company Size</p>
                        <p className="text-2xl font-bold text-gray-900">{loading ? "..." : stats.companySize}</p>
                    </div>
                </div>

                {/* Stat 3 */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex items-center">
                    <div className="p-3 bg-orange-100 rounded-full mr-4">
                        <TrophyIcon className="w-8 h-8 text-orange-600" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Total Tournaments</p>
                        <p className="text-2xl font-bold text-gray-900">{loading ? "..." : stats.totalTournaments}</p>
                    </div>
                </div>
            </div>

            <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
                <div className="flex">
                    <div className="ml-3">
                        <p className="text-sm text-blue-700">
                            Create managers in the <b>Staff Management</b> tab to let them organize tournaments for your employees.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CorporateDashboard;
