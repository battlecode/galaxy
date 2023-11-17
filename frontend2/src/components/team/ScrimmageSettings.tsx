import React, { useEffect, useState } from "react";
import {
  useCurrentTeam,
  TeamStateEnum,
} from "../../contexts/CurrentTeamContext";
import SectionCard from "../SectionCard";
import DescriptiveCheckbox from "../elements/DescriptiveCheckbox";
import { useEpisode, useEpisodeId } from "../../contexts/EpisodeContext";
import { isPresent } from "../../utils/utilTypes";
import { updateTeamPartial } from "../../utils/api/team";
import { determineCheckboxState } from "./EligibilitySettings";

// This component should only be used when there is a logged in user with a team.
const ScrimmageSettings: React.FC = () => {
  const { team, teamState, refreshTeam } = useCurrentTeam();
  const episode = useEpisode();
  const { episodeId } = useEpisodeId();
  // true when the team has accept on, undefined when team's data hasn't loaded
  const [ranked, setRanked] = useState<boolean | undefined>(undefined);
  const [unranked, setUnranked] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    // update with most current status
    const autoRanked = team?.profile?.auto_accept_ranked;
    if (isPresent(autoRanked)) {
      setRanked(autoRanked);
    }
    const autoUnranked = team?.profile?.auto_accept_unranked;
    if (isPresent(autoUnranked)) {
      setUnranked(autoUnranked);
    }
  }, [team?.profile?.auto_accept_ranked, team?.profile?.auto_accept_unranked]);

  useEffect(() => {
    // make API calls to update only if necessary
    if (
      !isPresent(ranked) ||
      !isPresent(unranked) ||
      (team?.profile?.auto_accept_ranked === ranked &&
        team.profile.auto_accept_unranked === unranked)
    ) {
      return;
    }

    let isActive = true;
    const update = async (): Promise<void> => {
      const updatedTeam = await updateTeamPartial(episodeId, {
        auto_accept_ranked: ranked,
        auto_accept_unranked: unranked,
      });
      const newProfile = team?.profile;
      if (isActive && isPresent(newProfile) && isPresent(team)) {
        // only update the ranked / unranked of the team profile to avoid
        // race conditions with other team profile updaters on this page
        newProfile.auto_accept_ranked = updatedTeam.profile?.auto_accept_ranked;
        newProfile.auto_accept_unranked =
          updatedTeam.profile?.auto_accept_unranked;
        refreshTeam({
          ...team,
          profile: newProfile,
        });
      }
    };
    void update();
    return () => {
      isActive = false;
    };
  }, [ranked, unranked, episodeId]);

  if (
    teamState !== TeamStateEnum.IN_TEAM ||
    !isPresent(team) ||
    !isPresent(episode) ||
    !isPresent(ranked) ||
    !isPresent(unranked)
  ) {
    return null;
  }
  return (
    <SectionCard title="Scrimmaging">
      <div className="flex flex-col gap-3 2xl:flex-row">
        <div className="text-green-600 2xl:w-60">
          <p className="text-gray-700">
            Choose how you want to handle incoming scrimmage requests from other
            players.
          </p>
        </div>
        <div className="flex flex-1 flex-col gap-2">
          <DescriptiveCheckbox
            status={determineCheckboxState(
              ranked,
              team.profile?.auto_accept_ranked ?? false,
            )}
            onChange={(checked) => {
              setRanked(checked);
            }}
            title="Auto-accept ranked scrimmages"
            description="When enabled, your team will automatically accept
                  ranked scrimmage requests. Ranked scrimmages affect your ELO rating."
          />
          <DescriptiveCheckbox
            status={determineCheckboxState(
              unranked,
              team.profile?.auto_accept_unranked ?? true,
            )}
            onChange={(checked) => {
              setUnranked(checked);
            }}
            title="Auto-accept unranked scrimmages"
            description="When enabled, your team will automatically accept
                  unranked scrimmage requests. Unranked scrimmages do not affect your ELO rating."
          />
        </div>
      </div>
    </SectionCard>
  );
};

export default ScrimmageSettings;
