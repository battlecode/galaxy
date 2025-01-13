import { Tab } from "@headlessui/react";
import { type QueryClient, useQueryClient } from "@tanstack/react-query";
import {
  ReleaseStatusEnum,
  StatusBccEnum,
  type TournamentRound,
} from "api/_autogen";
import { useTournamentMatchList } from "api/compete/useCompete";
import {
  useCreateAndEnqueueMatches,
  useEpisodeInfo,
  useEpisodeMaps,
  useInitializeTournament,
  useReleaseTournamentRound,
  useTournamentInfo,
  useTournamentRoundInfo,
  useTournamentRoundList,
} from "api/episode/useEpisode";
import { buildKey, classNames } from "api/helpers";
import { myUserInfoFactory } from "api/user/userFactories";
import { PageTitle } from "components/elements/BattlecodeStyle";
import Button from "components/elements/Button";
import Icon from "components/elements/Icon";
import SelectMultipleMenu from "components/elements/SelectMultipleMenu";
import Tooltip from "components/elements/Tooltip";
import Modal from "components/Modal";
import SectionCard from "components/SectionCard";
import Spinner from "components/Spinner";
import TournamentResultsTable from "components/tables/TournamentResultsTable";
import { useEpisodeId } from "contexts/EpisodeContext";
import type React from "react";
import { useCallback, useMemo, useState } from "react";
import { type LoaderFunction, redirect, useParams } from "react-router-dom";
import { isPresent } from "utils/utilTypes";

export const adminTournamentLoader =
  (queryClient: QueryClient): LoaderFunction =>
  async ({ params }) => {
    const { episodeId, tournamentId } = params;
    if (episodeId === undefined) return null;
    if (tournamentId === undefined) return redirect(`/${episodeId}/home`);

    // Ensure the user is a staff member
    const user = queryClient.ensureQueryData({
      queryKey: buildKey(myUserInfoFactory.queryKey, {}),
      queryFn: myUserInfoFactory.queryFn,
    });

    if (!(await user).is_staff)
      return redirect(`/${episodeId}/tournament/${tournamentId}`);

    return null;
  };

