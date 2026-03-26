import React, { useState } from "react";
import TournamentList from "./MTournamentsList";

const TournamentManagement = () => {
  const [selectedTournament, setSelectedTournament] = useState(null);

  return (
    <div className="min-h-screen font-sans p-4 md:p-6">
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