import React, { useState, useEffect, useContext } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";
import { QRCodeCanvas } from "qrcode.react";
import * as XLSX from "xlsx";
import {
    QrCode,
    FileSpreadsheet,
    UserPlus,
    X,
    Trophy,
    Download,
    Upload,
    User,
    CheckCircle,
    AlertCircle,
    Trash2,
    Plus,
    ChevronLeft
} from "lucide-react";
import { toast, ToastContainer } from "react-toastify";

const InviteEmployees = () => {
    const { user } = useContext(AuthContext);
    const [searchParams] = useSearchParams();
    const tournamentId = searchParams.get("tournamentId");
    const navigate = useNavigate();

    const [tournament, setTournament] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("qr"); // qr, excel, manual

    // Manual Add State
    const [manualEmployees, setManualEmployees] = useState([]);
    const [newEmployee, setNewEmployee] = useState({ employeeId: "", name: "", mobile: "" });

    // Excel State
    const [excelData, setExcelData] = useState([]);
    const [fileName, setFileName] = useState("");

    useEffect(() => {
        if (!user?.isCorporate) {
            navigate("/mdashboard");
            return;
        }
        if (!tournamentId) {
            navigate("/mtournament-management");
            return;
        }
        fetchTournament();
    }, [tournamentId, user]);

    const fetchTournament = async () => {
        try {
            const response = await axios.get(`/api/tournaments/${tournamentId}`);
            setTournament(response.data.tournament);
            if (response.data.tournament.whitelist) {
                setManualEmployees(response.data.tournament.whitelist.map(emp => ({ ...emp, id: emp._id || Math.random() })));
            }
        } catch (error) {
            console.error("Error fetching tournament:", error);
            toast.error("Failed to load tournament details");
        } finally {
            setLoading(false);
        }
    };

    // Tab 1: QR Logic
    const downloadQRCode = () => {
        const canvas = document.getElementById("invite-qr-canvas");
        if (canvas) {
            const pngUrl = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
            let downloadLink = document.createElement("a");
            downloadLink.href = pngUrl;
            downloadLink.download = `tournament_invite_qr_${tournamentId}.png`;
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
        }
    };

    // Tab 2: Excel Logic
    const downloadTemplate = () => {
        const templateData = [
            { "EmployeeId": "", "Name": "", "Mobile no.": "" }
        ];
        const ws = XLSX.utils.json_to_sheet(templateData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Template");
        XLSX.writeFile(wb, "Tournament_Employee_Template.xlsx");
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setFileName(file.name);
        const reader = new FileReader();
        reader.onload = (evt) => {
            const bstr = evt.target.result;
            const wb = XLSX.read(bstr, { type: "binary" });
            const wsname = wb.SheetNames[0];
            const ws = wb.Sheets[wsname];
            const data = XLSX.utils.sheet_to_json(ws);

            // Map headers to internal state and filter duplicates
            const formattedData = data.map(item => ({
                employeeId: item.EmployeeId || item.employeeId || "",
                name: item.Name || item.name || "",
                mobile: item["Mobile no."] || item.mobile || ""
            })).filter(item => item.name || item.employeeId);

            // Filter out duplicates within the Excel itself
            const uniqueData = [];
            const seenIds = new Set();
            const seenMobiles = new Set();

            formattedData.forEach(item => {
                const id = item.employeeId?.toString().trim();
                const mob = item.mobile?.toString().trim();

                if ((id && seenIds.has(id)) || (mob && seenMobiles.has(mob))) {
                    console.warn("Skipping duplicate in excel:", item);
                    return;
                }

                if (id) seenIds.add(id);
                if (mob) seenMobiles.add(mob);
                uniqueData.push(item);
            });

            if (uniqueData.length < formattedData.length) {
                toast.info(`Filtered out ${formattedData.length - uniqueData.length} duplicate entries from Excel.`);
            }

            setExcelData(uniqueData);
        };
        reader.readAsBinaryString(file);
    };

    const handleInviteExcel = async () => {
        if (excelData.length === 0) {
            toast.warning("No data found in the uploaded file");
            return;
        }

        try {
            const response = await axios.put(`/api/tournaments/${tournamentId}/whitelist`, {
                whitelist: excelData
            });
            if (response.data.success) {
                toast.success("Employee list uploaded and saved successfully!");
                setManualEmployees(response.data.tournament.whitelist.map(emp => ({ ...emp, id: emp._id || Math.random() })));
                setExcelData([]);
                setFileName("");
            }
        } catch (error) {
            console.error("Error saving whitelist:", error);
            toast.error("Failed to save employee list");
        }
    };

    // Tab 3: Manual Logic
    const handleAddManual = () => {
        if (!newEmployee.name || !newEmployee.employeeId) {
            toast.error("Employee Id and Name are required");
            return;
        }

        // Mobile validation: must be 10 digits
        const mobileRegex = /^[0-9]{10}$/;
        if (newEmployee.mobile && !mobileRegex.test(newEmployee.mobile)) {
            toast.error("Mobile number must be exactly 10 digits");
            return;
        }

        // Check for duplicates in current list
        const isDuplicateId = manualEmployees.some(emp => emp.employeeId === newEmployee.employeeId);
        const isDuplicateMobile = newEmployee.mobile && manualEmployees.some(emp => emp.mobile === newEmployee.mobile);

        if (isDuplicateId) {
            toast.error(`Employee ID ${newEmployee.employeeId} is already in the list`);
            return;
        }
        if (isDuplicateMobile) {
            toast.error(`Mobile number ${newEmployee.mobile} is already in the list`);
            return;
        }

        setManualEmployees([...manualEmployees, { ...newEmployee, id: Date.now() }]);
        setNewEmployee({ employeeId: "", name: "", mobile: "" });
    };

    const handleRemoveManual = (id) => {
        setManualEmployees(manualEmployees.filter(emp => emp.id !== id));
    };

    const handleInviteManual = async () => {
        if (manualEmployees.length === 0) {
            toast.warning("Please add at least one employee");
            return;
        }

        try {
            const response = await axios.put(`/api/tournaments/${tournamentId}/whitelist`, {
                whitelist: manualEmployees.map(({ employeeId, name, mobile }) => ({ employeeId, name, mobile }))
            });
            if (response.data.success) {
                toast.success("Employee list updated successfully!");
                setManualEmployees(response.data.tournament.whitelist.map(emp => ({ ...emp, id: emp._id || Math.random() })));
            }
        } catch (error) {
            console.error("Error saving whitelist:", error);
            toast.error("Failed to save employee list");
        }
    };

    if (loading) return <div className="p-8 text-center">Loading...</div>;

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8">
            <ToastContainer />
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-50 transition-colors"
                    >
                        <ChevronLeft className="w-6 h-6 text-gray-600" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Invite Employees</h1>
                        <p className="text-gray-500 font-medium flex items-center gap-2 mt-1">
                            <Trophy className="w-4 h-4 text-orange-500" />
                            {tournament?.title}
                        </p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-8">
                    <div className="flex border-b border-gray-100">
                        <button
                            onClick={() => setActiveTab("qr")}
                            className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition-all ${activeTab === "qr" ? "bg-gray-50 text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:text-gray-800"
                                }`}
                        >
                            <QrCode className="w-5 h-5" /> QR Code
                        </button>
                        <button
                            onClick={() => setActiveTab("excel")}
                            className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition-all ${activeTab === "excel" ? "bg-gray-50 text-green-600 border-b-2 border-green-600" : "text-gray-500 hover:text-gray-800"
                                }`}
                        >
                            <FileSpreadsheet className="w-5 h-5" /> Excel Upload
                        </button>
                        <button
                            onClick={() => setActiveTab("manual")}
                            className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition-all ${activeTab === "manual" ? "bg-gray-50 text-purple-600 border-b-2 border-purple-600" : "text-gray-500 hover:text-gray-800"
                                }`}
                        >
                            <UserPlus className="w-5 h-5" /> Manual Add
                        </button>
                    </div>

                    <div className="p-8">
                        {/* Tab 1: QR Code */}
                        {activeTab === "qr" && (
                            <div className="flex flex-col items-center text-center max-w-sm mx-auto animate-in fade-in duration-300">
                                <div className="bg-white p-6 rounded-3xl shadow-inner border border-gray-100 mb-6">
                                    <QRCodeCanvas
                                        id="invite-qr-canvas"
                                        value={`chalokhelne://tournament/details/${tournamentId}`}
                                        size={250}
                                        level={"H"}
                                        includeMargin={true}
                                    />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Tournament QR Code</h3>
                                <p className="text-gray-500 mb-8 text-sm">
                                    Employees can scan this QR code to join the tournament directly from their mobile app.
                                </p>
                                <button
                                    onClick={downloadQRCode}
                                    className="w-full py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition flex items-center justify-center gap-2 shadow-lg shadow-blue-200"
                                >
                                    <Download className="w-5 h-5" /> Download QR Code
                                </button>
                            </div>
                        )}

                        {/* Tab 2: Excel Upload */}
                        {activeTab === "excel" && (
                            <div className="animate-in fade-in duration-300">
                                <div className="max-w-md mx-auto">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-sm font-bold text-gray-700">Upload Filled Sheet</h3>
                                        <button
                                            onClick={downloadTemplate}
                                            className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
                                        >
                                            <Download className="w-3 h-3" /> Download Empty Template
                                        </button>
                                    </div>
                                    <div className="border-2 border-dashed border-gray-200 rounded-3xl p-12 text-center hover:border-green-500 hover:bg-green-50/30 transition-all cursor-pointer relative group">
                                        <input
                                            type="file"
                                            accept=".xlsx, .xls"
                                            onChange={handleFileUpload}
                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                        />
                                        <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                                            <Upload className="w-8 h-8 text-green-600" />
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-900 mb-1">
                                            {fileName || "Click to upload Excel"}
                                        </h3>
                                        <p className="text-sm text-gray-500">
                                            Support .xlsx and .xls formats
                                        </p>
                                    </div>

                                    {excelData.length > 0 && (
                                        <div className="mt-8 space-y-4">
                                            <div className="bg-green-50 p-4 rounded-2xl flex items-center gap-3 border border-green-100">
                                                <CheckCircle className="w-6 h-6 text-green-600" />
                                                <span className="font-bold text-green-900">{excelData.length} employees found</span>
                                            </div>
                                            <div className="max-h-60 overflow-y-auto border border-gray-100 rounded-2xl bg-gray-50 p-2 text-xs">
                                                <table className="w-full">
                                                    <thead className="text-left text-gray-400 border-b border-gray-100">
                                                        <tr>
                                                            <th className="p-2">ID</th>
                                                            <th className="p-2">Name</th>
                                                            <th className="p-2">Mobile</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {excelData.slice(0, 10).map((row, i) => (
                                                            <tr key={i} className="border-b border-gray-50 last:border-0">
                                                                <td className="p-2">{row.employeeId}</td>
                                                                <td className="p-2">{row.name}</td>
                                                                <td className="p-2">{row.mobile}</td>
                                                            </tr>
                                                        ))}
                                                        {excelData.length > 10 && (
                                                            <tr>
                                                                <td colSpan="3" className="p-2 text-center text-gray-400">...and {excelData.length - 10} more</td>
                                                            </tr>
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                            <button
                                                onClick={handleInviteExcel}
                                                className="w-full py-4 bg-green-600 text-white font-bold rounded-2xl hover:bg-green-700 transition shadow-lg shadow-green-200"
                                            >
                                                Upload & Whitelist Employees
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Tab 3: Manual Add */}
                        {activeTab === "manual" && (
                            <div className="animate-in fade-in duration-300">
                                <form
                                    onSubmit={(e) => { e.preventDefault(); handleAddManual(); }}
                                    className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 bg-gray-50 p-6 rounded-3xl border border-gray-100"
                                >
                                    <div className="md:col-span-1">
                                        <label className="block text-xs font-bold text-gray-400 uppercase mb-2 pl-1">Employee ID</label>
                                        <input
                                            type="text"
                                            value={newEmployee.employeeId}
                                            onChange={(e) => setNewEmployee({ ...newEmployee, employeeId: e.target.value })}
                                            placeholder="EMP001"
                                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all text-sm"
                                        />
                                    </div>
                                    <div className="md:col-span-1">
                                        <label className="block text-xs font-bold text-gray-400 uppercase mb-2 pl-1">Full Name</label>
                                        <input
                                            type="text"
                                            value={newEmployee.name}
                                            onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
                                            placeholder="John Doe"
                                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all text-sm"
                                        />
                                    </div>
                                    <div className="md:col-span-1">
                                        <label className="block text-xs font-bold text-gray-400 uppercase mb-2 pl-1">Mobile No.</label>
                                        <input
                                            type="text"
                                            maxLength={10}
                                            value={newEmployee.mobile}
                                            onChange={(e) => {
                                                const val = e.target.value.replace(/\D/g, "");
                                                setNewEmployee({ ...newEmployee, mobile: val });
                                            }}
                                            placeholder="1234567890"
                                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all text-sm"
                                        />
                                    </div>
                                    <div className="flex items-end">
                                        <button
                                            type="submit"
                                            className="w-full py-3 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 transition flex items-center justify-center gap-2 text-sm"
                                        >
                                            Add to List
                                        </button>
                                    </div>
                                </form>

                                <div className="space-y-4">
                                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                        <User className="w-5 h-5 text-purple-600" />
                                        Whitelisted Employees ({manualEmployees.length})
                                    </h3>

                                    {manualEmployees.length === 0 ? (
                                        <div className="text-center py-12 border-2 border-dashed border-gray-100 rounded-3xl">
                                            <UserPlus className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                                            <p className="text-gray-400">No employees whitelisted yet</p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {manualEmployees.map((emp) => (
                                                <div key={emp.id} className="bg-white p-4 rounded-2xl border border-gray-100 flex items-center justify-between group hover:border-purple-200 hover:shadow-sm transition-all">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-purple-50 rounded-full flex items-center justify-center text-purple-600 font-bold">
                                                            {emp.name?.charAt(0) || "E"}
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-gray-900">{emp.name}</div>
                                                            <div className="text-xs text-gray-500">ID: {emp.employeeId} | Mob: {emp.mobile}</div>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => handleRemoveManual(emp.id)}
                                                        className="p-2 text-gray-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                    >
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {manualEmployees.length > 0 && (
                                        <button
                                            onClick={handleInviteManual}
                                            className="w-full mt-6 py-4 bg-purple-600 text-white font-bold rounded-2xl hover:bg-purple-700 transition shadow-lg shadow-purple-200"
                                        >
                                            Update Whitelist ({manualEmployees.length} Employees)
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InviteEmployees;
