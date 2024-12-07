import type React from "react";
import { useNavigate } from "react-router-dom";
import Button from "components/elements/Button";
import { useEpisodeId } from "contexts/EpisodeContext";

const PageNotFound: React.FC = () => {
  const navigate = useNavigate();
  const { episodeId } = useEpisodeId();
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-8 overflow-auto">
      <div className="flex h-fit w-full flex-row justify-center overflow-auto">
        <img
          className="bg-grey h-64 w-64 rounded-full fill-cyan-500"
          src="/number_4.svg"
        />
        <img
          className="bg-grey h-64 w-64 rounded-full"
          src="/battlecode-logo-vert-white.png"
        />
        <img
          className="bg-grey h-64 w-64 rounded-full fill-cyan-500"
          src="/number_4.svg"
        />
      </div>

      <span className="font-large text-5xl font-bold text-gray-700">
        Page Not Found
      </span>

      <Button
        variant="dark"
        label="Go Home?"
        onClick={() => {
          navigate(`/${episodeId}/home`);
        }}
      />
    </div>
  );
};

export default PageNotFound;
