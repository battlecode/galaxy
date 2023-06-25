import React, { useContext } from "react";
import { EpisodeContext } from "../contexts/EpisodeContext";

const Account: React.FC = () => {
  const { episode } = useContext(EpisodeContext);
  return <p>the episode is {episode} and this is the account page</p>;
};

export default Account;
