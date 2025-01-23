import type React from "react";
import type {
  EligibilityCriterion,
  PaginatedTeamPublicList,
} from "../../api/_autogen";
import type { Maybe } from "../../utils/utilTypes";
import { NavLink } from "react-router-dom";
import EligibilityIcon from "../EligibilityIcon";
import { useEpisodeId } from "../../contexts/EpisodeContext";
import { useEpisodeInfo } from "api/episode/useEpisode";
import { getEligibilities } from "api/helpers";
import Table from "components/Table";
import TableBottom from "components/TableBottom";
import ScrimmageAcceptRejectLabel from "components/ScrimmageAcceptRejectLabel";

interface RankingsTableProps {
  data: Maybe<PaginatedTeamPublicList>;
  eligibleFor: string[];
  loading: boolean;
  page: number;
  handlePage: (page: number) => void;
}

const RankingsTable: React.FC<RankingsTableProps> = ({
  data,
  eligibleFor,
  loading,
  page,
  handlePage,
}) => {
  const { episodeId } = useEpisodeId();
  const episode = useEpisodeInfo({ id: episodeId });

  return (
    <Table
      data={data?.results ?? []}
      loading={loading}
      keyFromValue={(team) =>
        team.id.toString() + eligibleFor.reduce((prev, curr) => prev + curr, "")
      }
      bottomElement={
        <TableBottom
          querySuccess={!loading}
          totalCount={data?.count ?? 0}
          pageSize={10}
          currentPage={page}
          onPage={(page) => {
            handlePage(page);
          }}
        />
      }
      columns={[
        {
          header: "Rating",
          key: "rating",
          value: (team) => Math.round(team.profile?.rating ?? 0),
        },
        {
          header: "Team",
          key: "team",
          value: (team) => (
            <NavLink
              to={`/${episodeId}/team/${team.id}`}
              className="hover:underline"
            >
              {team.name}
            </NavLink>
          ),
        },
        {
          header: "Members",
          key: "members",
          value: (team) =>
            team.members.map((member, idx) => (
              <NavLink
                key={member.id}
                to={`/user/${member.id}`}
                className="hover:underline"
              >
                {member.username +
                  (idx !== team.members.length - 1 ? ", " : "")}
              </NavLink>
            )),
        },
        {
          header: "Quote",
          key: "quote",
          value: (team) => team.profile?.quote ?? "",
        },
        {
          header: "Eligibility",
          key: "eligibility",
          value: (team) => {
            const icons: EligibilityCriterion[] = getEligibilities(
              episode.data?.eligibility_criteria ?? [],
              team.profile?.eligible_for ?? [],
            );
            return (
              <div className="flex flex-row items-center gap-2">
                {icons.map((el) => (
                  <EligibilityIcon key={el.id} criterion={el} />
                ))}
              </div>
            );
          },
        },
        {
          header: "Ranked Scrimmages",
          key: "ranked_scrimmages",
          value: (team) => (
            <ScrimmageAcceptRejectLabel
              acceptRejectStatus={team.profile?.auto_accept_reject_ranked}
            />
          ),
        },
        {
          header: "Unranked Scrimmages",
          key: "unranked_scrimmages",
          value: (team) => (
            <ScrimmageAcceptRejectLabel
              acceptRejectStatus={team.profile?.auto_accept_reject_unranked}
            />
          ),
        },
      ]}
    />
  );
};

export default RankingsTable;
