import { useContext, useEffect, useState } from "react"
import { EpisodeContext } from "../contexts/EpisodeContext"
import { Api } from "../utils/api"
import BattlecodeTable from "../components/BattlecodeTable"
import { type PaginatedTeamPublicList } from "../utils/types/model/PaginatedTeamPublicList"
import BattlecodeTableBottomElement from "../components/BattlecodeTableBottomElement"
import { NavLink, useNavigate } from "react-router-dom"

function trimString(str: string, maxLength: number) {
  if (str.length > maxLength) {
    return str.slice(0, maxLength - 1) + "..."
  }
  return str
}

const Rankings: React.FC = () => {
  const episodeId = useContext(EpisodeContext).episodeId

  const navigate = useNavigate()

  const [page, setPage] = useState<number>(1)
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [requireActiveSubmission, setRequireActiveSubmission] =
    useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(true)

  const [data, setData] = useState<PaginatedTeamPublicList | undefined>(
    undefined
  )

  const queryVars = {
    episodeId,
    searchQuery,
    requireActiveSubmission: false,
    page,
  }

  function handlePage(page: number) {
    if (!loading) {
      setPage(page)
    }
  }

  useEffect(() => {
    setLoading(true)

    Api.searchTeams(
      queryVars.episodeId,
      queryVars.searchQuery,
      queryVars.requireActiveSubmission,
      queryVars.page
    ).then((res) => {
      setData(res)
      setLoading(false)
    })

    return () => { setLoading(false) }
  }, [searchQuery, page])

  if (data == null) {
    return <>Loading...</>
  }

  return (
    <div className="flex flex-col w-full">
      <h1 className="ml-10 text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
        Rankings
      </h1>
      <div style={{ height: 40 }} />

      <div style={{ height: 40 }} />
      <BattlecodeTable
        data={data.results ?? []}
        bottomElement={
          <BattlecodeTableBottomElement
            totalCount={data.count ?? 0}
            pageSize={10}
            currentPage={page}
            onPage={(page) => { handlePage(page) }}
          />
        }
        onRowClick={(r) => { navigate(`/team/${r.id}`) }}
        columns={[
          {
            header: "Rating",
            value: (team) => team.profile?.rating.toFixed(0) ?? 0,
          },
          {
            header: "Team",
            value: (team) => team.name,
          },
          {
            header: "Members",
            value: (team) =>
              team.members.map((member, idx) => (
                <>
                  <NavLink key={idx} to={`/user/${member.id}`}>
                    {trimString(member.username, 13)}
                  </NavLink>
                  {idx !== team.members.length - 1 ? ", " : ""}
                </>
              )),
          },
          {
            header: "Quote",
            value: (team) => team.profile?.quote ?? "",
          },
          {
            header: "Eligibility",
            value: (team) =>
              team.profile?.eligibleFor?.map((e) => e).join(", ") ?? "",
          },
          {
            header: "Auto-Accept Ranked",
            value: (team) => (team.profile?.autoAcceptRanked ? "Yes" : "No"),
          },
          {
            header: "Auto-Accept Unranked",
            value: (team) => (team.profile?.autoAcceptUnranked ? "Yes" : "No"),
          },
        ]}
      />
    </div>
  )
}

export default Rankings
