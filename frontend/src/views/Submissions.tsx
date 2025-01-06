import type React from "react";
import { useMemo } from "react";
import { useEpisodeId } from "../contexts/EpisodeContext";
import SectionCard from "../components/SectionCard";
import SubHistoryTable from "../components/tables/submissions/SubHistoryTable";
import TourneySubTable from "../components/tables/submissions/TourneySubTable";
import Button from "../components/elements/Button";
import Input from "../components/elements/Input";
import { type SubmitHandler, useForm } from "react-hook-form";
import { FIELD_REQUIRED_ERROR_MSG } from "../utils/constants";
import TournamentCountdown from "../components/compete/TournamentCountdown";
import FormLabel from "../components/elements/FormLabel";
import { useEpisodeInfo, useNextTournament } from "../api/episode/useEpisode";
import {
  useSubmissionsList,
  useTournamentSubmissions,
  useUploadSubmission,
} from "../api/compete/useCompete";
import { useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { getParamEntries, parsePageParam } from "../utils/searchParamHelpers";
import { useUserTeam } from "api/team/useTeam";
import { Status526Enum } from "api/_autogen";

interface SubmissionFormInput {
  file: FileList;
  packageName: string;
  description: string;
}

interface QueryParams {
  scrimsPage: number;
}

const Submissions: React.FC = () => {
  const { episodeId } = useEpisodeId();
  const queryClient = useQueryClient();

  const [searchParams, setSearchParams] = useSearchParams();
  const queryParams: QueryParams = useMemo(
    () => ({
      scrimsPage: parsePageParam("scrimsPage", searchParams),
    }),
    [searchParams],
  );

  const episode = useEpisodeInfo({ id: episodeId });

  const submissions = useSubmissionsList(
    {
      episodeId,
      page: queryParams.scrimsPage,
    },
    queryClient,
  );
  const tourneySubs = useTournamentSubmissions({
    episodeId,
  });
  const nextTournament = useNextTournament({
    episodeId,
  });

  /**
   * Helper function to update the page number of the desired table.
   * This is done by updating the URL (search) params.
   */
  function handlePage(
    page: number,
    key: keyof Omit<QueryParams, "search">,
  ): void {
    setSearchParams((prev) => ({
      ...getParamEntries(prev),
      [key]: page.toString(),
    }));
  }

  return (
    <div className="flex h-full w-full flex-col overflow-auto p-6">
      <h1 className="mb-5 text-3xl font-bold leading-7 text-gray-900">
        Submissions
      </h1>

      <SectionCard
        title="Next Submission Deadline"
        className="mb-8"
        loading={nextTournament.isLoading}
      >
        {nextTournament.isSuccess && (
          <TournamentCountdown tournament={nextTournament.data ?? undefined} />
        )}
      </SectionCard>

      <SectionCard
        title="Submit Code"
        className="mb-8"
        loading={episode.isLoading}
      >
        <CodeSubmission />
      </SectionCard>

      <SectionCard title="Submission History" className="mb-8">
        <SubHistoryTable
          data={submissions.data}
          loading={submissions.isLoading}
          page={queryParams.scrimsPage}
          handlePage={(page) => {
            handlePage(page, "scrimsPage");
          }}
        />
      </SectionCard>

      <SectionCard title="Tournament Submission History">
        <TourneySubTable
          data={tourneySubs.data}
          loading={tourneySubs.isLoading}
        />
      </SectionCard>
    </div>
  );
};

const CodeSubmission: React.FC = () => {
  const { episodeId } = useEpisodeId();
  const teamData = useUserTeam({ episodeId });
  const queryClient = useQueryClient();

  const episode = useEpisodeInfo({ id: episodeId });

  const uploadSub = useUploadSubmission(
    {
      episodeId,
    },
    queryClient,
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<SubmissionFormInput>();

  const onSubmit: SubmitHandler<SubmissionFormInput> = (data) => {
    if (uploadSub.isPending) return;
    uploadSub.mutate({
      episodeId,
      _package: data.packageName,
      description: data.description,
      sourceCode: data.file[0],
    });
    reset();
  };

  if (!episode.isSuccess) return null;

  const isStaffTeam = teamData.data?.status === Status526Enum.S;
  if (!isStaffTeam && episode.data.frozen)
    return (
      <p>
        Submissions are currently frozen! This is most likely due to a
        submission freeze for a tournament. If you think the freeze has passed,
        try refreshing the page.
      </p>
    );

  return (
    <div>
      <p>Submit your code using the button below.</p>
      <p>
        Create a{" "}
        <span className="rounded-md bg-gray-200 px-1 py-0.5 font-mono">
          zip
        </span>{" "}
        file of your robot player, and submit it below. The submission format
        should be a zip file containing a single folder (which is your package
        name), which should contain{" "}
        <span className="rounded-md bg-gray-200 px-1 py-0.5 font-mono">
          RobotPlayer.java
        </span>{" "}
        and any other code you have written, for example:
      </p>
      <span className="w-full">
        <p className="rounded-md border border-gray-400 bg-gray-100 px-4 py-3 font-mono">
          {
            "submission.zip --> examplefuncsplayer --> RobotPlayer.java, FooBar.java"
          }
        </p>
      </span>
      <form
        onSubmit={(e) => {
          void handleSubmit(onSubmit)(e);
        }}
        className="mt-4 flex flex-col gap-4"
      >
        <div>
          <FormLabel required label="Choose Submission File" />
          <input
            type="file"
            accept=".zip"
            required
            {...register("file", { required: FIELD_REQUIRED_ERROR_MSG })}
          />
        </div>
        <div className="flex w-full flex-row items-end gap-10">
          <Input
            className="w-1/3"
            label="Package Name (i.e. where is RobotPlayer?)"
            required
            errorMessage={errors.packageName?.message}
            {...register("packageName", {
              required: FIELD_REQUIRED_ERROR_MSG,
            })}
          />
          <Input
            className="w-2/3"
            label="Description (for your reference)"
            required
            errorMessage={errors.description?.message}
            {...register("description", {
              required: FIELD_REQUIRED_ERROR_MSG,
            })}
          />
        </div>
        <Button
          className={`max-w-sm ${
            uploadSub.isPending || !isDirty ? "disabled cursor-not-allowed" : ""
          }`}
          variant="dark"
          label="Submit"
          type="submit"
          loading={uploadSub.isPending}
          disabled={uploadSub.isPending || !isDirty}
        />
      </form>
    </div>
  );
};

export default Submissions;
