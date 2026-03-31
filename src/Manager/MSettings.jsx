import React, { useContext, useState, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import {
  User, Lock, Mail, Phone, Bell, Globe, Shield, HelpCircle, Info,
  LogOut, Settings, Eye, Loader2, Check, X, Edit2, Save,
} from "lucide-react";

export default function MSettings() {
  const { auth, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const managerId = auth?._id;

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingName, setEditingName] = useState(false);
  const [editingEmail, setEditingEmail] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [saving, setSaving] = useState(false);

  // Password
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  // Fetch profile
  useEffect(() => {
    if (!managerId) { setLoading(false); return; }
    (async () => {
      try {
        const res = await axios.get(`/api/managers/${managerId}/profile`);
        if (res.data?.success) {
          setProfile(res.data.manager);
          setNameInput(res.data.manager.name || "");
          setEmailInput(res.data.manager.email || "");
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [managerId]);

  // Save name/email
  const handleSaveProfile = async (field) => {
    setSaving(true);
    try {
      const data = {};
      if (field === "name") data.name = nameInput.trim();
      if (field === "email") data.email = emailInput.trim();

      const res = await axios.put(`/api/managers/${managerId}/profile`, data);
      if (res.data?.success) {
        setProfile((p) => ({ ...p, ...res.data.manager }));
        toast.success(`${field === "name" ? "Name" : "Email"} updated!`);
        setEditingName(false);
        setEditingEmail(false);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update");
    } finally {
      setSaving(false);
    }
  };

  // Change password
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      return;
    }

    setChangingPassword(true);
    try {
      const res = await axios.put(`/api/managers/${managerId}/change-password`, {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      if (res.data?.success) {
        setPasswordSuccess("Password updated successfully!");
        setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
        setTimeout(() => { setShowPasswordModal(false); setPasswordSuccess(""); }, 2000);
      }
    } catch (err) {
      setPasswordError(err.response?.data?.message || "Failed to update password");
    } finally {
      setChangingPassword(false);
    }
  };

  const handleLogout = () => { logout(); navigate("/login"); };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-8 h-8 text-[#004E93] animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-black text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-0.5">Manage your account and preferences</p>
      </div>

      <div className="space-y-5">
        {/* Profile Card */}
        <Section icon={User} title="Profile">
          <div className="flex items-center gap-4 mb-5 pb-5 border-b border-gray-100">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#004E93] to-[#2DA5FF] flex items-center justify-center text-white text-2xl font-black">
              {(profile?.name || auth?.name || "U").charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-800">{profile?.name || auth?.name || "Manager"}</h3>
              <p className="text-sm text-gray-500">{profile?.email || auth?.email}</p>
              <span className="text-[10px] font-bold text-[#004E93] bg-[#004E93]/10 px-2 py-0.5 rounded-full mt-1 inline-block">Manager</span>
            </div>
          </div>

          {/* Editable Name */}
          <div className="flex items-center justify-between py-3 border-b border-gray-50">
            <div className="flex items-center gap-3">
              <User className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-xs text-gray-400 font-medium">Full Name</p>
                {editingName ? (
                  <input type="text" value={nameInput} onChange={(e) => setNameInput(e.target.value)} autoFocus
                    className="text-sm font-semibold text-gray-800 border-b-2 border-[#004E93] outline-none bg-transparent py-0.5 w-48" />
                ) : (
                  <p className="text-sm font-semibold text-gray-800">{profile?.name || "—"}</p>
                )}
              </div>
            </div>
            {editingName ? (
              <div className="flex gap-1.5">
                <button onClick={() => handleSaveProfile("name")} disabled={saving}
                  className="p-1.5 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition w-auto">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                </button>
                <button onClick={() => { setEditingName(false); setNameInput(profile?.name || ""); }}
                  className="p-1.5 bg-gray-100 text-gray-500 rounded-lg hover:bg-gray-200 transition w-auto">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button onClick={() => setEditingName(true)} className="p-1.5 text-gray-400 hover:text-[#004E93] hover:bg-blue-50 rounded-lg transition w-auto">
                <Edit2 className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Editable Email */}
          <div className="flex items-center justify-between py-3 border-b border-gray-50">
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-xs text-gray-400 font-medium">Email Address</p>
                {editingEmail ? (
                  <input type="email" value={emailInput} onChange={(e) => setEmailInput(e.target.value)} autoFocus
                    className="text-sm font-semibold text-gray-800 border-b-2 border-[#004E93] outline-none bg-transparent py-0.5 w-56" />
                ) : (
                  <p className="text-sm font-semibold text-gray-800">{profile?.email || "—"}</p>
                )}
              </div>
            </div>
            {editingEmail ? (
              <div className="flex gap-1.5">
                <button onClick={() => handleSaveProfile("email")} disabled={saving}
                  className="p-1.5 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition w-auto">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                </button>
                <button onClick={() => { setEditingEmail(false); setEmailInput(profile?.email || ""); }}
                  className="p-1.5 bg-gray-100 text-gray-500 rounded-lg hover:bg-gray-200 transition w-auto">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button onClick={() => setEditingEmail(true)} className="p-1.5 text-gray-400 hover:text-[#004E93] hover:bg-blue-50 rounded-lg transition w-auto">
                <Edit2 className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Account ID */}
          <div className="flex items-center gap-3 py-3">
            <Shield className="w-4 h-4 text-gray-400" />
            <div>
              <p className="text-xs text-gray-400 font-medium">Account ID</p>
              <p className="text-xs text-gray-500 font-mono">{managerId}</p>
            </div>
          </div>
        </Section>

        {/* Security */}
        <Section icon={Lock} title="Security">
          <button onClick={() => setShowPasswordModal(true)}
            className="w-full flex items-center justify-between py-3 hover:bg-gray-50 rounded-xl px-3 -mx-3 transition group">
            <div className="flex items-center gap-3">
              <Lock className="w-4 h-4 text-gray-400 group-hover:text-[#004E93]" />
              <div className="text-left">
                <p className="text-sm font-semibold text-gray-800">Change Password</p>
                <p className="text-xs text-gray-400">Update your account password</p>
              </div>
            </div>
            <div className="text-xs text-[#004E93] font-semibold opacity-0 group-hover:opacity-100 transition">Change →</div>
          </button>
        </Section>

        {/* App Info */}
        <Section icon={Info} title="About">
          <div className="space-y-3">
            <InfoRow label="App Name" value="Chalo Khelne" />
            <InfoRow label="Version" value="v2.0.0" />
            <InfoRow label="Role" value="Manager" />
            <InfoRow label="Support" value="support@chalokhelne.com" />
          </div>
          <div className="flex gap-3 mt-4 pt-3 border-t border-gray-100">
            <a href="/l/terms-and-conditions" className="text-xs text-[#004E93] font-medium hover:underline">Terms & Conditions</a>
            <a href="/l/privacy-policy" className="text-xs text-[#004E93] font-medium hover:underline">Privacy Policy</a>
            <a href="/l/faq" className="text-xs text-[#004E93] font-medium hover:underline">FAQs</a>
          </div>
        </Section>

        {/* Logout */}
        <button onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl border-2 border-red-200 text-red-600 font-bold text-sm hover:bg-red-50 transition active:scale-[0.98]">
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </div>

      {/* Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-800">Change Password</h3>
              <button onClick={() => { setShowPasswordModal(false); setPasswordError(""); setPasswordSuccess(""); setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" }); }}
                className="p-1.5 hover:bg-gray-100 rounded-lg w-auto">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <form onSubmit={handlePasswordChange} className="p-6 space-y-4">
              <PasswordInput label="Current Password" value={passwordForm.currentPassword}
                onChange={(v) => setPasswordForm((p) => ({ ...p, currentPassword: v }))} />
              <PasswordInput label="New Password" value={passwordForm.newPassword}
                onChange={(v) => setPasswordForm((p) => ({ ...p, newPassword: v }))} />
              <PasswordInput label="Confirm New Password" value={passwordForm.confirmPassword}
                onChange={(v) => setPasswordForm((p) => ({ ...p, confirmPassword: v }))} />

              {passwordError && <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2.5 rounded-xl text-sm font-medium">{passwordError}</div>}
              {passwordSuccess && <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-2.5 rounded-xl text-sm font-medium">{passwordSuccess}</div>}

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => { setShowPasswordModal(false); setPasswordError(""); }}
                  className="flex-1 px-4 py-2.5 rounded-xl text-gray-600 font-semibold text-sm hover:bg-gray-100 transition w-auto">
                  Cancel
                </button>
                <button type="submit" disabled={changingPassword}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-[#004E93] hover:bg-[#073E73] text-white font-bold text-sm transition disabled:opacity-50 flex items-center justify-center gap-2">
                  {changingPassword ? <><Loader2 className="w-4 h-4 animate-spin" /> Updating...</> : "Update Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Sub-components
function Section({ icon: Icon, title, children }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-[#004E93]/10 flex items-center justify-center">
          <Icon className="w-4 h-4 text-[#004E93]" />
        </div>
        <h3 className="font-bold text-gray-800 text-sm">{title}</h3>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between items-center py-1.5">
      <span className="text-xs text-gray-500">{label}</span>
      <span className="text-sm font-semibold text-gray-800">{value}</span>
    </div>
  );
}

function PasswordInput({ label, value, onChange }) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 mb-1.5">{label}</label>
      <div className="relative">
        <input type={show ? "text" : "password"} value={value} onChange={(e) => onChange(e.target.value)} required minLength={label.includes("New") ? 6 : undefined}
          className="w-full px-4 py-2.5 pr-10 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#004E93]/20 focus:border-[#004E93] transition" />
        <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 w-auto">
          <Eye className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
