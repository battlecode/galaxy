import React, { useEffect, useState } from "react";
import SectionCard from "../components/SectionCard";
import Input from "../components/elements/Input";
import Button from "../components/elements/Button";
import { FIELD_REQUIRED_ERROR_MSG } from "../utils/constants";
import { type SubmitHandler, useForm } from "react-hook-form";
import { useEpisodeId } from "../contexts/EpisodeContext";
import { useCurrentTeam } from "../contexts/CurrentTeamContext";
import { createTeam, joinTeam } from "../utils/api/team";
import { type Maybe } from "../utils/utilTypes";

interface CreateTeamInput {
  episodeId: string;
  teamName: string;
}
interface JoinTeamInput {
  episodeId: string;
  teamName: string;
  joinKey: string;
}


const JoinTeam: React.FC = () => {
  // const { register, handleSubmit } = useForm<CreateTeamInput>();
  const { register:registerJoin, handleSubmit:handleJoinSubmit } = useForm<JoinTeamInput>();
  const { register, handleSubmit } = useForm<CreateTeamInput>();
  // const { login, authState } = useCurrentTeam();
  const [loginError, setJoinError] = useState<Maybe<string>>();

  const onTeamCreate: SubmitHandler<CreateTeamInput> = async (data) => {
    try {
      setJoinError(undefined);
      console.log("teaming");
      await createTeam(data.episodeId, data.teamName);
      // login(await getUserUserProfile());
    } catch (error) {
      // setLoginError(
      //   "Error logging in. Did you enter your username and password correctly?",
      // );
    }
  };
  const onTeamJoin: SubmitHandler<JoinTeamInput> = async (data) => {
    try {
      setJoinError(undefined);
      await joinTeam(data.episodeId, data.teamName, data.joinKey);
      // login();
    } catch (error) {
      setJoinError(
        "Error joining team. Did you enter the name and key correctly?",
      );
    }
  };

  return (
    <div className="p-10">
      <div className="flex flex-col gap-8 xl:flex-row">
      <div className="flex flex-1 flex-col gap-8 xl:max-w-4xl">
      <form
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        onSubmit={handleSubmit(onTeamCreate)}
      >
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
