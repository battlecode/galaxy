import React from "react";
import { useEpisodeId } from "../contexts/EpisodeContext";

const Home: React.FC = () => {
  const { episodeId } = useEpisodeId();

  return <p>Homepage for {episodeId}</p>;
};

export default Home;
