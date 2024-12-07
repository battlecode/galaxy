import type React from "react";
import { useNavigate } from "react-router-dom";
import { useEpisodeId } from "../../contexts/EpisodeContext";
import type { PaginatedTournamentList } from "../../api/_autogen";
import type { Maybe } from "../../utils/utilTypes";
import Table from "../Table";
import TableBottom from "../TableBottom";
import { dateTime } from "../../utils/dateTime";
import Icon from "../elements/Icon";

interface TournamentsTableProps {
  data: Maybe<PaginatedTournamentList>;
  loading: boolean;
  page: number;
  handlePage: (page: number) => void;
}

const TournamentsTable: React.FC<TournamentsTableProps> = ({
  data,
  loading,
  page,
  handlePage,
}) => {
  const { episodeId } = useEpisodeId();
  const navigate = useNavigate();

  return (
    <Table
      data={data?.results?.filter((t) => t.is_public) ?? []}
      loading={loading}
      keyFromValue={(tour) => tour.name_short}
      onRowClick={(tour) => {
        navigate(`/${episodeId}/tournament/${tour.name_short}`);
      }}
      bottomElement={
        <TableBottom
          totalCount={data?.count ?? 0}
          pageSize={10}
          currentPage={page}
          onPage={handlePage}
        />
      }
      columns={[
        {
          header: "Tournament",
          key: "name_long",
          value: (tour) => (
            <span className="hover:underline">{tour.name_long}</span>
          ),
        },
        {
          header: "Date",
          key: "display_date",
          value: (tour) => dateTime(tour.display_date).shortDateStr,
        },
        {
          header: "Eligible?",
          key: "is_eligible",
          value: (tour) =>
            tour.is_eligible ? (
              <Icon name={"check"} className="text-green-700" size="md" />
            ) : (
              <Icon name={"x_mark"} className="text-red-700" size="md" />
            ),
        },
        {
          header: "About",
          key: "blurb",
          value: (tour) => <div className="max-w-80">{tour.blurb}</div>,
        },
      ]}
    />
  );
};

export default TournamentsTable;
