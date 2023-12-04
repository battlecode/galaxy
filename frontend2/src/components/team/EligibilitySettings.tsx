import React, { useEffect, useState } from "react";
import {
  useCurrentTeam,
  TeamStateEnum,
} from "../../contexts/CurrentTeamContext";
import SectionCard from "../SectionCard";
import DescriptiveCheckbox, {
  CheckboxState,
} from "../elements/DescriptiveCheckbox";
import { useEpisodeId } from "../../contexts/EpisodeContext";
import { isPresent } from "../../utils/utilTypes";
import { updateTeamPartial } from "../../utils/api/team";
import { isEqual } from "lodash";
import { useEpisodeInfo } from "../../api/episode/useEpisode";
import { useUpdateTeam, useUserTeam } from "../../api/team/useTeam";
import Loading from "../Loading";

export function determineCheckboxState(
  inDesired: boolean,
  inActual: boolean,
): CheckboxState {
  if (inDesired && inActual) {
    return CheckboxState.CHECKED;
  } else if (!inDesired && !inActual) {
    return CheckboxState.UNCHECKED;
  } else {
    return CheckboxState.LOADING;
  }
}

// This component should only be used when there is a logged in user with a team.
const EligibilitySettings: React.FC = () => {
  // const { team, teamState, refreshTeam } = useCurrentTeam();
  const { episodeId } = useEpisodeId();
  const { data: team, isLoading } = useUserTeam({ episodeId });
  // TODO: use this isPending state to block the UI while the update is in progress
  const { mutate: updateTeam, isPending } = useUpdateTeam({
    episodeId,
    patchedTeamPrivateRequest: { profile: team?.profile },
  });
  const { data: episode } = useEpisodeInfo({ id: episodeId });
  // the desired state according to what the user has clicked on the page
  const [desiredEligibility, setDesiredEligibility] = useState<
    number[] | undefined
  >();

  // TODO: We should add the "isPending" state from the updateTeam hook to block the UI while the update is in progress
  // i.e., this state should be removed entirely!
  // for now, will leave as is!
  useEffect(() => {
    setDesiredEligibility(team?.profile?.eligible_for);
  }, [team?.profile?.eligible_for]);

  // useEffect(() => {
  //   // if actual team eligibility hasn't loaded yet or the desired/actual are identical
  //   if (
  //     !isPresent(desiredEligibility) ||
  //     isEqual(desiredEligibility, team?.profile?.eligible_for)
  //   ) {
  //     return;
  //   }

  //   let isActive = true;
  //   const update = async (): Promise<void> => {
  //     const updatedTeam = await updateTeamPartial(episodeId, {
  //       eligible_for: desiredEligibility,
  //     });
  //     const newProfile = team?.profile;
  //     if (isActive && isPresent(newProfile) && isPresent(team)) {
  //       // only update the eligibility of the team profile to avoid race conditions
  //       // with other team profile updaters on this page
  //       refreshTeam({
  //         ...team,
  //         profile: {
  //           ...newProfile,
  //           eligible_for: updatedTeam.profile?.eligible_for,
  //         },
  //       });
  //     }
  //   };
  //   void update();
  //   return () => {
  //     isActive = false;
  //   };
  // }, [desiredEligibility, episodeId]);

  // TODO: I think there is a better way to handle loading than rendering a Loading component
  // Since we will eventually prefetch the team data, maybe we can jsut forego this loading entirely!
  if (isLoading) {
    return <Loading />;
  } else if (!isPresent(team) || !isPresent(episode)) {
    return <div>{"Error: You're not in a team!"}</div>;
  }
  return (
    <SectionCard title="Eligibility">
      <div className="flex flex-col gap-4 2xl:flex-row">
        <div className="2xl:w-60">
          <p className="text-gray-700">
            Check the box(es) that apply to <i>all</i> members of your team.
          </p>
          <p className="text-gray-700">
            This determines which tournaments and prizes your team is eligible
            for.
          </p>
        </div>
        <div className="flex flex-1 flex-col gap-2">
          {isPresent(desiredEligibility) &&
            episode.eligibility_criteria.map((criterion) => {
              return (
                <DescriptiveCheckbox
                  key={criterion.id}
                  status={determineCheckboxState(
                    desiredEligibility.includes(criterion.id),
                    (team.profile?.eligible_for ?? []).includes(criterion.id),
                  )}
                  onChange={async (checked) => {
                    if (checked && !desiredEligibility.includes(criterion.id)) {
                      // Add criterion to team
                      // We do NOT want to await this, because we want to send the state of this mutation to isPending!
                      updateTeam({
                        episodeId,
                        patchedTeamPrivateRequest: {
                          profile: {
                            ...team.profile,
                            eligible_for: [
                              ...(team.profile?.eligible_for ?? []),
                              criterion.id,
                            ],
                          },
                        },
                      });
                      // setDesiredEligibility([
                      //   ...desiredEligibility,
                      //   criterion.id,
                      // ]);
                    } else if (!checked) {
                      // Remove criterion from team
                      updateTeam({
                        episodeId,
                        patchedTeamPrivateRequest: {
                          profile: {
                            ...team.profile,
                            eligible_for: team.profile?.eligible_for?.filter(
                              (item) => item !== criterion.id,
                            ),
                          },
                        },
                      });
                      // setDesiredEligibility(
                      //   desiredEligibility.filter(
                      //     (item) => item !== criterion.id,
                      //   ),
                      // );
                    }
                  }}
                  title={`${criterion.title} ${criterion.icon}`}
                  description={criterion.description}
                />
              );
            })}
        </div>
      </div>
    </SectionCard>
  );
};

export default EligibilitySettings;
