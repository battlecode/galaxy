import React, { useState, useEffect, useMemo } from "react";
import { NavLink, useParams, useSearchParams } from "react-router-dom";
import {
  StatusBccEnum,
  type PaginatedMatchList,
  type Tournament,
  type EligibilityCriterion,
} from "../utils/types";
import { getTournamentMatches } from "../utils/api/compete";
import { useEpisode, useEpisodeId } from "../contexts/EpisodeContext";
import BattlecodeTable from "../components/BattlecodeTable";
import BattlecodeTableBottomElement from "../components/BattlecodeTableBottomElement";
import { getTournamentInfo } from "../utils/api/episode";
import MatchScore from "../components/compete/MatchScore";
import MatchStatus from "../components/compete/MatchStatus";
import RatingDelta from "../components/compete/RatingDelta";
import { dateTime } from "../utils/dateTime";
import AsyncSelectMenu from "../components/elements/AsyncSelectMenu";
import { loadTeamOptions } from "../utils/loadTeams";
import Loading from "../components/Loading";
import SectionCard from "../components/SectionCard";
import Tooltip from "../components/elements/Tooltip";
import Collapse from "../components/elements/Collapse";
import Icon from "../components/elements/Icon";

interface QueryParams {
  page: number;
}

const getParamEntries = (prev: URLSearchParams): Record<string, string> => {
  return Object.fromEntries(prev);
};

