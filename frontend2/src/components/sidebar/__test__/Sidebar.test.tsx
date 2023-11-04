import React from "react";
import { render, screen } from "@testing-library/react";
import Sidebar from "../";
import { EpisodeIdContext } from "../../../contexts/EpisodeContext";
import { CurrentUserContext } from "../../../contexts/CurrentUserContext";
import {
  CurrentTeamContext,
  TeamStateEnum,
} from "../../../contexts/CurrentTeamContext";
import { MemoryRouter } from "react-router-dom";
import { Status526Enum } from "../../../utils/types";

const mem = {
  id: 123,
  username: "theuser",
  is_staff: false,
};
const faketeam = {
  id: 123,
  episode: "bc23",
  name: "theteam",
  members: [mem],
  join_key: "abc",
  status: Status526Enum.O,
};
const fakeuser = {
  id: 123,
  username: "theuser",
  email: "user@gmail.com",
  first_name: "the",
  last_name: "user",
  is_staff: false,
};

test("UI: should collapse sidebar", () => {
  render(
    <MemoryRouter>
      <EpisodeIdContext.Provider
        value={{ episodeId: "something", setEpisodeId: (_) => undefined }}
      >
        <CurrentTeamContext.Provider
          value={{
            teamState: TeamStateEnum.IN_TEAM,
            team: faketeam,
            leaveMyTeam: async (): Promise<void> => {
              await Promise.resolve();
            },
          }}
        >
          <CurrentUserContext.Provider
            value={{
              authState: "loading",
              user: fakeuser,
              login: (_) => {
                console.log();
              },
              logout: () => {
                console.log();
              },
            }}
          >
            <Sidebar collapsed={true} />
          </CurrentUserContext.Provider>
        </CurrentTeamContext.Provider>
      </EpisodeIdContext.Provider>
    </MemoryRouter>,
  );
  expect(screen.queryByText("Home")).toBeNull();
});

test("UI: should link to episode in surrounding context", () => {
  render(
    <MemoryRouter>
      <EpisodeIdContext.Provider
        value={{ episodeId: "something", setEpisodeId: (_) => undefined }}
      >
        <CurrentTeamContext.Provider
          value={{
            teamState: TeamStateEnum.IN_TEAM,
            team: faketeam,
            leaveMyTeam: async (): Promise<void> => {
              await Promise.resolve();
            },
          }}
        >
          <CurrentUserContext.Provider
            value={{
              authState: "loading",
              user: fakeuser,
              login: (_) => {
                console.log();
              },
              logout: () => {
                console.log();
              },
            }}
          >
            <Sidebar />
          </CurrentUserContext.Provider>
        </CurrentTeamContext.Provider>
      </EpisodeIdContext.Provider>
    </MemoryRouter>,
  );
  const linkElement = screen
    .getByText("Resources")
    .closest("a")
    ?.getAttribute("href");
  expect(linkElement).toEqual(expect.stringContaining(`/something/resources`));
});
