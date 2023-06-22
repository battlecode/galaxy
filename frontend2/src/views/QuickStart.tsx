import React, { useContext } from "react";
import { EpisodeContext } from "../contexts/EpisodeContext";

const QuickStart: React.FC = () => {
  const {episode, setEpisode} = useContext(EpisodeContext)
  return <p>quickstart page</p>;
};

export default QuickStart;