const AdminTournament: React.FC = () => {
  const { episodeId } = useEpisodeId();
  const { tournamentId } = useParams();

  const queryClient = useQueryClient();

  const tournament = useTournamentInfo({
    episodeId,
    id: tournamentId ?? "",
  });
  const tournamentRounds = useTournamentRoundList(
    {
      episodeId,
      tournament: tournamentId ?? "",
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

  const activeRound = useMemo(() => {
    if (LOADING || !SUCCESS) return undefined;

    // First round which is still fully hidden
    return sortedRounds.find(
      (round) =>
        !isPresent(round.release_status) ||
        round.release_status < ReleaseStatusEnum.NUMBER_1,
    );
  }, [LOADING, SUCCESS, tournamentRounds]);

  const canReset = useCallback(
    (round: TournamentRound) => {
      if (!isPresent(activeRound)) return false;

      if (round.id === activeRound.id) return true;

      // Can reset if is round before active
      if (
        round.display_order === activeRound.display_order - 1 &&
        isPresent(activeRound.release_status) &&
        activeRound.release_status > ReleaseStatusEnum.NUMBER_0
      ) {
        return true;
      }

      return false;
    },
    [activeRound],
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

      <SectionCard title="Manage Rounds" loading={tournamentRounds.isLoading}>
        {tournamentRounds.isSuccess && (
          <Tab.Group>
            <Tab.List className={TABLIST_STYLE}>
              {sortedRounds.map((round) => (
                <RoundTab
                  key={round.id}
                  tournamentId={round.tournament}
                  roundId={round.id}
                  activeRound={round.id === activeRound?.id}
                  canReset={canReset(round)}
                />
              ))}
            </Tab.List>
            {sortedRounds.map((round) => (
              <RoundPanel
                key={round.id}
                tournamentId={round.tournament}
                roundId={round.id}
                activeRound={round.id === activeRound?.id}
                canReset={canReset(round)}
              />
            ))}
          </Tab.Group>
        )}
      </SectionCard>

      {/* TODO: link to client tournament display thingy? and/or iframe it */}
      {/* TODO: link to challonge! */}
      {/* TODO: Tournament rounds accessible via tabs? */}

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
  canReset: boolean;
}

const RoundTab: React.FC<RoundTabProps> = ({
  tournamentId,
  roundId,
  activeRound,
  canReset,
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

    // TODO differential tab styling based on isActive and canReset

    return classNames(...classes);
  }, []);

  return (
    <Tab className={tabClassName}>
      <div className="flex w-full flex-col items-center justify-center gap-2">
        {round.data?.name ?? <Spinner size="sm" />}
        {round.isSuccess && !canReset && <Icon size="sm" name="lock_closed" />}
        {round.isSuccess && activeRound && (
          <Icon size="sm" name="exclamation_triangle" />
        )}
      </div>
    </Tab>
  );
};

interface RoundPanelProps {
  tournamentId: string;
  roundId: number;
  activeRound: boolean;
  canReset: boolean;
}

const RoundPanel: React.FC<RoundPanelProps> = ({
  tournamentId,
  roundId,
  activeRound,
  canReset,
}) => {
  const { episodeId } = useEpisodeId();
  const queryClient = useQueryClient();

  const [selectedMaps, setSelectedMaps] = useState<number[]>([]);
  const [matchesPage, setMatchesPage] = useState(1);

  const episode = useEpisodeInfo({ id: episodeId });
  const round = useTournamentRoundInfo({
    episodeId,
    tournament: tournamentId,
    id: roundId.toString(),
  });
  const matches = useTournamentMatchList(
    { episodeId, roundId, tournamentId },
    queryClient,
  );
  const maps = useEpisodeMaps({ episodeId });

  const createAndEnqueue = useCreateAndEnqueueMatches(
    {
      episodeId,
      tournament: tournamentId,
      id: roundId.toString(),
      maps: selectedMaps,
    },
    queryClient,
  );
  const release = useReleaseTournamentRound({
    episodeId,
    tournament: tournamentId,
    id: roundId.toString(),
  });

  const canCreateEnqueue = useMemo(() => {
    if (!matches.isSuccess || !round.isSuccess) return false;

    return (
      activeRound &&
      canReset &&
      !(
        matches.data.results?.some(
          (match) =>
            match.status === StatusBccEnum.New ||
            match.status === StatusBccEnum.Que ||
            match.status === StatusBccEnum.Run ||
            match.status === StatusBccEnum.Try,
        ) ?? false
      )
    );
  }, [matches, round]);

  // const canRelease = useMemo(() => {
  //   // TODO: when can we release this round?
  // }, []);

  if (activeRound) {
    console.log("round", round.data);
  }

  return (
    <Tab.Panel className="flex flex-col gap-4 rounded-xl bg-white p-3 ring-white/60 ring-offset-2 ring-offset-cyan-400 focus:outline-none focus:ring-2">
      <SelectMultipleMenu<number>
        label="Select An Odd Number of Maps"
        options={maps.data?.map((m) => ({ value: m.id, label: m.name })) ?? []}
        placeholder={"Select maps for this round..."}
        value={selectedMaps}
        onChange={(newMaps) => {
          setSelectedMaps(newMaps);
        }}
      />

      <span className="font-normal text-gray-700">
        {`This round is ${activeRound ? "active" : "not active"}. It ${
          canReset ? "can" : "cannot"
        } be reset.`}
      </span>

      <SectionCard title="Matches">
        <div className="mb-4 flex flex-row gap-4">
          <Tooltip text="If matches already exist, this will restart the round.">
            <Button
              // TODO: disable logic isn't correct yet
              disabled={!canCreateEnqueue}
              loading={createAndEnqueue.isPending}
              iconName="play_circle"
              variant="dark"
              label="Create Matches"
              onClick={() => {
                createAndEnqueue.mutate({
                  episodeId,
                  tournament: tournamentId,
                  id: roundId.toString(),
                  maps: selectedMaps,
                });
              }}
            />
          </Tooltip>
          <Tooltip text="Releases the round to the bracket service.">
            <Button
              // TODO: disable logic isn't correct yet
              disabled={
                !round.isSuccess ||
                round.data.release_status !== ReleaseStatusEnum.NUMBER_2 // TODO what do release statuses mean??
              }
              loading={release.isPending}
              iconName="share"
              variant="dark"
              label="Release Round"
              onClick={() => {
                release.mutate({
                  episodeId,
                  tournament: tournamentId,
                  id: roundId.toString(),
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
    </Tab.Panel>
  );
};

export default AdminTournament;
