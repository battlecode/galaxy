import React, { useMemo, useState } from "react";
import { PageTitle } from "../components/elements/BattlecodeStyle";
import SectionCard from "../components/SectionCard";
import Input from "../components/elements/Input";
import TextArea from "../components/elements/TextArea";
import { TeamStateEnum, useCurrentTeam } from "../contexts/CurrentTeamContext";
import Button from "../components/elements/Button";
import MemberList from "../components/team/MemberList";
import JoinTeam from "./JoinTeam";
import Modal from "../components/Modal";
import EligibilitySettings from "../components/team/EligibilitySettings";
import ScrimmageSettings from "../components/team/ScrimmageSettings";


const MyTeam: React.FC = () => {
  const { team, teamState, leaveMyTeam } = useCurrentTeam();
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState<boolean>(false);
  const [isLeaveTeamPending, setIsLeaveTeamPending] = useState<boolean>(false);
  const membersList = useMemo(() => {
    return (
      <div className="flex flex-col gap-8">
        {team !== undefined && <MemberList members={team?.members} />}
        <Button
          className="self-start"
          onClick={() => {
            setIsLeaveModalOpen(true);
          }}
          label="Leave team"
        />
      </div>
    );
  }, [team]);
  if (teamState !== TeamStateEnum.IN_TEAM || team === undefined) {
    return <JoinTeam />;
  }
  return (
   <div className="p-10">
      <PageTitle>Team Settings</PageTitle>
      <div className="flex flex-col gap-8 xl:flex-row">
        <div className="flex flex-1 flex-col gap-8 xl:max-w-4xl">
          <SectionCard title="Profile" className="max-w-5xl">
            <div className="flex flex-col md:flex-row md:gap-8">
              <div className="flex flex-col items-center gap-6 p-4">
                <img
                  className="h-24 w-24 rounded-full bg-gray-400 md:h-48 md:w-48"
                  src={team.profile?.avatar_url}
                />
                <div className="text-center text-xl font-semibold">
                  {team.name}
                </div>
              </div>
              <div className="flex flex-1 flex-col gap-4">
                <Input
                  disabled
                  label="Join key"
                  value={team.join_key ?? "Loading..."}
                />
                <Input label="Team quote" />
                <TextArea label="Team biography" />
                {/* TODO: This button will be disabled when no changes have been made,
                and will turn dark cyan after changes have been made. When changes
                are saved, it will be disabled again. We may want to show a popup indicating
                success */}
                <Button className="mt-2" label="Save" type="submit" />
              </div>
            </div>
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
            <span className="font-semibold">{team.name}</span>?
          </p>
          <div className="flex flex-row gap-4">
            <Button
              variant="danger-outline"
              onClick={() => {
                const leave = async (): Promise<void> => {
                  setIsLeaveTeamPending(true);
                  await leaveMyTeam();
                  setIsLeaveTeamPending(false);
                  setIsLeaveModalOpen(false);
                };
                void leave();
              }}
              loading={isLeaveTeamPending}
              label="Leave team"
            />
            <Button
              onClick={() => {
                setIsLeaveModalOpen(false);
              }}
              label="Cancel"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default MyTeam;
