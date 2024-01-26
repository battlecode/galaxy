import React, { useMemo, useState } from "react";
import SectionCard from "../SectionCard";
import DescriptiveCheckbox, {
  getCheckboxState,
} from "../elements/DescriptiveCheckbox";
import { useEpisodeId } from "../../contexts/EpisodeContext";
import { isPresent } from "../../utils/utilTypes";
import { useUpdateTeam, useUserTeam } from "../../api/team/useTeam";
import { useQueryClient } from "@tanstack/react-query";
import Button from "../elements/Button";

// This component should only be used when there is a logged in user with a team.
const ScrimmageSettings: React.FC = () => {
  const { episodeId } = useEpisodeId();
  const queryClient = useQueryClient();

  const teamData = useUserTeam({ episodeId });
  const updateTeam = useUpdateTeam(
    {
      episodeId,
    },
    queryClient,
  );

  // True when the team has accept on, undefined when team's data hasn't loaded
  const [ranked, setRanked] = useState<boolean | undefined>();
  const [unranked, setUnranked] = useState<boolean | undefined>();

  const editMode = useMemo(() => {
    // Either ranked or unranked is different from the current (present, non-loading) team data
    return (
      !teamData.isLoading &&
      teamData.isSuccess &&
      ((isPresent(ranked) &&
        ranked !== teamData.data.profile?.auto_accept_ranked) ||
        (isPresent(unranked) &&
          unranked !== teamData.data.profile?.auto_accept_unranked))
    );
  }, [ranked, unranked, teamData]);

  if (!teamData.isSuccess) {
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
            status={getCheckboxState(
              teamData.isLoading || updateTeam.isPending,
              editMode,
              Boolean(ranked),
              Boolean(teamData.data.profile?.auto_accept_ranked),
            )}
            onChange={(checked) => {
              if (!isPresent(unranked))
                setUnranked(
                  teamData.data?.profile?.auto_accept_unranked ?? false,
                );
              setRanked(checked);
            }}
            title="Auto-accept ranked scrimmages"
            description="When enabled, your team will automatically accept
                  ranked scrimmage requests. Ranked scrimmages affect your ELO rating."
          />
          <DescriptiveCheckbox
            status={getCheckboxState(
              teamData.isLoading || updateTeam.isPending,
              editMode,
              Boolean(unranked),
              Boolean(teamData.data.profile?.auto_accept_unranked),
            )}
            onChange={(checked) => {
              if (!isPresent(ranked))
                setRanked(teamData.data.profile?.auto_accept_ranked ?? false);
              setUnranked(checked);
            }}
            title="Auto-accept unranked scrimmages"
            description="When enabled, your team will automatically accept
                  unranked scrimmage requests. Unranked scrimmages do not affect your ELO rating."
          />
          {editMode && (
            <Button
              variant="dark"
              label="Save"
              fullWidth
              // VERY IMPORTANT - Prevents race conditions with other team updates!
              disabled={updateTeam.isPending}
              loading={updateTeam.isPending}
              onClick={() => {
                updateTeam.mutate({
                  profile: {
                    auto_accept_ranked: ranked,
                    auto_accept_unranked: unranked,
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

export default ScrimmageSettings;
