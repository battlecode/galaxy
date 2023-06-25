import React from "react";
import { ApiSafe, ApiUnsafe, Auth } from "./utils/api";

async function getId() {
  const res = await ApiUnsafe.getUserUserProfile();
  return res.id;
}

async function getLoggedIn() {
  const res = await Auth.loginCheck();
  return res;
}

async function searchTeams() {
  const res = await ApiUnsafe.searchTeams("bc22", "team", false, 1);
  return res;
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
      <button
        onClick={async () => {
          await Auth.login("lmtorola_test", "pass");
          Auth.setLoginHeader();
          console.log("Logged in!");
        }}
      >
        Login!
      </button>
      <button onClick={async () => console.log(getId())}>ID</button>
      <button onClick={async () => console.log(getLoggedIn())}>
        Logged In?
      </button>
      <button onClick={async () => console.log(searchTeams())}>
        Search Teams
      </button>
    </div>
  );
};

export default App;
