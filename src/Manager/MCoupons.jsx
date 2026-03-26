import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import {
  Tag,
  Plus,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Percent,
  IndianRupee,
  Calendar,
  Copy,
  Users,
  BarChart3,
  X,
  Check,
  RefreshCcw,
  Search,
  Gift,
} from "lucide-react";

export default function MCoupons() {
  const { auth } = useContext(AuthContext);
  const managerId = auth?._id;

  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [showCreate, setShowCreate] = useState(false);
  const [search, setSearch] = useState("");

  const [form, setForm] = useState({
    code: "",
    discountType: "percentage",
    discountValue: "",
    applicableTo: "all",
    applicableId: "",
    applicableName: "",
    usageLimit: "",
    perUserLimit: "1",
    expiryDate: "",
    minAmount: "",
    maxDiscount: "",
    description: "",
  });

  useEffect(() => {
    fetchCoupons();
    fetchAnalytics();
  }, []);

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/coupons/list", { params: { createdBy: managerId } });
      if (res.data.success) setCoupons(res.data.coupons);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const res = await axios.get("/api/coupons/analytics", { params: { createdBy: managerId } });
      if (res.data.success) setStats(res.data.stats);
    } catch {}
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("/api/coupons/create", {
        ...form,
        code: form.code.toUpperCase(),
        discountValue: Number(form.discountValue),
        usageLimit: form.usageLimit ? Number(form.usageLimit) : null,
        perUserLimit: Number(form.perUserLimit) || 1,
        minAmount: form.minAmount ? Number(form.minAmount) : 0,
        maxDiscount: form.maxDiscount ? Number(form.maxDiscount) : null,
        createdBy: managerId,
        createdByName: auth?.name,
        createdByModel: "Manager",
      });
      if (res.data.success) {
        setShowCreate(false);
        setForm({ code: "", discountType: "percentage", discountValue: "", applicableTo: "all", applicableId: "", applicableName: "", usageLimit: "", perUserLimit: "1", expiryDate: "", minAmount: "", maxDiscount: "", description: "" });
        fetchCoupons();
        fetchAnalytics();
      }
    } catch (err) {
      alert("Failed: " + (err.response?.data?.message || err.message));
    }
  };

  const handleToggle = async (id) => {
    try {
      await axios.put(`/api/coupons/toggle/${id}`);
      fetchCoupons();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this coupon?")) return;
    try {
      await axios.delete(`/api/coupons/${id}`);
      fetchCoupons();
      fetchAnalytics();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    alert(`Copied: ${code}`);
  };

  const filtered = coupons.filter((c) =>
    !search || c.code.includes(search.toUpperCase()) || c.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 max-w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <Gift className="w-7 h-7 text-emerald-500" />
            Coupons & Discounts
          </h1>
          <p className="text-sm text-gray-500 mt-1">Create and manage discount coupons for bookings</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Create Coupon
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Coupons", value: stats.totalCoupons || 0, icon: Tag, color: "blue" },
          { label: "Active", value: stats.activeCoupons || 0, icon: Check, color: "green" },
          { label: "Times Used", value: stats.totalUsage || 0, icon: Users, color: "purple" },
          { label: "Total Discount Given", value: `₹${stats.totalDiscountGiven || 0}`, icon: IndianRupee, color: "orange" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl bg-${color}-100 flex items-center justify-center`}>
              <Icon className={`w-5 h-5 text-${color}-600`} />
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900">{value}</p>
              <p className="text-xs text-gray-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-4 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search coupons..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-200 outline-none"
        />
      </div>

      {/* Coupon List */}
      {loading ? (
        <div className="flex justify-center py-20"><RefreshCcw className="w-8 h-8 animate-spin text-emerald-400" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Tag className="w-16 h-16 mx-auto mb-4 opacity-30" />
          <p className="text-lg font-semibold">No coupons yet</p>
          <p className="text-sm">Create your first coupon to start offering discounts</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((coupon) => {
            const isExpired = coupon.isExpired;
            const isExhausted = coupon.isExhausted;
            const isInactive = !coupon.isActive;

            return (
              <div
                key={coupon._id}
                className={`bg-white border-2 rounded-2xl overflow-hidden transition-all ${
                  isExpired || isInactive ? "border-gray-200 opacity-60" : "border-emerald-200 hover:shadow-md"
                }`}
              >
                {/* Top bar */}
                <div className={`px-4 py-2 flex items-center justify-between ${
                  isExpired ? "bg-red-50" : isInactive ? "bg-gray-50" : "bg-emerald-50"
                }`}>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                      coupon.applicableTo === "facility" ? "bg-blue-100 text-blue-700" :
                      coupon.applicableTo === "tournament" ? "bg-purple-100 text-purple-700" :
                      "bg-gray-100 text-gray-700"
                    }`}>
                      {coupon.applicableTo}
                    </span>
                    {isExpired && <span className="text-[10px] font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded-full">EXPIRED</span>}
                    {isExhausted && <span className="text-[10px] font-bold text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full">EXHAUSTED</span>}
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => handleToggle(coupon._id)} className="p-1 hover:bg-white rounded-lg w-auto">
                      {coupon.isActive ? <ToggleRight className="w-5 h-5 text-emerald-600" /> : <ToggleLeft className="w-5 h-5 text-gray-400" />}
                    </button>
                    <button onClick={() => handleDelete(coupon._id)} className="p-1 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-500 w-auto">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="p-4">
                  {/* Code */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-lg font-bold text-gray-900 bg-gray-100 px-3 py-1 rounded-lg tracking-wider">
                        {coupon.code}
                      </span>
                      <button onClick={() => copyCode(coupon.code)} className="p-1 text-gray-400 hover:text-gray-600 w-auto">
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Discount */}
                  <div className="flex items-baseline gap-1 mb-2">
                    {coupon.discountType === "percentage" ? (
                      <>
                        <span className="text-3xl font-extrabold text-emerald-600">{coupon.discountValue}%</span>
                        <span className="text-sm text-gray-500">off</span>
                        {coupon.maxDiscount && <span className="text-xs text-gray-400 ml-1">(max ₹{coupon.maxDiscount})</span>}
                      </>
                    ) : (
                      <>
                        <span className="text-3xl font-extrabold text-emerald-600">₹{coupon.discountValue}</span>
                        <span className="text-sm text-gray-500">flat off</span>
                      </>
                    )}
                  </div>

                  {coupon.description && <p className="text-xs text-gray-500 mb-3">{coupon.description}</p>}

                  {/* Details */}
                  <div className="space-y-1.5 text-xs text-gray-500">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5" />
                      Expires: {new Date(coupon.expiryDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-3.5 h-3.5" />
                      Used: {coupon.usedCount}{coupon.usageLimit ? ` / ${coupon.usageLimit}` : " (unlimited)"}
                    </div>
                    {coupon.minAmount > 0 && (
                      <div className="flex items-center gap-2">
                        <IndianRupee className="w-3.5 h-3.5" />
                        Min order: ₹{coupon.minAmount}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Coupon Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <form onSubmit={handleCreate} className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-4 flex justify-between items-center rounded-t-2xl">
              <h3 className="text-white font-bold text-lg flex items-center gap-2"><Tag className="w-5 h-5" /> Create Coupon</h3>
              <button type="button" onClick={() => setShowCreate(false)} className="text-white hover:text-emerald-200 bg-transparent w-auto">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Code */}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Coupon Code *</label>
                <div className="flex gap-2 mt-1">
                  <input
                    type="text"
                    required
                    maxLength={20}
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase().replace(/\s/g, "") })}
                    className="flex-1 px-3 py-2.5 border border-gray-300 rounded-lg text-sm font-mono font-bold tracking-wider focus:ring-2 focus:ring-emerald-200 outline-none uppercase"
                    placeholder="SUMMER20 or click Generate"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
                      let code = "";
                      for (let i = 0; i < 8; i++) code += chars[Math.floor(Math.random() * chars.length)];
                      setForm({ ...form, code });
                    }}
                    className="px-3 py-2.5 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-lg text-xs font-bold text-gray-600 whitespace-nowrap transition-colors"
                  >
                    🎲 Generate
                  </button>
                </div>
              </div>

              {/* Discount Type + Value */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">Discount Type *</label>
                  <select
                    value={form.discountType}
                    onChange={(e) => setForm({ ...form, discountType: e.target.value })}
                    className="w-full mt-1 px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-200 outline-none"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="flat">Flat Amount (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">
                    {form.discountType === "percentage" ? "Percentage *" : "Amount (₹) *"}
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={form.discountType === "percentage" ? 100 : 99999}
                    value={form.discountValue}
                    onChange={(e) => setForm({ ...form, discountValue: e.target.value })}
                    className="w-full mt-1 px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-200 outline-none"
                    placeholder={form.discountType === "percentage" ? "20" : "100"}
                  />
                </div>
              </div>

              {/* Applicable To */}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Applicable To *</label>
                <select
                  value={form.applicableTo}
                  onChange={(e) => setForm({ ...form, applicableTo: e.target.value })}
                  className="w-full mt-1 px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-200 outline-none"
                >
                  <option value="all">All (Facility + Tournament)</option>
                  <option value="facility">Facility Bookings Only</option>
                  <option value="tournament">Tournament Registrations Only</option>
                </select>
              </div>

              {/* Expiry + Usage */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">Expiry Date *</label>
                  <input
                    type="date"
                    required
                    value={form.expiryDate}
                    onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
                    className="w-full mt-1 px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-200 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">Usage Limit</label>
                  <input
                    type="number"
                    min={1}
                    value={form.usageLimit}
                    onChange={(e) => setForm({ ...form, usageLimit: e.target.value })}
                    className="w-full mt-1 px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-200 outline-none"
                    placeholder="Unlimited"
                  />
                </div>
              </div>

              {/* Min Amount + Max Discount */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">Min Order (₹)</label>
                  <input
                    type="number"
                    min={0}
                    value={form.minAmount}
                    onChange={(e) => setForm({ ...form, minAmount: e.target.value })}
                    className="w-full mt-1 px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-200 outline-none"
                    placeholder="0"
                  />
                </div>
                {form.discountType === "percentage" && (
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">Max Discount (₹)</label>
                    <input
                      type="number"
                      min={1}
                      value={form.maxDiscount}
                      onChange={(e) => setForm({ ...form, maxDiscount: e.target.value })}
                      className="w-full mt-1 px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-200 outline-none"
                      placeholder="No cap"
                    />
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Description</label>
                <input
                  type="text"
                  maxLength={200}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full mt-1 px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-200 outline-none"
                  placeholder="Summer discount for all bookings"
                />
              </div>
            </div>

            <div className="border-t px-6 py-4 flex gap-3 bg-gray-50 rounded-b-2xl">
              <button type="button" onClick={() => setShowCreate(false)} className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100">
                Cancel
              </button>
              <button type="submit" className="flex-1 px-4 py-2.5 bg-emerald-600 rounded-lg text-sm font-medium text-white hover:bg-emerald-700 flex items-center justify-center gap-2">
                <Check className="w-4 h-4" /> Create Coupon
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
