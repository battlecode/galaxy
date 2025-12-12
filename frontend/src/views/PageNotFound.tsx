import type React from "react";
import { useNavigate } from "react-router-dom";
import Button from "components/elements/Button";
import { useEpisodeId } from "contexts/EpisodeContext";
import { PageContainer } from "components/elements/BattlecodeStyle";

const PageNotFound: React.FC = () => {
  const navigate = useNavigate();
  const { episodeId } = useEpisodeId();
  return (
    <PageContainer className="items-center justify-center gap-8">
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
    </PageContainer>
  );
};

export default PageNotFound;
