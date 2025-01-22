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

  // True/False only when dirtied, undefined otherwise
  // const [acceptRanked, setAcceptRanked] = useState<boolean | undefined>();
  // const [acceptUnranked, setAcceptUnranked] = useState<boolean | undefined>();
  // const [rejectRanked, setRejectRanked] = useState<boolean | undefined>();
  // const [rejectUnranked, setRejectUnranked] = useState<boolean | undefined>();

  // const editMode = useMemo(() => {
  //   if (!teamData.isSuccess || teamData.isLoading) return false;

  //   // Some of accept/reject ranked/unranked is different from the data
  //   return (
  //     (isPresent(acceptRanked) &&
  //       acceptRanked !== teamData.data.profile?.auto_accept_ranked) ||
  //     (isPresent(acceptUnranked) &&
  //       acceptUnranked !== teamData.data.profile?.auto_accept_unranked) ||
  //     (isPresent(rejectRanked) &&
  //       rejectRanked !== teamData.data.profile?.auto_reject_ranked) ||
  //     (isPresent(rejectUnranked) &&
  //       rejectUnranked !== teamData.data.profile?.auto_reject_unranked)
  //   );
  // }, [acceptRanked, acceptUnranked, rejectRanked, rejectUnranked, teamData]);

  // const wrapCheckboxState = useCallback(
  //   (
  //     manualCheck: boolean | undefined,
  //     dataCheck: boolean | undefined,
  //   ): CheckboxState =>
  //     getCheckboxState(
  //       teamData.isLoading || updateTeam.isPending,
  //       editMode,
  //       manualCheck,
  //       dataCheck,
  //     ),
  //   [teamData, updateTeam, editMode],
  // );

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
    <SectionCard title="Scrimmaging" loading={teamData.isLoading}>
      {teamData.isSuccess && (
        <div className="flex flex-col gap-3 2xl:flex-row">
          <div className="text-green-600 2xl:w-60">
            <p className="text-gray-700">
              Choose how you want to handle incoming scrimmage requests from
              other players.
            </p>
          </div>
          <div className="flex flex-1 flex-col gap-2">
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
          {/* <div className="flex flex-1 flex-col gap-2">
            <DescriptiveCheckbox
              status={wrapCheckboxState(
                acceptRanked,
                teamData.data.profile?.auto_accept_ranked,
              )}
              onChange={(checked) => {
                setAcceptRanked(checked);
              }}
              title="Auto-accept ranked scrimmages"
              description="When enabled, your team will automatically accept
                  ranked scrimmage requests. Ranked scrimmages affect your ELO rating."
            />
            <DescriptiveCheckbox
              status={wrapCheckboxState(
                acceptUnranked,
                teamData.data.profile?.auto_accept_unranked,
              )}
              onChange={(checked) => {
                setAcceptUnranked(checked);
              }}
              title="Auto-accept unranked scrimmages"
              description="When enabled, your team will automatically accept
                  unranked scrimmage requests. Unranked scrimmages do not affect your ELO rating."
            />
            <DescriptiveCheckbox
              status={wrapCheckboxState(
                rejectRanked,
                teamData.data.profile?.auto_reject_ranked,
              )}
              onChange={(checked) => {
                setRejectRanked(checked);
              }}
              title="Auto-reject ranked scrimmages"
              description="When enabled, your team will automatically reject
                  ranked scrimmage requests."
            />
            <DescriptiveCheckbox
              status={wrapCheckboxState(
                rejectUnranked,
                teamData.data.profile?.auto_reject_unranked,
              )}
              onChange={(checked) => {
                setRejectUnranked(checked);
              }}
              title="Auto-reject unranked scrimmages"
              description="When enabled, your team will automatically reject
                  unranked scrimmage requests."
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
                      auto_accept_ranked: acceptRanked,
                      auto_accept_unranked: acceptUnranked,
                      auto_reject_ranked: rejectRanked,
                      auto_reject_unranked: rejectUnranked,
                    },
                  });
                }}
              />
            )}
          </div> */}
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
  />
);

export default ScrimmageSettings;
