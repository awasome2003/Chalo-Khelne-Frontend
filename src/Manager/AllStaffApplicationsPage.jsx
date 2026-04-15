import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import {
  Users, Check, X, Eye, ChevronDown, Briefcase, ShieldCheck, ShieldX,
  Clock, Phone, Mail, Award, FileText, Calendar, Download,
  BadgeCheck, AlertCircle, Loader2, Filter,
} from "lucide-react";

const ROLE_META = {
  trainer:     { label: "Trainer", icon: "🏋️", bg: "bg-orange-50", text: "text-orange-600", color: "#F97316" },
  referee:     { label: "Referee", icon: "🏅", bg: "bg-orange-50", text: "text-orange-500", color: "#3B82F6" },
  scorer:      { label: "Scorer", icon: "📊", bg: "bg-emerald-50", text: "text-emerald-600", color: "#8B5CF6" },
  cameraman:   { label: "Cameraman", icon: "📹", bg: "bg-rose-50", text: "text-rose-600", color: "#EC4899" },
  commentator: { label: "Commentator", icon: "🎙️", bg: "bg-emerald-50", text: "text-emerald-600", color: "#14B8A6" },
  staff:       { label: "Staff", icon: "👷", bg: "bg-amber-50", text: "text-amber-600", color: "#F59E0B" },
};

const STATUS_STYLES = {
  pending:   { class: "bg-yellow-100 text-yellow-700", label: "Pending" },
  accepted:  { class: "bg-green-100 text-green-700", label: "Accepted" },
  rejected:  { class: "bg-red-100 text-red-700", label: "Rejected" },
  withdrawn: { class: "bg-gray-100 text-gray-500", label: "Withdrawn" },
};

