import React, { useState } from 'react';
import axios from 'axios';
import { MapPin, Clock, DollarSign, Camera, Phone, FileText, Shield, Car, Users, Star, CalendarDays, Dumbbell, ArrowLeft, Check, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AddTurf = () => {
  const navigate = useNavigate();
  const [turfData, setTurfData] = useState({
    name: '', about: '', location: '', photos: [], hourlyPrice: '', sports: '',
    offers: '', amenities: '', rules: '', cancellationPolicy: '', contacts: '',
    openTime: '', closeTime: '', reviews: '', bookingSystem: '',
    specialEvents: '', membershipPlans: '', parkingFacility: ''
  });
  const [loading, setLoading] = useState(false);
  const [previewImages, setPreviewImages] = useState([]);

  const handleChange = (e) => {
    setTurfData({ ...turfData, [e.target.name]: e.target.value });
  };

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    setTurfData({ ...turfData, photos: files });
    setPreviewImages(files.map(f => URL.createObjectURL(f)));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    Object.keys(turfData).forEach(key => {
      if (key === 'photos') {
        turfData.photos.forEach(photo => formData.append('turfImages', photo));
      } else {
        formData.append(key, turfData[key]);
      }
    });

    try {
      const response = await axios.post(`/api/turfs/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert('Turf added successfully!');
      setTurfData({
        name: '', about: '', location: '', photos: [], hourlyPrice: '', sports: '',
        offers: '', amenities: '', rules: '', cancellationPolicy: '', contacts: '',
        openTime: '', closeTime: '', reviews: '', bookingSystem: '',
        specialEvents: '', membershipPlans: '', parkingFacility: ''
      });
      setPreviewImages([]);
    } catch (error) {
      console.error('Error adding turf:', error);
      alert('Failed to add turf. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-xl transition w-auto">
          <ArrowLeft className="w-5 h-5 text-gray-500" />
        </button>
        <div>
          <h1 className="text-2xl font-black text-gray-900">Add New Turf</h1>
          <p className="text-sm text-gray-500 mt-0.5">Fill in the details to register a new sports facility</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Basic Info */}
        <Section title="Basic Information" icon={Dumbbell}>
          <InputField label="Turf Name" name="name" value={turfData.name} onChange={handleChange} placeholder="e.g. Shivaji Sports Arena" required />
          <TextareaField label="About Turf" name="about" value={turfData.about} onChange={handleChange} placeholder="Describe your turf — facilities, surface type, environment..." required rows={3} />
          <InputField label="Location" name="location" value={turfData.location} onChange={handleChange} placeholder="Full address with city and pincode" required icon={MapPin} />
        </Section>

        {/* Section 2: Photos */}
        <Section title="Photos" icon={Camera}>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Upload Photos</label>
            <div className="border-2 border-dashed border-gray-200 rounded-2xl p-6 text-center hover:border-[#004E93] hover:bg-blue-50/30 transition cursor-pointer relative">
              <input type="file" multiple onChange={handlePhotoUpload} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
              <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600 font-medium">Click or drag photos here</p>
              <p className="text-xs text-gray-400 mt-1">JPG, PNG up to 5MB each</p>
            </div>
            {previewImages.length > 0 && (
              <div className="flex gap-3 mt-3 overflow-x-auto pb-2">
                {previewImages.map((src, i) => (
                  <img key={i} src={src} alt={`Preview ${i}`} className="w-20 h-20 rounded-xl object-cover border border-gray-200 flex-shrink-0" />
                ))}
              </div>
            )}
          </div>
        </Section>

        {/* Section 3: Sports & Pricing */}
        <Section title="Sports & Pricing" icon={DollarSign}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField label="Available Sports" name="sports" value={turfData.sports} onChange={handleChange} placeholder="Cricket, Football, Badminton..." />
            <InputField label="Hourly Price (₹)" name="hourlyPrice" value={turfData.hourlyPrice} onChange={handleChange} type="number" placeholder="500" icon={DollarSign} />
          </div>
          <InputField label="Offers & Discounts" name="offers" value={turfData.offers} onChange={handleChange} placeholder="e.g. 20% off on weekdays" />
        </Section>

        {/* Section 4: Timings */}
        <Section title="Operating Hours" icon={Clock}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField label="Opening Time" name="openTime" value={turfData.openTime} onChange={handleChange} type="time" icon={Clock} />
            <InputField label="Closing Time" name="closeTime" value={turfData.closeTime} onChange={handleChange} type="time" icon={Clock} />
          </div>
        </Section>

        {/* Section 5: Facilities */}
        <Section title="Facilities & Amenities" icon={Star}>
          <InputField label="Amenities" name="amenities" value={turfData.amenities} onChange={handleChange} placeholder="Floodlights, Changing rooms, Water..." />
          <InputField label="Parking Facility" name="parkingFacility" value={turfData.parkingFacility} onChange={handleChange} placeholder="e.g. Free parking for 50 cars" icon={Car} />
          <InputField label="Booking System" name="bookingSystem" value={turfData.bookingSystem} onChange={handleChange} placeholder="Online, Walk-in, Phone..." />
        </Section>

        {/* Section 6: Policies */}
        <Section title="Rules & Policies" icon={Shield}>
          <TextareaField label="Rules & Regulations" name="rules" value={turfData.rules} onChange={handleChange} placeholder="No shoes on turf, Carry own equipment..." rows={2} />
          <TextareaField label="Cancellation Policy" name="cancellationPolicy" value={turfData.cancellationPolicy} onChange={handleChange} placeholder="Full refund 24h before, 50% refund 12h before..." rows={2} />
        </Section>

        {/* Section 7: Contact & Extras */}
        <Section title="Contact & More" icon={Phone}>
          <InputField label="Contact Number" name="contacts" value={turfData.contacts} onChange={handleChange} placeholder="9876543210" required icon={Phone} />
          <InputField label="Special Events" name="specialEvents" value={turfData.specialEvents} onChange={handleChange} placeholder="Weekend tournaments, Corporate events..." icon={CalendarDays} />
          <InputField label="Membership Plans" name="membershipPlans" value={turfData.membershipPlans} onChange={handleChange} placeholder="Monthly, Quarterly, Annual..." icon={Users} />
        </Section>

        {/* Submit */}
        <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-6 py-3 rounded-xl border border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50 transition w-auto"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 md:flex-none md:px-10 py-3 rounded-xl bg-[#004E93] hover:bg-[#073E73] text-white font-bold text-sm shadow-sm transition flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.98]"
          >
            {loading ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</>
            ) : (
              <><Check className="w-4 h-4" /> Add Turf</>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

// ---- Reusable sub-components (local to this file) ----

function Section({ title, icon: Icon, children }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-[#004E93]/10 flex items-center justify-center">
          <Icon className="w-4 h-4 text-[#004E93]" />
        </div>
        <h3 className="font-bold text-gray-800 text-sm">{title}</h3>
      </div>
      <div className="p-6 space-y-4">
        {children}
      </div>
    </div>
  );
}

function InputField({ label, icon: Icon, ...props }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        )}
        <input
          {...props}
          className={`w-full ${Icon ? "pl-10" : "pl-4"} pr-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#004E93]/20 focus:border-[#004E93] transition`}
        />
      </div>
    </div>
  );
}

function TextareaField({ label, rows = 3, ...props }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>
      <textarea
        {...props}
        rows={rows}
        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#004E93]/20 focus:border-[#004E93] transition resize-none"
      />
    </div>
  );
}

export default AddTurf;
