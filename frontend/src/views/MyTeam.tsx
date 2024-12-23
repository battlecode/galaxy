import type React from "react";
import { type EventHandler, useMemo, useState } from "react";
import { PageTitle } from "components/elements/BattlecodeStyle";
import SectionCard from "components/SectionCard";
import Input from "components/elements/Input";
import TextArea from "components/elements/TextArea";
import Button from "components/elements/Button";
import MemberList from "../components/team/MemberList";
import Modal from "components/Modal";
import EligibilitySettings from "components/team/EligibilitySettings";
import ScrimmageSettings from "components/team/ScrimmageSettings";
import { useEpisodeId } from "contexts/EpisodeContext";
import {
  useLeaveTeam,
  useUpdateTeam,
  useUserTeam,
  useUpdateTeamAvatar,
} from "api/team/useTeam";
import { useQueryClient } from "@tanstack/react-query";
import JoinTeam from "./JoinTeam";
import { type SubmitHandler, useForm } from "react-hook-form";
import { FIELD_REQUIRED_ERROR_MSG } from "utils/constants";
import FormLabel from "components/elements/FormLabel";
import ScrimmagingRecord from "components/compete/ScrimmagingRecord";
// import TeamChart from "components/compete/chart/TeamChart";
// import { useUserRatingHistory } from "api/compete/useCompete";

interface InfoFormInput {
  quote: string;
  biography: string;
}

interface AvatarInput {
  file: FileList;
}

