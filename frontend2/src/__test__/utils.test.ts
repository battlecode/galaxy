import {describe, expect, test} from '@jest/globals'
import { ApiApi } from '../utils/types';
import { Auth } from '../utils/types';

const API = new ApiApi()

//---- AUTHORIZATION ----//
// TEST 1: Generate/Verify API Access Token
// This test should work, called "login" in safe API //
test('Generate/Verify API Access Token (STABLE)', async () => {
  const request = {
    username: 'lmtorola_test',
    password: 'pass',
    access: '',
    refresh: '',
  }
  expect(API.apiTokenCreate(request).then((res) => {
    return API.apiTokenVerifyCreate({token: res.body.access})
  })).toBeTruthy()
})

//---- SUBMISSIONS ----//
// TEST 1: Upload a new submission
// TODO: once we have routing and submissions page, we can test this
// test('Upload a new submission (UNSTABLE)', async () => {
//   await Auth.login('lmtorola_test', 'pass')
// })

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

// TEST 2: Get current user's info (unauthed)

// TEST 3: Get user's info (authed)

// TEST 4: Get user's info (unauthed)
