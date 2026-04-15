import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { TrophyIcon, CalendarIcon, UserGroupIcon, MapPinIcon } from '@heroicons/react/24/outline';

const CorporateTournaments = () => {
    const { user } = useContext(AuthContext);
    const [tournaments, setTournaments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user?._id) {
            fetchCorporateTournaments();
        }
    }, [user]);

    const fetchCorporateTournaments = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`/api/tournaments/corporate/${user._id}`);
            if (res.data.success) {
                setTournaments(res.data.tournaments);
            }
        } catch (error) {
            console.error("Error fetching tournaments:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="p-8 text-center text-gray-500">Loading tournaments...</div>;
    }

    return (
        <div className="space-y-6 pb-12">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                        <TrophyIcon className="w-8 h-8 mr-2 text-yellow-500" />
                        Our Corporate Tournaments
                    </h1>
                    <p className="text-gray-600">
                        View tournaments managed by your company's staff.
                    </p>
                </div>
            </div>

            {tournaments.length === 0 ? (
                <div className="bg-white rounded-lg p-12 text-center shadow-sm border border-gray-200">
                    <TrophyIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900">No Tournaments found</h3>
                    <p className="text-gray-500 mt-2">
                        Your managers have not created any tournaments yet.
                    </p>
                    <p className="text-gray-500">
                        Go to <b>Staff Management</b> to add managers who can create tournaments.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {tournaments.map((tournament) => (
                        <div key={tournament._id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition overflow-hidden">
                            <div className="h-40 bg-gray-100 relative">
                                {tournament.tournamentLogo ? (
                                    <img
                                        src={`/uploads/tournaments/${tournament.tournamentLogo.split("\\").pop()}`}
                                        alt={tournament.title}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = 'https://via.placeholder.com/400x200?text=No+Image';
                                        }}
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                        <TrophyIcon className="w-16 h-16" />
                                    </div>
                                )}
                                <div className="absolute top-2 right-2 bg-white px-2 py-1 rounded-md text-xs font-semibold shadow-sm uppercase">
                                    {tournament.sportsType}
                                </div>
                            </div>
                            <div className="p-5">
                                <h3 className="text-lg font-bold text-gray-900 mb-2 truncate" title={tournament.title}>
                                    {tournament.title}
                                </h3>
                                <div className="space-y-2 text-sm text-gray-600">
                                    <div className="flex items-center">
                                        <CalendarIcon className="w-4 h-4 mr-2" />
                                        {new Date(tournament.startDate).toLocaleDateString()} - {new Date(tournament.endDate).toLocaleDateString()}
                                    </div>
                                    <div className="flex items-center">
                                        <MapPinIcon className="w-4 h-4 mr-2" />
                                        <span className="truncate">{tournament.eventLocation || "TBD"}</span>
                                    </div>
                                    <div className="flex items-center">
                                        <UserGroupIcon className="w-4 h-4 mr-2" />
                                        {tournament.type === 'knockout + group stage' ? 'Group + Knockout' : tournament.type === 'knockout' ? 'Knockout' : 'Group Stage'}
                                    </div>
                                </div>
                                <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                                    <span className={`px-2 py-1 text-xs rounded-full ${new Date(tournament.endDate) < new Date() ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                                        }`}>
                                        {new Date(tournament.endDate) < new Date() ? 'Completed' : 'Active'}
                                    </span>
                                    {/* Link to view details if needed, e.g. /corporate/tournament/:id */}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CorporateTournaments;
