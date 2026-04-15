import React, { useState, useEffect, useContext } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";
import * as XLSX from "xlsx";
import {
  FileSpreadsheet,
  Upload,
  Download,
  CheckCircle,
  AlertCircle,
  Trash2,
  ChevronLeft,
  Users,
  UserPlus,
  X,
  Trophy,
} from "lucide-react";
import { toast, ToastContainer } from "react-toastify";

const BulkBookingUpload = () => {
  const { user } = useContext(AuthContext);
  const [searchParams] = useSearchParams();
  const tournamentId = searchParams.get("tournamentId");
  const navigate = useNavigate();

  const [tournament, setTournament] = useState(null);
  const [loading, setLoading] = useState(true);
  const [players, setPlayers] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [fileError, setFileError] = useState("");

  useEffect(() => {
    if (tournamentId) fetchTournament();
  }, [tournamentId]);

  const fetchTournament = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/tournaments/${tournamentId}`);
      setTournament(res.data.tournament || res.data);
    } catch (err) {
      toast.error("Failed to load tournament details");
    } finally {
      setLoading(false);
    }
  };

  const downloadTemplate = () => {
    const templateData = [
      { Name: "John Doe", Email: "john@company.com", Phone: "9876543210", EmployeeId: "EMP001", Category: "" },
      { Name: "Jane Smith", Email: "", Phone: "", EmployeeId: "EMP002", Category: "" },
    ];
    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Players");

    // Set column widths
    ws["!cols"] = [
      { wch: 25 }, { wch: 30 }, { wch: 15 }, { wch: 15 }, { wch: 20 },
    ];

    XLSX.writeFile(wb, "Bulk_Booking_Template.xlsx");
    toast.success("Template downloaded!");
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileError("");
    setResult(null);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(ws);

        if (!data || data.length === 0) {
          setFileError("Excel file is empty or has no data rows.");
          return;
        }

        // Map columns (flexible — handle different casing)
        const mapped = data.map((row) => {
          const get = (keys) => {
            for (const k of keys) {
              const val = row[k] || row[k.toLowerCase()] || row[k.toUpperCase()];
              if (val !== undefined && val !== null && String(val).trim() !== "") return String(val).trim();
            }
            return "";
          };

          return {
            name: get(["Name", "name", "Player Name", "PlayerName", "FullName"]),
            email: get(["Email", "email", "E-mail", "EmailId"]),
            phone: get(["Phone", "phone", "Mobile", "mobile", "Phone Number", "PhoneNumber", "Contact"]),
            employeeId: get(["EmployeeId", "employeeId", "Employee ID", "EmpId", "ID", "Emp_Id"]),
            category: get(["Category", "category", "Cat"]),
          };
        }).filter((p) => p.name); // Remove rows without names

        if (mapped.length === 0) {
          setFileError("No valid player rows found. Make sure the 'Name' column exists and has data.");
          return;
        }

        setPlayers(mapped);
        toast.success(`${mapped.length} players loaded from Excel`);
      } catch (err) {
        setFileError("Failed to parse Excel file. Please check the format.");
      }
    };
    reader.readAsBinaryString(file);
    e.target.value = "";
  };

  const removePlayer = (index) => {
    setPlayers((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (players.length === 0) {
      toast.error("No players to upload");
      return;
    }

    setUploading(true);
    setResult(null);

    try {
      const res = await axios.post("/api/tournaments/bookings/bulk-create", {
        tournamentId,
        players,
      });

      setResult(res.data);
      if (res.data.created?.length > 0) {
        toast.success(`${res.data.created.length} bookings created successfully!`);
      }
      if (res.data.skipped?.length > 0) {
        toast.warn(`${res.data.skipped.length} players skipped (duplicates or missing data)`);
      }
      setPlayers([]);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create bookings");
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Bulk Player Registration</h1>
          <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-orange-500" />
            {tournament?.title || "Tournament"}
          </p>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-6">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
            <AlertCircle className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <p className="font-semibold text-amber-800">Private Tournament — Manager Upload</p>
            <p className="text-sm text-amber-700 mt-1">
              Upload an Excel sheet with player details to directly register them. No player accounts required.
              Email will be auto-generated for players who don't have one.
            </p>
          </div>
        </div>
      </div>

      {/* Upload Section */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-green-600" />
            Upload Excel
          </h3>
          <button
            onClick={downloadTemplate}
            className="flex items-center gap-2 px-4 py-2 bg-green-50 hover:bg-green-100 text-green-700 rounded-xl text-sm font-semibold transition-colors"
          >
            <Download className="w-4 h-4" />
            Download Template
          </button>
        </div>

        <div className="border-2 border-dashed border-gray-200 hover:border-orange-400 rounded-2xl p-8 text-center transition-colors relative cursor-pointer group bg-gray-50 hover:bg-orange-50/30">
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileUpload}
            className="absolute inset-0 opacity-0 cursor-pointer z-10"
          />
          <Upload className="w-10 h-10 text-gray-400 group-hover:text-orange-500 mx-auto mb-3 transition-colors" />
          <p className="text-sm font-semibold text-gray-600">
            Drop your Excel file here or click to browse
          </p>
          <p className="text-xs text-gray-400 mt-1">Supports .xlsx and .xls formats</p>
        </div>

        {fileError && (
          <div className="mt-3 flex items-center gap-2 text-red-600 text-sm">
            <AlertCircle className="w-4 h-4" />
            {fileError}
          </div>
        )}
      </div>

      {/* Preview Table */}
      {players.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              Preview ({players.length} players)
            </h3>
            <button
              onClick={() => setPlayers([])}
              className="text-sm text-red-500 hover:text-red-700 font-semibold flex items-center gap-1"
            >
              <X className="w-4 h-4" /> Clear All
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-3 text-gray-500 font-semibold">#</th>
                  <th className="text-left py-3 px-3 text-gray-500 font-semibold">Name</th>
                  <th className="text-left py-3 px-3 text-gray-500 font-semibold">Email</th>
                  <th className="text-left py-3 px-3 text-gray-500 font-semibold">Phone</th>
                  <th className="text-left py-3 px-3 text-gray-500 font-semibold">Emp ID</th>
                  <th className="text-left py-3 px-3 text-gray-500 font-semibold">Category</th>
                  <th className="py-3 px-3"></th>
                </tr>
              </thead>
              <tbody>
                {players.map((p, i) => (
                  <tr key={i} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-3 text-gray-400">{i + 1}</td>
                    <td className="py-3 px-3 font-medium text-gray-800">{p.name}</td>
                    <td className="py-3 px-3 text-gray-600">{p.email || <span className="text-gray-400 italic">Auto-generate</span>}</td>
                    <td className="py-3 px-3 text-gray-600">{p.phone || <span className="text-gray-400">—</span>}</td>
                    <td className="py-3 px-3 text-gray-600">{p.employeeId || <span className="text-gray-400">—</span>}</td>
                    <td className="py-3 px-3 text-gray-600">{p.category || <span className="text-gray-400">Default</span>}</td>
                    <td className="py-3 px-3">
                      <button
                        onClick={() => removePlayer(i)}
                        className="text-red-400 hover:text-red-600 p-1 rounded-lg hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-5 flex justify-end">
            <button
              onClick={handleSubmit}
              disabled={uploading}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl text-white font-bold text-sm transition-all ${
                uploading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-orange-500 hover:bg-orange-600 shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40"
              }`}
            >
              {uploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white" />
                  Creating Bookings...
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  Register {players.length} Players
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-4">
            <CheckCircle className="w-5 h-5 text-green-600" />
            Upload Results
          </h3>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-green-50 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-green-700">{result.created?.length || 0}</p>
              <p className="text-sm text-green-600 font-medium">Created</p>
            </div>
            <div className="bg-amber-50 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-amber-700">{result.skipped?.length || 0}</p>
              <p className="text-sm text-amber-600 font-medium">Skipped</p>
            </div>
          </div>

          {result.skipped?.length > 0 && (
            <div className="mt-3">
              <p className="text-sm font-semibold text-gray-600 mb-2">Skipped Players:</p>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {result.skipped.map((s, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm bg-amber-50 rounded-lg px-3 py-2">
                    <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                    <span className="font-medium text-gray-700">{s.name || "Unknown"}</span>
                    <span className="text-gray-400">—</span>
                    <span className="text-amber-600">{s.reason}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BulkBookingUpload;
