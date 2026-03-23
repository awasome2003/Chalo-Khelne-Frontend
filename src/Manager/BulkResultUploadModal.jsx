import { useState, useRef } from "react";
import {
  Upload,
  FileSpreadsheet,
  Download,
  X,
  Check,
  AlertTriangle,
  RefreshCcw,
  Eye,
  Send,
  Trash2,
  FileText,
} from "lucide-react";
import axios from "axios";

/**
 * Reusable Bulk Result Upload Modal — CSV/Excel file upload for match results.
 *
 * Props:
 * - isOpen: boolean
 * - onClose: () => void
 * - onSuccess: () => void
 * - tournamentId: string
 * - matchType: "player" | "team" (default: "player")
 * - title: string (optional)
 */
export default function BulkResultUploadModal({
  isOpen,
  onClose,
  onSuccess,
  tournamentId,
  matchType = "player",
  title,
}) {
  const fileRef = useRef(null);
  const [file, setFile] = useState(null);
  const [step, setStep] = useState("upload"); // upload | preview | result
  const [loading, setLoading] = useState(false);

  // Preview state
  const [preview, setPreview] = useState(null);

  // Result state
  const [result, setResult] = useState(null);

  if (!isOpen) return null;

  const handleFileSelect = (e) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    const ext = selected.name.split(".").pop().toLowerCase();
    if (!["csv", "xlsx", "xls"].includes(ext)) {
      alert("Invalid file type. Please upload a .csv or .xlsx file.");
      return;
    }
    setFile(selected);
    setStep("upload");
    setPreview(null);
    setResult(null);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) {
      setFile(dropped);
      setStep("upload");
      setPreview(null);
      setResult(null);
    }
  };

  const handlePreview = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await axios.post("/api/tournaments/bulk-result-upload/preview", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setPreview(res.data);
      setStep("preview");
    } catch (err) {
      alert("Preview failed: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async () => {
    if (!file || !tournamentId) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("tournamentId", tournamentId);
      formData.append("matchType", matchType);

      const res = await axios.post("/api/tournaments/bulk-result-upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResult(res.data);
      setStep("result");
    } catch (err) {
      alert("Upload failed: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadTemplate = () => {
    window.open(`/api/tournaments/bulk-result-upload/template?type=${matchType}`, "_blank");
  };

  const handleClose = () => {
    setFile(null);
    setStep("upload");
    setPreview(null);
    setResult(null);
    onClose();
  };

  const handleDone = () => {
    onSuccess?.();
    handleClose();
  };

  const handleReset = () => {
    setFile(null);
    setStep("upload");
    setPreview(null);
    setResult(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-6 py-4 flex justify-between items-center">
          <div>
            <h3 className="text-white text-lg font-bold flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5" />
              {title || "Bulk Result Upload (CSV/Excel)"}
            </h3>
            <p className="text-indigo-200 text-sm">
              Upload match results from a spreadsheet file
            </p>
          </div>
          <button onClick={handleClose} className="text-white hover:text-indigo-200 bg-transparent w-auto">
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* ═══════════════════ STEP: UPLOAD ═══════════════════ */}
          {step === "upload" && (
            <div className="space-y-6">
              {/* Download template */}
              <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-sm font-semibold text-blue-800">Download Sample Template</p>
                    <p className="text-xs text-blue-600">Get the correct CSV format with column headers</p>
                  </div>
                </div>
                <button
                  onClick={handleDownloadTemplate}
                  className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 flex items-center gap-2 w-auto"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
              </div>

              {/* Drop zone */}
              <div
                className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all ${
                  file ? "border-green-400 bg-green-50" : "border-gray-300 hover:border-indigo-400 hover:bg-indigo-50/30"
                }`}
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileRef.current?.click()}
              >
                {file ? (
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
                      <Check className="w-7 h-7 text-green-600" />
                    </div>
                    <p className="text-sm font-bold text-green-700">{file.name}</p>
                    <p className="text-xs text-green-600">
                      {(file.size / 1024).toFixed(1)} KB
                    </p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleReset();
                      }}
                      className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1 w-auto"
                    >
                      <Trash2 className="w-3 h-3" /> Remove
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <Upload className="w-12 h-12 text-gray-300" />
                    <p className="text-sm font-semibold text-gray-600">
                      Drag & drop your CSV/Excel file here
                    </p>
                    <p className="text-xs text-gray-400">or click to browse • Supports .csv, .xlsx</p>
                  </div>
                )}
                <input
                  ref={fileRef}
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>

              {/* Expected format */}
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Expected Columns</h4>
                <div className="overflow-x-auto">
                  <table className="text-xs w-full">
                    <thead>
                      <tr className="bg-gray-100 text-gray-600">
                        <th className="px-3 py-1.5 text-left font-bold">Column</th>
                        <th className="px-3 py-1.5 text-left font-bold">Required</th>
                        <th className="px-3 py-1.5 text-left font-bold">Description</th>
                      </tr>
                    </thead>
                    <tbody className="text-gray-700">
                      <tr className="border-b border-gray-100">
                        <td className="px-3 py-1.5 font-mono font-bold">match_id</td>
                        <td className="px-3 py-1.5 text-green-600">Yes</td>
                        <td className="px-3 py-1.5">MongoDB ObjectId of the match</td>
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="px-3 py-1.5 font-mono font-bold">set1_p1, set1_p2</td>
                        <td className="px-3 py-1.5 text-green-600">Yes</td>
                        <td className="px-3 py-1.5">Set 1 scores ({matchType === "team" ? "home/away" : "player1/player2"})</td>
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="px-3 py-1.5 font-mono font-bold">set2_p1, set2_p2</td>
                        <td className="px-3 py-1.5 text-green-600">Yes</td>
                        <td className="px-3 py-1.5">Set 2 scores</td>
                      </tr>
                      <tr>
                        <td className="px-3 py-1.5 font-mono font-bold">set3_p1...set7_p2</td>
                        <td className="px-3 py-1.5 text-gray-400">Optional</td>
                        <td className="px-3 py-1.5">Additional sets (up to 7)</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════════ STEP: PREVIEW ═══════════════════ */}
          {step === "preview" && preview && (
            <div className="space-y-4">
              {/* Stats bar */}
              <div className="flex gap-3">
                <div className="flex-1 bg-blue-50 border border-blue-200 rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-blue-700">{preview.totalRows}</p>
                  <p className="text-xs text-blue-500">Total Rows</p>
                </div>
                <div className="flex-1 bg-green-50 border border-green-200 rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-green-700">
                    {preview.preview.filter((r) => r.valid).length}
                  </p>
                  <p className="text-xs text-green-500">Valid</p>
                </div>
                <div className="flex-1 bg-red-50 border border-red-200 rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-red-700">
                    {preview.preview.filter((r) => !r.valid).length}
                  </p>
                  <p className="text-xs text-red-500">Issues</p>
                </div>
              </div>

              {/* Column check */}
              {!preview.hasRequiredColumns && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-red-700">Missing Required Columns</p>
                    <p className="text-xs text-red-600 mt-1">
                      Expected: match_id, set1_p1, set1_p2, ... Found: {preview.columns.join(", ")}
                    </p>
                  </div>
                </div>
              )}

              {/* Preview table */}
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                <div className="px-4 py-3 bg-gray-50 border-b flex items-center gap-2">
                  <Eye className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-bold text-gray-700">
                    Preview (first {preview.preview.length} of {preview.totalRows} rows)
                  </span>
                </div>
                <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
                  <table className="w-full text-xs">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="px-3 py-2 text-left font-bold text-gray-500">Row</th>
                        <th className="px-3 py-2 text-left font-bold text-gray-500">Status</th>
                        {preview.columns.map((col) => (
                          <th key={col} className="px-3 py-2 text-left font-bold text-gray-500 font-mono">
                            {col}
                          </th>
                        ))}
                        <th className="px-3 py-2 text-left font-bold text-gray-500">Issues</th>
                      </tr>
                    </thead>
                    <tbody>
                      {preview.preview.map((row) => (
                        <tr
                          key={row.row}
                          className={`border-b ${row.valid ? "hover:bg-green-50/30" : "bg-red-50/30"}`}
                        >
                          <td className="px-3 py-2 font-medium">{row.row}</td>
                          <td className="px-3 py-2">
                            {row.valid ? (
                              <span className="w-5 h-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                                <Check className="w-3 h-3" />
                              </span>
                            ) : (
                              <span className="w-5 h-5 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
                                <X className="w-3 h-3" />
                              </span>
                            )}
                          </td>
                          {preview.columns.map((col) => (
                            <td key={col} className="px-3 py-2 font-mono">
                              {String(row.data[col] || "")}
                            </td>
                          ))}
                          <td className="px-3 py-2 text-red-600 max-w-[200px]">
                            {row.issues.length > 0 ? row.issues.join("; ") : "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════════ STEP: RESULT ═══════════════════ */}
          {step === "result" && result && (
            <div className="space-y-4">
              {/* Summary */}
              <div className="flex gap-3">
                <div className="flex-1 bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
                  <p className="text-3xl font-bold text-blue-700">{result.summary?.totalRows || 0}</p>
                  <p className="text-xs text-blue-500 font-medium">Total</p>
                </div>
                <div className="flex-1 bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                  <p className="text-3xl font-bold text-green-700">{result.summary?.succeeded || 0}</p>
                  <p className="text-xs text-green-500 font-medium">Succeeded</p>
                </div>
                <div className="flex-1 bg-red-50 border border-red-200 rounded-xl p-4 text-center">
                  <p className="text-3xl font-bold text-red-700">{result.summary?.failed || 0}</p>
                  <p className="text-xs text-red-500 font-medium">Failed</p>
                </div>
                <div className="flex-1 bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-center">
                  <p className="text-3xl font-bold text-yellow-700">{result.summary?.skipped || 0}</p>
                  <p className="text-xs text-yellow-500 font-medium">Skipped</p>
                </div>
              </div>

              {/* Success results */}
              {result.results?.length > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-xl overflow-hidden">
                  <div className="px-4 py-3 bg-green-100 border-b border-green-200">
                    <span className="text-sm font-bold text-green-800 flex items-center gap-2">
                      <Check className="w-4 h-4" />
                      Successful Updates ({result.results.length})
                    </span>
                  </div>
                  <div className="max-h-[200px] overflow-y-auto">
                    <table className="w-full text-xs">
                      <thead className="bg-green-100/50 sticky top-0">
                        <tr>
                          <th className="px-3 py-2 text-left font-bold">Row</th>
                          <th className="px-3 py-2 text-left font-bold">
                            {matchType === "team" ? "Team 1" : "Player 1"}
                          </th>
                          <th className="px-3 py-2 text-left font-bold">
                            {matchType === "team" ? "Team 2" : "Player 2"}
                          </th>
                          <th className="px-3 py-2 text-left font-bold">Winner</th>
                          <th className="px-3 py-2 text-left font-bold">Score</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.results.map((r, i) => (
                          <tr key={i} className="border-b border-green-100">
                            <td className="px-3 py-2">{r.row}</td>
                            <td className="px-3 py-2 font-medium">
                              {matchType === "team" ? r.team1 : r.player1}
                            </td>
                            <td className="px-3 py-2 font-medium">
                              {matchType === "team" ? r.team2 : r.player2}
                            </td>
                            <td className="px-3 py-2 text-green-700 font-bold">{r.winner}</td>
                            <td className="px-3 py-2 font-mono font-bold">{r.finalScore}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Error results */}
              {result.errors?.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-xl overflow-hidden">
                  <div className="px-4 py-3 bg-red-100 border-b border-red-200">
                    <span className="text-sm font-bold text-red-800 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      Failed Rows ({result.errors.length})
                    </span>
                  </div>
                  <div className="max-h-[200px] overflow-y-auto">
                    <table className="w-full text-xs">
                      <thead className="bg-red-100/50 sticky top-0">
                        <tr>
                          <th className="px-3 py-2 text-left font-bold">Row</th>
                          <th className="px-3 py-2 text-left font-bold">Match ID</th>
                          <th className="px-3 py-2 text-left font-bold">Error</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.errors.map((e, i) => (
                          <tr key={i} className="border-b border-red-100">
                            <td className="px-3 py-2">{e.row}</td>
                            <td className="px-3 py-2 font-mono text-gray-500">{e.match_id || "—"}</td>
                            <td className="px-3 py-2 text-red-700">{e.error}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 flex justify-between items-center bg-gray-50">
          {step === "upload" && (
            <>
              <button
                onClick={handleClose}
                className="px-5 py-2 rounded-lg border border-gray-300 text-gray-600 text-sm font-medium hover:bg-gray-100 bg-white w-auto"
              >
                Cancel
              </button>
              <button
                onClick={handlePreview}
                disabled={!file || loading}
                className="px-5 py-2 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50 w-auto flex items-center gap-2"
              >
                {loading ? (
                  <RefreshCcw className="w-4 h-4 animate-spin" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
                {loading ? "Parsing..." : "Preview File"}
              </button>
            </>
          )}

          {step === "preview" && (
            <>
              <button
                onClick={handleReset}
                className="px-5 py-2 rounded-lg border border-gray-300 text-gray-600 text-sm font-medium hover:bg-gray-100 bg-white w-auto"
              >
                Back
              </button>
              <button
                onClick={handleUpload}
                disabled={loading || !preview?.hasRequiredColumns}
                className="px-5 py-2 rounded-lg bg-green-600 text-white text-sm font-semibold hover:bg-green-700 disabled:opacity-50 w-auto flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <RefreshCcw className="w-4 h-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Upload & Process ({preview?.totalRows} rows)
                  </>
                )}
              </button>
            </>
          )}

          {step === "result" && (
            <>
              <button
                onClick={handleReset}
                className="px-5 py-2 rounded-lg border border-gray-300 text-gray-600 text-sm font-medium hover:bg-gray-100 bg-white w-auto flex items-center gap-2"
              >
                <RefreshCcw className="w-4 h-4" />
                Upload Another
              </button>
              <button
                onClick={handleDone}
                className="px-5 py-2 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 w-auto flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                Done
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
