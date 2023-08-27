/* tslint:disable */
/* eslint-disable */
/**
 * 
 * No description provided (generated by Openapi Generator https://github.com/openapitools/openapi-generator)
 *
 * The version of the OpenAPI document: 0.0.0
 * 
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */


import * as runtime from '../runtime';
import type {
  TokenObtainPair,
  TokenObtainPairRequest,
  TokenRefresh,
  TokenRefreshRequest,
  TokenVerifyRequest,
} from '../models';
import {
    TokenObtainPairFromJSON,
    TokenObtainPairToJSON,
    TokenObtainPairRequestFromJSON,
    TokenObtainPairRequestToJSON,
    TokenRefreshFromJSON,
    TokenRefreshToJSON,
    TokenRefreshRequestFromJSON,
    TokenRefreshRequestToJSON,
    TokenVerifyRequestFromJSON,
    TokenVerifyRequestToJSON,
} from '../models';

export interface TokenCreateRequest {
    tokenObtainPairRequest: TokenObtainPairRequest;
}

export interface TokenRefreshCreateRequest {
    tokenRefreshRequest: TokenRefreshRequest;
}

export interface TokenVerifyCreateRequest {
    tokenVerifyRequest: TokenVerifyRequest;
}

/**
 * 
 */
export class TokenApi extends runtime.BaseAPI {

    /**
     * Takes a set of user credentials and returns an access and refresh JSON web token pair to prove the authentication of those credentials.
     */
    async tokenCreateRaw(requestParameters: TokenCreateRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<TokenObtainPair>> {
        if (requestParameters.tokenObtainPairRequest === null || requestParameters.tokenObtainPairRequest === undefined) {
            throw new runtime.RequiredError('tokenObtainPairRequest','Required parameter requestParameters.tokenObtainPairRequest was null or undefined when calling tokenCreate.');
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        headerParameters['Content-Type'] = 'application/json';

        const response = await this.request({
            path: `/api/token/`,
            method: 'POST',
            headers: headerParameters,
            query: queryParameters,
            body: TokenObtainPairRequestToJSON(requestParameters.tokenObtainPairRequest),
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => TokenObtainPairFromJSON(jsonValue));
    }

    /**
     * Takes a set of user credentials and returns an access and refresh JSON web token pair to prove the authentication of those credentials.
     */
    async tokenCreate(requestParameters: TokenCreateRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<TokenObtainPair> {
        const response = await this.tokenCreateRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     * Takes a refresh type JSON web token and returns an access type JSON web token if the refresh token is valid.
     */
    async tokenRefreshCreateRaw(requestParameters: TokenRefreshCreateRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<TokenRefresh>> {
        if (requestParameters.tokenRefreshRequest === null || requestParameters.tokenRefreshRequest === undefined) {
            throw new runtime.RequiredError('tokenRefreshRequest','Required parameter requestParameters.tokenRefreshRequest was null or undefined when calling tokenRefreshCreate.');
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        headerParameters['Content-Type'] = 'application/json';

        const response = await this.request({
            path: `/api/token/refresh/`,
            method: 'POST',
            headers: headerParameters,
            query: queryParameters,
            body: TokenRefreshRequestToJSON(requestParameters.tokenRefreshRequest),
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => TokenRefreshFromJSON(jsonValue));
    }

    /**
     * Takes a refresh type JSON web token and returns an access type JSON web token if the refresh token is valid.
     */
    async tokenRefreshCreate(requestParameters: TokenRefreshCreateRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<TokenRefresh> {
        const response = await this.tokenRefreshCreateRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     * Takes a token and indicates if it is valid.  This view provides no information about a token\'s fitness for a particular use.
     */
    async tokenVerifyCreateRaw(requestParameters: TokenVerifyCreateRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<void>> {
        if (requestParameters.tokenVerifyRequest === null || requestParameters.tokenVerifyRequest === undefined) {
            throw new runtime.RequiredError('tokenVerifyRequest','Required parameter requestParameters.tokenVerifyRequest was null or undefined when calling tokenVerifyCreate.');
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        headerParameters['Content-Type'] = 'application/json';

        const response = await this.request({
            path: `/api/token/verify/`,
            method: 'POST',
            headers: headerParameters,
            query: queryParameters,
            body: TokenVerifyRequestToJSON(requestParameters.tokenVerifyRequest),
        }, initOverrides);

        return new runtime.VoidApiResponse(response);
    }

    /**
     * Takes a token and indicates if it is valid.  This view provides no information about a token\'s fitness for a particular use.
     */
    async tokenVerifyCreate(requestParameters: TokenVerifyCreateRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<void> {
        await this.tokenVerifyCreateRaw(requestParameters, initOverrides);
    }

}
