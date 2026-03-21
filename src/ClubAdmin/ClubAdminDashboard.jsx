import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ClubAdminDashboard = () => {
  const { auth } = useContext(AuthContext);
  const [profileData, setProfileData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!auth || !auth._id) return;

      setIsLoading(true);
      try {
        const response = await axios.get(
          `/api/user/profile/${auth._id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        setProfileData(response.data);
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast.error("Failed to load profile data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [auth]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className=" mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {/* Dashboard Header */}
          <div className="px-6 py-5 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">
              Club Admin Dashboard
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Welcome back, {auth?.name || "Club Admin"}
            </p>
          </div>

          {/* Profile Information */}
          <div className="px-6 py-5">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Club Profile
            </h2>

            <div className="bg-gray-50 p-4 rounded-lg mb-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Club Name
                  </h3>
                  <p className="mt-1 text-sm text-gray-900">
                    {profileData?.name || auth?.name || "Not available"}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Email Address
                  </h3>
                  <p className="mt-1 text-sm text-gray-900">
                    {profileData?.email || auth?.email || "Not available"}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Phone Number
                  </h3>
                  <p className="mt-1 text-sm text-gray-900">
                    {profileData?.mobile || auth?.mobile || "Not available"}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500">Address</h3>
                  <p className="mt-1 text-sm text-gray-900">
                    {profileData?.address || "Not available"}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-center mt-6">
              <button
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 w-auto"
                onClick={() => toast.info("Edit profile feature coming soon!")}
              >
                Edit Profile
              </button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="px-6 py-5 border-t border-gray-200">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Quick Stats
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="bg-indigo-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-indigo-800">Members</h3>
                <p className="mt-2 text-3xl font-bold text-indigo-600">0</p>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-green-800">Events</h3>
                <p className="mt-2 text-3xl font-bold text-green-600">0</p>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-blue-800">
                  Tournaments
                </h3>
                <p className="mt-2 text-3xl font-bold text-blue-600">0</p>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="px-6 py-5 border-t border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-gray-900">
                Recent Activity
              </h2>
              <button className="text-sm text-indigo-600 hover:text-indigo-500 bg-transparent hover:bg-transparent">
                View All
              </button>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg text-center">
              <p className="text-gray-500">No recent activity found.</p>
              <button
                className="mt-3 inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                onClick={() => toast.info("Create event feature coming soon!")}
              >
                Create Your First Event
              </button>
            </div>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-5">
          <button
            className="px-4 py-3 bg-white shadow rounded-lg hover:bg-transparent hover:shadow-md transition-shadow duration-200 flex items-center justify-center"
            onClick={() => toast.info("Members management coming soon!")}
          >
            <span className="text-gray-900 font-medium hover:bg-transparent">
              Manage Members
            </span>
          </button>

          <button
            className="px-4 py-3 bg-white shadow rounded-lg hover:bg-transparent hover:shadow-md transition-shadow duration-200 flex items-center justify-center"
            onClick={() => toast.info("Event creation coming soon!")}
          >
            <span className="text-gray-900 font-medium">Create Event</span>
          </button>

          <button
            className="px-4 py-3 bg-white shadow rounded-lg hover:bg-transparent hover:shadow-md transition-shadow duration-200 flex items-center justify-center"
            onClick={() => toast.info("Tournament creation coming soon!")}
          >
            <span className="text-gray-900 font-medium hover:bg-transparent">
              Create Tournament
            </span>
          </button>
        </div>
      </div>
      <ToastContainer position="top-center" />
    </div>
  );
};

export default ClubAdminDashboard;
