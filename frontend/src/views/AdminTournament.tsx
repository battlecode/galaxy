import { Tab } from "@headlessui/react";
import { useQueryClient } from "@tanstack/react-query";
import {
  type PaginatedMatchList,
  ReleaseStatusEnum,
  StatusBccEnum,
  type TournamentRound,
} from "api/_autogen";
import { tournamentMatchListFactory } from "api/compete/competeFactories";
import { useTournamentMatchList } from "api/compete/useCompete";
import {
  useCreateAndEnqueueMatches,
  useEpisodeInfo,
  useEpisodeMaps,
  useInitializeTournament,
  useReleaseTournamentRound,
  useRequeueTournamentRound,
  useTournamentInfo,
  useTournamentRoundInfo,
  useTournamentRoundList,
} from "api/episode/useEpisode";
import { buildKey, classNames } from "api/helpers";
import { PageTitle } from "components/elements/BattlecodeStyle";
import Button from "components/elements/Button";
import Icon from "components/elements/Icon";
import SelectMultipleMenu from "components/elements/SelectMultipleMenu";
import Tooltip from "components/elements/Tooltip";
import Modal from "components/Modal";
import SectionCard from "components/SectionCard";
import Spinner from "components/Spinner";
import { PageButtonsList } from "components/TableBottom";
import TournamentResultsTable from "components/tables/TournamentResultsTable";
import { useEpisodeId } from "contexts/EpisodeContext";
import type React from "react";
import { useCallback, useMemo, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { parsePageParam } from "utils/searchParamHelpers";
import { isPresent } from "utils/utilTypes";

interface QueryParams {
  roundPage: number;
}

const AdminTournament: React.FC = () => {
  const { episodeId } = useEpisodeId();
  const { tournamentId } = useParams();

  const [searchParams, setSearchParams] = useSearchParams();

  const queryParams: QueryParams = useMemo(
    () => ({
      roundPage: parsePageParam("roundPage", searchParams),
    }),
    [searchParams],
  );

  function handlePage(page: number): void {
    if (!tournamentRounds.isLoading) {
      setSearchParams({ ...queryParams, roundPage: page.toString() });
    }
  }

  const queryClient = useQueryClient();

  const episode = useEpisodeInfo({ id: episodeId });
  const tournament = useTournamentInfo({
    episodeId,
    id: tournamentId ?? "",
  });
  const tournamentRounds = useTournamentRoundList(
    {
      episodeId,
      tournament: tournamentId ?? "",
      page: queryParams.roundPage,
    },
    queryClient,
  );

  const initializeTournament = useInitializeTournament(
    { episodeId, id: tournamentId ?? "" },
    queryClient,
  );

  const [initializeModalOpen, setInitializeModalOpen] = useState(false);

  const LOADING = tournament.isLoading || tournamentRounds.isLoading;
  const SUCCESS = tournament.isSuccess && tournamentRounds.isSuccess;

  const TABLIST_STYLE = "flex space-x-1 rounded-xl bg-cyan-600 p-1";

  const canInitialize = useMemo(() => {
    if (LOADING || !SUCCESS) return false;

    // We can only initialize if there are no rounds yet
    return tournamentRounds.data.count === 0;
  }, [tournament, tournamentRounds]);

  const sortedRounds = useMemo(
    () =>
      tournamentRounds.data?.results?.sort(
        (a, b) => a.display_order - b.display_order,
      ) ?? [],
    [tournamentRounds],
  );

  /**
   * Round is active if:
   *  - it is not released
   *  - it has been sent to Saturn and the next round has not been sent
   *  - it is the earliest round that has not been sent to Saturn and
   *    the round before it has been completed
   */
  const isActive = useCallback(
    (round: TournamentRound) => {
      if (
        LOADING ||
        !SUCCESS ||
        (round.release_status ?? ReleaseStatusEnum.NUMBER_0) ===
          ReleaseStatusEnum.NUMBER_2
      )
        return false;

      /**
       * Whether the round has been started, i.e. sent to Saturn.
       */
      const hasStarted = (round: TournamentRound): boolean =>
        round.in_progress ?? false;

      const roundIndex = sortedRounds.findIndex((r) => r.id === round.id);
      if (roundIndex === -1) return false;

      const isEarliestUnsentRound =
        sortedRounds.findIndex((sr) => !hasStarted(sr)) === roundIndex;

      const prevRound: TournamentRound | undefined =
        sortedRounds[roundIndex - 1];
      const nextRound: TournamentRound | undefined =
        sortedRounds[roundIndex + 1];

      // Has been sent to Saturn and next round has not been sent
      if (
        hasStarted(round) &&
        (!isPresent(nextRound) || !hasStarted(nextRound))
      )
        return true;
      // Earliest round that has not been sent to Saturn and round before it has been completed
      else if (
        isEarliestUnsentRound &&
        (!isPresent(prevRound) || hasStarted(prevRound))
      )
        return true;
      else return false;
    },
    [LOADING, SUCCESS, sortedRounds],
  );

  /**
   * Can attempt a requeue if:
   * - the round is active
   * - the round has been sent to Saturn
   * - the round has no matches in progress
   * - the round is not released
   *
   * Note that requeue may fail if there are no failed matches for this round.
   */
  const canRequeue = useCallback(
    (round: TournamentRound) => {
      if (LOADING || !SUCCESS) return false;
      else if (
        !isActive(round) ||
        !(round.in_progress ?? false) ||
        round.release_status === ReleaseStatusEnum.NUMBER_2
      )
        return false;

      const matches = queryClient.getQueryData<PaginatedMatchList>(
        buildKey(tournamentMatchListFactory.queryKey, {
          episodeId,
          tournamentId,
          roundId: round.id,
        }),
      );

      if (!isPresent(matches)) return false;

      // TODO: should we waterfall every page of matches?
      return (
        matches.results?.find(
          (match) =>
            match.status === StatusBccEnum.Run ||
            match.status === StatusBccEnum.Try ||
            match.status === StatusBccEnum.Que,
        ) === undefined
      );
    },
    [isActive, LOADING, SUCCESS, episodeId, tournamentId],
  );

  return (
    <div className="flex h-full w-full flex-col gap-4 p-6">
      <PageTitle>
        Admin Settings{" "}
        {tournament.isSuccess ? `for ${tournament.data.name_long}` : ""}
      </PageTitle>

      <Tooltip text="Creates bracket and spawns rounds.">
        <Button
          disabled={!canInitialize}
          loading={LOADING}
          label="Initialize!"
          iconName={
            (tournamentRounds.data?.count ?? 0) > 0 ? "check" : "play_circle"
          }
          onClick={() => {
            setInitializeModalOpen(true);
          }}
        />
      </Tooltip>

      <SectionCard
        title="Information"
        loading={tournament.isLoading || episode.isLoading}
      >
        {tournament.isSuccess && episode.isSuccess && (
          <div className="grid max-w-96 grid-cols-2 items-center justify-start text-gray-700">
            <span className="font-semibold">Public Challonge:</span>
            <Button
              label="Go!"
              fullWidth={false}
              onClick={() => {
                window.open(
                  `https://www.challonge.com/${tournament.data.name_short}`,
                  "_blank",
                );
              }}
            />

            {/* TODO: is there any way to link to tournament viewer? */}
          </div>
        )}
      </SectionCard>

      <SectionCard title="Manage Rounds" loading={tournamentRounds.isLoading}>
        <div className="mb-4 flex w-full flex-row justify-center">
          <PageButtonsList
            recordCount={tournamentRounds.data?.count ?? 0}
            pageSize={10}
            currentPage={queryParams.roundPage}
            onPage={(newPage) => {
              handlePage(newPage);
            }}
          />
        </div>

        {tournamentRounds.isSuccess && (
          <Tab.Group>
            <Tab.List className={TABLIST_STYLE}>
              {sortedRounds.map((round) => (
                <RoundTab
                  key={round.id}
                  tournamentId={round.tournament}
                  roundId={round.id}
                  activeRound={isActive(round)}
                />
              ))}
            </Tab.List>
            {sortedRounds.map((round) => (
              <RoundPanel
                key={round.id}
                round={round}
                activeRound={isActive(round)}
                canRequeue={canRequeue}
              />
            ))}
          </Tab.Group>
        )}
      </SectionCard>

      <Modal
        isOpen={initializeModalOpen}
        closeModal={() => {
          setInitializeModalOpen(false);
        }}
        title={`Initialize ${tournament.data?.name_long ?? ""}`}
      >
        <div className="mt-4 flex flex-col gap-4">
          <span className="font-semibold text-gray-700">
            Are you sure you want to initialize this tournament? Initializing
            will seed the tournament with eligible teams in order of decreasing
            rating, populate the brackets in the bracket service, and create
            tournament rounds.
          </span>
          <div className="mt-2 flex flex-row gap-4">
            <Button
              label="Confirm"
              variant="dark"
              fullWidth
              loading={initializeTournament.isPending}
              onClick={() => {
                initializeTournament.mutate({
                  episodeId,
                  id: tournamentId ?? "",
                });
                setInitializeModalOpen(false);
              }}
            />
            <Button
              fullWidth
              label="Cancel"
              onClick={() => {
                setInitializeModalOpen(false);
              }}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

interface RoundTabProps {
  tournamentId: string;
  roundId: number;
  activeRound: boolean;
}

const RoundTab: React.FC<RoundTabProps> = ({
  tournamentId,
  roundId,
  activeRound,
}) => {
  const { episodeId } = useEpisodeId();

  const round = useTournamentRoundInfo({
    episodeId,
    tournament: tournamentId,
    id: roundId.toString(),
  });

  const tabClassName = useCallback(({ selected }: { selected: boolean }) => {
    const classes = [
      "w-full rounded-lg py-2.5 text-sm font-medium leading-5 min-w-10",
      "ring-white/60 ring-offset-2 ring-offset-cyan-400 focus:outline-none focus:ring-2",
    ];

    if (selected) {
      classes.push("bg-white text-cyan-700 shadow");
    } else {
      classes.push("text-cyan-100 hover:bg-white/[0.12] hover:text-white");
    }

    return classNames(...classes);
  }, []);

  return (
    <Tab className={tabClassName}>
      <div className="flex w-full flex-col items-center justify-center gap-2">
        {round.data?.name ?? <Spinner size="sm" />}
        {round.isSuccess && activeRound ? (
          <Icon size="sm" name="exclamation_triangle" />
        ) : (
          <Icon size="sm" name="lock_closed" />
        )}
      </div>
    </Tab>
  );
};

interface RoundPanelProps {
  round: TournamentRound;
  activeRound: boolean;
  canRequeue: (round: TournamentRound) => boolean;
}

const RELEASE_STATUS_LABELS: Record<ReleaseStatusEnum, string> = {
  [ReleaseStatusEnum.NUMBER_0]: "Fully Hidden",
  [ReleaseStatusEnum.NUMBER_1]: "Participants Only",
  [ReleaseStatusEnum.NUMBER_2]: "Fully Released",
};

const RoundPanel: React.FC<RoundPanelProps> = ({
  round,
  activeRound,
  canRequeue,
}) => {
  const { episodeId } = useEpisodeId();
  const queryClient = useQueryClient();

  const [selectedMaps, setSelectedMaps] = useState<number[]>(round.maps ?? []);
  const [matchesPage, setMatchesPage] = useState(1);
  const [releaseModalOpen, setReleaseModalOpen] = useState(false);

  const episode = useEpisodeInfo({ id: episodeId });
  const matches = useTournamentMatchList(
    { episodeId, roundId: round.id, tournamentId: round.tournament },
    queryClient,
  );
  const maps = useEpisodeMaps({ episodeId });

  const createAndEnqueue = useCreateAndEnqueueMatches(
    {
      episodeId,
      tournament: round.tournament,
      id: round.id.toString(),
      maps: selectedMaps,
    },
    queryClient,
  );
  const requeue = useRequeueTournamentRound(
    {
      episodeId,
      tournament: round.tournament,
      id: round.id.toString(),
    },
    queryClient,
  );
  const release = useReleaseTournamentRound(
    {
      episodeId,
      tournament: round.tournament,
      id: round.id.toString(),
    },
    queryClient,
  );

  /**
   * Can create/enqueue when:
   *  - the round is active
   *  - the round has no matches
   *  - an odd number of matches are selected
   */
  const canCreateEnqueue = useMemo(() => {
    if (!matches.isSuccess) return false;

    return (
      activeRound &&
      selectedMaps.length % 2 !== 0 &&
      (matches.data.count ?? false) === 0
    );
  }, [matches, activeRound, selectedMaps]);

  /**
   * Can release when:
   *  - the round has been sent to Saturn
   *  - the round is not released
   *  - all of the matches in this round are completed successfully
   */
  const canRelease = useMemo(() => {
    if (!matches.isSuccess) return false;

    // TODO: should we waterfall all of the matches in this round?
    return (
      (round.in_progress ?? false) &&
      (round.release_status ?? ReleaseStatusEnum.NUMBER_0) <
        ReleaseStatusEnum.NUMBER_2 &&
      matches.data.results?.find(
        (match) => match.status !== StatusBccEnum.Ok,
      ) === undefined
    );
  }, [matches, round]);

  return (
    <Tab.Panel className="flex flex-col gap-4 rounded-xl bg-white p-3 ring-white/60 ring-offset-2 ring-offset-cyan-400 focus:outline-none focus:ring-2">
      <SectionCard title="Round Information">
        <div className="grid min-w-32 grid-cols-2 justify-start text-gray-700">
          <span className="font-semibold">Round:</span>
          <span>{round.name}</span>

          <span className="font-semibold">Has started?:</span>
          <span>{round.in_progress ?? false ? "Yes" : "No"}</span>

          <span className="font-semibold">Release Status:</span>
          <span>
            {isPresent(round.release_status)
              ? RELEASE_STATUS_LABELS[round.release_status]
              : "N/A"}
          </span>

          <span className="font-semibold">Maps:</span>
          <span>
            {round.maps
              ?.map((m) => maps.data?.find((map) => map.id === m)?.name)
              .filter(isPresent)
              .join(", ") ?? "N/A"}
          </span>
        </div>
      </SectionCard>

      {!(round.in_progress ?? false) && (
        <SelectMultipleMenu<number>
          label="Select An Odd Number of Maps"
          disabled={createAndEnqueue.isPending}
          options={
            maps.data?.map((m) => ({ value: m.id, label: m.name })) ?? []
          }
          placeholder={"Select maps for this round..."}
          value={selectedMaps}
          onChange={(newMaps) => {
            setSelectedMaps(newMaps);
          }}
        />
      )}

      <SectionCard title="Matches">
        <div className="mb-4 flex flex-row gap-4">
          <Button
            disabled={!canCreateEnqueue || createAndEnqueue.isPending}
            loading={createAndEnqueue.isPending}
            iconName="play_circle"
            variant="dark"
            label="Create Matches"
            onClick={() => {
              createAndEnqueue.mutate({
                episodeId,
                tournament: round.tournament,
                id: round.id.toString(),
                maps: selectedMaps,
              });
            }}
          />
          <Tooltip text="Requeues all matches.">
            <Button
              disabled={!canRequeue(round) || requeue.isPending}
              loading={requeue.isPending}
              iconName="arrow_path"
              variant="danger-outline"
              label="Requeue"
              onClick={() => {
                requeue.mutate({
                  episodeId,
                  tournament: round.tournament,
                  id: round.id.toString(),
                });
              }}
            />
          </Tooltip>
          <Tooltip text="Releases the round to the bracket service.">
            <Button
              disabled={release.isPending || !canRelease}
              loading={release.isPending}
              iconName="share"
              label="Release Round"
              onClick={() => {
                release.mutate({
                  episodeId,
                  tournament: round.tournament,
                  id: round.id.toString(),
                });
              }}
            />
          </Tooltip>
        </div>

        <TournamentResultsTable
          data={matches.data}
          loading={matches.isLoading}
          page={matchesPage}
          episode={episode}
          handlePage={(newPage) => {
            setMatchesPage(newPage);
          }}
        />
      </SectionCard>

      <Modal
        isOpen={releaseModalOpen}
        closeModal={() => {
          setReleaseModalOpen(false);
        }}
        title={`Release ${round.name}?`}
      >
        <div className="mt-4 flex flex-col gap-4">
          <span className="font-semibold text-gray-700">
            Are you sure you want to release this tournament round? Releasing
            the round will make it visible on the public bracket to competitors.
          </span>
          <div className="mt-2 flex flex-row gap-4">
            <Button
              label="Confirm"
              variant="dark"
              fullWidth
              loading={release.isPending}
              onClick={() => {
                release.mutate({
                  episodeId,
                  tournament: round.tournament,
                  id: round.id.toString(),
                });
                setReleaseModalOpen(false);
              }}
            />
            <Button
              fullWidth
              label="Cancel"
              onClick={() => {
                setReleaseModalOpen(false);
              }}
            />
          </div>
        </div>
      </Modal>
    </Tab.Panel>
  );
};

export default AdminTournament;
