import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Building2, Mail, Phone, User, MapPin, Loader2, Check, Copy, RotateCcw, Briefcase, Trophy } from "lucide-react";

const initialForm = {
  name: "",
  email: "",
  phone: "",
  designation: "Admin",
  clubName: "",
  sports: "",
  city: "",
  area: "",
  address: "",
};

export default function CreateClubAdmin() {
  const [formData, setFormData] = useState(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generatedCredentials, setGeneratedCredentials] = useState(null);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await axios.post("/api/clubadminprofile/onboard", formData);
      setGeneratedCredentials(res.data.credentials || { email: formData.email, password: res.data.password || "Sent via email" });
      toast.success("Club Admin account created successfully!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create account");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData(initialForm);
    setGeneratedCredentials(null);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Create Club Admin</h1>
        <p className="text-sm text-gray-500 mt-0.5">Directly onboard a club admin without an inquiry. Account credentials will be auto-generated and emailed.</p>
      </div>

      {generatedCredentials ? (
        // Success State
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
                <Check className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Account Created Successfully!</h3>
                <p className="text-sm text-white/80">An email has been sent with these credentials.</p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-4">
            <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Email</p>
                  <p className="text-sm font-semibold text-gray-900 mt-0.5">{generatedCredentials.email}</p>
                </div>
                <button onClick={() => copyToClipboard(generatedCredentials.email)}
                  className="p-2 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition w-auto">
                  <Copy className="w-4 h-4" />
                </button>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Password</p>
                  <p className="text-sm font-semibold text-gray-900 mt-0.5 font-mono">{generatedCredentials.password}</p>
                </div>
                <button onClick={() => copyToClipboard(generatedCredentials.password)}
                  className="p-2 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition w-auto">
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={handleReset}
                className="flex items-center gap-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold rounded-xl transition active:scale-[0.98] w-auto">
                <RotateCcw className="w-4 h-4" /> Create Another
              </button>
            </div>
          </div>
        </div>
      ) : (
        // Form
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Admin Details */}
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center">
                <User className="w-4 h-4 text-orange-500" />
              </div>
              <h3 className="font-bold text-gray-800 text-sm">Admin Details</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Full Name *" name="name" value={formData.name} onChange={handleChange} placeholder="John Doe" required />
                <Field label="Designation" name="designation" value={formData.designation} onChange={handleChange} placeholder="Admin" required icon={Briefcase} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Email * (used for login)" name="email" type="email" value={formData.email} onChange={handleChange} placeholder="admin@club.com" required icon={Mail} />
                <Field label="Phone Number *" name="phone" type="tel" value={formData.phone} onChange={handleChange} placeholder="+91 9876543210" required icon={Phone} />
              </div>
            </div>
          </div>

          {/* Club Details */}
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                <Building2 className="w-4 h-4 text-emerald-600" />
              </div>
              <h3 className="font-bold text-gray-800 text-sm">Club Details</h3>
            </div>
            <div className="p-6 space-y-4">
              <Field label="Club Name *" name="clubName" value={formData.clubName} onChange={handleChange} placeholder="Alpha Sports Club" required icon={Building2} />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Field label="City *" name="city" value={formData.city} onChange={handleChange} placeholder="Mumbai" required />
                <Field label="Area *" name="area" value={formData.area} onChange={handleChange} placeholder="Andheri West" required />
                <Field label="Sports * (comma separated)" name="sports" value={formData.sports} onChange={handleChange} placeholder="Cricket, Football" required icon={Trophy} />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Detailed Address *</label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                  <textarea name="address" required rows={2} value={formData.address} onChange={handleChange}
                    placeholder="123 Main Street, Building, Landmark..."
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition resize-none" />
                </div>
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex items-center gap-3 pt-2">
            <button type="submit" disabled={isSubmitting}
              className="flex-1 md:flex-none md:px-12 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm shadow-sm transition flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.98]">
              {isSubmitting ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Creating Account...</>
              ) : (
                <><Check className="w-4 h-4" /> Create Account & Send Credentials</>
              )}
            </button>
            <button type="button" onClick={handleReset}
              className="px-6 py-3 rounded-xl border border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50 transition w-auto">
              Reset
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

function Field({ label, name, type = "text", value, onChange, placeholder, required, icon: Icon }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 mb-1.5">{label}</label>
      <div className="relative">
        {Icon && <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />}
        <input type={type} name={name} value={value} onChange={onChange} placeholder={placeholder} required={required}
          className={`w-full ${Icon ? "pl-10" : "pl-4"} pr-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition`} />
      </div>
    </div>
  );
}
