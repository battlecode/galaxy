import React, { useContext } from "react";
import { EpisodeContext } from "../contexts/EpisodeContext";

const Account: React.FC = () => {
  const { episodeId } = useContext(EpisodeContext);
  return <p>the episode is {episodeId} and this is the account page</p>;
};

export default Account;
