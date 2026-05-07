import { useState } from "react";
import TournamentList from "./MTournamentsList";

const TournamentManagement = () => {
  const [selectedTournament, setSelectedTournament] = useState(null);

  return (
    <div className="min-h-screen bg-white">
      <TournamentList
        onTournamentSelect={setSelectedTournament}
        selectedTournament={selectedTournament}
      />
    </div>
  );
};

export default TournamentManagement;
