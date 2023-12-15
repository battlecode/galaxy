import React, { useState, useMemo } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { type EligibilityCriterion } from "../api/_autogen";
import { useEpisodeId } from "../contexts/EpisodeContext";
import { dateTime } from "../utils/dateTime";
import AsyncSelectMenu from "../components/elements/AsyncSelectMenu";
import { loadTeamOptions } from "../utils/loadTeams";
import Loading from "../components/Loading";
import SectionCard from "../components/SectionCard";
import Tooltip from "../components/elements/Tooltip";
import Collapse from "../components/elements/Collapse";
import Icon from "../components/elements/Icon";
import { getParamEntries, parsePageParam } from "../utils/searchParamHelpers";
import EligibilityIcon from "../components/EligibilityIcon";
import TournamentResultsTable from "../components/tables/TournamentResultsTable";
import { useEpisodeInfo, useTournamentInfo } from "../api/episode/useEpisode";
import { useTournamentMatchList } from "../api/compete/useCompete";
import { useQueryClient } from "@tanstack/react-query";

interface QueryParams {
  page: number;
}

const TournamentPage: React.FC = () => {
  const { episodeId } = useEpisodeId();
  const queryClient = useQueryClient();

  const { tournamentId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryParams: QueryParams = useMemo(() => {
    return {
      page: parsePageParam("page", searchParams),
    };
  }, [searchParams]);

  const { data: episode } = useEpisodeInfo({
    id: episodeId,
  });
  const tourneyData = useTournamentInfo({
    episodeId,
    id: tournamentId ?? "",
  });
  const { data: matches, isLoading: matchesLoading } = useTournamentMatchList(
    {
      episodeId,
      tournamentId: tournamentId ?? "",
      page: queryParams.page,
    },
    queryClient,
  );

  const [selectedTeam, setSelectedTeam] = useState<{
    value: number;
    label: string;
  } | null>(null);

  const eligibility: {
    includes: EligibilityCriterion[];
    excludes: EligibilityCriterion[];
    isEligible: boolean;
  } = useMemo(() => {
    if (episode === undefined || tourneyData.data === undefined) {
      return { includes: [], excludes: [], isEligible: false };
    }
    const includes =
      tourneyData.data.eligibility_includes
        ?.map((inc) => episode.eligibility_criteria[inc])
        .filter((inc) => inc !== null && inc !== undefined) ?? [];
    const excludes =
      tourneyData.data.eligibility_excludes
        ?.map((exc) => episode.eligibility_criteria[exc])
        .filter((exc) => exc !== null && exc !== undefined) ?? [];
    const isEligible = tourneyData.data?.is_eligible ?? false;
    return { includes, excludes, isEligible };
  }, [tourneyData.data, episode]);

  return (
    <div className="flex h-full w-full flex-col bg-white p-6">
      <div className="flex flex-1 flex-col gap-8">
        <h1>Tournament {tourneyData.data?.name_long ?? tournamentId}</h1>
        <SectionCard title="About">
          {!tourneyData.isSuccess ? (
            <Loading />
          ) : (
            <>
              {tourneyData.data.blurb !== undefined && (
                <p>{tourneyData.data.blurb}</p>
              )}
              <Collapse title="More Info">
                <div className="grid max-w-4xl grid-cols-2 gap-2">
                  <p>Tournament Date:</p>
                  <p>
                    {dateTime(tourneyData.data?.display_date).localFullString}
                  </p>

                  <p>Eligible?:</p>
                  <div className="flex flex-row items-center space-x-2">
                    <span>{`Your team is ${
                      eligibility.isEligible ? "" : "not"
                    } eligible!`}</span>
                    <Icon
                      className={
                        eligibility.isEligible
                          ? "text-green-700"
                          : "text-red-700"
                      }
                      name={eligibility.isEligible ? "check" : "x_mark"}
                      size={"lg"}
                    />
                  </div>

                  <p>Not Eligible:</p>
                  {eligibility.excludes.length > 0 ? (
                    <>
                      {eligibility.excludes.map((exc) => (
                        <Tooltip
                          key={"icon " + exc.id.toString()}
                          text={exc.title}
                        >
                          <span className="mr-2">{exc.icon}</span>
                        </Tooltip>
                      ))}
                    </>
                  ) : (
                    <p>N/A</p>
                  )}

                  <p>Eligible:</p>
                  {eligibility.includes.length > 0 ? (
                    <>
                      {eligibility.includes.map((inc) => (
                        <EligibilityIcon
                          key={"icon " + inc.id.toString()}
                          criterion={inc}
                        />
                      ))}
                    </>
                  ) : (
                    <p>N/A</p>
                  )}

                  <p>Submission Freeze:</p>
                  <p>
                    {
                      dateTime(tourneyData.data?.submission_freeze)
                        .localFullString
                    }
                  </p>

                  <p>Submission Unfreeze:</p>
                  <p>
                    {
                      dateTime(tourneyData.data?.submission_unfreeze)
                        .localFullString
                    }
                  </p>

                  <p>Requires Resume?:</p>
                  <p>{tourneyData.data.require_resume ? "Yes" : "No"}</p>
                </div>
              </Collapse>
            </>
          )}
        </SectionCard>
        <SectionCard title="Results">
          <div className="mb-4 max-w-md gap-5">
            <AsyncSelectMenu<number>
              onChange={(team) => {
                setSelectedTeam(team);
                setSearchParams((prev) => ({
                  ...getParamEntries(prev),
                  page: "1",
                }));
              }}
              selected={selectedTeam}
              loadOptions={async (searchString) =>
                await loadTeamOptions(episodeId, searchString, 1)
              }
              placeholder="Search for a team..."
            />
          </div>
          <TournamentResultsTable
            data={matches}
            loading={matchesLoading}
            page={queryParams.page}
            episode={episode}
            handlePage={(page) => {
              setSearchParams((prev) => ({
                ...getParamEntries(prev),
                page: page.toString(),
              }));
            }}
          />
        </SectionCard>
      </div>
    </div>
  );
};

export default TournamentPage;
