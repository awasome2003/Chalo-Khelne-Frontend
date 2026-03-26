import { getSportConfig } from "./sportUIConfig";
import SetBasedScorer from "./SetBasedScorer";
import TimeBasedScorer from "./TimeBasedScorer";
import InningsBasedScorer from "./InningsBasedScorer";
import SingleResultScorer from "./SingleResultScorer";

const RENDERERS = {
  sets: SetBasedScorer,
  time: TimeBasedScorer,
  innings: InningsBasedScorer,
  single: SingleResultScorer,
};

/**
 * Dynamically selects the correct scoring UI based on sport type.
 * Zero hardcoded sport names — fully config-driven.
 *
 * Props:
 * - sportName: string (e.g. "Table Tennis", "Cricket", "Football")
 * - matchFormat: object from match document
 * - sets: array of completed sets
 * - currentSet: number
 * - player1Name, player2Name: strings
 * - onSubmitScores: (games[]) => Promise
 * - submitting: boolean
 * - onRefresh: () => void
 */
export default function DynamicScorer({ sportName, ...props }) {
  const config = getSportConfig(sportName);
  const Renderer = RENDERERS[config.scoringType] || SetBasedScorer;

  return <Renderer config={config} {...props} />;
}
