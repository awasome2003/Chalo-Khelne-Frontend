import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiFlag, FiTable, FiCheck, FiInfo } from "react-icons/fi";
import { FaMedal } from "react-icons/fa";
import { useGroupTabs } from "./GroupTabsContext";
import groupTabsApi from "./groupTabsApi";

export default function TopPlayersPanel({ onOpenMatchModal, onOpenBulkScore, onOpenGenerateModal, onOpenDirectKnockoutSchedule }) {
  const navigate = useNavigate();
  const {
    tournamentId, tournament, groups,
    round2Groups, activeRound2Group, setActiveRound2Group,
    round2MatchesData, filteredRound2Groups, currentRound2Group,
    selectedCategory,
    availablePlayersForKnockout,
    fetchAvailablePlayers,
  } = useGroupTabs();

  // Direct Knockout player selection (local to this panel)
  const [selectedPlayersForKnockout, setSelectedPlayersForKnockout] = useState([]);
  const [validationStatus, setValidationStatus] = useState({ isValid: false, message: "" });
  const [tournamentMode] = useState("round2-plus-knockout");

  const validateSelectedPlayers = (players) => {
    const count = players.length;
    if (count === 0) {
      setValidationStatus({ isValid: false, message: "Select players for Direct Knockout" });
      return;
    }
    const validSizes = [16, 32, 64];
    if (validSizes.includes(count)) {
      setValidationStatus({
        isValid: true,
        message: `${count} players selected — ${Math.log2(count)} rounds, ${count - 1} matches`,
      });
    } else {
      const nearest = validSizes.find((s) => s >= count) || 64;
      setValidationStatus({
        isValid: false,
        message: `${count} is not a valid draw size. Valid: ${validSizes.join(", ")}. Need ${nearest - count} more players for ${nearest}-draw.`,
      });
    }
  };

  const formatDate = (iso) => {
    if (!iso) return "Not scheduled";
    try { return new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }); }
    catch { return "Invalid Date"; }
  };

  const formatTime = (iso) => {
    if (!iso) return "";
    try { return new Date(iso).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true }); }
    catch { return ""; }
  };

  return (
    <div>
      {filteredRound2Groups.length > 0 ? (
        <>
          {/* Group Tabs */}
          <div className="flex space-x-2 mb-3 overflow-x-auto pb-2 scrollbar-hide">
            {filteredRound2Groups.map((group, index) => (
              <button
                key={group._id}
                onClick={() => setActiveRound2Group(group._id)}
                className={`px-4 py-2 text-sm w-auto font-semibold rounded-lg transition-all whitespace-nowrap ${
                  activeRound2Group === group._id
                    ? "bg-[#1D6A8B] text-white shadow-sm"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {group.groupName || `Round 2 Group ${index + 1}`}
              </button>
            ))}
          </div>

          {currentRound2Group && (
            <div className="w-full p-4 bg-white rounded-2xl">
              <h2 className="text-[18px] font-[500] text-[#004E93] mb-0">
                {currentRound2Group.groupName || `Round 2 Group ${round2Groups.indexOf(currentRound2Group) + 1}`}
              </h2>

              {/* Players */}
              <ol className="list-decimal pl-5 space-y-2 text-lg mb-4">
                {currentRound2Group.players?.map((player, index) => (
                  <li key={player._id || index}>
                    {player.userName || player.playerName || `Player ${index + 1}`}
                  </li>
                ))}
              </ol>

              {/* Actions */}
              <div className="flex flex-col items-center gap-2">
                <button
                  className="w-full bg-orange-500 text-white py-2 rounded-full text-[16px] font-[400] flex items-center justify-center gap-3"
                  onClick={onOpenGenerateModal}
                >
                  <FiFlag /> Generate Round 2 Matches
                </button>

                <button
                  className="w-full py-2 rounded-full text-[16px] font-[400] flex items-center justify-center gap-3 text-[#004E93] bg-white hover:bg-transparent"
                  style={{ border: "1px solid #004E93" }}
                  onClick={() =>
                    navigate(`/tournament-management/group-stage/${tournamentId}/${activeRound2Group}/points-table`, {
                      state: { tournamentId, groupId: activeRound2Group, round: 2 },
                    })
                  }
                >
                  <FiTable /> Points Table
                </button>

                {round2MatchesData[activeRound2Group]?.length > 0 &&
                  round2MatchesData[activeRound2Group].some((m) => m.status !== "completed" && m.status !== "COMPLETED") && (
                    <button
                      className="w-full py-2 rounded-full font-[500] flex items-center justify-center gap-3 text-white bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 shadow-md"
                      onClick={onOpenBulkScore}
                    >
                      <FiCheck /> Bulk Score Upload
                    </button>
                  )}
              </div>

              {/* Matches */}
              {round2MatchesData[activeRound2Group]?.length > 0 && (
                <div className="mt-6">
                  <h5 className="mb-3 text-lg font-semibold text-[#004E93]">
                    Matches — {currentRound2Group.groupName}
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {round2MatchesData[activeRound2Group].map((match, index) => (
                      <Round2MatchCard
                        key={match._id || index}
                        match={match}
                        onClick={() => onOpenMatchModal(match)}
                        formatDate={formatDate}
                        formatTime={formatTime}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      ) : (
        <div className="flex flex-col items-center justify-center p-12 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200 mt-4">
          <FiInfo className="text-gray-400 text-3xl mb-4" />
          <p className="text-gray-600 font-semibold text-lg text-center">
            No Round 2 groups found for {selectedCategory || "this category"}
          </p>
          <p className="text-gray-400 text-sm mt-1 text-center max-w-sm">
            Round 2 groups appear here after Top Players are selected.
          </p>
        </div>
      )}

      {/* Direct Knockout Mode */}
      {round2Groups.length === 0 && tournamentMode === "direct-knockout" && availablePlayersForKnockout.length > 0 && (
        <DirectKnockoutSelector
          availablePlayers={availablePlayersForKnockout}
          selectedPlayers={selectedPlayersForKnockout}
          setSelectedPlayers={setSelectedPlayersForKnockout}
          validationStatus={validationStatus}
          validatePlayers={validateSelectedPlayers}
          groups={groups}
          selectedCategory={selectedCategory}
          onCreateKnockout={onOpenDirectKnockoutSchedule}
        />
      )}
    </div>
  );
}

// ---- Sub-components ----

function Round2MatchCard({ match, onClick, formatDate, formatTime }) {
  const isCompleted = match.status === "COMPLETED" || match.status === "completed";
  const isInProgress = match.status === "IN_PROGRESS" || match.status === "in_progress";

  return (
    <div
      className={`shadow-md rounded-lg p-4 cursor-pointer ${
        isCompleted ? "bg-green-50 border-l-4 border-green-500" :
        isInProgress ? "bg-yellow-50 border-l-4 border-yellow-500" : "bg-[#F2F4F6]"
      }`}
      onClick={onClick}
    >
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2">
          <span className="bg-purple-100 text-purple-700 rounded-full text-[12px] font-[500] px-2 py-1">
            R2 - M{match.matchNumber}
          </span>
          {isCompleted && <span className="bg-green-500 text-white text-[12px] px-2 py-1 rounded-full">Completed</span>}
          {isInProgress && <span className="bg-yellow-500 text-white text-[12px] px-2 py-1 rounded-full">In Progress</span>}
        </div>
      </div>

      <p className="text-center text-[16px] text-[#333] mb-2">
        {formatDate(match.startTime)} {formatTime(match.startTime) && `• ${formatTime(match.startTime)}`}
      </p>

      <div className="flex flex-col items-center">
        <span className="font-[500] text-[14px] text-[#004E93]">{match.player1?.userName || "Player 1"}</span>
        <span className="text-[14px] text-[#333] my-1">VS</span>
        <span className="font-[500] text-[14px] text-[#004E93]">{match.player2?.userName || "Player 2"}</span>
      </div>

      {isCompleted && match.result?.finalScore && (
        <div className="text-center mt-2 text-xs bg-gray-100 px-2 py-1 rounded">
          {match.result.finalScore.player1Sets}-{match.result.finalScore.player2Sets}
        </div>
      )}
    </div>
  );
}

function DirectKnockoutSelector({ availablePlayers, selectedPlayers, setSelectedPlayers, validationStatus, validatePlayers, groups, selectedCategory, onCreateKnockout }) {
  return (
    <div className="mt-8 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
          <FaMedal className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-purple-900">Direct Knockout Mode</h3>
          <p className="text-sm text-purple-700">Skip Round 2 groups — Go straight to knockout bracket!</p>
        </div>
      </div>

      <h4 className="text-lg font-semibold text-purple-800 mb-3">
        Select Players ({selectedPlayers.length} selected)
      </h4>

      {/* Validation */}
      <div className={`p-4 rounded-lg mb-4 border-2 ${
        validationStatus.isValid ? "bg-green-50 border-green-300 text-green-800" :
        selectedPlayers.length === 0 ? "bg-blue-50 border-blue-200 text-blue-700" :
        "bg-red-50 border-red-300 text-red-800"
      }`}>
        <div className="text-sm font-semibold">{validationStatus.message}</div>
      </div>

      {/* Player Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-60 overflow-y-auto mb-4">
        {availablePlayers
          .filter((p) => {
            if (!selectedCategory) return true;
            const src = groups.find((g) => g._id === p.sourceGroupId);
            if (!src) return true;
            return (src.category || "").toLowerCase().includes(selectedCategory.toLowerCase());
          })
          .map((player, index) => {
            const isSelected = selectedPlayers.some((sp) => (sp.playerId || sp._id) === (player.playerId || player._id));
            return (
              <div
                key={player._id || index}
                onClick={() => {
                  const next = isSelected
                    ? selectedPlayers.filter((sp) => (sp.playerId || sp._id) !== (player.playerId || player._id))
                    : [...selectedPlayers, player];
                  setSelectedPlayers(next);
                  validatePlayers(next);
                }}
                className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                  isSelected ? "border-purple-500 bg-purple-100" : "border-gray-200 bg-white hover:border-purple-300"
                }`}
              >
                <div className="text-sm font-medium">{player.userName}</div>
                <div className="text-xs text-gray-500">{player.sourceGroup}</div>
                {isSelected && <div className="text-xs text-purple-600 font-medium mt-1">Selected</div>}
              </div>
            );
          })}
      </div>

      {/* Quick Select */}
      <div className="flex gap-2 mb-6">
        {[16, 32, 64].map((count) => (
          <button
            key={count}
            onClick={() => {
              if (availablePlayers.length >= count) {
                const sel = availablePlayers.slice(0, count);
                setSelectedPlayers(sel);
                validatePlayers(sel);
              }
            }}
            disabled={availablePlayers.length < count}
            className={`px-3 py-2 rounded-lg text-sm font-medium ${
              availablePlayers.length >= count ? "bg-purple-500 text-white hover:bg-purple-600" : "bg-gray-200 text-gray-500 cursor-not-allowed"
            }`}
          >
            Select {count}
          </button>
        ))}
        <button
          onClick={() => { setSelectedPlayers([]); validatePlayers([]); }}
          className="px-3 py-2 rounded-lg text-sm font-medium bg-gray-500 text-white hover:bg-gray-600"
        >
          Clear All
        </button>
      </div>

      <button
        onClick={onCreateKnockout}
        disabled={!validationStatus.isValid}
        className={`w-full py-3 rounded-lg font-semibold flex items-center justify-center gap-3 ${
          validationStatus.isValid ? "bg-purple-500 text-white hover:bg-purple-600" : "bg-gray-300 text-gray-500 cursor-not-allowed"
        }`}
      >
        <FaMedal className="w-5 h-5" /> Create Direct Knockout
      </button>
    </div>
  );
}
