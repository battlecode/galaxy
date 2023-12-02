import React, { useEffect, useState } from "react";
import {
  useCurrentTeam,
  TeamStateEnum,
} from "../../contexts/CurrentTeamContext";
import SectionCard from "../SectionCard";
import DescriptiveCheckbox, {
  CheckboxState,
} from "../elements/DescriptiveCheckbox";
import { useEpisode, useEpisodeId } from "../../contexts/EpisodeContext";
import { isPresent } from "../../utils/utilTypes";
import { updateTeamPartial } from "../../utils/api/team";
import { isEqual } from "lodash";

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
  const { team, teamState, refreshTeam } = useCurrentTeam();
  const episode = useEpisode();
  const { episodeId } = useEpisodeId();
  // the desired state according to what the user has clicked on the page
  const [desiredEligibility, setDesiredEligibility] = useState<
    number[] | undefined
  >();
  useEffect(() => {
    setDesiredEligibility(team?.profile?.eligible_for);
  }, [team?.profile?.eligible_for]);

  useEffect(() => {
    // if actual team eligibility hasn't loaded yet or the desired/actual are identical
    if (
      !isPresent(desiredEligibility) ||
      isEqual(desiredEligibility, team?.profile?.eligible_for)
    ) {
      return;
    }

    let isActive = true;
    const update = async (): Promise<void> => {
      const updatedTeam = await updateTeamPartial(episodeId, {
        eligible_for: desiredEligibility,
      });
      const newProfile = team?.profile;
      if (isActive && isPresent(newProfile) && isPresent(team)) {
        // only update the eligibility of the team profile to avoid race conditions
        // with other team profile updaters on this page
        refreshTeam({
          ...team,
          profile: {
            ...newProfile,
            eligible_for: updatedTeam.profile?.eligible_for,
          },
        });
      }
    };
    void update();
    return () => {
      isActive = false;
    };
  }, [desiredEligibility, episodeId]);

  if (
    teamState !== TeamStateEnum.IN_TEAM ||
    !isPresent(team) ||
    !isPresent(episode)
  ) {
    return <div>Error: You`&apos;`re not in a team!</div>;
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
                  onChange={(checked) => {
                    if (checked && !desiredEligibility.includes(criterion.id)) {
                      setDesiredEligibility([
                        ...desiredEligibility,
                        criterion.id,
                      ]);
                    } else if (!checked) {
                      setDesiredEligibility(
                        desiredEligibility.filter(
                          (item) => item !== criterion.id,
                        ),
                      );
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
