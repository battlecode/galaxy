import React from "react";
import type { Match } from "../../utils/types/models";

interface MyMatchResultProps {
  match: Match;
}

const MyMatchResult: React.FC<MyMatchResultProps> = ({ match }) => {
  return (
    <div className="text-grey-700 flex h-full w-full bg-red-700">Hello!</div>
  );
};

export default MyMatchResult;
