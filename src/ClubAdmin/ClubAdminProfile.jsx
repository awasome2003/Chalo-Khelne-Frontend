import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


const ClubAdminProfile = () => {
  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (user?._id) {
      localStorage.setItem('userId', user._id);
    }
  }, [user]);

  const userId = localStorage.getItem('userId');

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    mobile: user?.mobile || '',
    address: '',
    area: '',
    city: '',
    typeOfRegistration: 'Private',
    registrationDate: '',
    sports: '',
    noOfPlayers: '',
    timeToOpen: '',
    timeToClose: '',
    contacts: [{ contactPersonName: '', designation: '', contactNumber: '' }],
    clubPhotosID: '',
    clubVideosID: '',
    addressLink: '',
    validityDate: '',
    locations: '',
    authorizations: '',
  });

  const [isNewProfile, setIsNewProfile] = useState(false);
  const [isEditable, setIsEditable] = useState(false);

  useEffect(() => {
    if (userId) {
      fetchProfile();
    }
  }, [userId]);

  const fetchProfile = async () => {
    try {
      const res = await axios.get(`/api/clubadminprofile/${userId}`);
      const data = res.data;
      const profile = data.clubProfile || {};

      setFormData({
        name: data.name || user?.name || '',
        email: data.email || user?.email || '',
        mobile: data.mobile || user?.mobile || '',
        address: profile.address || '',
        area: profile.area || '',
        city: profile.city || '',
        typeOfRegistration: profile.typeOfRegistration || 'Private',
        registrationDate: profile.registrationDate || '',
        sports: profile.sports || '',
        noOfPlayers: profile.noOfPlayers || '',
        timeToOpen: profile.timeToOpen || '',
        timeToClose: profile.timeToClose || '',
        contacts:
          profile.contacts && profile.contacts.length > 0
            ? profile.contacts
            : [{ contactPersonName: '', designation: '', contactNumber: '' }],
        clubPhotosID: profile.clubPhotosID || '',
        clubVideosID: profile.clubVideosID || '',
        addressLink: profile.addressLink || '',
        validityDate: profile.validityDate || '',
        locations: profile.locations || '',
        authorizations: profile.authorizations || '',
      });
    } catch (error) {
      setIsNewProfile(true);
    }
  };

  const handleChange = (e, index = null, field = null) => {
    const { name, value } = e.target;

    if (index !== null && field) {
      const updatedContacts = [...formData.contacts];
      updatedContacts[index] = {
        ...updatedContacts[index],
        [field]: value,
      };
      setFormData({ ...formData, contacts: updatedContacts });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const addContact = () => {
    setFormData({
      ...formData,
      contacts: [...formData.contacts, { contactPersonName: '', designation: '', contactNumber: '' }],
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isNewProfile) {
        await axios.post('/api/clubadminprofile/', { userId, ...formData });

        // toast.info('Profile created successfully!');
        toast.success('Profile created successfully!');
      } else {
        await axios.put(`/api/clubadminprofile/${userId}`, formData);
        // toast.info('Profile updated successfully!');
        toast.success('Profile updated successfully!');
      }
      fetchProfile();
      setIsEditable(false);
    } catch (error) {
      console.error('Error submitting form:', error.response?.data || error.message);
      toast.error('An error occurred while submitting the form.');
    }
  };

  return (
<div className=" mx-auto px-4 sm:px-6 lg:px-8 py-6 relative">
  {/* Top Right Buttons */}
  <div className="absolute top-4 right-4 flex space-x-3">
    {!isEditable ? (
      <button
        type="button"
        className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 text-sm sm:text-base"
        onClick={() => setIsEditable(true)}
      >
        Edit
      </button>
    ) : (
      <button
        type="button"
        className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 text-sm sm:text-base"
        onClick={() => {
          fetchProfile();
          setIsEditable(false);
        }}
      >
        Cancel
      </button>
    )}
  </div>

  <h2 className="text-2xl sm:text-3xl font-semibold mb-6 text-center">
    {isNewProfile ? 'Create Club Admin Profile' : 'Club Admin Profile'}
  </h2>

  <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div className="flex flex-col">
      <label className="mb-1 text-sm font-medium">Club Name</label>
      <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Club Name" className="input" required readOnly={!isEditable} />
    </div>

    <div className="flex flex-col">
      <label className="mb-1 text-sm font-medium">Email</label>
      <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Email" className="input" required readOnly={!isEditable} />
    </div>

    <div className="flex flex-col">
      <label className="mb-1 text-sm font-medium">Mobile</label>
      <input type="text" name="mobile" value={formData.mobile} onChange={handleChange} placeholder="Mobile" className="input" required readOnly={!isEditable} />
    </div>

    <div className="flex flex-col">
      <label className="mb-1 text-sm font-medium">Address</label>
      <input type="text" name="address" value={formData.address} onChange={handleChange} placeholder="Address" className="input" readOnly={!isEditable} />
    </div>

    <div className="flex flex-col">
      <label className="mb-1 text-sm font-medium">Area</label>
      <input type="text" name="area" value={formData.area} onChange={handleChange} placeholder="Area" className="input" readOnly={!isEditable} />
    </div>

    <div className="flex flex-col">
      <label className="mb-1 text-sm font-medium">City</label>
      <input type="text" name="city" value={formData.city} onChange={handleChange} placeholder="City" className="input" readOnly={!isEditable} />
    </div>

    <div className="flex flex-col">
      <label className="mb-1 text-sm font-medium">Type of Registration</label>
      <select name="typeOfRegistration" value={formData.typeOfRegistration} onChange={handleChange} className="input md:h-[48px] lg:h-[48px] mt-[8px] rounded-[5px] border border-gray-300 bg-white" disabled={!isEditable}>
        <option value="Private">Private</option>
        <option value="Govt">Govt</option>
      </select>
    </div>

    <div className="flex flex-col">
      <label className="mb-1 text-sm font-medium">Registration Date</label>
      <input type="date" name="registrationDate" value={formData.registrationDate ? formData.registrationDate.split('T')[0] : ''} onChange={handleChange} className="input" readOnly={!isEditable} />
    </div>

    <div className="flex flex-col">
      <label className="mb-1 text-sm font-medium">Sports</label>
      <input type="text" name="sports" value={formData.sports} onChange={handleChange} placeholder="Sports" className="input" readOnly={!isEditable} />
    </div>

    <div className="flex flex-col">
      <label className="mb-1 text-sm font-medium">No of Players</label>
      <input type="number" name="noOfPlayers" value={formData.noOfPlayers} onChange={handleChange} placeholder="No of Players" className="input" readOnly={!isEditable} />
    </div>

    <div className="flex flex-col">
      <label className="mb-1 text-sm font-medium">Time to Open</label>
      <input type="time" name="timeToOpen" value={formData.timeToOpen} onChange={handleChange} className="input" readOnly={!isEditable} />
    </div>

    <div className="flex flex-col">
      <label className="mb-1 text-sm font-medium">Time to Close</label>
      <input type="time" name="timeToClose" value={formData.timeToClose} onChange={handleChange} className="input" readOnly={!isEditable} />
    </div>

    <div className="col-span-1 md:col-span-2 mt-4">
      <h4 className="text-lg font-semibold mb-2">Contact Persons</h4>
      {formData.contacts.map((contact, index) => (
        <div key={index} className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-3">
          <div className="flex flex-col">
            <label className="mb-1 text-sm font-medium">Name</label>
            <input
              type="text"
              value={contact.contactPersonName}
              onChange={(e) => handleChange(e, index, 'contactPersonName')}
              placeholder="Name"
              className="input"
              readOnly={!isEditable}
            />
          </div>
          <div className="flex flex-col">
            <label className="mb-1 text-sm font-medium">Designation</label>
            <input
              type="text"
              value={contact.designation}
              onChange={(e) => handleChange(e, index, 'designation')}
              placeholder="Designation"
              className="input"
              readOnly={!isEditable}
            />
          </div>
          <div className="flex flex-col">
            <label className="mb-1 text-sm font-medium">Contact Number</label>
            <input
              type="text"
              value={contact.contactNumber}
              onChange={(e) => handleChange(e, index, 'contactNumber')}
              placeholder="Contact Number"
              className="input"
              readOnly={!isEditable}
            />
          </div>
        </div>
      ))}
      {isEditable && (
        <button type="button" onClick={addContact} className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 mt-2">
          Add Contact
        </button>
      )}
    </div>

    <div className="flex flex-col">
      <label className="mb-1 text-sm font-medium">Photos ID</label>
      <input type="text" name="clubPhotosID" value={formData.clubPhotosID} onChange={handleChange} placeholder="Photos ID" className="input" readOnly={!isEditable} />
    </div>

    <div className="flex flex-col">
      <label className="mb-1 text-sm font-medium">Videos ID</label>
      <input type="text" name="clubVideosID" value={formData.clubVideosID} onChange={handleChange} placeholder="Videos ID" className="input" readOnly={!isEditable} />
    </div>

    <div className="flex flex-col">
      <label className="mb-1 text-sm font-medium">Address Link</label>
      <input type="text" name="addressLink" value={formData.addressLink} onChange={handleChange} placeholder="Address Link" className="input" readOnly={!isEditable} />
    </div>

    <div className="flex flex-col">
      <label className="mb-1 text-sm font-medium">Validity Date</label>
      <input type="date" name="validityDate" value={formData.validityDate ? formData.validityDate.split('T')[0] : ''} onChange={handleChange} className="input" readOnly={!isEditable} />
    </div>

    <div className="flex flex-col">
      <label className="mb-1 text-sm font-medium">Locations</label>
      <input type="text" name="locations" value={formData.locations} onChange={handleChange} placeholder="Locations" className="input" readOnly={!isEditable} />
    </div>

    <div className="flex flex-col">
      <label className="mb-1 text-sm font-medium">Authorizations</label>
      <input type="text" name="authorizations" value={formData.authorizations} onChange={handleChange} placeholder="Authorizations" className="input" readOnly={!isEditable} />
    </div>

    {isEditable && (
      <div className="col-span-1 md:col-span-2 text-center mt-6">
        <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 text-base">
          {isNewProfile ? 'Create' : 'Update'}
        </button>
      </div>
    )}
  </form>
<ToastContainer
  position="top-right"
  autoClose={3000}
  hideProgressBar={false}
  newestOnTop={false}
  closeOnClick
  rtl={false}
  pauseOnFocusLoss
  draggable
  pauseOnHover
  theme="colored"
  closeButton={false}
/>


</div>

  );
};

export default ClubAdminProfile;


