import React, { useCallback, useEffect, useState } from "react";
import SectionCard from "../components/SectionCard";
import Input from "../components/elements/Input";
import Button from "../components/elements/Button";
import { FIELD_REQUIRED_ERROR_MSG } from "../utils/constants";
import { type SubmitHandler, useForm } from "react-hook-form";
import { useEpisodeId } from "../contexts/EpisodeContext";
import { useCurrentTeam } from "../contexts/CurrentTeamContext";
import { createTeam, joinTeam, retrieveTeam } from "../utils/api/team";
import { type Maybe } from "../utils/utilTypes";
import { type TeamPrivate } from "../utils/types";
// import types;

interface CreateTeamInput {
  teamName: string;
}
interface JoinTeamInput {
  teamName: string;
  joinKey: string;
}


const JoinTeam: React.FC = () => {
  const {episodeId} = useEpisodeId();
  // const { register, handleSubmit } = useForm<CreateTeamInput>();
  const { register:registerJoin, handleSubmit:handleJoinSubmit } = useForm<JoinTeamInput>();
  const { register, handleSubmit } = useForm<CreateTeamInput>();
  const { refreshTeam } = useCurrentTeam();
  const [createError, setCreateError] = useState<Maybe<string>>();
  const [joinError, setJoinError] = useState<Maybe<string>>();

  const onTeamCreate: SubmitHandler<CreateTeamInput> = useCallback(async (data) => {
    try {
      setCreateError(undefined);
      refreshTeam(await createTeam(episodeId, data.teamName) as TeamPrivate);
    } catch (error) {
      setCreateError(

        "Error creating team, try a different name",
      );
    }
  }, [episodeId]);
  const onTeamJoin: SubmitHandler<JoinTeamInput> = useCallback(async (data) => {
    try {
      setJoinError(undefined);
      await joinTeam(episodeId, data.teamName, data.joinKey);
      const team = await retrieveTeam(episodeId);
      refreshTeam(team);
    } catch (error) {
      setJoinError(
        "Error joining team. Did you enter the name and key correctly?",
      );
    }
  }, [episodeId]);

  return (
    <div className="p-10">
      <div className="flex flex-col gap-8 xl:flex-row">
      <div className="flex flex-1 flex-col gap-8 xl:max-w-4xl">
      <form
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        onSubmit={handleSubmit(onTeamCreate)}
      >
        {
          createError !== undefined && (
            <div className="text-center text-sm text-red-600">{createError}</div>
          )
        }
      <SectionCard title="Create Team" className="max-w-5xl">
        <div className="flex flex-col gap-2">
        <Input
          label="Team Name"
          {...register("teamName", { required: FIELD_REQUIRED_ERROR_MSG })}
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
        onSubmit={handleJoinSubmit(onTeamJoin)}
      >
        {
          joinError !== undefined && (
            <div className="text-center text-sm text-red-600">{joinError}</div>
          )
        }
      <SectionCard title="Join Team" className="max-w-5xl">
      <div className="flex flex-col gap-2">
          <Input
          label="Team Name"
          {...registerJoin("teamName", { required: FIELD_REQUIRED_ERROR_MSG })}
          />
          <Input
          label="Team Join Key"
           {...registerJoin("joinKey", { required: FIELD_REQUIRED_ERROR_MSG })}
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
