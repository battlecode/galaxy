import { describe, expect, test } from "@jest/globals";
import { ApiApi } from "../utils/types";
import { Auth } from "../utils/api";

const API = new ApiApi("http://localhost:8000");

//---- AUTHORIZATION ----//
// TEST 1: Generate/Verify API Access Token
// This test should work, called "login" in safe API //
test("API: Generate/Verify API Access Token (STABLE)", async () => {
  const request = {
    username: "lmtorola_test",
    password: "pass",
    access: "",
    refresh: "",
  };
  expect(
    API.apiTokenCreate(request).then((res) => {
      return API.apiTokenVerifyCreate({ token: res.body.access });
    })
  ).toBeTruthy();
});

//---- SUBMISSIONS ----//
// TEST 1: Upload a new submission
// Located at frontend2\src\__test__\App.test.tsx

// TEST 2: Get a submission
// TODO: how???
// test('Download a submission (UNSTABLE)', async () => {
//   await Auth.login('lmtorola_test', 'pass')
// })

// TEST 3: Get a page of submissions
// TODO: ahhhhhhhh
// test('Get a page of submissions (UNSTABLE)', async () => {
//   expect(API.apiCompeteSubmissionList('bc22', 1)
//     .done((res) => { return res.body.count }))
//   .toEqual(3)
// })

//---- USER ----//
// TEST 1: Get current user's info (authed)
test("API: Get current user's info (authed) (UNSTABLE)", async () => {
  await Auth.login("lmtorola_test", "pass");
  Auth.setLoginHeader();
  await new Promise((r) => setTimeout(r, 2000));
  const id = (await API.apiUserUMeRetrieve()).body.id;
  expect(id).toEqual(43);
});

// TEST 2: Get current user's info (unauthed)

// TEST 3: Get user's info (authed)

// TEST 4: Get user's info (unauthed)
