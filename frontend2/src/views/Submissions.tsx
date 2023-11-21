import React, { useEffect, useState } from "react";
import type { Maybe } from "../utils/utilTypes";
import type {
  Tournament,
  PaginatedSubmissionList,
  TournamentSubmission,
} from "../utils/types";
import { useEpisode, useEpisodeId } from "../contexts/EpisodeContext";
import {
  getAllSubmissions,
  getAllUserTournamentSubmissions,
  uploadSubmission,
} from "../utils/api/compete";
import SectionCard from "../components/SectionCard";
import SubHistoryTable from "../components/tables/submissions/SubHistoryTable";
import TourneySubTable from "../components/tables/submissions/TourneySubTable";
import Button from "../components/elements/Button";
import Input from "../components/elements/Input";
import FileUpload from "../components/FileUpload";
import { type SubmitHandler, useForm } from "react-hook-form";
import type { SubmissionUploadRequest } from "../utils/apiTypes";
import { FIELD_REQUIRED_ERROR_MSG } from "../utils/constants";
import { getNextTournament } from "../utils/api/episode";
import Spinner from "../components/Spinner";
import TournamentCountdown from "../components/compete/TournamentCountdown";

interface SubmissionFormInput {
  file: FileList;
  packageName: string;
  description: string;
}

const Submissions: React.FC = () => {
  const { episodeId } = useEpisodeId();
  const episode = useEpisode();
  const { register, handleSubmit } = useForm<SubmissionFormInput>();

  const [subsLoading, setSubsLoading] = useState<boolean>(false);
  const [tourneySubsLoading, setTourneySubsLoading] = useState<boolean>(false);
  const [nextTourneyLoading, setNextTourneyLoading] = useState<boolean>(false);

  const [subData, setSubData] = useState<Maybe<PaginatedSubmissionList>>();
  const [tourneySubData, setTourneySubData] =
    useState<Maybe<TournamentSubmission[]>>();
  const [nextTourneyData, setNextTourneyData] = useState<Maybe<Tournament>>();

  const [submitting, setSubmitting] = useState<boolean>(false);
  const [subError, setSubError] = useState<Maybe<string>>();

  const onSubmit: SubmitHandler<SubmissionFormInput> = async (data) => {
    if (submitting) return;
    setSubmitting(true);
    try {
      await uploadSubmission(episodeId, {
        ...data,
        file: data.file[0],
      });
    } catch (err) {
      setSubError(`${err as string}`);
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    let isActiveLookup = true;
    if (subsLoading) return;
    setSubsLoading(true);
    setSubData((prev) => ({ count: prev?.count ?? 0 }));

    const fetchSubs = async (): Promise<void> => {
      try {
        const result = await getAllSubmissions(episodeId, 1);
        if (isActiveLookup) {
          setSubData(result);
        }
      } catch (err) {
        if (isActiveLookup) {
          setSubData(undefined);
        }
        console.error(err);
      } finally {
        if (isActiveLookup) {
          setSubsLoading(false);
        }
      }
    };

    void fetchSubs();

    return () => {
      isActiveLookup = false;
    };
  }, [episodeId]);

  useEffect(() => {
    let isActiveLookup = true;
    if (tourneySubsLoading) return;
    setTourneySubsLoading(true);
    setTourneySubData([]);

    const fetchTourneySubs = async (): Promise<void> => {
      try {
        const result = await getAllUserTournamentSubmissions(episodeId);
        if (isActiveLookup) {
          setTourneySubData(result);
        }
      } catch (err) {
        if (isActiveLookup) {
          setTourneySubData(undefined);
        }
        console.error(err);
      } finally {
        if (isActiveLookup) {
          setTourneySubsLoading(false);
        }
      }
    };

    void fetchTourneySubs();

    return () => {
      isActiveLookup = false;
    };
  }, [episodeId]);

  useEffect(() => {
    let isActiveLookup = true;
    if (nextTourneyLoading) return;
    setNextTourneyLoading(true);
    setNextTourneyData(undefined);

    const fetchNextTourney = async (): Promise<void> => {
      try {
        const result = await getNextTournament(episodeId);
        if (isActiveLookup) {
          setNextTourneyData(result);
        }
      } catch (err) {
        if (isActiveLookup) {
          setNextTourneyData(undefined);
        }
        console.error(err);
      } finally {
        if (isActiveLookup) {
          setNextTourneyLoading(false);
        }
      }
    };

    void fetchNextTourney();

    return () => {
      isActiveLookup = false;
    };
  }, [episodeId]);

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
          <TournamentCountdown tournament={nextTourneyData} />
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
              className="mt-4 flex flex-col"
            >
              <FileUpload
                label="Choose Submission File"
                fileInputHelp="Java .zip File (5MB max)"
                errorMessage={subError}
                required
                accept=".zip"
                {...register("file", { required: FIELD_REQUIRED_ERROR_MSG })}
              />
              {/* <div className="flex w-full flex-row items-center gap-10"> */}
              <Input
                className="w-1/3"
                label="Package Name (i.e. where is RobotPlayer?)"
                required
                {...register("packageName", {
                  required: FIELD_REQUIRED_ERROR_MSG,
                })}
              />
              <Input
                className="w-2/3"
                label="Description (for your reference)"
                required
                {...register("description", {
                  required: FIELD_REQUIRED_ERROR_MSG,
                })}
              />
              {/* </div> */}
              <Button
                className="mt-4 max-w-sm"
                variant="dark"
                label="Submit"
                type="submit"
                loading={submitting}
                disabled={submitting}
              />
            </form>
          </>
        )}
      </SectionCard>

      <SectionCard title="Submission History" className="mb-8">
        <SubHistoryTable data={subData} loading={subsLoading} />
      </SectionCard>

      <SectionCard title="Tournament Submission History">
        <TourneySubTable data={tourneySubData} loading={tourneySubsLoading} />
      </SectionCard>
    </div>
  );
};

export default Submissions;
