import React, { useState, useEffect, useContext } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { AuthContext } from "../context/AuthContext";
import {
  FiEdit,
  FiTrash2,
  FiMapPin,
  FiCheckCircle,
  FiInfo,
  FiUsers,
  FiPlus,
  FiX,
  FiCheck,
  FiUserCheck,
  FiAlertTriangle,
  FiArrowLeft,
  FiImage,
  FiCalendar,
  FiSettings,
  FiEye,
  FiUserX,
  FiChevronLeft,
} from "react-icons/fi";

const ViewTurf = () => {
  const { id } = useParams();
  const { auth } = useContext(AuthContext);
  const navigate = useNavigate();

  // Core states
  const [turf, setTurf] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Manager assignment states
  const [availableManagers, setAvailableManagers] = useState([]);
  const [assignedManagers, setAssignedManagers] = useState([]);
  const [showManagerModal, setShowManagerModal] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [managersLoading, setManagersLoading] = useState(false);

  // Modal states for confirmations
  const [showDeleteTurfModal, setShowDeleteTurfModal] = useState(false);
  const [showRemoveManagerModal, setShowRemoveManagerModal] = useState(false);
  const [showAssignConfirmModal, setShowAssignConfirmModal] = useState(false);
  const [selectedManagerForRemoval, setSelectedManagerForRemoval] =
    useState(null);
  const [selectedManagerForAssignment, setSelectedManagerForAssignment] =
    useState(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  // Form validation states
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchTurf();
  }, [id, auth._id]);

  const fetchTurf = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `/api/turfs/${id}?userId=${auth._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setTurf(response.data);
      setAssignedManagers(response.data.assignedManagers || []);
      setErrors({});
    } catch (error) {
      console.error("Error fetching turf details:", error);
      toast.error("Failed to fetch turf details. Please try again.");
      setErrors({ fetch: "Failed to load turf data" });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAvailableManagers = async () => {
    try {
      setManagersLoading(true);
      const token = localStorage.getItem("token");

      // Add clubId parameter to the request
      const response = await axios.get(
        `/api/manager/club-admin/managers?clubId=${auth._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const managers = response.data.filter(
        (manager) =>
          manager.isActive &&
          !assignedManagers.some((assigned) => assigned._id === manager._id)
      );
      setAvailableManagers(managers);
    } catch (error) {
      console.error("Error fetching managers:", error);
      toast.error("Failed to fetch available managers");
    } finally {
      setManagersLoading(false);
    }
  };

  const handleAssignManager = async () => {
    if (!selectedManagerForAssignment) return;

    try {
      setIsAssigning(true);
      const token = localStorage.getItem("token");

      await axios.post(
        `/api/turfs/${id}/assign-manager`,
        { managerId: selectedManagerForAssignment._id },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Update local state
      setAssignedManagers((prev) => [...prev, selectedManagerForAssignment]);
      setAvailableManagers((prev) =>
        prev.filter((m) => m._id !== selectedManagerForAssignment._id)
      );

      toast.success(
        `${selectedManagerForAssignment.name} assigned successfully`
      );
      setShowAssignConfirmModal(false);
      setSelectedManagerForAssignment(null);
    } catch (error) {
      console.error("Error assigning manager:", error);
      const errorMessage =
        error.response?.data?.error || "Failed to assign manager";
      toast.error(errorMessage);
    } finally {
      setIsAssigning(false);
    }
  };

  const handleRemoveManager = async () => {
    if (!selectedManagerForRemoval) return;

    try {
      const token = localStorage.getItem("token");

      await axios.delete(
        `/api/turfs/${id}/remove-manager/$
          selectedManagerForRemoval._id
        }`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Update local state
      setAssignedManagers((prev) =>
        prev.filter((m) => m._id !== selectedManagerForRemoval._id)
      );
      setAvailableManagers((prev) => [...prev, selectedManagerForRemoval]);

      toast.success(`${selectedManagerForRemoval.name} removed successfully`);
      setShowRemoveManagerModal(false);
      setSelectedManagerForRemoval(null);
    } catch (error) {
      console.error("Error removing manager:", error);
      const errorMessage =
        error.response?.data?.error || "Failed to remove manager";
      toast.error(errorMessage);
    }
  };

  const handleDeleteTurf = async () => {
    // Enhanced validation for different deletion scenarios
    const isEnhancedMode =
      showDeleteTurfModal && deleteConfirmText !== undefined;

    if (isEnhancedMode) {
      if (deleteConfirmText !== turf.name) {
        toast.error("Please type the turf name exactly to confirm deletion");
        return;
      }
    } else {
      // Simple confirmation mode
      if (!window.confirm("Are you sure you want to delete this turf?")) {
        return;
      }
    }

    try {
      setIsDeleting(true);
      const token = localStorage.getItem("token");
      await axios.delete(
        `/api/turfs/${id}?userId=${auth._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success("Turf deleted successfully");

      // Navigate based on context
      if (navigate) {
        navigate("/turf-management?tab=manage");
      } else {
        window.location.href = "/turf-management";
      }
    } catch (error) {
      console.error("Error deleting turf:", error);
      const errorMessage =
        error.response?.data?.error || "Failed to delete turf";
      toast.error(errorMessage);
    } finally {
      setIsDeleting(false);
      if (showDeleteTurfModal) {
        setShowDeleteTurfModal(false);
        setDeleteConfirmText("");
      }
    }
  };

  const openManagerModal = () => {
    setShowManagerModal(true);
    fetchAvailableManagers();
  };

  const closeAllModals = () => {
    setShowManagerModal(false);
    setShowDeleteTurfModal(false);
    setShowRemoveManagerModal(false);
    setShowAssignConfirmModal(false);
    setSelectedManagerForRemoval(null);
    setSelectedManagerForAssignment(null);
    setDeleteConfirmText("");
  };

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen outlets">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500 mb-4"></div>
        <p className="text-gray-600">Loading turf details...</p>
      </div>
    );
  }

  if (!turf) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen outlets">
        <FiAlertTriangle className="text-red-500 mb-4" size={48} />
        <h2 className="text-xl font-semibold text-gray-800 mb-2">
          Turf Not Found
        </h2>
        <p className="text-gray-600 mb-4">
          The requested turf could not be found.
        </p>
        <Link
          to="/turf-management?tab=manage"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Back to Turf Management
        </Link>
      </div>
    );
  }

  return (
    <div className="outlets min-h-screen py-8 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Enhanced Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="flex items-center justify-between p-6">
            <div className="flex items-center">
              <Link
                to="/turf-management?tab=manage"
                className="mr-4 p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                title="Back to Turf Management"
              >
                <FiArrowLeft size={20} />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {turf.name}
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Created on {new Date(turf.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Status Badge */}
            <div className="flex items-center space-x-3">
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  turf.isActive
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {turf.isActive ? "Active" : "Inactive"}
              </span>
            </div>
          </div>
        </div>

        {/* Club Information */}
        {turf.clubName && (
          <div className="bg-blue-50 rounded-xl shadow-sm border border-blue-200 mb-6">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-blue-800 mb-2 flex items-center">
                <FiUsers className="mr-2" />
                Club Information
              </h3>
              <div className="flex items-center">
                <span className="text-sm font-medium text-gray-600">
                  Owned by:
                </span>
                <span className="ml-2 text-blue-700 font-semibold">
                  {turf.clubName}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Images and Quick Actions */}
          <div className="lg:col-span-1">
            {/* Image Gallery */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <FiImage className="mr-2 text-blue-600" />
                Turf Images
              </h3>

              {turf.images && turf.images.length > 0 ? (
                <>
                  <div className="relative mb-4">
                    <img
                      src={`/uploads/${
                        turf.images[activeImageIndex]
                      }`}
                      alt={`${turf.name} view`}
                      className="w-full h-64 object-cover rounded-lg shadow-sm"
                    />
                    <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
                      {activeImageIndex + 1} / {turf.images.length}
                    </div>
                  </div>

                  {turf.images.length > 1 && (
                    <div className="grid grid-cols-3 gap-2">
                      {turf.images.map((image, index) => (
                        <div
                          key={index}
                          onClick={() => setActiveImageIndex(index)}
                          className={`cursor-pointer rounded-lg overflow-hidden transition-all ${
                            index === activeImageIndex
                              ? "ring-2 ring-orange-500"
                              : "hover:ring-2 hover:ring-gray-300"
                          }`}
                        >
                          <img
                            src={`/uploads/${image}`}
                            alt={`Thumbnail ${index + 1}`}
                            className="w-full h-16 object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="w-full h-64 rounded-lg bg-gray-100 flex items-center justify-center">
                  <div className="text-center">
                    <FiImage className="mx-auto text-gray-400 mb-2" size={32} />
                    <span className="text-gray-500">No images available</span>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <FiSettings className="mr-2 text-blue-600" />
                Quick Actions
              </h3>

              <div className="space-y-3">
                <Link
                  to={`/turf/edit/${turf._id}`}
                  className="w-full flex items-center justify-center bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <FiEdit className="mr-2" />
                  Edit Turf Details
                </Link>

                <button
                  onClick={() => setShowDeleteTurfModal(true)}
                  className="w-full flex items-center justify-center bg-red-600 text-white px-4 py-3 rounded-lg hover:bg-red-700 transition-colors"
                >
                  <FiTrash2 className="mr-2" />
                  Delete Turf
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Manager Assignment Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold flex items-center">
                  <FiUsers className="mr-2 text-blue-600" />
                  Assigned Managers ({assignedManagers.length})
                </h3>
                <button
                  onClick={openManagerModal}
                  className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors w-auto"
                >
                  <FiPlus className="mr-2" />
                  Assign Manager
                </button>
              </div>

              {assignedManagers.length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
                  <FiUsers className="mx-auto text-gray-400 mb-3" size={32} />
                  <p className="text-gray-500 font-medium">
                    No managers assigned
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
                    Assign managers to help operate this turf
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {assignedManagers.map((manager) => (
                    <div
                      key={manager._id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                            <FiUserCheck className="text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {manager.name}
                            </p>
                            <p className="text-sm text-gray-500">
                              {manager.email}
                            </p>
                            <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full mt-1">
                              Active
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setSelectedManagerForRemoval(manager);
                            setShowRemoveManagerModal(true);
                          }}
                          className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 transition-colors w-auto bg-transparent"
                          title="Remove manager"
                        >
                          <FiUserX size={20} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Location Details */}
            {/* Location Details */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <FiMapPin className="mr-2 text-orange-600" />
                Location Details
              </h3>
              <div className="grid grid-cols-3">
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Full Address
                  </label>
                  <p className="text-gray-900">
                    {turf.location?.address || "Address not available"}
                  </p>
                </div>
                
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Longitude
                    </label>
                    <p className="text-gray-900">
                      {turf.location?.coordinates?.[0] ?? "N/A"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Latitude
                    </label>
                    <p className="text-gray-900">
                      {turf.location?.coordinates?.[1] ?? "N/A"}
                    </p>
                  </div>
           
              </div>
            </div>

            {/* Sports and Facilities */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Sports */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <FiCheckCircle className="mr-2 text-green-600" />
                  Available Sports
                </h3>
                <div className="flex flex-wrap gap-2">
                  {turf.sports.map((sport, index) => (
                    <span
                      key={index}
                      className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
                    >
                      {sport.name}
                    </span>
                  ))}
                </div>
              </div>

              {/* Facilities */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <FiInfo className="mr-2 text-purple-600" />
                  Facilities
                </h3>

                <div className="space-y-2">
                  {turf.facilities &&
                    turf.facilities.map((facility) => (
                      <div key={facility} className="flex items-center text-sm">
                        <FiCheck className="text-green-500 mr-2" size={14} />
                        <span className="text-gray-700">
                          {facility
                            .replace(/([A-Z])/g, " $1")
                            .replace(/^./, (str) => str.toUpperCase())}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            {/* Description */}
            {turf.description && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <FiInfo className="mr-2 text-gray-600" />
                  Description
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {turf.description}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Manager Assignment Modal */}
      {showManagerModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-xl font-semibold">Assign Manager to Turf</h3>
              <button
                onClick={closeAllModals}
                className="text-gray-400 hover:text-gray-600 p-1 w-auto bg-transparent hover:bg-transparent"
              >
                <FiX size={24} />
              </button>
            </div>

            <div className="p-6">
              {managersLoading ? (
                <div className="flex flex-col items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-4"></div>
                  <p className="text-gray-600">Loading available managers...</p>
                </div>
              ) : availableManagers.length === 0 ? (
                <div className="text-center py-8">
                  <FiUsers className="mx-auto text-gray-400 mb-4" size={48} />
                  <p className="text-gray-700 font-medium">
                    No available managers
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    All active managers are already assigned to this turf or no
                    active managers exist
                  </p>
                </div>
              ) : (
                <div className="max-h-96 overflow-y-auto space-y-3">
                  {availableManagers.map((manager) => (
                    <div
                      key={manager._id}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mr-3">
                          <FiUsers className="text-gray-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {manager.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {manager.email}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedManagerForAssignment(manager);
                          setShowAssignConfirmModal(true);
                        }}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors w-auto"
                      >
                        Select
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end p-6 border-t bg-gray-50">
              <button
                onClick={closeAllModals}
                className="px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assignment Confirmation Modal */}
      {showAssignConfirmModal && selectedManagerForAssignment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                  <FiUserCheck className="text-blue-600" size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Confirm Manager Assignment
                  </h3>
                  <p className="text-sm text-gray-500">
                    This action will assign management rights
                  </p>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-blue-800">
                  <strong>Manager:</strong> {selectedManagerForAssignment.name}
                  <br />
                  <strong>Email:</strong> {selectedManagerForAssignment.email}
                  <br />
                  <strong>Turf:</strong> {turf.name}
                </p>
              </div>

              <p className="text-gray-600 text-sm mb-6">
                Are you sure you want to assign{" "}
                <strong>{selectedManagerForAssignment.name}</strong> as a
                manager for <strong>{turf.name}</strong>? They will be able to
                manage bookings and operations for this turf.
              </p>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowAssignConfirmModal(false)}
                  className="flex-1 px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAssignManager}
                  disabled={isAssigning}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {isAssigning ? "Assigning..." : "Confirm Assignment"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Remove Manager Confirmation Modal */}
      {showRemoveManagerModal && selectedManagerForRemoval && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mr-4">
                  <FiUserX className="text-red-600" size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Remove Manager Access
                  </h3>
                  <p className="text-sm text-gray-500">
                    This will revoke management rights
                  </p>
                </div>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-red-800">
                  <strong>Manager:</strong> {selectedManagerForRemoval.name}
                  <br />
                  <strong>Email:</strong> {selectedManagerForRemoval.email}
                  <br />
                  <strong>Turf:</strong> {turf.name}
                </p>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <div className="flex items-start">
                  <FiAlertTriangle
                    className="text-yellow-600 mr-2 mt-0.5"
                    size={16}
                  />
                  <div>
                    <p className="text-sm text-yellow-800 font-medium">
                      Warning
                    </p>
                    <p className="text-sm text-yellow-700 mt-1">
                      Removing <strong>{selectedManagerForRemoval.name}</strong>{" "}
                      will immediately revoke their access to manage bookings
                      and operations for <strong>{turf.name}</strong>. This
                      action cannot be undone automatically.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={closeAllModals}
                  className="flex-1 px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRemoveManager}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Remove Access
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Turf Confirmation Modal */}
      {showDeleteTurfModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mr-4">
                  <FiTrash2 className="text-red-600" size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Delete Turf
                  </h3>
                  <p className="text-sm text-gray-500">
                    This action is permanent and cannot be undone
                  </p>
                </div>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <div className="flex items-start">
                  <FiAlertTriangle
                    className="text-red-600 mr-3 mt-0.5"
                    size={20}
                  />
                  <div>
                    <p className="text-sm text-red-800 font-medium mb-2">
                      Permanent Deletion Warning
                    </p>
                    <ul className="text-sm text-red-700 space-y-1">
                      <li>• All turf data will be permanently deleted</li>
                      <li>• All associated bookings will be affected</li>
                      <li>• All uploaded images will be removed</li>
                      <li>• Manager assignments will be revoked</li>
                      <li>• This action cannot be reversed</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type the turf name{" "}
                  <span className="font-bold text-red-600">"{turf.name}"</span>{" "}
                  to confirm deletion:
                </label>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder={`Type "${turf.name}" here`}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
                {deleteConfirmText && deleteConfirmText !== turf.name && (
                  <p className="text-sm text-red-600 mt-1">
                    Text doesn't match. Please type "{turf.name}" exactly.
                  </p>
                )}
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={closeAllModals}
                  className="flex-1 px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteTurf}
                  disabled={deleteConfirmText !== turf.name || isDeleting}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isDeleting ? (
                    <span className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                      Deleting...
                    </span>
                  ) : (
                    "Delete Turf"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success/Error Toast Container */}
      <div className="fixed bottom-4 right-4 z-50">
        {errors.fetch && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-lg mb-2">
            <div className="flex items-center">
              <FiAlertTriangle className="mr-2" />
              <span className="text-sm">{errors.fetch}</span>
              <button
                onClick={() => setErrors({})}
                className="ml-auto text-red-600 hover:text-red-800"
              >
                <FiX size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Loading Overlay for Actions */}
      {(isAssigning || isDeleting) && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-40">
          <div className="bg-white rounded-lg p-6 shadow-xl">
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500 mr-3"></div>
              <span className="text-gray-700">
                {isAssigning && "Assigning manager..."}
                {isDeleting && "Deleting turf..."}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewTurf;
