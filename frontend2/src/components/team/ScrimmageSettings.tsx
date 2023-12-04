import React, { useEffect, useState } from "react";
import {
  useCurrentTeam,
  TeamStateEnum,
} from "../../contexts/CurrentTeamContext";
import SectionCard from "../SectionCard";
import DescriptiveCheckbox from "../elements/DescriptiveCheckbox";
import { useEpisodeId } from "../../contexts/EpisodeContext";
import { isPresent } from "../../utils/utilTypes";
import { updateTeamPartial } from "../../utils/api/team";
import { determineCheckboxState } from "./EligibilitySettings";
import { type TeamPrivate } from "../../utils/types";
import { useEpisodeInfo } from "../../api/episode/useEpisode";
import { useUpdateTeam, useUserTeam } from "../../api/team/useTeam";
import Loading from "../Loading";

// This component should only be used when there is a logged in user with a team.
const ScrimmageSettings: React.FC = () => {
  // const { team, teamState, refreshTeam } = useCurrentTeam();
  const { episodeId } = useEpisodeId();
  const { data: team, isLoading } = useUserTeam({ episodeId });
  const { data: episode } = useEpisodeInfo({ id: episodeId });

  const { mutate: updateTeam, isPending } = useUpdateTeam({
    episodeId,
    patchedTeamPrivateRequest: { profile: team?.profile },
  });

  // true when the team has accept on, undefined when team's data hasn't loaded
  // TODO: remove this state!
  const [ranked, setRanked] = useState<boolean | undefined>(undefined);
  const [unranked, setUnranked] = useState<boolean | undefined>(undefined);

  // TODO: We should add the "isPending" state from the updateTeam hook to block the UI while the update is in progress
  // i.e., this state should be removed entirely!
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

  // useEffect(() => {
  //   // make API calls to update only if necessary
  //   if (
  //     !isPresent(ranked) ||
  //     !isPresent(unranked) ||
  //     (team?.profile?.auto_accept_ranked === ranked &&
  //       team.profile.auto_accept_unranked === unranked)
  //   ) {
  //     return;
  //   }

  //   let isActive = true;
  //   const update = async (): Promise<void> => {
  //     let updatedTeam: TeamPrivate;
  //     try {
  //       updatedTeam = await updateTeamPartial(episodeId, {
  //         auto_accept_ranked: ranked,
  //         auto_accept_unranked: unranked,
  //       });
  //     } catch (error) {
  //       // TODO: Add a notif here indicating that the update failed
  //       console.error(error);
  //       return;
  //     }
  //     const newProfile = team?.profile;
  //     if (isActive && isPresent(newProfile) && isPresent(team)) {
  //       // only update the ranked / unranked of the team profile to avoid
  //       // race conditions with other team profile updaters on this page
  //       refreshTeam({
  //         ...team,
  //         profile: {
  //           ...newProfile,
  //           auto_accept_unranked: updatedTeam.profile?.auto_accept_unranked,
  //           auto_accept_ranked: updatedTeam.profile?.auto_accept_ranked,
  //         },
  //       });
  //     }
  //   };
  //   void update();
  //   return () => {
  //     isActive = false;
  //   };
  // }, [ranked, unranked, episodeId]);

  // TODO: figure out a more elegant way to handle loading than blocking the UI
  if (isLoading) {
    return <Loading />;
  } else if (
    // TODO: I think that we should redirect to the home page if the user is not on a team
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
              // TODO: does this object get passed in automatically? Can we just invoke the mutate function without passing in the object?
              updateTeam({
                episodeId,
                patchedTeamPrivateRequest: {
                  profile: {
                    ...team.profile,
                    auto_accept_ranked: checked,
                  },
                },
              });
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
              updateTeam({
                episodeId,
                patchedTeamPrivateRequest: {
                  profile: {
                    ...team.profile,
                    auto_accept_unranked: checked,
                  },
                },
              });
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
