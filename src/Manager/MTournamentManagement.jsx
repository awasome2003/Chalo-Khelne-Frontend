import React, { useState } from "react";
import TournamentList from "./MTournamentsList";

const TournamentManagement = () => {
  const [selectedTournament, setSelectedTournament] = useState(null);

  return (
    <div className="min-h-screen bg-gray-50 font-sans p-4 md:p-8">
      {/* 
        Container is centered with a max-width for better readability on large screens.
        Height is calculated to fit the screen minus padding, allowing the inner list to scroll.
      */}
      <div className="max-w-5xl mx-auto h-[calc(100vh-4rem)] md:h-[calc(100vh-6rem)]">
        <TournamentList
          onTournamentSelect={setSelectedTournament}
          selectedTournament={selectedTournament}
        />
      </div>
    </div>
  );
};

export default TournamentManagement;