const MyTeam: React.FC = () => {
  const { episodeId } = useEpisodeId();
  const queryClient = useQueryClient();

  const {
    register: registerInfo,
    handleSubmit: handleInfoSubmit,
    formState: { isDirty: isInfoDirty },
    reset: resetInfo,
  } = useForm<InfoFormInput>();

  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState<boolean>(false);

  const teamData = useUserTeam({ episodeId });
  // const teamRatingHistory = useUserRatingHistory({ episodeId });

  const updateTeam = useUpdateTeam(
    {
      episodeId,
    },
    queryClient,
  );
  const leaveTeam = useLeaveTeam(
    {
      episodeId,
    },
    queryClient,
    () => {
      setIsLeaveModalOpen(false);
    },
  );

  const onInfoSubmit: SubmitHandler<InfoFormInput> = (data) => {
    if (updateTeam.isPending) return;
    updateTeam.mutate({
      profile: {
        quote: data.quote,
        biography: data.biography,
      },
    });
    resetInfo();
  };

  const onLeaveTeam: EventHandler<React.MouseEvent<HTMLButtonElement>> = (
    event,
  ) => {
    if (leaveTeam.isPending) return;
    event.preventDefault();
    event.stopPropagation();
    leaveTeam.mutate();
    setIsLeaveModalOpen(false);
  };

  const membersList = useMemo(() => {
    if (!teamData.isSuccess) return null;
    return (
      <div className="flex flex-col gap-8">
        <MemberList members={teamData.data.members} />
        <Button
          className="self-start"
          onClick={() => {
            setIsLeaveModalOpen(true);
          }}
          label="Leave team"
        />
      </div>
    );
  }, [teamData]);

  if (!teamData.isSuccess) {
    return <JoinTeam />;
  }

  return (
    <div className="p-6">
      <PageTitle>Team Settings</PageTitle>
      <div className="flex flex-col gap-8 xl:flex-row">
        <div className="flex flex-1 flex-col gap-8 xl:max-w-4xl">
          <SectionCard title="Profile" className="max-w-5xl">
            <form
              onSubmit={(e) => {
                void handleInfoSubmit(onInfoSubmit)(e);
              }}
              className="flex flex-col md:flex-row md:gap-8"
            >
              <div className="flex flex-col items-center gap-6 p-4">
                <img
                  className="h-24 w-24 rounded-full bg-gray-400 md:h-48 md:w-48"
                  src={teamData.data.profile?.avatar_url}
                />
                <div className="text-center text-xl font-semibold">
                  {teamData.data.name}
                </div>
              </div>
              <div className="flex flex-1 flex-col gap-4">
                <Input
                  disabled
                  label="Join key"
                  value={teamData.data.join_key}
                />
                <Input
                  label="Team quote"
                  {...registerInfo("quote")}
                  defaultValue={teamData.data.profile?.quote}
                />
                <TextArea
                  label="Team biography"
                  {...registerInfo("biography")}
                  defaultValue={teamData.data.profile?.biography}
                />
                <Button
                  className="mt-2"
                  disabled={updateTeam.isPending || !isInfoDirty}
                  loading={updateTeam.isPending}
                  variant={"dark"}
                  label="Save"
                  type="submit"
                />
              </div>
            </form>
          </SectionCard>
          {/* The members list, file upload, and win/loss that display when on a smaller screen */}
          <SectionCard
            className="shrink xl:hidden"
            title="Members"
            loading={teamData.isLoading}
          >
            {membersList}
          </SectionCard>
          <EligibilitySettings />
          <ScrimmageSettings />
          <SectionCard className="shrink xl:hidden" title="File Upload">
            <TeamAvatar />
          </SectionCard>
          <SectionCard className="shrink xl:hidden" title="Scrimmaging Record">
            <ScrimmagingRecord
              team={teamData.data}
              hideTeamName={true}
              hideAllScrimmages={true}
            />
          </SectionCard>
        </div>
        {/* Display the members list, file upload, and win/loss to the right when on a big screen. */}
        <div className="hidden max-w-2xl gap-8 xl:flex xl:flex-1 xl:flex-col">
          <SectionCard title="Members">{membersList}</SectionCard>
          <SectionCard title="File Upload">
            <TeamAvatar />
          </SectionCard>
          <SectionCard title="Scrimmaging Record">
            <ScrimmagingRecord
              team={teamData.data}
              hideTeamName={true}
              hideAllScrimmages={true}
            />
          </SectionCard>
          {/* <SectionCard title="Rating History">
            <TeamChart
              teamRatings={
                teamRatingHistory.isSuccess ? [teamRatingHistory.data] : []
              }
              loading={teamRatingHistory.isLoading}
            />
          </SectionCard> */}
        </div>
      </div>
      {/* The confirmation modal that pops up when a user clicks "Leave Team" */}
      <Modal
        isOpen={isLeaveModalOpen}
        closeModal={() => {
          setIsLeaveModalOpen(false);
        }}
        title="Leave team"
      >
        <div className="mt-4 flex flex-col gap-2">
          <p>
            Are you sure you want to leave{" "}
            <span className="font-semibold">{teamData.data.name}</span>?
          </p>
          <div className="flex flex-row gap-4">
            <Button
              variant="danger-outline"
              onClick={onLeaveTeam}
              loading={leaveTeam.isPending}
              label="Leave team"
            />
            <Button
              onClick={() => {
                setIsLeaveModalOpen(false);
              }}
              label="Cancel"
              disabled={leaveTeam.isPending}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

const TeamAvatar: React.FC = () => {
  const { episodeId } = useEpisodeId();
  const queryClient = useQueryClient();

  const uploadTeamAvatar = useUpdateTeamAvatar({ episodeId }, queryClient);

  const {
    register: registerAvatar,
    handleSubmit: handleAvatarSubmit,
    reset: resetAvatar,
    formState: { isDirty: isAvatarDirty },
  } = useForm<AvatarInput>();

  const onAvatarSubmit: SubmitHandler<AvatarInput> = (data) => {
    if (uploadTeamAvatar.isPending) return;
    uploadTeamAvatar.mutate(data.file[0]);
    resetAvatar();
  };

  return (
    <form
      className="pb-1"
      onSubmit={(e) => {
        void handleAvatarSubmit(onAvatarSubmit)(e);
      }}
    >
      <FormLabel label="Team Avatar" />
      <input
        type="file"
        accept="image/*"
        className="w-full"
        {...registerAvatar("file", {
          required: FIELD_REQUIRED_ERROR_MSG,
        })}
      />
      <Button
        className="mt-4"
        label="Save avatar"
        type="submit"
        loading={uploadTeamAvatar.isPending}
        disabled={uploadTeamAvatar.isPending || !isAvatarDirty}
      />
    </form>
  );
};

export default MyTeam;
