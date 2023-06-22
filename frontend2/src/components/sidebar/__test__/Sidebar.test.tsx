import React from "react";
import { render, screen } from "@testing-library/react";
import Sidebar from "../";
import { DEFAULT_EPISODE } from "../../../utils/constants";
import { EpisodeContext } from "../../../contexts/EpisodeContext";
import { MemoryRouter } from "react-router-dom";

test('UI: should link to default episode', () => {
  render(<MemoryRouter><Sidebar /></MemoryRouter>);
  const linkElement = screen.getByText('Resources').closest('a')?.getAttribute('href');
  expect(linkElement).toEqual(expect.stringContaining(`/${DEFAULT_EPISODE}/resources`));
});

test('UI: should collapse sidebar', () => {
  render(<MemoryRouter><Sidebar collapsed={true} /></MemoryRouter>);
  expect(screen.queryByText('Home')).toBeNull();
});

test('UI: should link to episode in surrounding context', () => {
  render(<MemoryRouter>
    <EpisodeContext.Provider value={{ episodeId: "something", setEpisodeId: (_) => undefined }}>
      <Sidebar />
    </EpisodeContext.Provider></MemoryRouter>
  );
  const linkElement = screen.getByText('Resources').closest('a')?.getAttribute('href');
  expect(linkElement).toEqual(expect.stringContaining(`/something/resources`));
});
