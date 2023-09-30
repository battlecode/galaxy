import React from "react";
import { useEpisodeId } from "../contexts/EpisodeContext";

const Account: React.FC = () => {
  const { episodeId } = useEpisodeId();
  return <p>the episode is {episodeId} and this is the account page</p>;
};

export default Account;
