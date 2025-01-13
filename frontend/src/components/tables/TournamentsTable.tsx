import type React from "react";
import { useNavigate } from "react-router-dom";
import { useEpisodeId } from "../../contexts/EpisodeContext";
import type { PaginatedTournamentList, Tournament } from "../../api/_autogen";
import type { Maybe } from "../../utils/utilTypes";
import Table, { type Column } from "../Table";
import TableBottom from "../TableBottom";
import { dateTime } from "../../utils/dateTime";
import Icon from "../elements/Icon";
import { useCurrentUser } from "contexts/CurrentUserContext";
import Button from "components/elements/Button";

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

  const { user } = useCurrentUser();

  const adminColumn: Column<Tournament> = {
    header: "Admin",
    key: "admin",
    value: (tour) => (
      <Button
        variant="dark"
        label="Go!"
        onClick={(ev) => {
          ev.stopPropagation();
          navigate(`/${episodeId}/tournament/${tour.name_short}/admin`);
        }}
      />
    ),
  };

  return (
    <Table
      data={data?.results ?? []}
      loading={loading}
      keyFromValue={(tour) => tour.name_short}
      onRowClick={(tour) => {
        navigate(`/${episodeId}/tournament/${tour.name_short}`);
      }}
      bottomElement={
        <TableBottom
          querySuccess={!loading}
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
            <span className="text-wrap hover:underline">{tour.name_long}</span>
          ),
        },
        {
          header: "Date",
          key: "display_date",
          value: (tour) => dateTime(tour.display_date).zeroOffsetShortStr,
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
        ...(user.isSuccess && user.data.is_staff ? [adminColumn] : []),
        {
          header: "About",
          key: "blurb",
          value: (tour) => (
            <div className="max-w-80 text-wrap">{tour.blurb}</div>
          ),
        },
      ]}
    />
  );
};

export default TournamentsTable;
