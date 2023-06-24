import React from "react";
import { ApiUnsafe, Auth } from "./utils/types";

async function getId() {
  const res = await ApiUnsafe.getCurrentUser();
  return res.body.id
}

const App: React.FC = () => {
  return (
    <div className="App">
      <header className="App-header text-3xl font-bold underline">
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
      <button onClick={async () => {
        await Auth.login("lmtorola_test", "pass")
        Auth.setLoginHeader()
      }}>Login!</button>
      <button onClick={ () => console.log(getId()) }>ID</button>
    </div>
  );
};

export default App;
