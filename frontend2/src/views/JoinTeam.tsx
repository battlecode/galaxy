import React from "react";
import SectionCard from "../components/SectionCard";
import Input from "../components/elements/Input";
import Button from "../components/elements/Button";
import { FIELD_REQUIRED_ERROR_MSG } from "../utils/constants";
import { useForm } from "react-hook-form";
import { useEpisodeId } from "../contexts/EpisodeContext";
import { useCreateTeam, useJoinTeam } from "../api/team/useTeam";
import { useQueryClient } from "@tanstack/react-query";

interface CreateTeamInput {
  teamName: string;
}
interface JoinTeamInput {
  teamName: string;
  joinKey: string;
}

const JoinTeam: React.FC = () => {
  const { episodeId } = useEpisodeId();
  const queryClient = useQueryClient();

  const createTeam = useCreateTeam({ episodeId }, queryClient);
  const joinTeam = useJoinTeam({ episodeId }, queryClient);

  const {
    register: registerJoin,
    handleSubmit: handleJoinSubmit,
    reset: resetJoin,
  } = useForm<JoinTeamInput>();
  const {
    register: registerCreate,
    handleSubmit: handleCreateSubmit,
    reset: resetCreate,
  } = useForm<CreateTeamInput>();

  return (
    <div className="p-10">
      <div className="flex flex-col gap-8 xl:flex-row">
        <div className="flex flex-1 flex-col gap-8 xl:max-w-4xl">
          <form
            // eslint-disable-next-line @typescript-eslint/no-misused-promises
            onSubmit={handleCreateSubmit(async (data) => {
              await createTeam.mutateAsync({ name: data.teamName });
              resetCreate();
            })}
          >
            <SectionCard title="Create Team" className="max-w-5xl">
              <div className="flex flex-col gap-2">
                <Input
                  label="Team Name"
                  {...registerCreate("teamName", {
                    required: FIELD_REQUIRED_ERROR_MSG,
                  })}
                />
                <Button
                  label="Create Team"
                  fullWidth
                  className="mt-1"
                  type="submit"
                  variant="dark"
                />
              </div>
            </SectionCard>
          </form>
          <form
            // eslint-disable-next-line @typescript-eslint/no-misused-promises
            onSubmit={handleJoinSubmit(async (data) => {
              await joinTeam.mutateAsync({
                name: data.teamName,
                join_key: data.joinKey,
              });
              resetJoin();
            })}
          >
            <SectionCard title="Join Team" className="max-w-5xl">
              <div className="flex flex-col gap-2">
                <Input
                  label="Team Name"
                  {...registerJoin("teamName", {
                    required: FIELD_REQUIRED_ERROR_MSG,
                  })}
                />
                <Input
                  label="Team Join Key"
                  {...registerJoin("joinKey", {
                    required: FIELD_REQUIRED_ERROR_MSG,
                  })}
                />
                <Button
                  label="Join Team"
                  fullWidth
                  className="mt-1"
                  type="submit"
                  variant="dark"
                />
              </div>
            </SectionCard>
          </form>
        </div>
      </div>
    </div>
  );
};

export default JoinTeam;
