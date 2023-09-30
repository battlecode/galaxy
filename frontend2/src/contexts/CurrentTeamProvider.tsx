import React, { useState, useEffect, useContext } from "react";
import { type TeamPrivate } from "../utils/types";
import { AuthStateEnum, useCurrentUser } from "../contexts/CurrentUserContext";
import { CurrentTeamContext, TeamStateEnum } from "./CurrentTeamContext";
import { EpisodeContext } from "./EpisodeContext";
import { retrieveTeam } from "../utils/api/team";

export const CurrentTeamProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [teamData, setTeamData] = useState<{
    team?: TeamPrivate;
    teamState: TeamStateEnum;
  }>({
    teamState: TeamStateEnum.NO_TEAM,
  });
  const { authState } = useCurrentUser();
  const { episodeId } = useContext(EpisodeContext);

  useEffect(() => {
    const loadTeam = async (): Promise<void> => {
      try {
        const team = await retrieveTeam(episodeId);
        setTeamData({ team, teamState: TeamStateEnum.IN_TEAM });
      } catch {
        setTeamData({ teamState: TeamStateEnum.NO_TEAM });
      }
    };

    if (authState === AuthStateEnum.AUTHENTICATED) {
      void loadTeam();
    } else {
      setTeamData({
        teamState: TeamStateEnum.NO_TEAM,
      });
    }
  }, [authState, episodeId]);

  return (
    <CurrentTeamContext.Provider value={teamData}>
      {children}
    </CurrentTeamContext.Provider>
  );
};
