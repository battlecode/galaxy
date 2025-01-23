import type React from "react";
import { useMemo, useState } from "react";
import SectionCard from "../SectionCard";
import { useEpisodeId } from "../../contexts/EpisodeContext";
import { isPresent } from "../../utils/utilTypes";
import { useUpdateTeam, useUserTeam } from "../../api/team/useTeam";
import { useQueryClient } from "@tanstack/react-query";
import Button from "../elements/Button";
import { ScrimmageRequestAcceptRejectEnum } from "api/_autogen";
import SelectMenu from "components/elements/SelectMenu";

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

  const [acceptRejectRanked, setAcceptRejectRanked] = useState<
    ScrimmageRequestAcceptRejectEnum | undefined
  >();
  const [acceptRejectUnranked, setAcceptRejectUnranked] = useState<
    ScrimmageRequestAcceptRejectEnum | undefined
  >();

  const editMode = useMemo(() => {
    if (!teamData.isSuccess || teamData.isLoading) return false;

    // Some of accept/reject ranked/unranked is different from the data
    return (
      (isPresent(acceptRejectRanked) &&
        acceptRejectRanked !==
          teamData.data.profile?.auto_accept_reject_ranked) ||
      (isPresent(acceptRejectUnranked) &&
        acceptRejectUnranked !==
          teamData.data.profile?.auto_accept_reject_unranked)
    );
  }, [teamData, acceptRejectRanked, acceptRejectUnranked]);

  return (
    <SectionCard
      title="Scrimmaging"
      loading={teamData.isLoading}
      allowOverflow={true}
    >
      {teamData.isSuccess && (
        <div className="flex flex-col gap-3">
          <div className="text-green-600">
            <p className="text-gray-700">
              Choose how you want to handle incoming scrimmage requests from
              other players.
            </p>
          </div>
          <div className="flex w-full flex-1 flex-col gap-4">
            <ScrimmageAcceptRejectSelect
              label="Ranked Scrimmages"
              loading={teamData.isLoading || updateTeam.isPending}
              acceptRejectStatus={
                acceptRejectRanked ??
                teamData.data.profile?.auto_accept_reject_ranked
              }
              onChange={(status) => {
                setAcceptRejectRanked(status);
              }}
            />
            <ScrimmageAcceptRejectSelect
              label="Unranked Scrimmages"
              loading={teamData.isLoading || updateTeam.isPending}
              acceptRejectStatus={
                acceptRejectUnranked ??
                teamData.data.profile?.auto_accept_reject_unranked
              }
              onChange={(status) => {
                setAcceptRejectUnranked(status);
              }}
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
                      auto_accept_reject_ranked: acceptRejectRanked,
                      auto_accept_reject_unranked: acceptRejectUnranked,
                    },
                  });
                }}
              />
            )}
          </div>
        </div>
      )}
    </SectionCard>
  );
};

interface ScrimmageAcceptRejectSelectProps {
  acceptRejectStatus?: ScrimmageRequestAcceptRejectEnum;
  loading?: boolean;
  label: string;
  onChange: (status: ScrimmageRequestAcceptRejectEnum) => void;
}

const ACCEPT_REJECT_OPTIONS = [
  { label: "Auto-Accept", value: ScrimmageRequestAcceptRejectEnum.A },
  { label: "Auto-Reject", value: ScrimmageRequestAcceptRejectEnum.R },
  { label: "Manual", value: ScrimmageRequestAcceptRejectEnum.M },
];

const ScrimmageAcceptRejectSelect: React.FC<
  ScrimmageAcceptRejectSelectProps
> = ({
  acceptRejectStatus = ScrimmageRequestAcceptRejectEnum.M,
  label,
  loading = false,
  onChange,
}) => (
  <SelectMenu<ScrimmageRequestAcceptRejectEnum>
    label={label}
    options={ACCEPT_REJECT_OPTIONS}
    loading={loading}
    value={acceptRejectStatus}
    onChange={onChange}
    className="w-48"
  />
);

export default ScrimmageSettings;
