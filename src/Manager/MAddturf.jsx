import React, { useState } from 'react';
import axios from 'axios';

const AddTurf = () => {
  const [turfData, setTurfData] = useState({
    name: '', about: '', location: '', photos: [], hourlyPrice: '', sports: '',
    offers: '', amenities: '', rules: '', cancellationPolicy: '', contacts: '',
    openTime: '', closeTime: '', reviews: '', bookingSystem: '',
    specialEvents: '', membershipPlans: '', parkingFacility: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setTurfData({ ...turfData, [e.target.name]: e.target.value });
  };

  const handlePhotoUpload = (e) => {
    setTurfData({ ...turfData, photos: Array.from(e.target.files) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    Object.keys(turfData).forEach(key => {
      if (key === 'photos') {
        turfData.photos.forEach(photo => formData.append('photos', photo));
      } else {
        formData.append(key, turfData[key]);
      }
    });

    try {
      const response = await axios.post(`/api/turf/turfs/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      console.log('Turf added successfully:', response.data);
      alert('Turf added successfully!');
      setTurfData({
        name: '', about: '', location: '', photos: [], hourlyPrice: '', sports: '',
        offers: '', amenities: '', rules: '', cancellationPolicy: '', contacts: '',
        openTime: '', closeTime: '', reviews: '', bookingSystem: '',
        specialEvents: '', membershipPlans: '', parkingFacility: ''
      });
    } catch (error) {
      console.error('Error adding turf:', error);
      alert('Failed to add turf. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Add a Turf</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block font-bold">Turf Name</label>
        <input type="text" name="name" value={turfData.name} onChange={handleChange} className="border p-2 w-full" required />

        <label className="block font-bold">About Turf</label>
        <textarea name="about" value={turfData.about} onChange={handleChange} className="border p-2 w-full" required></textarea>

        <label className="block font-bold">Location</label>
        <input type="text" name="location" value={turfData.location} onChange={handleChange} className="border p-2 w-full" required />

        <label className="block font-bold">Photos</label>
        <input type="file" multiple onChange={handlePhotoUpload} className="border p-2 w-full" />

        <label className="block font-bold">Hourly Price</label>
        <input type="number" name="hourlyPrice" value={turfData.hourlyPrice} onChange={handleChange} className="border p-2 w-full" />

        <label className="block font-bold">Available Sports</label>
        <input type="text" name="sports" value={turfData.sports} onChange={handleChange} className="border p-2 w-full" />

        <label className="block font-bold">Offers</label>
        <input type="text" name="offers" value={turfData.offers} onChange={handleChange} className="border p-2 w-full" />

        <label className="block font-bold">Amenities</label>
        <input type="text" name="amenities" value={turfData.amenities} onChange={handleChange} className="border p-2 w-full" />

        <label className="block font-bold">Rules & Regulations</label>
        <textarea name="rules" value={turfData.rules} onChange={handleChange} className="border p-2 w-full"></textarea>

        <label className="block font-bold">Cancellation Policy</label>
        <textarea name="cancellationPolicy" value={turfData.cancellationPolicy} onChange={handleChange} className="border p-2 w-full"></textarea>

        <label className="block font-bold">Contacts</label>
        <input type="text" name="contacts" value={turfData.contacts} onChange={handleChange} className="border p-2 w-full" required />

        <label className="block font-bold">Opening Time</label>
        <input type="time" name="openTime" value={turfData.openTime} onChange={handleChange} className="border p-2 w-full" />

        <label className="block font-bold">Closing Time</label>
        <input type="time" name="closeTime" value={turfData.closeTime} onChange={handleChange} className="border p-2 w-full" />

        <label className="block font-bold">Reviews</label>
        <input type="text" name="reviews" value={turfData.reviews} onChange={handleChange} className="border p-2 w-full" />

        <label className="block font-bold">Booking System</label>
        <input type="text" name="bookingSystem" value={turfData.bookingSystem} onChange={handleChange} className="border p-2 w-full" />

        <label className="block font-bold">Special Events</label>
        <input type="text" name="specialEvents" value={turfData.specialEvents} onChange={handleChange} className="border p-2 w-full" />

        <label className="block font-bold">Membership Plans</label>
        <input type="text" name="membershipPlans" value={turfData.membershipPlans} onChange={handleChange} className="border p-2 w-full" />

        <label className="block font-bold">Parking Facility</label>
        <input type="text" name="parkingFacility" value={turfData.parkingFacility} onChange={handleChange} className="border p-2 w-full" />

        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700" disabled={loading}>
          {loading ? 'Submitting...' : 'Submit'}
        </button>
      </form>
    </div>
  );
};

export default AddTurf;