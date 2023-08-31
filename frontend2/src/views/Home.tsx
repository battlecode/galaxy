import React from "react";
import Icon from "../components/elements/Icon";
import Collapse from "../components/elements/Collapse";

const Home: React.FC = () => {
  return (
    <div className="flex flex-col gap-6 bg-white w-full p-20">
      This is a page that contains collapsible content:
      <Collapse title="This is the title">
        <p>Some content here</p>
        <div className="flex flex-row gap-2">
          <Icon name="check" />
          <p>alskdjfasdf</p>
          <h1>asdfljkasldkfj</h1>
        </div>
      </Collapse>
      <Collapse title="This is the title">
        <p>Some content here</p>
        <div className="flex flex-row gap-2">
          <Icon name="check" />
          <p>alskdjfasdf</p>
          <h1>asdfljkasldkfj</h1>
        </div>
      </Collapse>
      <Collapse title="This is the title">
        <p>Some content here</p>
        <div className="flex flex-row gap-2">
          <Icon name="check" />
          <p>alskdjfasdf</p>
          <h1>asdfljkasldkfj</h1>
        </div>
      </Collapse>
    </div>
  );
};

export default Home;
