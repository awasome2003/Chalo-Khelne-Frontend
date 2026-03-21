import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';

const MTrainers = () => {
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTrainers = useCallback(async () => {
    try {
      const response = await axios.get(`/api/trainer/trainers`);
      setTrainers(response.data);
    } catch (err) {
      console.error('Error fetching trainers:', err);
      setError('Failed to load trainers');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTrainers();
  }, [fetchTrainers]);

  if (loading) {
    return <div className="text-center py-10 text-lg text-gray-600">Loading trainers...</div>;
  }

  if (error) {
    return <div className="text-center py-10 text-red-500">{error}</div>;
  }

  return (
    <div className="px-4 py-8 sm:px-6 lg:px-8 max-w-screen-2xl mx-auto">
      <h2 className="text-2xl sm:text-3xl font-bold mb-8 text-center text-gray-800">Trainer List</h2>

      <ul className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
        {trainers.map((trainer) => {
          const {
            _id,
            profileImage,
            sports,
            languages,
            dob,
            gender,
            bio,
            experienceDescription,
            userId,
          } = trainer;

          const name = userId?.name || 'N/A';
          const email = userId?.email || 'N/A';
          const imageSrc = profileImage ? `http://localhost:3005/${profileImage}` : null;
          const dobFormatted = dob ? new Date(dob).toLocaleDateString() : 'N/A';

          return (
            <li
              key={_id}
              className="bg-white rounded-2xl shadow-md p-4 border border-gray-100 hover:shadow-lg transition duration-300 flex flex-col"
            >
              {imageSrc ? (
                <img
                  loading="lazy"
                  src={imageSrc}
                  alt={name}
                  className="w-full h-48 sm:h-52 md:h-56 object-cover rounded-lg mb-4"
                />
              ) : (
                <div className="w-full h-48 sm:h-52 md:h-56 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 mb-4">
                  No Image
                </div>
              )}

              <p className="text-lg font-semibold text-gray-800 mb-1">{name}</p>
              <p className="text-sm text-gray-600 mb-3 break-words">{email}</p>

              <p className="text-sm"><span className="font-medium">Sports:</span> {sports?.join(', ') || 'N/A'}</p>
              <p className="text-sm"><span className="font-medium">Languages:</span> {languages?.join(', ') || 'N/A'}</p>
              <p className="text-sm"><span className="font-medium">Date of Birth:</span> {dobFormatted}</p>
              <p className="text-sm"><span className="font-medium">Gender:</span> {gender || 'N/A'}</p>
              <p className="text-sm"><span className="font-medium">Bio:</span> {bio || 'N/A'}</p>
              <p className="text-sm"><span className="font-medium">Experience:</span> {experienceDescription || 'N/A'}</p>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default MTrainers;

