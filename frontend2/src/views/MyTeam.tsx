import React, { useState } from "react";
import { PageTitle } from "../components/elements/BattlecodeStyle";
import SectionCard from "../components/SectionCard";
import Input from "../components/elements/Input";
import TextArea from "../components/elements/TextArea";
import { useCurrentTeam } from "../contexts/CurrentTeamContext";
import Button from "../components/elements/Button";
import MemberList from "../components/team/MemberList";
import DescriptiveCheckbox from "../components/elements/DescriptiveCheckbox";

const MyTeam: React.FC = () => {
  const { team, teamState } = useCurrentTeam();
  const [checked, setChecked] = useState<boolean>(false);
  const [checked1, setChecked1] = useState<boolean>(false);
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
                  src={team?.profile?.avatar_url}
                />
                <div className="text-center text-xl font-semibold">
                  {team?.name}
                </div>
              </div>
              <div className="flex flex-1 flex-col gap-4">
                <Input
                  disabled
                  label="Join key"
                  value={team?.join_key ?? "Loading..."}
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
          <SectionCard title="Eligibility">
            <div className="flex flex-col gap-4 2xl:flex-row">
              <div className="2xl:w-60">
                <p className="text-gray-700">
                  Check the box(es) that apply to <i>all</i> members of your
                  team.
                </p>
                <p className="text-gray-700">
                  This determines which tournaments and prizes your team is
                  eligible for.
                </p>
              </div>
              <div className="flex flex-1 flex-col gap-2">
                <DescriptiveCheckbox
                  checked={checked}
                  onChange={(checked) => {
                    console.log("new value", checked);
                    setChecked(checked);
                  }}
                  title="Student"
                  description="Here's a description of what a student is"
                />
                <DescriptiveCheckbox
                  checked={checked}
                  onChange={(checked) => {
                    console.log("new value", checked);
                    setChecked(checked);
                  }}
                  title="US Student"
                  description="Here's a description of what a US student is"
                />
                <DescriptiveCheckbox
                  checked={checked}
                  onChange={(checked) => {
                    console.log("new value", checked);
                    setChecked(checked);
                  }}
                  title="High school student"
                  description="These descriptions and titles should be loaded dynamically."
                />
                <DescriptiveCheckbox
                  checked={checked}
                  onChange={(checked) => {
                    console.log("new value", checked);
                    setChecked(checked);
                  }}
                  title="Newbie"
                  description="These descriptions and titles should be loaded dynamically. I think this is MIT newbie? we might want to rename this criteria"
                />
              </div>
            </div>
          </SectionCard>
          <SectionCard title="Scrimmaging">
            <div className="flex flex-col gap-3 2xl:flex-row">
              <div className="text-green-600 2xl:w-60">
                <p className="text-gray-700">
                  Choose how you want to handle incoming scrimmage requests from
                  other players.
                </p>
              </div>
              <div className="flex flex-1 flex-col gap-2">
                <DescriptiveCheckbox
                  checked={checked}
                  onChange={(checked) => {
                    console.log("new value", checked);
                    setChecked(checked);
                  }}
                  title="Auto-accept ranked scrimmages"
                  description="When enabled, your team will automatically accept
                  ranked scrimmage requests. Ranked scrimmages affect your ELO rating."
                />
                <DescriptiveCheckbox
                  checked={checked1}
                  onChange={(checked1) => {
                    console.log("new value", checked1);
                    setChecked1(checked1);
                  }}
                  title="Auto-accept unranked scrimmages"
                  description="When enabled, your team will automatically accept
                  unranked scrimmage requests. Unranked scrimmages do not affect your ELO rating."
                />
              </div>
            </div>
          </SectionCard>
        </div>
        <SectionCard className="shrink xl:max-w-lg" title="Members">
          {team !== undefined && <MemberList members={team?.members} />}
        </SectionCard>
      </div>
    </div>
  );
};

export default MyTeam;
