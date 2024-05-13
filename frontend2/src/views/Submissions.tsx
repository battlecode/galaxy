import React, { useMemo } from "react";
import { useEpisodeId } from "../contexts/EpisodeContext";
import SectionCard from "../components/SectionCard";
import SubHistoryTable from "../components/tables/submissions/SubHistoryTable";
import TourneySubTable from "../components/tables/submissions/TourneySubTable";
import Button from "../components/elements/Button";
import Input from "../components/elements/Input";
import { type SubmitHandler, useForm } from "react-hook-form";
import { FIELD_REQUIRED_ERROR_MSG } from "../utils/constants";
import Spinner from "../components/Spinner";
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
  const queryParams: QueryParams = useMemo(() => {
    return {
      scrimsPage: parsePageParam("scrimsPage", searchParams),
    };
  }, [searchParams]);

  const { data: episode } = useEpisodeInfo({ id: episodeId });

  const { data: subsData, isLoading: subsLoading } = useSubmissionsList(
    {
      episodeId,
      page: queryParams.scrimsPage,
    },
    queryClient,
  );
  const { data: tourneySubData, isLoading: tourneySubsLoading } =
    useTournamentSubmissions({
      episodeId,
    });
  const { data: nextTourneyData, isLoading: nextTourneyLoading } =
    useNextTournament({
      episodeId,
    });

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

      <SectionCard title="Next Submission Deadline" className="mb-8">
        {nextTourneyLoading ? (
          <div className="flex flex-row items-center gap-4">
            <Spinner size="md" />
            <span>Loading...</span>
          </div>
        ) : (
          <TournamentCountdown tournament={nextTourneyData ?? undefined} />
        )}
      </SectionCard>

      <SectionCard title="Submit Code" className="mb-8">
        {episode === undefined ? (
          <>
            <div className="flex flex-row items-center gap-4">
              <Spinner size="md" />
              <span>Loading...</span>
            </div>
          </>
        ) : episode.frozen ? (
          <>
            <p>
              Submissions are currently frozen! This is most likely due to a
              submission freeze for a tournament. If you think the freeze has
              passed, try refreshing the page.
            </p>
          </>
        ) : (
          <>
            <p>Submit your code using the button below.</p>
            <p>
              Create a{" "}
              <span className="rounded-md bg-gray-200 px-1 py-0.5 font-mono">
                zip
              </span>{" "}
              file of your robot player, and submit it below. The submission
              format should be a zip file containing a single folder (which is
              your package name), which should contain{" "}
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
              // eslint-disable-next-line @typescript-eslint/no-misused-promises
              onSubmit={handleSubmit(onSubmit)}
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
                  uploadSub.isPending || !isDirty
                    ? "disabled cursor-not-allowed"
                    : ""
                }`}
                variant="dark"
                label="Submit"
                type="submit"
                loading={uploadSub.isPending}
                disabled={uploadSub.isPending || !isDirty}
              />
            </form>
          </>
        )}
      </SectionCard>

      <SectionCard title="Submission History" className="mb-8">
        <SubHistoryTable
          data={subsData}
          loading={subsLoading}
          page={queryParams.scrimsPage}
          handlePage={(page) => {
            handlePage(page, "scrimsPage");
          }}
        />
      </SectionCard>

      <SectionCard title="Tournament Submission History">
        <TourneySubTable data={tourneySubData} loading={tourneySubsLoading} />
      </SectionCard>
    </div>
  );
};

export default Submissions;
