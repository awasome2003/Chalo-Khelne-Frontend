import { useState, useEffect } from "react";
import axios from "axios";
import {
  ExternalLink,
  Link2,
  Search,
  Plus,
  Trash2,
  RefreshCcw,
  ShoppingBag,
  MousePointerClick,
  X,
  Check,
  Package,
  Filter,
} from "lucide-react";

const CATEGORIES = ["Racket", "Bat", "Shoes", "Jersey", "Ball", "Net", "Protective Gear", "Accessories", "Other"];
const SPORTS = ["Badminton", "Table Tennis", "Cricket", "Football", "Tennis", "Basketball", "Volleyball", "Hockey", "Chess", "Carrom", "Kabaddi", "Boxing", "Swimming"];

const CONDITION_COLORS = {
  "Like New": "bg-green-100 text-green-700",
  "Good": "bg-blue-100 text-blue-700",
  "Fair": "bg-yellow-100 text-yellow-700",
  "Used": "bg-gray-100 text-gray-600",
};

export default function VendorMarketplace() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [sportFilter, setSportFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [vendorFilter, setVendorFilter] = useState(""); // "" | "true" | "false"

  // Add vendor link modal
  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [vendorForm, setVendorForm] = useState({ vendor_link: "", vendor_name: "", price: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchListings();
  }, [page, sportFilter, categoryFilter, vendorFilter]);

  const fetchListings = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 15 };
      if (sportFilter) params.sport = sportFilter;
      if (categoryFilter) params.category = categoryFilter;
      if (vendorFilter) params.hasVendor = vendorFilter;
      if (search) params.search = search;

      const res = await axios.get("/api/equipment", { params });
      setListings(res.data.listings || []);
      setTotalPages(res.data.totalPages || 1);
      setStats(res.data.stats || {});
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchListings();
  };

  const openAddModal = (item) => {
    setSelectedItem(item);
    setVendorForm({
      vendor_link: item.vendorLink || "",
      vendor_name: item.vendorName || "",
      price: item.vendorPrice || "",
    });
    setShowModal(true);
  };

  const handleSaveVendorLink = async (e) => {
    e.preventDefault();
    if (!vendorForm.vendor_link) {
      alert("Vendor URL is required");
      return;
    }
    setSaving(true);
    try {
      await axios.post("/api/equipment/vendor-link", {
        equipment_id: selectedItem._id,
        vendor_link: vendorForm.vendor_link,
        vendor_name: vendorForm.vendor_name,
        price: vendorForm.price || null,
      });
      setShowModal(false);
      setSelectedItem(null);
      fetchListings();
    } catch (err) {
      alert("Failed: " + (err.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveVendorLink = async (id) => {
    if (!confirm("Remove vendor link from this equipment?")) return;
    try {
      await axios.delete(`/api/equipment/vendor-link/${id}`);
      fetchListings();
    } catch (err) {
      alert("Failed: " + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="p-6 max-w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <ShoppingBag className="w-7 h-7 text-orange-500" />
            Vendor Marketplace
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Attach vendor purchase links to player equipment listings
          </p>
        </div>
        <button
          onClick={fetchListings}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 flex items-center gap-2"
        >
          <RefreshCcw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
            <Package className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{stats.totalEquipment || 0}</p>
            <p className="text-xs text-gray-500">Total Equipment</p>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
            <Link2 className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{stats.withVendorLinks || 0}</p>
            <p className="text-xs text-gray-500">With Vendor Links</p>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
            <MousePointerClick className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{stats.totalClicks || 0}</p>
            <p className="text-xs text-gray-500">Total Clicks</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6 flex flex-wrap items-center gap-3">
        <form onSubmit={handleSearch} className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search equipment or vendor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-200 focus:border-orange-400 outline-none"
          />
        </form>

        <select
          value={sportFilter}
          onChange={(e) => { setSportFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-orange-200 outline-none"
        >
          <option value="">All Sports</option>
          {SPORTS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>

        <select
          value={categoryFilter}
          onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-orange-200 outline-none"
        >
          <option value="">All Categories</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>

        <select
          value={vendorFilter}
          onChange={(e) => { setVendorFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-orange-200 outline-none"
        >
          <option value="">All</option>
          <option value="true">With Vendor Link</option>
          <option value="false">No Vendor Link</option>
        </select>
      </div>

      {/* Equipment Table */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <RefreshCcw className="w-8 h-8 animate-spin text-orange-400" />
        </div>
      ) : listings.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Package className="w-16 h-16 mx-auto mb-4 opacity-30" />
          <p className="text-lg font-semibold">No equipment found</p>
          <p className="text-sm">Players need to list equipment first</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left font-bold text-gray-500 text-xs uppercase">Equipment</th>
                  <th className="px-4 py-3 text-left font-bold text-gray-500 text-xs uppercase">Sport / Category</th>
                  <th className="px-4 py-3 text-left font-bold text-gray-500 text-xs uppercase">Seller</th>
                  <th className="px-4 py-3 text-left font-bold text-gray-500 text-xs uppercase">Price</th>
                  <th className="px-4 py-3 text-left font-bold text-gray-500 text-xs uppercase">Vendor Link</th>
                  <th className="px-4 py-3 text-left font-bold text-gray-500 text-xs uppercase">Clicks</th>
                  <th className="px-4 py-3 text-left font-bold text-gray-500 text-xs uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {listings.map((item) => (
                  <tr key={item._id} className="hover:bg-orange-50/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {item.images?.[0] ? (
                          <img src={item.images[0]} alt="" className="w-10 h-10 rounded-lg object-cover" />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                            <Package className="w-5 h-5 text-gray-400" />
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-gray-800">{item.itemName}</p>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${CONDITION_COLORS[item.condition] || "bg-gray-100 text-gray-500"}`}>
                            {item.condition}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-700">{item.sport}</p>
                      <p className="text-xs text-gray-400">{item.category}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-gray-700">{item.sellerName}</p>
                      <p className="text-[10px] text-gray-400 uppercase">{item.sellerLevel}</p>
                    </td>
                    <td className="px-4 py-3">
                      {item.isDonation ? (
                        <span className="text-green-600 font-bold text-xs">FREE</span>
                      ) : (
                        <span className="font-semibold">₹{item.askingPrice}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {item.vendorLink ? (
                        <div className="flex flex-col gap-1">
                          <a
                            href={item.vendorLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 text-xs flex items-center gap-1 max-w-[200px] truncate"
                          >
                            <ExternalLink className="w-3 h-3 shrink-0" />
                            {item.vendorName || "View"}
                          </a>
                          {item.vendorPrice && (
                            <span className="text-[10px] text-green-600 font-bold">₹{item.vendorPrice} (new)</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-300 text-xs">No link</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {item.vendorLink ? (
                        <span className="text-sm font-bold text-purple-600">{item.vendorClickCount || 0}</span>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openAddModal(item)}
                          className="p-2 rounded-lg hover:bg-orange-100 text-orange-600 transition-colors w-auto"
                          title={item.vendorLink ? "Edit vendor link" : "Add vendor link"}
                        >
                          {item.vendorLink ? <Link2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                        </button>
                        {item.vendorLink && (
                          <button
                            onClick={() => handleRemoveVendorLink(item._id)}
                            className="p-2 rounded-lg hover:bg-red-100 text-red-500 transition-colors w-auto"
                            title="Remove vendor link"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-4 py-3 bg-gray-50 border-t flex items-center justify-between">
              <span className="text-xs text-gray-500">
                Page {page} of {totalPages}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 text-xs rounded-lg border border-gray-300 disabled:opacity-50 hover:bg-gray-100 w-auto"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1.5 text-xs rounded-lg border border-gray-300 disabled:opacity-50 hover:bg-gray-100 w-auto"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add/Edit Vendor Link Modal */}
      {showModal && selectedItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <form
            onSubmit={handleSaveVendorLink}
            className="bg-white rounded-2xl w-full max-w-md overflow-hidden"
          >
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4 flex justify-between items-center">
              <div>
                <h3 className="text-white font-bold flex items-center gap-2">
                  <Link2 className="w-5 h-5" />
                  {selectedItem.vendorLink ? "Edit" : "Add"} Vendor Link
                </h3>
                <p className="text-orange-200 text-sm">{selectedItem.itemName}</p>
              </div>
              <button type="button" onClick={() => setShowModal(false)} className="text-white hover:text-orange-200 bg-transparent w-auto">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Equipment info */}
              <div className="bg-gray-50 rounded-xl p-3 flex items-center gap-3">
                {selectedItem.images?.[0] ? (
                  <img src={selectedItem.images[0]} alt="" className="w-12 h-12 rounded-lg object-cover" />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center">
                    <Package className="w-6 h-6 text-gray-400" />
                  </div>
                )}
                <div>
                  <p className="font-bold text-gray-800 text-sm">{selectedItem.itemName}</p>
                  <p className="text-xs text-gray-500">
                    {selectedItem.sport} • {selectedItem.category} • {selectedItem.condition}
                  </p>
                  <p className="text-xs text-gray-400">by {selectedItem.sellerName}</p>
                </div>
              </div>

              {/* Vendor URL */}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">
                  Vendor URL <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  required
                  value={vendorForm.vendor_link}
                  onChange={(e) => setVendorForm({ ...vendorForm, vendor_link: e.target.value })}
                  className="w-full mt-1 px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-200 outline-none"
                  placeholder="https://www.amazon.in/dp/B0..."
                />
              </div>

              {/* Vendor Name */}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">
                  Vendor Name
                </label>
                <input
                  type="text"
                  value={vendorForm.vendor_name}
                  onChange={(e) => setVendorForm({ ...vendorForm, vendor_name: e.target.value })}
                  className="w-full mt-1 px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-200 outline-none"
                  placeholder="Amazon, Decathlon, Sports365..."
                />
              </div>

              {/* New Price */}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">
                  New Price (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  value={vendorForm.price}
                  onChange={(e) => setVendorForm({ ...vendorForm, price: e.target.value })}
                  className="w-full mt-1 px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-200 outline-none"
                  placeholder="Price for buying new from vendor"
                />
              </div>
            </div>

            <div className="border-t px-6 py-4 flex gap-3 bg-gray-50">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 px-4 py-2.5 bg-orange-600 rounded-lg text-sm font-medium text-white hover:bg-orange-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {saving ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
