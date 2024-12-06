import type React from "react";
import { useMemo, useState } from "react";
import SectionCard from "../SectionCard";
import DescriptiveCheckbox, {
  getCheckboxState,
} from "../elements/DescriptiveCheckbox";
import { useEpisodeId } from "../../contexts/EpisodeContext";
import { isPresent } from "../../utils/utilTypes";
import { useEpisodeInfo } from "../../api/episode/useEpisode";
import { useUpdateTeam, useUserTeam } from "../../api/team/useTeam";
import { useQueryClient } from "@tanstack/react-query";
import { isEqual } from "lodash";
import Loading from "../Loading";
import Button from "../elements/Button";

// This component should only be used when there is a logged in user with a team.
const EligibilitySettings: React.FC = () => {
  const { episodeId } = useEpisodeId();
  const queryClient = useQueryClient();

  const episodeData = useEpisodeInfo({ id: episodeId });
  const teamData = useUserTeam({ episodeId });
  const updateTeam = useUpdateTeam(
    {
      episodeId,
    },
    queryClient,
  );

  // the desired state according to what the user has clicked on the page
  const [desiredEligibility, setDesiredEligibility] = useState<
    number[] | undefined
  >();

  const editMode = useMemo(
    () =>
      // Desired eligibility is different from the current (present, non-loading) team data
      !teamData.isLoading &&
      teamData.isSuccess &&
      isPresent(desiredEligibility) &&
      !isEqual(
        desiredEligibility.sort((a, b) => a - b),
        teamData.data.profile?.eligible_for?.sort((a, b) => a - b),
      ),
    [desiredEligibility, teamData],
  );

  if (episodeData.isLoading) {
    return <Loading />;
  } else if (!episodeData.isSuccess || !teamData.isSuccess) {
    return null;
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
          {episodeData.data.eligibility_criteria.map((crit) => (
            <DescriptiveCheckbox
              key={crit.id}
              status={getCheckboxState(
                teamData.isLoading || updateTeam.isPending,
                editMode,
                Boolean(desiredEligibility?.includes(crit.id)),
                Boolean(teamData.data.profile?.eligible_for?.includes(crit.id)),
              )}
              onChange={(checked) => {
                const prev = isPresent(desiredEligibility)
                  ? desiredEligibility
                  : teamData.data.profile?.eligible_for;
                setDesiredEligibility(
                  checked
                    ? [...(prev ?? []), crit.id]
                    : prev?.filter((item) => item !== crit.id) ?? [],
                );
              }}
              title={`${crit.title} ${crit.icon}`}
              description={crit.description}
            />
          ))}
          {editMode && (
            <Button
              variant="dark"
              label="Save"
              fullWidth
              disabled={updateTeam.isPending}
              loading={updateTeam.isPending}
              onClick={() => {
                updateTeam.mutate({
                  profile: {
                    eligible_for: desiredEligibility,
                  },
                });
              }}
            />
          )}
        </div>
      </div>
    </SectionCard>
  );
};

export default EligibilitySettings;
