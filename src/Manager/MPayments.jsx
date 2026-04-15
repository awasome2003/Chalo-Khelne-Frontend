import { useState, useEffect } from "react";
import axios from "axios";
import {
    QrCode,
    Plus,
    Trash2,
    User,
    Phone,
    Tag,
    Save,
    CreditCard,
    Upload,
    X,
    CheckCircle2,
    AlertCircle,
    Smartphone
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";

const MPayments = ({ tournamentId }) => {
    const manager = JSON.parse(localStorage.getItem("user"));
    const managerId = manager?._id;

    const [existingSetup, setExistingSetup] = useState({
        qrCodes: [],
        upiIds: [],
        offlinePayments: [],
    });
    const [newUpi, setNewUpi] = useState("");
    const [qrFiles, setQrFiles] = useState([]);
    const [newOfflinePayment, setNewOfflinePayment] = useState({
        receiverName: "",
        receiverContact: "",
        label: "",
    });

    const [loading, setLoading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    const fetchSetup = async () => {
        if (!managerId) return;
        try {
            const res = await axios.get(
                `/api/payments/setup/${managerId}/${tournamentId || ""}`
            );
            if (res.data.success) setExistingSetup(res.data.data);
        } catch (err) {
            console.error("Fetch setup error:", err);
            toast.error("Failed to fetch payment setup");
        }
    };

    useEffect(() => {
        fetchSetup();
    }, [managerId, tournamentId]);

    const handleAddUpi = () => {
        if (!newUpi.trim()) return;
        setExistingSetup(prev => ({
            ...prev,
            upiIds: [...prev.upiIds, { _id: `temp-${Date.now()}`, upi: newUpi.trim() }],
        }));
        setNewUpi("");
        toast.info("UPI ID added to pending list");
    };

    const handleAddOfflinePayment = () => {
        if (!newOfflinePayment.receiverName.trim() || !newOfflinePayment.receiverContact.trim()) {
            toast.warning("Please fill required fields");
            return;
        }
        setExistingSetup(prev => ({
            ...prev,
            offlinePayments: [...prev.offlinePayments, { _id: `temp-${Date.now()}`, ...newOfflinePayment }],
        }));
        setNewOfflinePayment({ receiverName: "", receiverContact: "", label: "" });
        toast.info("Offline receiver added to pending list");
    };

    const handleOfflinePaymentChange = (field, value) => {
        setNewOfflinePayment(prev => ({ ...prev, [field]: value }));
    };

    const handleFileChange = e => {
        const files = Array.from(e.target.files);
        setQrFiles(prev => [...prev, ...files]);
    };

    const handleSubmit = async () => {
        if (!managerId) return toast.error("Manager ID is required");

        try {
            const formData = new FormData();
            qrFiles.forEach(file => formData.append("qrCodes", file));
            formData.append("managerId", managerId);
            if (tournamentId) formData.append("tournamentId", tournamentId);

            const newUpis = existingSetup.upiIds.filter(u => u._id?.startsWith("temp-")).map(u => u.upi);
            const newOffline = existingSetup.offlinePayments.filter(o => o._id?.startsWith("temp-"));

            formData.append("upiIds", JSON.stringify(newUpis));
            formData.append("offlinePayments", JSON.stringify(newOffline));

            setLoading(true);
            setUploadProgress(0);

            const res = await axios.post(
                `/api/payments/setup`,
                formData,
                {
                    onUploadProgress: progressEvent => {
                        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                        setUploadProgress(percentCompleted);
                    },
                }
            );

            if (res.data.success) {
                toast.success("Payment setup saved successfully!");
                setQrFiles([]);
                fetchSetup();
            } else {
                toast.error(res.data.message || "Failed to save payment setup");
            }
        } catch (err) {
            console.error("Error submitting payment setup:", err);
            toast.error("Error saving setup. Please try again.");
        } finally {
            setLoading(false);
            setUploadProgress(0);
        }
    };

    const handleDelete = async (optionId, type) => {
        if (!managerId) return;

        // If it's a temp ID, just remove from state
        if (typeof optionId === 'string' && optionId.startsWith('temp-')) {
            setExistingSetup(prev => ({
                ...prev,
                upiIds: prev.upiIds.filter(u => u._id !== optionId),
                offlinePayments: prev.offlinePayments.filter(o => o._id !== optionId),
            }));
            return;
        }

        try {
            const res = await axios.delete(`/api/payments/setup/delete`, {
                data: { managerId, optionId, type },
            });

            if (res.data.success) {
                setExistingSetup(prev => ({
                    ...prev,
                    qrCodes: prev.qrCodes.filter(q => q._id !== optionId),
                    upiIds: prev.upiIds.filter(u => u._id !== optionId),
                    offlinePayments: prev.offlinePayments.filter(o => o._id !== optionId),
                }));
                toast.success("Item deleted successfully");
            }
        } catch (err) {
            console.error(err);
            toast.error("Error deleting item");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50/50 py-10 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto space-y-8">
                {/* Header Section */}
                <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
                            <CreditCard className="w-8 h-8 text-orange-500" />
                            Payment Setup
                        </h1>
                        <p className="mt-2 text-gray-500">Configure how you'd like to receive payments for this tournament.</p>
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleSubmit}
                        disabled={loading}
                        className={`flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-bold transition-all shadow-lg ${loading
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "bg-orange-500 text-white hover:bg-orange-600 shadow-orange-200"
                            }`}
                    >
                        {loading ? (
                            <div className="flex items-center gap-2">
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                <span>Saving... {uploadProgress}%</span>
                            </div>
                        ) : (
                            <>
                                <Save className="w-5 h-5" />
                                Save Configuration
                            </>
                        )}
                    </motion.button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* QR Codes Section */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-6">
                        <div className="flex items-center gap-2 mb-2">
                            <QrCode className="w-6 h-6 text-orange-500" />
                            <h2 className="text-xl font-bold text-gray-800">QR Codes</h2>
                        </div>

                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                            <label className="relative flex flex-col items-center justify-center aspect-square border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-orange-400 hover:bg-orange-50/30 transition-all group">
                                <input type="file" multiple accept="image/*" onChange={handleFileChange} className="hidden" />
                                <Upload className="w-6 h-6 text-gray-400 group-hover:text-orange-500 mb-2 transition-colors" />
                                <span className="text-xs font-medium text-gray-500 group-hover:text-orange-500">Upload</span>
                            </label>

                            <AnimatePresence>
                                {/* Newly selected files */}
                                {qrFiles.map((file, i) => (
                                    <motion.div
                                        key={`new-${i}`}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.8 }}
                                        className="relative aspect-square group"
                                    >
                                        <img
                                            src={URL.createObjectURL(file)}
                                            alt="qr preview"
                                            className="w-full h-full object-cover rounded-xl ring-1 ring-gray-100"
                                        />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
                                            <button
                                                onClick={() => setQrFiles(qrFiles.filter((_, idx) => idx !== i))}
                                                className="p-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors shadow-sm"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                        <span className="absolute -top-2 -left-2 bg-amber-500 text-[10px] font-bold text-white px-2 py-0.5 rounded-full shadow-sm">
                                            PREVIEW
                                        </span>
                                    </motion.div>
                                ))}

                                {/* Existing uploaded QR codes */}
                                {existingSetup.qrCodes?.map(qr => (
                                    <motion.div
                                        key={qr._id}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="relative aspect-square group"
                                    >
                                        <img
                                            src={`/uploads/${qr.imageUrl.replace(/^.*?uploads[\\/]?/i, "")}`}
                                            alt="uploaded qr"
                                            className="w-full h-full object-cover rounded-xl ring-1 ring-gray-100"
                                            onError={(e) => { e.currentTarget.style.opacity = "0.3"; }}
                                        />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
                                            <button
                                                onClick={() => handleDelete(qr._id, "qr")}
                                                className="p-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors shadow-sm"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                        <span className="absolute -top-2 -left-2 bg-emerald-500 text-[10px] font-bold text-white px-2 py-0.5 rounded-full shadow-sm">
                                            SAVED
                                        </span>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* UPI IDs Section */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-6">
                        <div className="flex items-center gap-2 mb-2">
                            <Smartphone className="w-6 h-6 text-orange-500" />
                            <h2 className="text-xl font-bold text-gray-800">UPI Identifiers</h2>
                        </div>

                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    value={newUpi}
                                    onChange={e => setNewUpi(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all outline-none text-sm"
                                    placeholder="yourname@upi"
                                />
                            </div>
                            <button
                                onClick={handleAddUpi}
                                className="px-5 py-2.5 bg-orange-50 text-orange-500 rounded-xl font-bold hover:bg-orange-100 transition-colors flex items-center gap-2"
                            >
                                <Plus className="w-4 h-4" />
                                Add
                            </button>
                        </div>

                        <div className="space-y-3 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                            <AnimatePresence>
                                {existingSetup.upiIds?.map(u => (
                                    <motion.div
                                        key={u._id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 10 }}
                                        className="flex items-center justify-between p-3 bg-gray-50 border border-gray-100 rounded-xl group hover:border-orange-200 transition-all"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                                                <CheckCircle2 className="w-4 h-4 text-orange-500" />
                                            </div>
                                            <span className="text-sm font-medium text-gray-700">{u.upi}</span>
                                        </div>
                                        <button
                                            onClick={() => handleDelete(u._id, "upi")}
                                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                            {(!existingSetup.upiIds || existingSetup.upiIds.length === 0) && (
                                <div className="text-center py-6">
                                    <p className="text-gray-400 text-sm">No UPI IDs added yet</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Offline Payments Section */}
                <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 overflow-hidden">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-2 bg-orange-50 rounded-xl">
                            <User className="w-6 h-6 text-orange-500" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-800">Physical Payment Receivers</h2>
                            <p className="text-sm text-gray-500">Contact persons for on-site/manual payments</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-8">
                        <div className="md:col-span-4 relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                value={newOfflinePayment.receiverName}
                                onChange={e => handleOfflinePaymentChange("receiverName", e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                                placeholder="Full Name"
                            />
                        </div>
                        <div className="md:col-span-4 relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                value={newOfflinePayment.receiverContact}
                                onChange={e => handleOfflinePaymentChange("receiverContact", e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                                placeholder="Contact Number"
                            />
                        </div>
                        <div className="md:col-span-3 relative">
                            <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                value={newOfflinePayment.label}
                                onChange={e => handleOfflinePaymentChange("label", e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                                placeholder="Label (e.g. Venue desk)"
                            />
                        </div>
                        <div className="md:col-span-1">
                            <button
                                onClick={handleAddOfflinePayment}
                                className="w-full h-full flex items-center justify-center bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-all shadow-md active:scale-95"
                            >
                                <Plus className="w-6 h-6" />
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        <AnimatePresence>
                            {existingSetup.offlinePayments?.map(o => (
                                <motion.div
                                    key={o._id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="relative p-5 bg-white border border-gray-100 rounded-2xl group hover:shadow-md hover:border-orange-100 transition-all"
                                >
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="font-bold text-gray-900 line-clamp-1">{o.receiverName}</h3>
                                                <p className="text-orange-500 text-sm font-medium flex items-center gap-1 mt-1">
                                                    <Phone className="w-3 h-3" />
                                                    {o.receiverContact}
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => handleDelete(o._id, "offline")}
                                                className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                        {o.label && (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-50 text-orange-600 border border-orange-100">
                                                {o.label}
                                            </span>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>

                    {(!existingSetup.offlinePayments || existingSetup.offlinePayments.length === 0) && (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                <AlertCircle className="w-8 h-8 text-gray-300" />
                            </div>
                            <p className="text-gray-400 font-medium tracking-tight">No physical receivers configured</p>
                            <p className="text-gray-300 text-xs mt-1">Add contact persons for on-field payments</p>
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: #f1f1f1;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #e2e8f0;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #cbd5e1;
                }
            `}</style>
        </div>
    );
};

export default MPayments;
