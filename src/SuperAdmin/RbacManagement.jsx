import { toast } from "react-toastify";
import { useState, useEffect } from "react";
import axios from "axios";
import {
  Shield,
  Users,
  Key,
  ChevronDown,
  ChevronRight,
  Check,
  X,
  Plus,
  Trash2,
  RefreshCcw,
  Lock,
  Grid3X3,
  Search,
  AlertTriangle,
} from "lucide-react";

const MODULE_ICONS = {
  tournament: "🏆",
  turf: "🏟️",
  booking: "📅",
  player: "👤",
  manager: "💼",
  news: "📰",
  payment: "💳",
  expense: "📊",
  referee: "🏁",
  social: "💬",
  sport: "⚽",
  report: "📈",
  role: "🔐",
  club_admin: "🏢",
  trainer: "🎯",
  notification: "🔔",
  donation: "🎁",
  settings: "⚙️",
  staff: "👥",
};

export default function RbacManagement() {
  const [activeTab, setActiveTab] = useState("matrix"); // matrix | roles | permissions
  const [matrixData, setMatrixData] = useState(null);
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState({ flat: [], modules: {} });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedModules, setExpandedModules] = useState({});
  const [selectedRole, setSelectedRole] = useState(null);
  const [showCreateRole, setShowCreateRole] = useState(false);
  const [showCreatePerm, setShowCreatePerm] = useState(false);
  const [saving, setSaving] = useState(false);

  // Create role form
  const [newRole, setNewRole] = useState({
    name: "",
    slug: "",
    authorityLevel: 5,
    description: "",
    color: "#6B7280",
  });

  // Create permission form
  const [newPerm, setNewPerm] = useState({
    key: "",
    name: "",
    module: "tournament",
    action: "read",
    description: "",
  });

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [matrixRes, rolesRes, permsRes] = await Promise.all([
        axios.get("/api/roles/matrix"),
        axios.get("/api/roles"),
        axios.get("/api/roles/permissions/list"),
      ]);
      setMatrixData(matrixRes.data);
      setRoles(rolesRes.data.roles || []);
      setPermissions({
        flat: permsRes.data.flat || [],
        modules: permsRes.data.permissions || {},
      });
    } catch (err) {
      console.error("RBAC fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSeed = async () => {
    try {
      const res = await axios.post("/api/roles/seed");
      toast.info(`Seed complete!\nPermissions: ${res.data.permissions.created} created, ${res.data.permissions.skipped} skipped\nRoles: ${res.data.roles.created} created, ${res.data.roles.updated} updated`);
      fetchAll();
    } catch (err) {
      toast.info("Seed failed: " + (err.response?.data?.message || err.message));
    }
  };

  const handleTogglePermission = async (roleId, permissionId, currentlyGranted, isSuperAdmin) => {
    if (isSuperAdmin) return; // Can't modify SuperAdmin
    setSaving(true);
    try {
      if (currentlyGranted) {
        await axios.post("/api/roles/revoke-permission", { roleId, permissionId });
      } else {
        await axios.post("/api/roles/assign-permission", { roleId, permissionId });
      }
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCreateRole = async (e) => {
    e.preventDefault();
    try {
      await axios.post("/api/roles", newRole);
      setShowCreateRole(false);
      setNewRole({ name: "", slug: "", authorityLevel: 5, description: "", color: "#6B7280" });
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    }
  };

  const handleDeleteRole = async (roleId, roleName, isSystem) => {
    if (isSystem) {
      toast.info("System roles cannot be deleted.");
      return;
    }
    if (!confirm(`Delete role "${roleName}"? This cannot be undone.`)) return;
    try {
      await axios.delete(`/api/roles/${roleId}`);
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    }
  };

  const handleCreatePermission = async (e) => {
    e.preventDefault();
    try {
      const key = `${newPerm.module}:${newPerm.action}`;
      await axios.post("/api/roles/permissions", { ...newPerm, key });
      setShowCreatePerm(false);
      setNewPerm({ key: "", name: "", module: "tournament", action: "read", description: "" });
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    }
  };

  const handleDeletePermission = async (permId, isSystem) => {
    if (isSystem) {
      toast.info("System permissions cannot be deleted.");
      return;
    }
    if (!confirm("Delete this permission?")) return;
    try {
      await axios.delete(`/api/roles/permissions/${permId}`);
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    }
  };

  const toggleModule = (mod) => {
    setExpandedModules((prev) => ({ ...prev, [mod]: !prev[mod] }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCcw className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <Shield className="w-7 h-7 text-red-500" />
            Roles & Permissions
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {roles.length} roles · {permissions.flat.length} permissions · {Object.keys(permissions.modules).length} modules
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleSeed}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 flex items-center gap-2"
          >
            <RefreshCcw className="w-4 h-4" />
            Re-Seed Defaults
          </button>
          <button
            onClick={() => setShowCreateRole(true)}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Role
          </button>
          <button
            onClick={() => setShowCreatePerm(true)}
            className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 flex items-center gap-2"
          >
            <Key className="w-4 h-4" />
            New Permission
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6 w-fit">
        {[
          { key: "matrix", label: "Permission Matrix", icon: Grid3X3 },
          { key: "roles", label: "Roles", icon: Users },
          { key: "permissions", label: "Permissions", icon: Key },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 text-sm font-medium rounded-lg flex items-center gap-2 transition-all ${
              activeTab === tab.key
                ? "bg-white text-blue-700 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* ═══════════════════════════════════════ */}
      {/* MATRIX VIEW */}
      {/* ═══════════════════════════════════════ */}
      {activeTab === "matrix" && matrixData && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50 z-10 min-w-[200px]">
                    Permission
                  </th>
                  {matrixData.matrix.map((col) => (
                    <th
                      key={col.role._id}
                      className="px-3 py-3 text-center min-w-[100px]"
                    >
                      <div className="flex flex-col items-center gap-1">
                        <span
                          className="inline-block w-3 h-3 rounded-full"
                          style={{ backgroundColor: col.role.color }}
                        />
                        <span className="text-xs font-bold text-gray-700">
                          {col.role.name}
                        </span>
                        <span className="text-[10px] text-gray-400">
                          Lvl {col.role.authorityLevel}
                        </span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Object.entries(matrixData.modules).map(([moduleName, modulePerms]) => (
                  <>
                    {/* Module header row */}
                    <tr key={`mod-${moduleName}`} className="bg-gray-50/50">
                      <td
                        colSpan={matrixData.matrix.length + 1}
                        className="px-4 py-2 text-xs font-bold text-gray-600 uppercase tracking-wider cursor-pointer sticky left-0 bg-gray-50/50"
                        onClick={() => toggleModule(moduleName)}
                      >
                        <span className="flex items-center gap-2">
                          {expandedModules[moduleName] === false ? (
                            <ChevronRight className="w-3.5 h-3.5" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5" />
                          )}
                          {MODULE_ICONS[moduleName] || "📦"} {moduleName}
                          <span className="text-gray-400 font-normal">({modulePerms.length})</span>
                        </span>
                      </td>
                    </tr>
                    {/* Permission rows */}
                    {expandedModules[moduleName] !== false &&
                      modulePerms.map((perm) => (
                        <tr
                          key={perm._id}
                          className="border-b border-gray-100 hover:bg-blue-50/30 transition-colors"
                        >
                          <td className="px-4 py-2.5 sticky left-0 bg-white z-10">
                            <div className="flex flex-col">
                              <span className="text-sm font-medium text-gray-800">
                                {perm.name}
                              </span>
                              <span className="text-[10px] text-gray-400 font-mono">
                                {perm.key}
                              </span>
                            </div>
                          </td>
                          {matrixData.matrix.map((col) => {
                            const cellPerm = col.permissions.find(
                              (p) => p._id === perm._id
                            );
                            const granted = cellPerm?.granted || false;

                            return (
                              <td
                                key={`${col.role._id}-${perm._id}`}
                                className="px-3 py-2.5 text-center"
                              >
                                <button
                                  onClick={() =>
                                    handleTogglePermission(
                                      col.role._id,
                                      perm._id,
                                      granted,
                                      col.isSuperAdmin
                                    )
                                  }
                                  disabled={col.isSuperAdmin || saving}
                                  className={`w-7 h-7 rounded-lg flex items-center justify-center mx-auto transition-all ${
                                    col.isSuperAdmin
                                      ? "bg-green-100 text-green-600 cursor-not-allowed"
                                      : granted
                                      ? "bg-green-500 text-white hover:bg-green-600 shadow-sm"
                                      : "bg-gray-100 text-gray-300 hover:bg-red-50 hover:text-red-400"
                                  }`}
                                  title={
                                    col.isSuperAdmin
                                      ? "SuperAdmin bypasses all checks"
                                      : granted
                                      ? "Click to revoke"
                                      : "Click to grant"
                                  }
                                >
                                  {granted ? (
                                    <Check className="w-4 h-4" />
                                  ) : (
                                    <X className="w-3.5 h-3.5" />
                                  )}
                                </button>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                  </>
                ))}
              </tbody>
            </table>
          </div>

          {/* Legend */}
          <div className="px-4 py-3 bg-gray-50 border-t flex items-center gap-6 text-xs text-gray-500">
            <span className="flex items-center gap-1.5">
              <span className="w-5 h-5 rounded bg-green-500 flex items-center justify-center">
                <Check className="w-3 h-3 text-white" />
              </span>
              Granted
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-5 h-5 rounded bg-gray-100 flex items-center justify-center">
                <X className="w-3 h-3 text-gray-300" />
              </span>
              Denied
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-5 h-5 rounded bg-green-100 flex items-center justify-center">
                <Lock className="w-3 h-3 text-green-600" />
              </span>
              SuperAdmin (auto-granted)
            </span>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════ */}
      {/* ROLES VIEW */}
      {/* ═══════════════════════════════════════ */}
      {activeTab === "roles" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {roles.map((role) => (
            <div
              key={role._id}
              className={`bg-white rounded-xl border-2 p-5 transition-all hover:shadow-md cursor-pointer ${
                selectedRole?._id === role._id
                  ? "border-blue-500 shadow-md"
                  : "border-gray-100"
              }`}
              onClick={() => setSelectedRole(selectedRole?._id === role._id ? null : role)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold"
                    style={{ backgroundColor: role.color }}
                  >
                    {role.authorityLevel}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{role.name}</h3>
                    <p className="text-xs text-gray-400 font-mono">{role.slug}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {role.isSystem && (
                    <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold">
                      SYSTEM
                    </span>
                  )}
                  {!role.isSystem && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteRole(role._id, role.name, role.isSystem);
                      }}
                      className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              <p className="text-xs text-gray-500 mb-3">{role.description}</p>

              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">
                  {role.permissions?.length || 0} permissions
                </span>
                <span className="text-[10px] text-gray-400">
                  Authority: {role.authorityLevel}
                </span>
              </div>

              {/* Expanded permissions list */}
              {selectedRole?._id === role._id && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">
                    Assigned Permissions
                  </h4>
                  <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto">
                    {role.permissions?.map((p) => (
                      <span
                        key={p._id}
                        className="text-[10px] bg-green-50 text-green-700 px-2 py-1 rounded-full font-medium border border-green-200"
                      >
                        {p.key}
                      </span>
                    ))}
                    {(!role.permissions || role.permissions.length === 0) && (
                      <span className="text-xs text-gray-400 italic">No permissions assigned</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ═══════════════════════════════════════ */}
      {/* PERMISSIONS VIEW */}
      {/* ═══════════════════════════════════════ */}
      {activeTab === "permissions" && (
        <div>
          {/* Search */}
          <div className="mb-4 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search permissions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full max-w-md pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none"
            />
          </div>

          <div className="space-y-3">
            {Object.entries(permissions.modules).map(([moduleName, modulePerms]) => {
              const filtered = modulePerms.filter(
                (p) =>
                  !searchTerm ||
                  p.key.includes(searchTerm.toLowerCase()) ||
                  p.name.toLowerCase().includes(searchTerm.toLowerCase())
              );
              if (filtered.length === 0) return null;

              return (
                <div key={moduleName} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <div
                    className="flex items-center justify-between px-4 py-3 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => toggleModule(moduleName)}
                  >
                    <span className="font-bold text-sm text-gray-700 flex items-center gap-2">
                      {MODULE_ICONS[moduleName] || "📦"} {moduleName.toUpperCase()}
                      <span className="text-gray-400 font-normal text-xs">
                        ({filtered.length})
                      </span>
                    </span>
                    {expandedModules[moduleName] === false ? (
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    )}
                  </div>

                  {expandedModules[moduleName] !== false && (
                    <div className="divide-y divide-gray-100">
                      {filtered.map((perm) => (
                        <div
                          key={perm._id}
                          className="flex items-center justify-between px-4 py-3 hover:bg-blue-50/30 transition-colors"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-gray-800">
                                {perm.name}
                              </span>
                              <span className="text-[10px] font-mono bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                                {perm.key}
                              </span>
                              {perm.isSystem && (
                                <Lock className="w-3 h-3 text-amber-500" />
                              )}
                            </div>
                            {perm.description && (
                              <p className="text-xs text-gray-400 mt-0.5">{perm.description}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-medium">
                              {perm.action}
                            </span>
                            {!perm.isSystem && (
                              <button
                                onClick={() => handleDeletePermission(perm._id, perm.isSystem)}
                                className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════ */}
      {/* CREATE ROLE MODAL */}
      {/* ═══════════════════════════════════════ */}
      {showCreateRole && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <form
            onSubmit={handleCreateRole}
            className="bg-white rounded-2xl w-full max-w-md p-6 space-y-4"
          >
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-500" />
              Create New Role
            </h3>

            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">Name</label>
              <input
                type="text"
                required
                value={newRole.name}
                onChange={(e) => {
                  setNewRole({
                    ...newRole,
                    name: e.target.value,
                    slug: e.target.value.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z_]/g, ""),
                  });
                }}
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-200 outline-none"
                placeholder="Volunteer"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Slug</label>
                <input
                  type="text"
                  required
                  value={newRole.slug}
                  onChange={(e) => setNewRole({ ...newRole, slug: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-blue-200 outline-none"
                  placeholder="volunteer"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Authority Level</label>
                <input
                  type="number"
                  required
                  min="1"
                  max="99"
                  value={newRole.authorityLevel}
                  onChange={(e) => setNewRole({ ...newRole, authorityLevel: parseInt(e.target.value) })}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-200 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">Description</label>
              <textarea
                value={newRole.description}
                onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-200 outline-none"
                rows={2}
                placeholder="What can this role do?"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">Color</label>
              <input
                type="color"
                value={newRole.color}
                onChange={(e) => setNewRole({ ...newRole, color: e.target.value })}
                className="w-full mt-1 h-10 rounded-lg cursor-pointer"
              />
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700">
                Lower authority level = higher power. SuperAdmin is 0, Player is 4. You cannot create roles with authority equal to or above your own.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowCreateRole(false)}
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2.5 bg-blue-600 rounded-lg text-sm font-medium text-white hover:bg-blue-700"
              >
                Create Role
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ═══════════════════════════════════════ */}
      {/* CREATE PERMISSION MODAL */}
      {/* ═══════════════════════════════════════ */}
      {showCreatePerm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <form
            onSubmit={handleCreatePermission}
            className="bg-white rounded-2xl w-full max-w-md p-6 space-y-4"
          >
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Key className="w-5 h-5 text-purple-500" />
              Create New Permission
            </h3>

            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">Name</label>
              <input
                type="text"
                required
                value={newPerm.name}
                onChange={(e) => setNewPerm({ ...newPerm, name: e.target.value })}
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-200 outline-none"
                placeholder="Manage Equipment"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Module</label>
                <select
                  value={newPerm.module}
                  onChange={(e) => setNewPerm({ ...newPerm, module: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-200 outline-none"
                >
                  {Object.keys(MODULE_ICONS).map((m) => (
                    <option key={m} value={m}>
                      {MODULE_ICONS[m]} {m}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Action</label>
                <select
                  value={newPerm.action}
                  onChange={(e) => setNewPerm({ ...newPerm, action: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-200 outline-none"
                >
                  {["create", "read", "update", "delete", "manage", "approve", "reject", "publish", "assign", "export", "view_all", "view_own"].map(
                    (a) => (
                      <option key={a} value={a}>
                        {a}
                      </option>
                    )
                  )}
                </select>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg px-3 py-2">
              <span className="text-xs text-gray-500">Generated key: </span>
              <span className="text-sm font-mono font-bold text-purple-600">
                {newPerm.module}:{newPerm.action}
              </span>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">Description</label>
              <input
                type="text"
                value={newPerm.description}
                onChange={(e) => setNewPerm({ ...newPerm, description: e.target.value })}
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-200 outline-none"
                placeholder="What does this permission allow?"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowCreatePerm(false)}
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2.5 bg-purple-600 rounded-lg text-sm font-medium text-white hover:bg-purple-700"
              >
                Create Permission
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
