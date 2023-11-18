import React from "react";
import Spinner from "./Spinner";

const Loading: React.FC = () => {
  return (
    <>
      Loading...
      <Spinner size="xl" />
    </>
  );
};

export default Loading;
