import React, { useState, useEffect, useMemo } from "react";
import { useEpisodeId } from "../contexts/EpisodeContext";
import { useNavigate, useSearchParams } from "react-router-dom";
import { BC23_TOURNAMENTS, TourneyPage } from "../content/bc23";
import type { PaginatedTournamentList } from "../utils/types";
import { getAllTournaments } from "../utils/api/episode";
import BattlecodeTable from "../components/BattlecodeTable";
import Icon from "../components/elements/Icon";
import Markdown from "../components/elements/Markdown";
import { dateTime } from "../utils/dateTime";
import BattlecodeTableBottomElement from "../components/BattlecodeTableBottomElement";
import SectionCard from "../components/SectionCard";

interface QueryParams {
  page: number;
}

const getParamEntries = (prev: URLSearchParams): Record<string, string> => {
  return Object.fromEntries(prev);
};

const Tournaments: React.FC = () => {
  const { episodeId } = useEpisodeId();
  const navigate = useNavigate();

  const [searchParams, setSearchParams] = useSearchParams();

  const parsePageParam = (paramName: string): number =>
    parseInt(searchParams.get(paramName) ?? "1");

  const queryParams: QueryParams = useMemo(() => {
    return {
      page: parsePageParam("page"),
    };
  }, [searchParams]);

  const [schedule, setSchedule] = useState<PaginatedTournamentList>();
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    let isActiveLookup = true;
    if (loading) return;
    setLoading(true);
    setSchedule((prev) => ({ count: prev?.count ?? 0 }));

    const fetchSchedule = async (): Promise<void> => {
      try {
        const result = await getAllTournaments(episodeId, queryParams.page);
        if (isActiveLookup) {
          setSchedule(result);
        }
      } catch (err) {
        if (isActiveLookup) {
          setSchedule(undefined);
        }
        console.error(err);
      } finally {
        if (isActiveLookup) {
          setLoading(false);
        }
      }
    };

    void fetchSchedule();

    return () => {
      isActiveLookup = false;
    };
  }, [episodeId, queryParams.page]);

  return (
    <div className="flex h-full w-full flex-col overflow-y-auto bg-white p-6">
      <div className="flex flex-1 flex-col gap-8">
        <SectionCard>
          <Markdown text={BC23_TOURNAMENTS[TourneyPage.SCHEDULE]} />
          <BattlecodeTable
            data={schedule?.results ?? []}
            loading={loading}
            onRowClick={(tour) => {
              navigate(`/${episodeId}/tournament/${tour.name_short}`);
            }}
            columns={[
              {
                header: "Tournament",
                value: (r) => (
                  <span className="hover:underline">{r.name_long}</span>
                ),
              },
              {
                header: "Date",
                value: (r) => dateTime(r.display_date).shortDateStr,
              },
              {
                header: "Eligible?",
                value: (r) =>
                  r.is_eligible ? (
                    <Icon name={"check"} className="text-green-700" size="md" />
                  ) : (
                    <Icon name={"x_mark"} className="text-red-700" size="md" />
                  ),
              },
              {
                header: "About",
                value: (r) => <div className="max-w-80">{r.blurb}</div>,
              },
            ]}
            bottomElement={
              <BattlecodeTableBottomElement
                totalCount={schedule?.count ?? 0}
                pageSize={10}
                currentPage={queryParams.page}
                onPage={(page) => {
                  if (!loading) {
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
        <SectionCard>
          <Markdown text={`${BC23_TOURNAMENTS[TourneyPage.PRIZES]}`} />
        </SectionCard>
        <SectionCard>
          <Markdown text={`${BC23_TOURNAMENTS[TourneyPage.FORMAT]}`} />
        </SectionCard>
        <SectionCard>
          <Markdown text={`${BC23_TOURNAMENTS[TourneyPage.RULES]}`} />
        </SectionCard>
      </div>
    </div>
  );
};

export default Tournaments;
