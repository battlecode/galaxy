import { createContext, useContext } from "react";
import { type TeamPrivate } from "../utils/types";

export enum TeamStateEnum {
  // the current team state is still loading
  LOADING = "loading",
  // the current user is not part of a team (or is not logged in)
  NO_TEAM = "no_team",
  // the current user is part of a team
  IN_TEAM = "has_team",
}

interface CurrentTeamContextType {
  teamState: TeamStateEnum;
  team?: TeamPrivate;
  /**
   * Leaves the current user's team for the current episode
   * The current user should be on team in the current episode before calling
   * this function.
   */
  leaveMyTeam: () => Promise<void>;
  /**
   * Replaces the TeamPrivate value in the context with a new value. Used to
   * refresh the value upon receiving updated values from API calls.
   * The current user must be on a team in the current episode
   * before calling this function.
   * @param updatedTeam The new team value to store in the context.
   */
  refreshTeam: (updatedTeam: TeamPrivate) => void;
}

export const CurrentTeamContext = createContext<CurrentTeamContextType | null>(
  null,
);

export const useCurrentTeam = (): CurrentTeamContextType => {
  const currentTeamContext = useContext(CurrentTeamContext);

  if (currentTeamContext === null) {
    throw new Error(
      "useCurrentTeam has to be used within <CurrentTeamProvider>",
    );
  }

  return currentTeamContext;
};
