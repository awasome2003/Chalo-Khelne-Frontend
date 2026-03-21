import { useState, useEffect } from "react";
import axios from "axios";
import {
    MagnifyingGlassIcon,
    CheckBadgeIcon,
    XMarkIcon,
    EyeIcon,
} from "@heroicons/react/24/outline";

export default function Inquiries() {
    const [inquiries, setInquiries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedInquiry, setSelectedInquiry] = useState(null);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        companyName: "",
        industryType: "",
        companySize: "",
        location: "",
        designation: "Admin",
        clubName: "", // For Normal Club
        sports: "",   // For Normal Club
        city: "",     // For Normal Club
    });
    const [onboardType, setOnboardType] = useState("corporate"); // "corporate" or "club"
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [generatedCredentials, setGeneratedCredentials] = useState(null);

    useEffect(() => {
        fetchInquiries();
    }, []);

    const fetchInquiries = async () => {
        try {
            const res = await axios.get("/api/inquiries");
            setInquiries(res.data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching inquiries:", error);
            setLoading(false);
        }
    };

    const handleOpenModal = (inquiry) => {
        setSelectedInquiry(inquiry);
        setFormData({
            name: inquiry.name,
            email: inquiry.email,
            phone: inquiry.phone,
            companyName: inquiry.companyName || "",
            industryType: "",
            companySize: "",
            location: "",
            designation: "Admin",
            clubName: inquiry.clubName || inquiry.name + " Club",
            sports: "",
            city: "",
        });
        setOnboardType(inquiry.inquiryType === "Partnership" ? "corporate" : "club");
        setGeneratedCredentials(null);
        setShowModal(true);
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const endpoint = onboardType === "corporate"
                ? "/api/corporate/onboard"
                : "/api/clubadminprofile/onboard";

            const res = await axios.post(endpoint, formData);
            setGeneratedCredentials(res.data.credentials);
            alert(`${onboardType === "corporate" ? "Corporate" : "Club"} Account Created Successfully!`);
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.message || "Error creating account");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Inquiries</h1>

            {loading ? (
                <p>Loading...</p>
            ) : (
                <div className="bg-white rounded-lg shadow overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th className="px-6 py-3">Name</th>
                                <th className="px-6 py-3">Email</th>
                                <th className="px-6 py-3">Phone</th>
                                <th className="px-6 py-3">Type</th>
                                <th className="px-6 py-3">Message</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {inquiries.map((inquiry) => (
                                <tr key={inquiry._id} className="bg-white border-b hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium text-gray-900">{inquiry.name}</td>
                                    <td className="px-6 py-4">{inquiry.email}</td>
                                    <td className="px-6 py-4">{inquiry.phone}</td>
                                    <td className="px-6 py-4">{inquiry.inquiryType}</td>
                                    <td className="px-6 py-4 max-w-xs truncate" title={inquiry.message}>
                                        {inquiry.message}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span
                                            className={`px-2 py-1 rounded text-xs text-white ${inquiry.status === "Pending"
                                                ? "bg-yellow-400"
                                                : inquiry.status === "Resolved"
                                                    ? "bg-green-500"
                                                    : "bg-gray-400"
                                                }`}
                                        >
                                            {inquiry.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 flex gap-2">
                                        <button
                                            onClick={() => handleOpenModal(inquiry)}
                                            className="text-blue-600 hover:text-blue-900 border border-blue-600 rounded px-2 py-1 hover:bg-blue-50 transition"
                                            title="Onboard Corporate Admin"
                                        >
                                            Onboard
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {inquiries.length === 0 && (
                                <tr>
                                    <td colSpan="7" className="px-6 py-4 text-center">
                                        No inquiries found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Onboard Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-lg relative max-h-[90vh] overflow-y-auto">
                        <button
                            onClick={() => setShowModal(false)}
                            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                        >
                            <XMarkIcon className="w-6 h-6" />
                        </button>

                        <h2 className="text-xl font-bold mb-4">Onboard Admin</h2>

                        {!generatedCredentials && (
                            <div className="flex bg-gray-100 p-1 rounded-lg mb-6">
                                <button
                                    className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition ${onboardType === "corporate" ? "bg-white shadow text-blue-600" : "text-gray-500 hover:text-gray-700"}`}
                                    onClick={() => setOnboardType("corporate")}
                                >
                                    Corporate Admin
                                </button>
                                <button
                                    className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition ${onboardType === "club" ? "bg-white shadow text-blue-600" : "text-gray-500 hover:text-gray-700"}`}
                                    onClick={() => setOnboardType("club")}
                                >
                                    Normal Club Admin
                                </button>
                            </div>
                        )}

                        {generatedCredentials ? (
                            <div className="bg-green-50 border border-green-200 p-4 rounded mb-4">
                                <h3 className="text-green-800 font-semibold mb-2">Credentials Generated!</h3>
                                <p className="text-sm text-gray-700">Account created for {onboardType === "corporate" ? "Corporate" : "Club"} Admin.</p>
                                <div className="mt-3 bg-white p-2 rounded border border-gray-200">
                                    <p><strong>Email:</strong> {generatedCredentials.email}</p>
                                    <p><strong>Password:</strong> {generatedCredentials.password}</p>
                                </div>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="mt-4 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                                >
                                    Close
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Full Name</label>
                                        <input
                                            type="text"
                                            name="name"
                                            required
                                            value={formData.name}
                                            onChange={handleChange}
                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Designation</label>
                                        <input
                                            type="text"
                                            name="designation"
                                            required
                                            value={formData.designation}
                                            onChange={handleChange}
                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Email (Username)</label>
                                        <input
                                            type="email"
                                            name="email"
                                            required
                                            value={formData.email}
                                            onChange={handleChange}
                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Phone</label>
                                        <input
                                            type="text"
                                            name="phone"
                                            required
                                            value={formData.phone}
                                            onChange={handleChange}
                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                        />
                                    </div>
                                </div>

                                <hr className="my-4" />
                                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                                    {onboardType === "corporate" ? "Company Details" : "Club Details"}
                                </h3>

                                {onboardType === "corporate" ? (
                                    <>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Company Name</label>
                                            <input
                                                type="text"
                                                name="companyName"
                                                required
                                                value={formData.companyName}
                                                onChange={handleChange}
                                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Industry Type</label>
                                                <input
                                                    type="text"
                                                    name="industryType"
                                                    required
                                                    value={formData.industryType}
                                                    onChange={handleChange}
                                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                                    placeholder="e.g. IT, Finance"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Company Size</label>
                                                <select
                                                    name="companySize"
                                                    required
                                                    value={formData.companySize}
                                                    onChange={handleChange}
                                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                                >
                                                    <option value="">Select Size</option>
                                                    <option value="1-50">1-50</option>
                                                    <option value="51-200">51-200</option>
                                                    <option value="201-500">201-500</option>
                                                    <option value="500+">500+</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Location</label>
                                            <input
                                                type="text"
                                                name="location"
                                                required
                                                value={formData.location}
                                                onChange={handleChange}
                                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                            />
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Club Name</label>
                                            <input
                                                type="text"
                                                name="clubName"
                                                required
                                                value={formData.clubName}
                                                onChange={handleChange}
                                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">City</label>
                                                <input
                                                    type="text"
                                                    name="city"
                                                    required
                                                    value={formData.city}
                                                    onChange={handleChange}
                                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Sports</label>
                                                <input
                                                    type="text"
                                                    name="sports"
                                                    required
                                                    value={formData.sports}
                                                    onChange={handleChange}
                                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                                    placeholder="Cricket, Football, etc."
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Full Address</label>
                                            <input
                                                type="text"
                                                name="address"
                                                required
                                                value={formData.address}
                                                onChange={handleChange}
                                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                            />
                                        </div>
                                    </>
                                )}

                                <div className="pt-4">
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:bg-blue-300"
                                    >
                                        {isSubmitting ? "Creating..." : "Create Account & Send Credentials"}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
