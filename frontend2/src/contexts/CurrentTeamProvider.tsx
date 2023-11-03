import React, { useState, useEffect, useCallback } from "react";
import { type TeamPrivate } from "../utils/types";
import { AuthStateEnum, useCurrentUser } from "../contexts/CurrentUserContext";
import { CurrentTeamContext, TeamStateEnum } from "./CurrentTeamContext";
import { useEpisodeId } from "./EpisodeContext";
import { retrieveTeam, leaveTeam } from "../utils/api/team";

export const CurrentTeamProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // invariant: team must be undefined when teamState is LOADING or NO_TEAM
  // team must be defined when teamState is IN_TEAM
  const [teamData, setTeamData] = useState<{
    team?: TeamPrivate;
    teamState: TeamStateEnum;
  }>({
    teamState: TeamStateEnum.LOADING,
  });
  const { authState } = useCurrentUser();
  const { episodeId } = useEpisodeId();

  const leaveMyTeam = useCallback(async (): Promise<void> => {
    await leaveTeam(episodeId);
    setTeamData({ teamState: TeamStateEnum.NO_TEAM });
  }, []);

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
    <CurrentTeamContext.Provider value={{ ...teamData, leaveMyTeam }}>
      {children}
    </CurrentTeamContext.Provider>
  );
};
