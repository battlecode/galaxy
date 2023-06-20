import {describe, expect, test} from '@jest/globals'
import { ApiApi } from '../types/api/ApiApi'

const API = new ApiApi()

//---- AUTHORIZATION ----//
// TEST 1: Generate/Verify API Access Token
test('Generate/Verify API Access Token', async () => {
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

//---- USER ----//
// TEST 1: Get current user's info (authed)

// TEST 2: Get current user's info (unauthed)

// TEST 3: Get user's info (authed)

// TEST 4: Get user's info (unauthed)
