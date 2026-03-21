import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthContext } from '../context/AuthContext';
import { BuildingOffice2Icon, PencilSquareIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';

const CorporateProfile = () => {
    const { user } = useContext(AuthContext);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);

    const [formData, setFormData] = useState({
        companyName: "",
        industryType: "",
        companySize: "",
        location: "",
        hrContact: {
            name: "",
            designation: "",
            contactNumber: "",
            email: ""
        }
    });

    useEffect(() => {
        if (user?._id) {
            fetchProfile();
        }
    }, [user]);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`/api/corporate/${user._id}`);
            // API returns { user: {...}, corporateProfile: {...} }
            const profile = res.data.corporateProfile;

            if (profile) {
                setFormData({
                    companyName: profile.companyName || "",
                    industryType: profile.industryType || "",
                    companySize: profile.companySize || "",
                    location: profile.location || "",
                    hrContact: profile.hrContact || {
                        name: "",
                        designation: "",
                        contactNumber: "",
                        email: ""
                    }
                });
            }
        } catch (error) {
            console.error("Error fetching profile:", error);
            // toast.error("Failed to load profile.");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name.startsWith('hr_')) {
            const field = name.split('hr_')[1];
            setFormData(prev => ({
                ...prev,
                hrContact: {
                    ...prev.hrContact,
                    [field]: value
                }
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Update endpoint: PUT /api/corporate/:userId
            await axios.put(`/api/corporate/${user._id}`, formData);
            toast.success("Profile updated successfully!");
            setIsEditing(false);
            fetchProfile();
        } catch (error) {
            console.error("Error updating profile:", error);
            toast.error("Failed to update profile.");
        }
    };

    const InputField = ({ label, name, value, type = "text", disabled = false }) => (
        <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            <input
                type={type}
                name={name}
                value={value}
                onChange={handleChange}
                disabled={disabled}
                className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
            />
        </div>
    );

    if (loading) return <div className="p-6 text-center">Loading profile...</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-12">
            <ToastContainer position="top-right" autoClose={3000} />

            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                    <BuildingOffice2Icon className="w-8 h-8 mr-2 text-blue-600" />
                    Corporate Profile
                </h1>
                {!isEditing ? (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                    >
                        <PencilSquareIcon className="w-5 h-5 mr-2" />
                        Edit Profile
                    </button>
                ) : (
                    <div className="flex space-x-2">
                        <button
                            onClick={() => {
                                setIsEditing(false);
                                fetchProfile(); // Reset changes
                            }}
                            className="flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition"
                        >
                            <XMarkIcon className="w-5 h-5 mr-2" />
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
                        >
                            <CheckIcon className="w-5 h-5 mr-2" />
                            Save Changes
                        </button>
                    </div>
                )}
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">Company Information</h3>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField
                        label="Company Name"
                        name="companyName"
                        value={formData.companyName}
                        disabled={!isEditing}
                    />
                    <InputField
                        label="Industry Type"
                        name="industryType"
                        value={formData.industryType}
                        disabled={!isEditing}
                    />
                    <InputField
                        label="Company Size"
                        name="companySize"
                        value={formData.companySize}
                        disabled={!isEditing}
                    />
                    <InputField
                        label="Headquarters Location"
                        name="location"
                        value={formData.location}
                        disabled={!isEditing}
                    />
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">HR / Contact Person</h3>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField
                        label="Full Name"
                        name="hr_name"
                        value={formData.hrContact.name}
                        disabled={!isEditing}
                    />
                    <InputField
                        label="Designation"
                        name="hr_designation"
                        value={formData.hrContact.designation}
                        disabled={!isEditing}
                    />
                    <InputField
                        label="Work Email"
                        name="hr_email"
                        type="email"
                        value={formData.hrContact.email}
                        disabled={!isEditing}
                    />
                    <InputField
                        label="Contact Number"
                        name="hr_contactNumber"
                        value={formData.hrContact.contactNumber}
                        disabled={!isEditing}
                    />
                </div>
            </div>
        </div>
    );
};

export default CorporateProfile;
