import type React from "react";
import { useState, useMemo } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { type EligibilityCriterion, StyleEnum } from "../api/_autogen";
import { useEpisodeId } from "../contexts/EpisodeContext";
import { dateTime } from "../utils/dateTime";
import SectionCard from "../components/SectionCard";
import Tooltip from "../components/elements/Tooltip";
import Collapse from "../components/elements/Collapse";
import Icon from "../components/elements/Icon";
import { PageContainer } from "components/elements/BattlecodeStyle";
import { getParamEntries, parsePageParam } from "../utils/searchParamHelpers";
import EligibilityIcon from "../components/EligibilityIcon";
import TournamentResultsTable from "../components/tables/TournamentResultsTable";
import { useEpisodeInfo, useTournamentInfo } from "../api/episode/useEpisode";
import { useTournamentMatchList } from "../api/compete/useCompete";
import { useQueryClient } from "@tanstack/react-query";
import SearchTeamsMenu from "../components/team/SearchTeamsMenu";
import { getEligibilities } from "api/helpers";

interface QueryParams {
  page: number;
}

const StyleToLabel: Record<StyleEnum, string> = {
  [StyleEnum.Se]: "Single Elimination",
  [StyleEnum.De]: "Double Elimination",
};

const Tournament: React.FC = () => {
  const { episodeId } = useEpisodeId();
  const queryClient = useQueryClient();

  const { tournamentId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryParams: QueryParams = useMemo(
    () => ({
      page: parsePageParam("page", searchParams),
    }),
    [searchParams],
  );

  const [selectedTeam, setSelectedTeam] = useState<{
    value: number;
    label: string;
  } | null>(null);

  const episode = useEpisodeInfo({
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
      teamId: selectedTeam?.value,
      page: queryParams.page,
    },
    queryClient,
  );

  const eligibility: {
    includes: EligibilityCriterion[];
    excludes: EligibilityCriterion[];
    isEligible: boolean;
  } = useMemo(() => {
    if (!episode.isSuccess || !tourneyData.isSuccess) {
      return { includes: [], excludes: [], isEligible: false };
    }

    const includes = getEligibilities(
      episode.data.eligibility_criteria,
      tourneyData.data.eligibility_includes ?? [],
    );

    const excludes = getEligibilities(
      episode.data.eligibility_criteria,
      tourneyData.data.eligibility_excludes ?? [],
    );

    const isEligible = tourneyData.data.is_eligible;

    return { includes, excludes, isEligible };
  }, [tourneyData.data, episode]);

  return (
    <PageContainer>
      <div className="flex flex-1 flex-col gap-8">
        <h1>Tournament {tourneyData.data?.name_long ?? tournamentId}</h1>
        <SectionCard title="About" loading={tourneyData.isLoading}>
          {tourneyData.isSuccess && (
            <>
              {tourneyData.data.blurb !== undefined && (
                <p>{tourneyData.data.blurb}</p>
              )}
              <Collapse title="More Info">
                <div className="grid max-w-4xl grid-cols-2 gap-2">
                  <p>Tournament Date:</p>
                  <p>
                    {dateTime(tourneyData.data.display_date).zeroOffsetShortStr}
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
                    <div className="flex flex-row gap-2">
                      {eligibility.excludes.map((exc) => (
                        <Tooltip
                          key={"icon " + exc.id.toString()}
                          text={exc.title}
                        >
                          <span className="mr-2">{exc.icon}</span>
                        </Tooltip>
                      ))}
                    </div>
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

                  <p>Format:</p>
                  <p>{StyleToLabel[tourneyData.data.style]}</p>

                  <p>Submission Freeze:</p>
                  <p>
                    {
                      dateTime(tourneyData.data.submission_freeze)
                        .localFullString
                    }
                  </p>

                  <p>Submission Unfreeze:</p>
                  <p>
                    {
                      dateTime(tourneyData.data.submission_unfreeze)
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
            <SearchTeamsMenu
              onChange={(team) => {
                setSelectedTeam(team);
                setSearchParams((prev) => ({
                  ...getParamEntries(prev),
                  page: "1",
                }));
              }}
              selected={selectedTeam}
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
    </PageContainer>
  );
};

export default Tournament;