export default function AllStaffApplicationsPage() {
  const auth = JSON.parse(localStorage.getItem("user") || "{}");
  const managerId = auth?.id || auth?._id || "";
  const qc = useQueryClient();
  const [expandedId, setExpandedId] = useState(null);
  const [profileModal, setProfileModal] = useState(null);
  const [respondNote, setRespondNote] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterRole, setFilterRole] = useState("");

  // Fetch all applications (with optional filters)
  const { data, isLoading } = useQuery({
    queryKey: ["allStaffApps", managerId, filterStatus, filterRole],
    queryFn: async () => {
      const p = new URLSearchParams();
      if (filterStatus) p.append("status", filterStatus);
      if (filterRole) p.append("role", filterRole);
      const r = await axios.get(`/api/staff-applications/manager/${managerId}/pending?${p}`);
      return r.data;
    },
    enabled: !!managerId,
  });

  // Fetch full profile for modal
  const { data: profileData, isLoading: profileLoading } = useQuery({
    queryKey: ["staffProfile", profileModal],
    queryFn: async () => {
      const r = await axios.get(`/api/staff-applications/${profileModal}/profile`);
      return r.data;
    },
    enabled: !!profileModal,
  });

  const acceptMut = useMutation({
    mutationFn: (id) => axios.put(`/api/staff-applications/${id}/accept`, { managerId, managerNote: respondNote }),
    onSuccess: () => { qc.invalidateQueries(["allStaffApps"]); setRespondNote(""); setExpandedId(null); },
  });

  const rejectMut = useMutation({
    mutationFn: (id) => axios.put(`/api/staff-applications/${id}/reject`, { managerId, managerNote: respondNote }),
    onSuccess: () => { qc.invalidateQueries(["allStaffApps"]); setRespondNote(""); setExpandedId(null); },
  });

  const verifyMut = useMutation({
    mutationFn: ({ id, isVerified }) => axios.put(`/api/staff-applications/${id}/verify`, { managerId, isVerified }),
    onSuccess: () => { qc.invalidateQueries(["allStaffApps"]); qc.invalidateQueries(["staffProfile"]); },
  });

  const apps = data?.applications || [];
  const pendingCount = data?.pending || 0;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-500 flex items-center justify-center shadow-lg shadow-orange-200">
            <Briefcase className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Staff Applications</h1>
            <p className="text-sm text-gray-500">
              {pendingCount > 0
                ? <><span className="text-yellow-600 font-bold">{pendingCount} pending</span> · {apps.length} total</>
                : `${apps.length} application${apps.length !== 1 ? "s" : ""}`}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
            className="text-xs px-3 py-2 rounded-lg border border-gray-200 bg-white font-medium">
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
          </select>
          <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)}
            className="text-xs px-3 py-2 rounded-lg border border-gray-200 bg-white font-medium">
            <option value="">All Roles</option>
            {Object.entries(ROLE_META).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
        </div>
      </div>

      {/* Stats Bar */}
      {!isLoading && apps.length > 0 && (
        <div className="grid grid-cols-4 gap-3 mb-6">
          {[
            { label: "Total", count: apps.length, color: "text-gray-700", bg: "bg-gray-50" },
            { label: "Pending", count: apps.filter((a) => a.status === "pending").length, color: "text-yellow-700", bg: "bg-yellow-50" },
            { label: "Accepted", count: apps.filter((a) => a.status === "accepted").length, color: "text-green-700", bg: "bg-green-50" },
            { label: "Rejected", count: apps.filter((a) => a.status === "rejected").length, color: "text-red-700", bg: "bg-red-50" },
          ].map((s) => (
            <div key={s.label} className={`${s.bg} rounded-xl p-3 text-center`}>
              <div className={`text-xl font-black ${s.color}`}>{s.count}</div>
              <div className="text-[10px] font-bold text-gray-400 uppercase">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
        </div>
      ) : apps.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
          <Users className="w-14 h-14 mx-auto mb-4 text-gray-200" />
          <p className="font-bold text-gray-400 text-lg">No Applications Found</p>
          <p className="text-sm text-gray-300 mt-1">
            {filterStatus || filterRole ? "Try changing filters" : "Applications will appear when staff apply to your tournaments"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {apps.map((app) => {
            const rm = ROLE_META[app.role] || ROLE_META.staff;
            const ss = STATUS_STYLES[app.status] || STATUS_STYLES.pending;
            const isExp = expandedId === app._id;
            const tournamentTitle = app.tournamentId?.title || app.tournamentName || "Tournament";
            const sportType = app.tournamentId?.sportsType || "";
            const expLabel = app.experience > 0
              ? `${app.experience}yr${app.experienceMonths > 0 ? ` ${app.experienceMonths}mo` : ""}`
              : app.experienceLevel === "fresher" ? "Fresher" : "—";

            return (
              <div key={app._id} className={`bg-white rounded-2xl border overflow-hidden transition-all ${
                app.status === "pending" ? "border-yellow-200 shadow-sm" : "border-gray-100"
              }`}>
                {/* Row */}
                <div className="flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-50/50 transition" onClick={() => setExpandedId(isExp ? null : app._id)}>
                  <div className="w-11 h-11 rounded-full flex items-center justify-center text-lg flex-shrink-0" style={{ backgroundColor: rm.color + "15" }}>
                    {rm.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm text-gray-800">{app.userName}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${rm.bg} ${rm.text}`}>{rm.label}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${ss.class}`}>{ss.label}</span>
                      {app.isVerified && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 flex items-center gap-0.5">
                          <BadgeCheck className="w-3 h-3" /> Verified
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-xs text-gray-400 flex-wrap">
                      <span className="font-medium text-orange-500">{tournamentTitle}</span>
                      {sportType && <><span>·</span><span>{sportType}</span></>}
                      <span>·</span>
                      <span className="flex items-center gap-0.5"><Clock className="w-3 h-3" /> {expLabel}</span>
                      {app.rateAmount > 0 && <><span>·</span><span>₹{app.rateAmount}/{(app.rateType || "").replace("per_", "")}</span></>}
                    </div>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isExp ? "rotate-180" : ""}`} />
                </div>

                {/* Expanded */}
                {isExp && (
                  <div className="border-t border-gray-100 p-4 bg-gray-50/40 space-y-4">
                    {/* Contact */}
                    <div className="flex gap-4 text-xs text-gray-500 flex-wrap">
                      {app.userEmail && <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {app.userEmail}</span>}
                      {app.userPhone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {app.userPhone}</span>}
                      {app.sports?.length > 0 && <span className="flex items-center gap-1"><Award className="w-3 h-3" /> {app.sports.join(", ")}</span>}
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Applied {new Date(app.createdAt).toLocaleDateString()}</span>
                    </div>

                    {/* Cover note */}
                    {app.message && (
                      <div className="bg-white rounded-xl p-3 border border-gray-100">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Cover Note</p>
                        <p className="text-sm text-gray-700 mt-1 leading-relaxed">{app.message}</p>
                      </div>
                    )}

                    {/* View Full Profile */}
                    <button onClick={(e) => { e.stopPropagation(); setProfileModal(app._id); }}
                      className="flex items-center gap-2 text-sm font-bold text-orange-500 hover:text-orange-700 transition">
                      <Eye className="w-4 h-4" /> View Full Profile & Documents
                    </button>

                    {/* Verify */}
                    <div className="flex items-center gap-3 bg-white rounded-xl p-3 border border-gray-100">
                      <div className="flex-1">
                        <p className="text-xs font-bold text-gray-600">Profile Verification</p>
                        <p className="text-[10px] text-gray-400">
                          {app.isVerified ? `Verified on ${new Date(app.verifiedAt).toLocaleDateString()}` : "Mark credentials as verified after review"}
                        </p>
                      </div>
                      <button onClick={() => verifyMut.mutate({ id: app._id, isVerified: !app.isVerified })}
                        className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition ${
                          app.isVerified ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}>
                        {app.isVerified ? <><ShieldCheck className="w-4 h-4" /> Verified</> : <><ShieldX className="w-4 h-4" /> Unverified</>}
                      </button>
                    </div>

                    {/* Manager response if already responded */}
                    {app.managerNote && (
                      <div className="bg-orange-50 rounded-xl p-3 border border-orange-100">
                        <p className="text-[10px] font-bold text-orange-400 uppercase">Your Response</p>
                        <p className="text-sm text-orange-600 mt-1">{app.managerNote}</p>
                      </div>
                    )}

                    {/* Actions — pending only */}
                    {app.status === "pending" && (
                      <div className="space-y-3 pt-1">
                        <textarea value={respondNote} onChange={(e) => setRespondNote(e.target.value)}
                          placeholder="Note to applicant (optional)..."
                          className="w-full text-sm px-4 py-3 rounded-xl border border-gray-200 bg-white resize-none h-14 outline-none focus:ring-2 focus:ring-orange-100" />
                        <div className="flex gap-2">
                          <button onClick={() => acceptMut.mutate(app._id)} disabled={acceptMut.isPending}
                            className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white py-3 rounded-xl font-bold text-sm hover:bg-green-700 transition disabled:opacity-50">
                            {acceptMut.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />} Accept
                          </button>
                          <button onClick={() => rejectMut.mutate(app._id)} disabled={rejectMut.isPending}
                            className="flex-1 flex items-center justify-center gap-2 bg-red-50 text-red-600 py-3 rounded-xl font-bold text-sm hover:bg-red-100 border border-red-100 transition disabled:opacity-50">
                            {rejectMut.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />} Reject
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Full Profile Modal */}
      {profileModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setProfileModal(null)}>
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[85vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-orange-500 to-[#F97316] p-5 text-white flex items-center justify-between">
              <h3 className="text-lg font-bold">Applicant Profile</h3>
              <button onClick={() => setProfileModal(null)} className="text-white/60 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="overflow-y-auto max-h-[70vh] p-5 space-y-4">
              {profileLoading ? (
                <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-orange-500" /></div>
              ) : profileData ? (
                <>
                  {/* User */}
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-black text-xl">
                      {profileData.user?.name?.charAt(0)?.toUpperCase() || "?"}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-800">{profileData.user?.name}</h4>
                      <div className="flex gap-3 text-xs text-gray-500 mt-1">
                        {profileData.user?.email && <span><Mail className="w-3 h-3 inline" /> {profileData.user.email}</span>}
                        {profileData.user?.mobile && <span><Phone className="w-3 h-3 inline" /> {profileData.user.mobile}</span>}
                      </div>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="bg-gray-50 rounded-xl p-4 grid grid-cols-2 gap-2 text-sm">
                    <div><span className="text-gray-400">Role:</span> <span className="font-bold">{ROLE_META[profileData.application?.role]?.label}</span></div>
                    <div><span className="text-gray-400">Experience:</span> <span className="font-bold">
                      {profileData.application?.experience > 0
                        ? `${profileData.application.experience}yr ${profileData.application.experienceMonths || 0}mo`
                        : "Fresher"}
                    </span></div>
                    {profileData.application?.rateAmount > 0 && (
                      <div><span className="text-gray-400">Rate:</span> <span className="font-bold">₹{profileData.application.rateAmount}/{(profileData.application.rateType || "").replace("per_", "")}</span></div>
                    )}
                    {profileData.application?.sports?.length > 0 && (
                      <div className="col-span-2"><span className="text-gray-400">Sports:</span> <span className="font-bold">{profileData.application.sports.join(", ")}</span></div>
                    )}
                  </div>

                  {/* Service Profile */}
                  {profileData.serviceProfile && (
                    <div className="border border-gray-100 rounded-xl p-4 space-y-3">
                      <h5 className="text-xs font-bold text-gray-500 uppercase tracking-wide"><Award className="w-3 h-3 inline" /> Service Profile</h5>
                      {profileData.serviceProfile.experienceDescription && (
                        <p className="text-sm text-gray-700">{profileData.serviceProfile.experienceDescription}</p>
                      )}
                      {profileData.serviceProfile.certificationLevel && (
                        <span className="text-xs font-bold bg-orange-50 text-orange-500 px-2 py-0.5 rounded-full">{profileData.serviceProfile.certificationLevel}</span>
                      )}
                      {profileData.serviceProfile.availableDays?.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {profileData.serviceProfile.availableDays.map((d) => (
                            <span key={d} className="text-[10px] font-bold bg-green-50 text-green-600 px-2 py-0.5 rounded-full">{d.slice(0, 3)}</span>
                          ))}
                        </div>
                      )}
                      {profileData.serviceProfile.certificates?.length > 0 && (
                        <div className="space-y-1.5">
                          <p className="text-[10px] font-bold text-gray-400">Certificates</p>
                          {profileData.serviceProfile.certificates.map((cert, i) => (
                            <div key={i} className="flex items-center gap-2 bg-gray-50 rounded-lg p-2 text-xs">
                              <FileText className="w-4 h-4 text-orange-500" />
                              <span className="font-bold text-gray-700 flex-1 truncate">{cert.name || `Certificate ${i + 1}`}</span>
                              {cert.certificateUrl && (
                                <a href={cert.certificateUrl} target="_blank" rel="noreferrer" className="text-orange-500"><Download className="w-3.5 h-3.5" /></a>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Cover Note */}
                  {profileData.application?.message && (
                    <div className="bg-amber-50 rounded-xl p-3 border border-amber-100">
                      <p className="text-[10px] font-bold text-amber-500 uppercase">Cover Note</p>
                      <p className="text-sm text-gray-700 mt-1">{profileData.application.message}</p>
                    </div>
                  )}

                  {/* Verification */}
                  <div className={`rounded-xl p-3 border flex items-center gap-3 ${profileData.application?.isVerified ? "bg-emerald-50 border-emerald-200" : "bg-gray-50 border-gray-200"}`}>
                    {profileData.application?.isVerified
                      ? <><BadgeCheck className="w-5 h-5 text-emerald-600" /><span className="text-sm font-bold text-emerald-700">Profile Verified</span></>
                      : <><AlertCircle className="w-5 h-5 text-gray-400" /><span className="text-sm font-bold text-gray-500">Not Verified</span></>}
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-gray-400">Failed to load profile</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
