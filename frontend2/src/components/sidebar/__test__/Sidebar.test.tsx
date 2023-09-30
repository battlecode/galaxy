import React from "react";
import { render, screen } from "@testing-library/react";
import Sidebar from "../";
import { EpisodeIdContext } from "../../../contexts/EpisodeContext";
import { MemoryRouter } from "react-router-dom";

test("UI: should collapse sidebar", () => {
  render(
    <MemoryRouter>
      <EpisodeIdContext.Provider
        value={{ episodeId: "something", setEpisodeId: (_) => undefined }}
      >
        <Sidebar collapsed={true} />
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
        <Sidebar />
      </EpisodeIdContext.Provider>
    </MemoryRouter>,
  );
  const linkElement = screen
    .getByText("Resources")
    .closest("a")
    ?.getAttribute("href");
  expect(linkElement).toEqual(expect.stringContaining(`/something/resources`));
});
