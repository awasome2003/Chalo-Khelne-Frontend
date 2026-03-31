import React, { useState, useEffect, useContext, useRef } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import {
  MapPin, Clock, Camera, Plus, X, Search, Trash2, Edit2, Star, Check,
  Dumbbell, DollarSign, Loader2, Eye,
} from "lucide-react";

const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
const SPORTS_PRESETS = ["Football", "Cricket", "Basketball", "Tennis", "Badminton", "Volleyball", "Hockey", "Table Tennis", "Swimming", "Pickleball", "Chess", "Carrom"];
const FACILITY_PRESETS = [
  "Floodlights", "Parking", "Changing Rooms", "Restrooms", "Drinking Water",
  "WiFi", "Food Court", "Lounge Area", "First Aid Kit", "Shower",
  "Locker Rooms", "CCTV", "Security", "Covered Areas", "Artificial Turf",
];

const TurfManagement = () => {
  const { auth } = useContext(AuthContext);

  // Tab
  const [activeTab, setActiveTab] = useState("add");

  // Add form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [locationAddress, setLocationAddress] = useState("");
  const [area, setArea] = useState("");
  const [city, setCity] = useState("");
  const [pincode, setPincode] = useState("");
  const [longitude, setLongitude] = useState("");
  const [latitude, setLatitude] = useState("");
  const [sportsList, setSportsList] = useState([]);
  const [sportInput, setSportInput] = useState("");
  const [priceInput, setPriceInput] = useState("");
  const [facilities, setFacilities] = useState([]);
  const [openTime, setOpenTime] = useState("06:00");
  const [closeTime, setCloseTime] = useState("22:00");
  const [selectedDays, setSelectedDays] = useState([...DAYS]);
  const [images, setImages] = useState([null, null, null]);
  const [imageFiles, setImageFiles] = useState([null, null, null]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Manage state
  const [turfs, setTurfs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const fileInputRefs = [useRef(null), useRef(null), useRef(null)];

  // Fetch turfs
  useEffect(() => {
    if (activeTab === "manage" && auth?._id) {
      (async () => {
        setIsLoading(true);
        try {
          const res = await axios.get(`/api/turfs/assigned/${auth._id}`);
          setTurfs(Array.isArray(res.data) ? res.data : res.data?.turfs || []);
        } catch { setTurfs([]); }
        finally { setIsLoading(false); }
      })();
    }
  }, [activeTab, auth]);

  // ═══ IMAGE HANDLERS ═══
  const handleImageChange = (e, index) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error("Max 5MB per image"); return; }
    const reader = new FileReader();
    reader.onload = () => {
      const ni = [...images]; ni[index] = reader.result; setImages(ni);
      const nf = [...imageFiles]; nf[index] = file; setImageFiles(nf);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = (index) => {
    const ni = [...images]; ni[index] = null; setImages(ni);
    const nf = [...imageFiles]; nf[index] = null; setImageFiles(nf);
    if (fileInputRefs[index].current) fileInputRefs[index].current.value = "";
  };

  // ═══ SPORT HANDLERS ═══
  const addSport = (sportName) => {
    const n = (sportName || sportInput).trim();
    if (!n) return;
    if (sportsList.some((s) => s.name.toLowerCase() === n.toLowerCase())) { toast.error("Already added"); return; }
    setSportsList([...sportsList, { name: n, pricePerHour: Number(priceInput) || 0 }]);
    setSportInput(""); setPriceInput("");
  };

  const removeSport = (idx) => setSportsList(sportsList.filter((_, i) => i !== idx));
  const toggleFacility = (f) => setFacilities((prev) => prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]);
  const toggleDay = (d) => setSelectedDays((prev) => prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]);

  // ═══ SUBMIT ═══
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) { toast.error("Turf name is required"); return; }
    if (!locationAddress.trim()) { toast.error("Address is required"); return; }
    if (sportsList.length === 0) { toast.error("Add at least one sport"); return; }

    setIsSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("ownerId", auth._id);
      fd.append("name", name.trim());
      fd.append("description", description);
      fd.append("address", locationAddress);
      fd.append("area", area);
      fd.append("city", city);
      fd.append("pincode", pincode);
      fd.append("longitude", longitude || "0");
      fd.append("latitude", latitude || "0");
      fd.append("sports", JSON.stringify(sportsList.map((s) => ({ name: s.name, pricePerHour: s.pricePerHour || 0 }))));
      fd.append("facilities", JSON.stringify(facilities));
      fd.append("availableTimeSlots", JSON.stringify(selectedDays.map((d) => ({ day: d, startTime: openTime, endTime: closeTime }))));
      imageFiles.forEach((f) => { if (f) fd.append("turfImages", f); });

      await axios.post("/api/turfs", fd, { headers: { "Content-Type": "multipart/form-data" } });
      toast.success("Turf added successfully!");

      // Reset
      setName(""); setDescription(""); setLocationAddress(""); setArea(""); setCity(""); setPincode("");
      setLongitude(""); setLatitude(""); setSportsList([]); setFacilities([]);
      setSelectedDays([...DAYS]); setOpenTime("06:00"); setCloseTime("22:00");
      setImages([null, null, null]); setImageFiles([null, null, null]);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add turf");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ═══ DELETE TURF ═══
  const handleDeleteTurf = async (id) => {
    if (!confirm("Delete this turf permanently?")) return;
    try {
      await axios.delete(`/api/turfs/${id}?userId=${auth._id}`);
      setTurfs(turfs.filter((t) => t._id !== id));
      toast.success("Turf deleted");
    } catch { toast.error("Failed to delete"); }
  };

  const filteredTurfs = turfs.filter((t) =>
    t.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.address?.fullAddress?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ═══════════════════════════════════
  // RENDER
  // ═══════════════════════════════════
  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Turf Management</h1>
          <p className="text-sm text-gray-500 mt-0.5">Add and manage your sports facilities</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {[
          { key: "add", label: "Add Turf", icon: Plus },
          { key: "manage", label: `My Turfs ${turfs.length > 0 ? `(${turfs.length})` : ""}`, icon: MapPin },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition w-auto ${
              activeTab === tab.key ? "bg-[#004E93] text-white shadow-sm" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            <tab.icon className="w-4 h-4" /> {tab.label}
          </button>
        ))}
      </div>

      {/* ═══ ADD TAB ═══ */}
      {activeTab === "add" && (
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Section 1: Basic Info */}
          <Section icon={Dumbbell} title="Basic Information">
            <Input label="Turf Name *" value={name} onChange={setName} placeholder="e.g. Shivaji Sports Arena" />
            <Textarea label="Description" value={description} onChange={setDescription} placeholder="Describe your facility — surface type, size, environment..." rows={3} />
          </Section>

          {/* Section 2: Photos */}
          <Section icon={Camera} title="Turf Photos">
            <div className="grid grid-cols-3 gap-4">
              {[0, 1, 2].map((idx) => (
                <div key={idx} className={`relative rounded-2xl border-2 border-dashed overflow-hidden transition-all ${images[idx] ? "border-[#004E93] bg-blue-50/30" : "border-gray-200 hover:border-[#004E93] hover:bg-blue-50/20"}`}>
                  {images[idx] ? (
                    <>
                      <img src={images[idx]} alt="" className="w-full h-36 object-cover" />
                      <button type="button" onClick={() => handleRemoveImage(idx)}
                        className="absolute top-2 right-2 w-7 h-7 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-sm transition w-auto">
                        <X className="w-3.5 h-3.5 text-gray-600" />
                      </button>
                    </>
                  ) : (
                    <label className="flex flex-col items-center justify-center h-36 cursor-pointer">
                      <Camera className="w-6 h-6 text-gray-400 mb-1.5" />
                      <span className="text-xs text-gray-500 font-medium">Photo {idx + 1}</span>
                      <span className="text-[10px] text-gray-400 mt-0.5">Click to upload</span>
                      <input type="file" ref={fileInputRefs[idx]} onChange={(e) => handleImageChange(e, idx)} className="hidden" accept="image/*" />
                    </label>
                  )}
                </div>
              ))}
            </div>
          </Section>

          {/* Section 3: Location */}
          <Section icon={MapPin} title="Location">
            <Input label="Full Address *" value={locationAddress} onChange={setLocationAddress} placeholder="Street address, landmark" icon={MapPin} />
            <div className="grid grid-cols-3 gap-4">
              <Input label="Area" value={area} onChange={setArea} placeholder="e.g. Kharadi" />
              <Input label="City" value={city} onChange={setCity} placeholder="Pune" />
              <Input label="Pincode" value={pincode} onChange={setPincode} placeholder="411014" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Latitude" value={latitude} onChange={setLatitude} placeholder="18.5255" type="number" />
              <Input label="Longitude" value={longitude} onChange={setLongitude} placeholder="73.8409" type="number" />
            </div>
          </Section>

          {/* Section 4: Sports & Pricing */}
          <Section icon={DollarSign} title="Sports & Pricing">
            <div className="flex items-end gap-3">
              <div className="flex-1">
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Sport Name</label>
                <input type="text" value={sportInput} onChange={(e) => setSportInput(e.target.value)} placeholder="or pick below"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#004E93]/20 focus:border-[#004E93] transition" />
              </div>
              <div className="w-28">
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">₹/hr</label>
                <input type="number" value={priceInput} onChange={(e) => setPriceInput(e.target.value)} placeholder="500"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#004E93]/20 focus:border-[#004E93] transition" />
              </div>
              <button type="button" onClick={() => addSport()} className="px-4 py-2.5 bg-[#004E93] hover:bg-[#073E73] text-white rounded-xl text-sm font-semibold transition w-auto">
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Sport presets */}
            <div className="flex flex-wrap gap-1.5 mt-3">
              {SPORTS_PRESETS.filter((s) => !sportsList.some((sl) => sl.name === s)).map((s) => (
                <button key={s} type="button" onClick={() => { setSportInput(s); }}
                  className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 hover:bg-[#004E93]/10 hover:text-[#004E93] transition w-auto">
                  {s}
                </button>
              ))}
            </div>

            {/* Added sports */}
            {sportsList.length > 0 && (
              <div className="space-y-2 mt-3">
                {sportsList.map((sport, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-xl px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-[#004E93]" />
                      <span className="text-sm font-semibold text-gray-800">{sport.name}</span>
                      {sport.pricePerHour > 0 && <span className="text-xs text-[#004E93] bg-[#004E93]/10 px-2 py-0.5 rounded-full font-bold">₹{sport.pricePerHour}/hr</span>}
                      {sport.pricePerHour === 0 && <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full font-bold">FREE</span>}
                    </div>
                    <button type="button" onClick={() => removeSport(idx)} className="text-red-400 hover:text-red-600 transition w-auto">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </Section>

          {/* Section 5: Operating Hours */}
          <Section icon={Clock} title="Operating Hours">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <Input label="Opening Time" value={openTime} onChange={setOpenTime} type="time" icon={Clock} />
              <Input label="Closing Time" value={closeTime} onChange={setCloseTime} type="time" icon={Clock} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-2">Open Days</label>
              <div className="flex flex-wrap gap-2">
                {DAYS.map((day) => (
                  <button key={day} type="button" onClick={() => toggleDay(day)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition w-auto ${
                      selectedDays.includes(day) ? "bg-[#004E93] text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                    }`}>
                    {day.slice(0, 3)}
                  </button>
                ))}
                <button type="button" onClick={() => setSelectedDays(selectedDays.length === DAYS.length ? [] : [...DAYS])}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-[#004E93] bg-[#004E93]/10 hover:bg-[#004E93]/20 transition w-auto">
                  {selectedDays.length === DAYS.length ? "Clear All" : "Select All"}
                </button>
              </div>
            </div>
          </Section>

          {/* Section 6: Facilities */}
          <Section icon={Star} title="Facilities & Amenities">
            <div className="flex flex-wrap gap-2">
              {FACILITY_PRESETS.map((f) => (
                <button key={f} type="button" onClick={() => toggleFacility(f)}
                  className={`px-3 py-2 rounded-xl text-xs font-medium transition w-auto flex items-center gap-1.5 ${
                    facilities.includes(f) ? "bg-green-100 text-green-700 border border-green-200" : "bg-gray-50 text-gray-600 border border-gray-200 hover:border-gray-300"
                  }`}>
                  {facilities.includes(f) && <Check className="w-3 h-3" />}
                  {f}
                </button>
              ))}
            </div>
          </Section>

          {/* Submit */}
          <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
            <button type="button" onClick={() => setActiveTab("manage")}
              className="px-6 py-3 rounded-xl border border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50 transition w-auto">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting}
              className="flex-1 md:flex-none md:px-12 py-3 rounded-xl bg-[#004E93] hover:bg-[#073E73] text-white font-bold text-sm shadow-sm transition flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.98]">
              {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Adding...</> : <><Check className="w-4 h-4" /> Add Turf</>}
            </button>
          </div>
        </form>
      )}

      {/* ═══ MANAGE TAB ═══ */}
      {activeTab === "manage" && (
        <div>
          {/* Search */}
          <div className="relative mb-4 max-w-sm">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search turfs..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#004E93]/20 focus:border-[#004E93] transition" />
          </div>

          {isLoading ? (
            <div className="text-center py-16"><Loader2 className="w-8 h-8 text-[#004E93] animate-spin mx-auto" /></div>
          ) : filteredTurfs.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
              <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-gray-700">No turfs yet</h3>
              <p className="text-sm text-gray-400 mt-1">Add your first turf to get started</p>
              <button onClick={() => setActiveTab("add")} className="mt-4 px-5 py-2 bg-[#004E93] text-white text-sm font-semibold rounded-xl w-auto">
                <Plus className="w-4 h-4 inline mr-1" /> Add Turf
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredTurfs.map((turf) => (
                <div key={turf._id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                  {/* Image */}
                  {turf.images?.[0] ? (
                    <img src={`/${turf.images[0]}`} alt={turf.name} className="w-full h-40 object-cover" />
                  ) : (
                    <div className="w-full h-40 bg-gradient-to-br from-[#004E93] to-[#2DA5FF] flex items-center justify-center">
                      <MapPin className="w-10 h-10 text-white/40" />
                    </div>
                  )}

                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-bold text-gray-800">{turf.name}</h3>
                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3" />
                          {turf.address?.fullAddress || turf.address?.city || "No address"}
                        </p>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${turf.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                        {turf.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>

                    {/* Sports */}
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {turf.sports?.map((s, i) => (
                        <span key={i} className="text-[10px] font-semibold text-[#004E93] bg-[#004E93]/10 px-2 py-0.5 rounded-full">
                          {s.name} {s.pricePerHour > 0 && `₹${s.pricePerHour}`}
                        </span>
                      ))}
                    </div>

                    {/* Rating */}
                    {turf.ratings?.average > 0 && (
                      <div className="flex items-center gap-1 mb-3">
                        <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                        <span className="text-xs font-bold text-gray-700">{turf.ratings.average.toFixed(1)}</span>
                        <span className="text-xs text-gray-400">({turf.ratings.count})</span>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 pt-3 border-t border-gray-100">
                      <Link to={`/turf/${turf._id}`} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-xl transition">
                        <Eye className="w-3.5 h-3.5" /> View
                      </Link>
                      <Link to={`/turf/edit/${turf._id}`} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-[#004E93] text-xs font-semibold rounded-xl transition">
                        <Edit2 className="w-3.5 h-3.5" /> Edit
                      </Link>
                      <button onClick={() => handleDeleteTurf(turf._id)}
                        className="px-3 py-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition w-auto">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ═══ REUSABLE SUB-COMPONENTS ═══

function Section({ icon: Icon, title, children }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-[#004E93]/10 flex items-center justify-center">
          <Icon className="w-4 h-4 text-[#004E93]" />
        </div>
        <h3 className="font-bold text-gray-800 text-sm">{title}</h3>
      </div>
      <div className="p-6 space-y-4">{children}</div>
    </div>
  );
}

function Input({ label, value, onChange, icon: Icon, type = "text", ...props }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 mb-1.5">{label}</label>
      <div className="relative">
        {Icon && <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />}
        <input type={type} value={value} onChange={(e) => onChange(e.target.value)}
          className={`w-full ${Icon ? "pl-10" : "pl-4"} pr-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#004E93]/20 focus:border-[#004E93] transition`}
          {...props} />
      </div>
    </div>
  );
}

function Textarea({ label, value, onChange, rows = 3, ...props }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 mb-1.5">{label}</label>
      <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={rows}
        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#004E93]/20 focus:border-[#004E93] transition resize-none"
        {...props} />
    </div>
  );
}

export default TurfManagement;