const TournamentPage: React.FC = () => {
  const { episodeId } = useEpisodeId();
  const episode = useEpisode();
  const { tournamentId } = useParams();

  const [searchParams, setSearchParams] = useSearchParams();

  const parsePageParam = (paramName: string): number =>
    parseInt(searchParams.get(paramName) ?? "1");

  const queryParams: QueryParams = useMemo(() => {
    return {
      page: parsePageParam("page"),
    };
  }, [searchParams]);

  const [tourneyInfo, setTourneyInfo] = useState<Tournament | undefined>(
    undefined,
  );
  const [matches, setMatches] = useState<PaginatedMatchList | undefined>(
    undefined,
  );
  const [selectedTeam, setSelectedTeam] = useState<{
    value: number;
    label: string;
  } | null>(null);

  const [infoLoading, setInfoLoading] = useState<boolean>(false);
  const [matchesLoading, setMatchesLoading] = useState<boolean>(false);

  /**
   * A wrapper function that returns the value/label pairs for the AsyncSelectMenu.
   * @param inputValue The search string from the menu
   * @returns An array of value/label pairs for the menu
   */
  const loadSelectOptions = async (
    inputValue: string,
  ): Promise<Array<{ value: number; label: string }>> => {
    return loadTeamOptions(episodeId, inputValue, true, 1);
  };

  const eligibility: {
    includes: EligibilityCriterion[];
    excludes: EligibilityCriterion[];
    isEligible: boolean;
  } = useMemo(() => {
    if (episode === undefined || tourneyInfo === undefined) {
      return { includes: [], excludes: [], isEligible: false };
    }
    const includes =
      tourneyInfo.eligibility_includes
        ?.map((inc) => episode.eligibility_criteria[inc])
        .filter((inc) => inc !== null && inc !== undefined) ?? [];
    const excludes =
      tourneyInfo.eligibility_excludes
        ?.map((exc) => episode.eligibility_criteria[exc])
        .filter((exc) => exc !== null && exc !== undefined) ?? [];
    const isEligible = tourneyInfo?.is_eligible ?? false;
    return { includes, excludes, isEligible };
  }, [tourneyInfo, episode]);

  useEffect(() => {
    let isActiveLookup = true;
    if (infoLoading || tournamentId === undefined) return;
    setInfoLoading(true);
    setTourneyInfo(undefined);

    const fetchTourneyInfo = async (): Promise<void> => {
      try {
        const result = await getTournamentInfo(episodeId, tournamentId);
        if (isActiveLookup) {
          setTourneyInfo(result);
        }
      } catch (err) {
        if (isActiveLookup) {
          setTourneyInfo(undefined);
        }
        console.error(err);
      } finally {
        if (isActiveLookup) {
          setInfoLoading(false);
        }
      }
    };

    void fetchTourneyInfo();

    return () => {
      isActiveLookup = false;
    };
  }, [episodeId, tournamentId]);

  useEffect(() => {
    let isActiveLookup = true;
    if (matchesLoading) return;
    setMatchesLoading(true);
    setMatches((prev) => ({ count: prev?.count ?? 0 }));

    const fetchMatches = async (): Promise<void> => {
      try {
        const result = await getTournamentMatches(
          episodeId,
          selectedTeam?.value ?? undefined,
          tournamentId,
          undefined, // We don't need to filter on the tournament round for now
          queryParams.page,
        );
        if (isActiveLookup) {
          setMatches(result);
        }
      } catch (err) {
        if (isActiveLookup) {
          setMatches(undefined);
        }
        console.error(err);
      } finally {
        if (isActiveLookup) {
          setMatchesLoading(false);
        }
      }
    };

    void fetchMatches();

    return () => {
      isActiveLookup = false;
    };
  }, [episodeId, tournamentId, selectedTeam, queryParams.page]);

  if (infoLoading || tourneyInfo === undefined || episode === undefined) {
    return <Loading />;
  }

  return (
    <div className="flex h-full w-full flex-col bg-white p-6">
      <div className="flex flex-1 flex-col gap-8">
        <h1>Tournament {tourneyInfo?.name_long ?? tournamentId}</h1>
        <SectionCard title="About">
          {tourneyInfo.blurb !== undefined && <p>{tourneyInfo.blurb}</p>}
          <Collapse title="More Info">
            <div className="grid max-w-4xl grid-cols-2 gap-2">
              <p>Tournament Date:</p>
              <p>{dateTime(tourneyInfo?.display_date).localFullString}</p>

              <p>Eligible?:</p>
              <div className="flex flex-row items-center space-x-2">
                <span>{`Your team is ${
                  eligibility.isEligible ? "" : "not"
                } eligible!`}</span>
                <Icon
                  className={
                    eligibility.isEligible ? "text-green-700" : "text-red-700"
                  }
                  name={eligibility.isEligible ? "check" : "x_mark"}
                  size={"lg"}
                />
              </div>

              <p>Not Eligible:</p>
              {eligibility.excludes.length > 0 ? (
                <>
                  {eligibility.excludes.map((exc) => (
                    <Tooltip key={"icon " + exc.id.toString()} text={exc.title}>
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
                    <Tooltip key={"icon " + inc.id.toString()} text={inc.title}>
                      {inc.icon}
                    </Tooltip>
                  ))}
                </>
              ) : (
                <p>N/A</p>
              )}

              <p>Submission Freeze:</p>
              <p>{dateTime(tourneyInfo?.submission_freeze).localFullString}</p>

              <p>Submission Unfreeze:</p>
              <p>
                {dateTime(tourneyInfo?.submission_unfreeze).localFullString}
              </p>

              <p>Requires Resume?:</p>
              <p>{tourneyInfo.require_resume ? "Yes" : "No"}</p>
            </div>
          </Collapse>
        </SectionCard>
        <SectionCard title="Results">
          <div className="mb-4 w-96 gap-5">
            <AsyncSelectMenu<number>
              onChange={(team) => {
                setSelectedTeam(team);
                setSearchParams((prev) => ({
                  ...getParamEntries(prev),
                  page: "1",
                }));
              }}
              selected={selectedTeam}
              loadOptions={loadSelectOptions}
              placeholder="Search for a team..."
            />
          </div>
          <BattlecodeTable
            data={matches?.results ?? []}
            loading={matchesLoading}
            columns={[
              {
                header: "Team (Δ)",
                value: (r) => {
                  const participant = r.participants[0];
                  if (participant !== undefined) {
                    return (
                      <RatingDelta
                        participant={participant}
                        ranked={r.is_ranked}
                      />
                    );
                  }
                },
              },
              {
                header: "Score",
                value: (r) => <MatchScore match={r} />,
              },
              {
                header: "Team (Δ)",
                value: (r) => {
                  const participant = r.participants[1];
                  if (participant !== undefined) {
                    return (
                      <RatingDelta
                        participant={participant}
                        ranked={r.is_ranked}
                      />
                    );
                  }
                },
              },
              {
                header: "Ranked?",
                value: (r) => (r.is_ranked ? "Ranked" : "Unranked"),
              },
              {
                header: "Status",
                value: (r) => <MatchStatus match={r} />,
              },
              {
                header: "Replay",
                value: (match) =>
                  episode === undefined || match.status !== StatusBccEnum.Ok ? (
                    <></>
                  ) : (
                    <NavLink
                      className="text-cyan-600 hover:underline"
                      to={`https://releases.battlecode.org/client/${
                        episode.artifact_name ?? ""
                      }/${
                        episode.release_version_public ?? ""
                      }/visualizer.html?${match.replay_url}`}
                    >
                      Replay!
                    </NavLink>
                  ),
              },
              {
                header: "Created",
                value: (r) => dateTime(r.created).localFullString,
              },
            ]}
            bottomElement={
              <BattlecodeTableBottomElement
                totalCount={matches?.count ?? 0}
                pageSize={10}
                currentPage={queryParams.page}
                onPage={(page) => {
                  if (!matchesLoading) {
                    setSearchParams((prev) => ({
                      ...getParamEntries(prev),
                      page: page.toString(),
                    }));
                  }
                }}
              />
            }
          />
        </SectionCard>
      </div>
    </div>
  );
};

export default TournamentPage;
