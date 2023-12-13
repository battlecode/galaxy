import React, { type EventHandler, useMemo, useState } from "react";
import { PageTitle } from "../components/elements/BattlecodeStyle";
import SectionCard from "../components/SectionCard";
import Input from "../components/elements/Input";
import TextArea from "../components/elements/TextArea";
import Button from "../components/elements/Button";
import MemberList from "../components/team/MemberList";
import Modal from "../components/Modal";
import EligibilitySettings from "../components/team/EligibilitySettings";
import ScrimmageSettings from "../components/team/ScrimmageSettings";
import { useEpisodeId } from "../contexts/EpisodeContext";
import { useLeaveTeam, useUpdateTeam, useUserTeam } from "../api/team/useTeam";
import { useQueryClient } from "@tanstack/react-query";
import JoinTeam from "./JoinTeam";
import Loading from "../components/Loading";
import { type SubmitHandler, useForm } from "react-hook-form";

interface InfoFormInput {
  quote: string;
  biography: string;
}

const MyTeam: React.FC = () => {
  const { episodeId } = useEpisodeId();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { isDirty },
    reset,
  } = useForm<InfoFormInput>();

  const teamData = useUserTeam({ episodeId });
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
  );

  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState<boolean>(false);

  const membersList = useMemo(() => {
    return (
      <div className="flex flex-col gap-8">
        {!teamData.isSuccess ? (
          <Loading />
        ) : (
          <MemberList members={teamData.data.members} />
        )}
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

  const onSubmit: SubmitHandler<InfoFormInput> = async (data) => {
    if (updateTeam.isPending) return;
    await updateTeam.mutateAsync({
      profile: {
        quote: data.quote,
        biography: data.biography,
      },
    });
    reset();
  };

  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  const onLeaveTeam: EventHandler<React.MouseEvent<HTMLButtonElement>> = async (
    event,
  ) => {
    if (leaveTeam.isPending) return;
    event.preventDefault();
    await leaveTeam.mutateAsync();
    setIsLeaveModalOpen(false);
  };

  if (teamData.isLoading) {
    return <Loading />;
  } else if (!teamData.isSuccess) {
    return <JoinTeam />;
  }

  return (
    <div className="p-6">
      <PageTitle>Team Settings</PageTitle>
      <div className="flex flex-col gap-8 xl:flex-row">
        <div className="flex flex-1 flex-col gap-8 xl:max-w-4xl">
          <SectionCard title="Profile" className="max-w-5xl">
            <form
              // eslint-disable-next-line @typescript-eslint/no-misused-promises
              onSubmit={handleSubmit(onSubmit)}
              className="flex flex-col md:flex-row md:gap-8"
            >
              <div className="flex flex-col items-center gap-6 p-4">
                <img
                  className="h-24 w-24 rounded-full bg-gray-400 md:h-48 md:w-48"
                  src={teamData.data.profile?.avatar_url}
                  // TODO: open add avatar modal on click! With hover effect!
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
                  {...register("quote")}
                  defaultValue={teamData.data.profile?.quote}
                />
                <TextArea
                  label="Team biography"
                  {...register("biography")}
                  defaultValue={teamData.data.profile?.biography}
                />
                <Button
                  className={`mt-2 ${
                    updateTeam.isPending || !isDirty
                      ? "disabled cursor-not-allowed"
                      : ""
                  }`}
                  variant={
                    isDirty && !updateTeam.isPending ? "dark" : "light-outline"
                  }
                  label="Save"
                  type="submit"
                  loading={updateTeam.isPending}
                  disabled={updateTeam.isPending || !isDirty}
                />
              </div>
            </form>
          </SectionCard>
          {/* The members list that displays when on a smaller screen */}
          <SectionCard className="shrink xl:hidden" title="Members">
            {membersList}
          </SectionCard>
          <EligibilitySettings />
          <ScrimmageSettings />
        </div>
        {/* The members list that displays to the right side when on a big screen. */}
        <SectionCard className="hidden w-1/3 shrink xl:block" title="Members">
          {membersList}
        </SectionCard>
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
              // eslint-disable-next-line @typescript-eslint/no-misused-promises
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

export default MyTeam;
