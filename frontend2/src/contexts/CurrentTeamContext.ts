import { createContext, useContext } from "react";
import { type TeamPrivate } from "../utils/types";

export enum TeamStateEnum {
  // the current user is not part of a team (or is not logged in)
  NO_TEAM = "no_team",
  // the current user is part of a team
  IN_TEAM = "has_team",
}

interface CurrentTeamContextType {
  teamState: TeamStateEnum;
  team?: TeamPrivate;
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
