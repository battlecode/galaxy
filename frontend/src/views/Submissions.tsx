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
  useTournamentSubmissions,
  useUploadSubmission,
} from "../api/compete/useCompete";
import { useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { getParamEntries, parsePageParam } from "../utils/searchParamHelpers";
import { LanguageEnum } from "api/_autogen";
import { PageTitle, PageContainer } from "components/elements/BattlecodeStyle";
import { useCurrentUserInfo } from "api/user/useUser";

interface SubmissionFormInput {
  file: FileList;
  packageName: string;
  description: string;
}

interface QueryParams {
  subsPage: number;
}

const Submissions: React.FC = () => {
  const { episodeId } = useEpisodeId();

  const [searchParams, setSearchParams] = useSearchParams();
  const queryParams: QueryParams = useMemo(
    () => ({
      subsPage: parsePageParam("subsPage", searchParams),
    }),
    [searchParams],
  );

  const episode = useEpisodeInfo({ id: episodeId });

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
    <PageContainer>
      <PageTitle>Submissions</PageTitle>

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
          page={queryParams.subsPage}
          handlePage={(page) => {
            handlePage(page, "subsPage");
          }}
        />
      </SectionCard>

      <SectionCard title="Tournament Submission History">
        <TourneySubTable
          data={tourneySubs.data}
          loading={tourneySubs.isLoading}
        />
      </SectionCard>
    </PageContainer>
  );
};

const CodeSubmission: React.FC = () => {
  const { episodeId } = useEpisodeId();
  const queryClient = useQueryClient();

  const userData = useCurrentUserInfo();
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

  const userIsStaff = userData.isSuccess && userData.data.is_staff;
  if (!userIsStaff && episode.data.frozen)
    return (
      <p>
        Submissions are currently frozen! This is most likely due to a
        submission freeze for a tournament. If you think the freeze has passed,
        try refreshing the page.
      </p>
    );

  if (episode.data.language === LanguageEnum.Py3) {
    return (
      <div>
        <p>Submit your python code using the button below.</p>
        <p>
          Create a{" "}
          <span className="rounded-md bg-gray-200 px-1 py-0.5 font-mono">
            zip
          </span>{" "}
          file of your robot player, and submit it below. The submission format
          should be a zip file containing a single folder (which is your package
          name), which should contain{" "}
          <span className="rounded-md bg-gray-200 px-1 py-0.5 font-mono">
            bot.py
          </span>{" "}
          and any other code you have written, for example:
        </p>
        <span className="w-full">
          <p className="rounded-md border border-gray-400 bg-gray-100 px-4 py-3 font-mono">
            {"submission.zip --> examplefuncsplayer --> bot.py, utils.py"}
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
          <div className="flex w-full flex-col items-start gap-4 lg:flex-row lg:items-end">
            <Input
              className="w-full lg:w-1/3"
              label="Package Name (i.e. examplefuncsplayer)"
              required
              errorMessage={errors.packageName?.message}
              {...register("packageName", {
                required: FIELD_REQUIRED_ERROR_MSG,
              })}
            />
            <Input
              className="w-full lg:w-2/3"
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
      </div>
    );
  } else {
    return (
      <div>
        <p>Submit your java code using the button below.</p>
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
          <div className="flex w-full flex-col items-start gap-4 lg:flex-row lg:items-end">
            <Input
              className="w-full lg:w-1/3"
              label="Package Name (i.e. examplefuncsplayer)"
              required
              errorMessage={errors.packageName?.message}
              {...register("packageName", {
                required: FIELD_REQUIRED_ERROR_MSG,
              })}
            />
            <Input
              className="w-full lg:w-2/3"
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
      </div>
    );
  }
};

export default Submissions;
