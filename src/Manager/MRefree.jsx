import { useEffect, useState } from 'react';
import axios from 'axios';


const RefereesPage = () => {
  const [referees, setReferees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReferees = async () => {
      try {
        const response = await axios.get(`/api/referee/referees`);
        setReferees(response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchReferees();
  }, []);

 
  if (error) return <div className="text-red-500 text-center mt-8">Error: {error}</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">Our Referees</h1>
          <p className="mt-3 text-xl text-gray-500">
            Qualified professionals ensuring fair play
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {referees.map((referee) => {
            const fullName = `${referee.firstName} ${referee.lastName}`;
            const user = referee.userId || {};

            return (
              <div key={referee._id} className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    {user.profileImage ? (
                      <img
                        className="h-16 w-16 rounded-full object-cover"
                        src={user.profileImage}
                        alt={fullName}
                      />
                    ) : (
                      <div className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                        {fullName.charAt(0)}
                      </div>
                    )}
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">{fullName}</h3>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                  </div>
                </div>
                <div className="border-t border-gray-200 px-5 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Certification</p>
                      <p className="text-sm text-gray-900">
                        {referee.certificationLevel || 'Not specified'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Experience</p>
                      <p className="text-sm text-gray-900">
                        {referee.experience || 0} {referee.experience === 1 ? 'year' : 'years'}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-5 py-3">
                  <div className="text-sm">
                    {referee.sports && referee.sports.length > 0 ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                        {referee.sports.join(', ')}
                      </span>
                    ) : (
                      <span className="text-gray-500">No sports specified</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {referees.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No referees found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RefereesPage;