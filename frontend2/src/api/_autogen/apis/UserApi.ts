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
  Email,
  EmailRequest,
  PasswordToken,
  PasswordTokenRequest,
  PatchedUserPrivateRequest,
  ResetToken,
  ResetTokenRequest,
  TeamPublic,
  UserAvatarRequest,
  UserCreate,
  UserCreateRequest,
  UserPrivate,
  UserPrivateRequest,
  UserPublic,
  UserResume,
  UserResumeRequest,
} from '../models';
import {
    EmailFromJSON,
    EmailToJSON,
    EmailRequestFromJSON,
    EmailRequestToJSON,
    PasswordTokenFromJSON,
    PasswordTokenToJSON,
    PasswordTokenRequestFromJSON,
    PasswordTokenRequestToJSON,
    PatchedUserPrivateRequestFromJSON,
    PatchedUserPrivateRequestToJSON,
    ResetTokenFromJSON,
    ResetTokenToJSON,
    ResetTokenRequestFromJSON,
    ResetTokenRequestToJSON,
    TeamPublicFromJSON,
    TeamPublicToJSON,
    UserAvatarRequestFromJSON,
    UserAvatarRequestToJSON,
    UserCreateFromJSON,
    UserCreateToJSON,
    UserCreateRequestFromJSON,
    UserCreateRequestToJSON,
    UserPrivateFromJSON,
    UserPrivateToJSON,
    UserPrivateRequestFromJSON,
    UserPrivateRequestToJSON,
    UserPublicFromJSON,
    UserPublicToJSON,
    UserResumeFromJSON,
    UserResumeToJSON,
    UserResumeRequestFromJSON,
    UserResumeRequestToJSON,
} from '../models';

export interface UserPasswordResetConfirmCreateRequest {
    passwordTokenRequest: PasswordTokenRequest;
}

export interface UserPasswordResetCreateRequest {
    emailRequest: EmailRequest;
}

export interface UserPasswordResetValidateTokenCreateRequest {
    resetTokenRequest: ResetTokenRequest;
}

export interface UserUAvatarCreateRequest {
    userAvatarRequest: UserAvatarRequest;
}

export interface UserUCreateRequest {
    userCreateRequest: UserCreateRequest;
}

export interface UserUMePartialUpdateRequest {
    patchedUserPrivateRequest?: PatchedUserPrivateRequest;
}

export interface UserUMeUpdateRequest {
    userPrivateRequest: UserPrivateRequest;
}

export interface UserUResumeUpdateRequest {
    userResumeRequest: UserResumeRequest;
}

export interface UserURetrieveRequest {
    id: number;
}

export interface UserUTeamsRetrieveRequest {
    id: number;
}

/**
 *
 */
export class UserApi extends runtime.BaseAPI {

    /**
     * An Api View which provides a method to reset a password based on a unique token
     */
    async userPasswordResetConfirmCreateRaw(requestParameters: UserPasswordResetConfirmCreateRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<PasswordToken>> {
        if (requestParameters.passwordTokenRequest === null || requestParameters.passwordTokenRequest === undefined) {
            throw new runtime.RequiredError('passwordTokenRequest','Required parameter requestParameters.passwordTokenRequest was null or undefined when calling userPasswordResetConfirmCreate.');
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        headerParameters['Content-Type'] = 'application/json';

        const response = await this.request({
            path: `/api/user/password_reset/confirm/`,
            method: 'POST',
            headers: headerParameters,
            query: queryParameters,
            body: PasswordTokenRequestToJSON(requestParameters.passwordTokenRequest),
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => PasswordTokenFromJSON(jsonValue));
    }

    /**
     * An Api View which provides a method to reset a password based on a unique token
     */
    async userPasswordResetConfirmCreate(requestParameters: UserPasswordResetConfirmCreateRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<PasswordToken> {
        const response = await this.userPasswordResetConfirmCreateRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     * An Api View which provides a method to request a password reset token based on an e-mail address  Sends a signal reset_password_token_created when a reset token was created
     */
    async userPasswordResetCreateRaw(requestParameters: UserPasswordResetCreateRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<Email>> {
        if (requestParameters.emailRequest === null || requestParameters.emailRequest === undefined) {
            throw new runtime.RequiredError('emailRequest','Required parameter requestParameters.emailRequest was null or undefined when calling userPasswordResetCreate.');
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        headerParameters['Content-Type'] = 'application/json';

        const response = await this.request({
            path: `/api/user/password_reset/`,
            method: 'POST',
            headers: headerParameters,
            query: queryParameters,
            body: EmailRequestToJSON(requestParameters.emailRequest),
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => EmailFromJSON(jsonValue));
    }

    /**
     * An Api View which provides a method to request a password reset token based on an e-mail address  Sends a signal reset_password_token_created when a reset token was created
     */
    async userPasswordResetCreate(requestParameters: UserPasswordResetCreateRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<Email> {
        const response = await this.userPasswordResetCreateRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     * An Api View which provides a method to verify that a token is valid
     */
    async userPasswordResetValidateTokenCreateRaw(requestParameters: UserPasswordResetValidateTokenCreateRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<ResetToken>> {
        if (requestParameters.resetTokenRequest === null || requestParameters.resetTokenRequest === undefined) {
            throw new runtime.RequiredError('resetTokenRequest','Required parameter requestParameters.resetTokenRequest was null or undefined when calling userPasswordResetValidateTokenCreate.');
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        headerParameters['Content-Type'] = 'application/json';

        const response = await this.request({
            path: `/api/user/password_reset/validate_token/`,
            method: 'POST',
            headers: headerParameters,
            query: queryParameters,
            body: ResetTokenRequestToJSON(requestParameters.resetTokenRequest),
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => ResetTokenFromJSON(jsonValue));
    }

    /**
     * An Api View which provides a method to verify that a token is valid
     */
    async userPasswordResetValidateTokenCreate(requestParameters: UserPasswordResetValidateTokenCreateRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<ResetToken> {
        const response = await this.userPasswordResetValidateTokenCreateRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     * Update uploaded avatar.
     */
    async userUAvatarCreateRaw(requestParameters: UserUAvatarCreateRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<void>> {
        if (requestParameters.userAvatarRequest === null || requestParameters.userAvatarRequest === undefined) {
            throw new runtime.RequiredError('userAvatarRequest','Required parameter requestParameters.userAvatarRequest was null or undefined when calling userUAvatarCreate.');
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        headerParameters['Content-Type'] = 'application/json';

        if (this.configuration && this.configuration.accessToken) {
            const token = this.configuration.accessToken;
            const tokenString = await token("jwtAuth", []);

            if (tokenString) {
                headerParameters["Authorization"] = `Bearer ${tokenString}`;
            }
        }
        const response = await this.request({
            path: `/api/user/u/avatar/`,
            method: 'POST',
            headers: headerParameters,
            query: queryParameters,
            body: UserAvatarRequestToJSON(requestParameters.userAvatarRequest),
        }, initOverrides);

        return new runtime.VoidApiResponse(response);
    }

    /**
     * Update uploaded avatar.
     */
    async userUAvatarCreate(requestParameters: UserUAvatarCreateRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<void> {
        await this.userUAvatarCreateRaw(requestParameters, initOverrides);
    }

    /**
     * A viewset for retrieving and updating all user info.
     */
    async userUCreateRaw(requestParameters: UserUCreateRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<UserCreate>> {
        if (requestParameters.userCreateRequest === null || requestParameters.userCreateRequest === undefined) {
            throw new runtime.RequiredError('userCreateRequest','Required parameter requestParameters.userCreateRequest was null or undefined when calling userUCreate.');
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        headerParameters['Content-Type'] = 'application/json';

        if (this.configuration && this.configuration.accessToken) {
            const token = this.configuration.accessToken;
            const tokenString = await token("jwtAuth", []);

            if (tokenString) {
                headerParameters["Authorization"] = `Bearer ${tokenString}`;
            }
        }
        const response = await this.request({
            path: `/api/user/u/`,
            method: 'POST',
            headers: headerParameters,
            query: queryParameters,
            body: UserCreateRequestToJSON(requestParameters.userCreateRequest),
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => UserCreateFromJSON(jsonValue));
    }

    /**
     * A viewset for retrieving and updating all user info.
     */
    async userUCreate(requestParameters: UserUCreateRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<UserCreate> {
        const response = await this.userUCreateRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     * Retrieve or update information about the logged-in user.
     */
    async userUMePartialUpdateRaw(requestParameters: UserUMePartialUpdateRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<UserPrivate>> {
        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        headerParameters['Content-Type'] = 'application/json';

        if (this.configuration && this.configuration.accessToken) {
            const token = this.configuration.accessToken;
            const tokenString = await token("jwtAuth", []);

            if (tokenString) {
                headerParameters["Authorization"] = `Bearer ${tokenString}`;
            }
        }
        const response = await this.request({
            path: `/api/user/u/me/`,
            method: 'PATCH',
            headers: headerParameters,
            query: queryParameters,
            body: PatchedUserPrivateRequestToJSON(requestParameters.patchedUserPrivateRequest),
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => UserPrivateFromJSON(jsonValue));
    }

    /**
     * Retrieve or update information about the logged-in user.
     */
    async userUMePartialUpdate(requestParameters: UserUMePartialUpdateRequest = {}, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<UserPrivate> {
        const response = await this.userUMePartialUpdateRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     * Retrieve or update information about the logged-in user.
     */
    async userUMeRetrieveRaw(initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<UserPrivate>> {
        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        if (this.configuration && this.configuration.accessToken) {
            const token = this.configuration.accessToken;
            const tokenString = await token("jwtAuth", []);

            if (tokenString) {
                headerParameters["Authorization"] = `Bearer ${tokenString}`;
            }
        }
        const response = await this.request({
            path: `/api/user/u/me/`,
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => UserPrivateFromJSON(jsonValue));
    }

    /**
     * Retrieve or update information about the logged-in user.
     */
    async userUMeRetrieve(initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<UserPrivate> {
        const response = await this.userUMeRetrieveRaw(initOverrides);
        return await response.value();
    }

    /**
     * Retrieve or update information about the logged-in user.
     */
    async userUMeUpdateRaw(requestParameters: UserUMeUpdateRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<UserPrivate>> {
        if (requestParameters.userPrivateRequest === null || requestParameters.userPrivateRequest === undefined) {
            throw new runtime.RequiredError('userPrivateRequest','Required parameter requestParameters.userPrivateRequest was null or undefined when calling userUMeUpdate.');
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        headerParameters['Content-Type'] = 'application/json';

        if (this.configuration && this.configuration.accessToken) {
            const token = this.configuration.accessToken;
            const tokenString = await token("jwtAuth", []);

            if (tokenString) {
                headerParameters["Authorization"] = `Bearer ${tokenString}`;
            }
        }
        const response = await this.request({
            path: `/api/user/u/me/`,
            method: 'PUT',
            headers: headerParameters,
            query: queryParameters,
            body: UserPrivateRequestToJSON(requestParameters.userPrivateRequest),
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => UserPrivateFromJSON(jsonValue));
    }

    /**
     * Retrieve or update information about the logged-in user.
     */
    async userUMeUpdate(requestParameters: UserUMeUpdateRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<UserPrivate> {
        const response = await this.userUMeUpdateRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     * Retrieve or update the uploaded resume.
     */
    async userUResumeRetrieveRaw(initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<UserResume>> {
        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        if (this.configuration && this.configuration.accessToken) {
            const token = this.configuration.accessToken;
            const tokenString = await token("jwtAuth", []);

            if (tokenString) {
                headerParameters["Authorization"] = `Bearer ${tokenString}`;
            }
        }
        const response = await this.request({
            path: `/api/user/u/resume/`,
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => UserResumeFromJSON(jsonValue));
    }

    /**
     * Retrieve or update the uploaded resume.
     */
    async userUResumeRetrieve(initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<UserResume> {
        const response = await this.userUResumeRetrieveRaw(initOverrides);
        return await response.value();
    }

    /**
     * Retrieve or update the uploaded resume.
     */
    async userUResumeUpdateRaw(requestParameters: UserUResumeUpdateRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<UserResume>> {
        if (requestParameters.userResumeRequest === null || requestParameters.userResumeRequest === undefined) {
            throw new runtime.RequiredError('userResumeRequest','Required parameter requestParameters.userResumeRequest was null or undefined when calling userUResumeUpdate.');
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        headerParameters['Content-Type'] = 'application/json';

        if (this.configuration && this.configuration.accessToken) {
            const token = this.configuration.accessToken;
            const tokenString = await token("jwtAuth", []);

            if (tokenString) {
                headerParameters["Authorization"] = `Bearer ${tokenString}`;
            }
        }
        const response = await this.request({
            path: `/api/user/u/resume/`,
            method: 'PUT',
            headers: headerParameters,
            query: queryParameters,
            body: UserResumeRequestToJSON(requestParameters.userResumeRequest),
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => UserResumeFromJSON(jsonValue));
    }

    /**
     * Retrieve or update the uploaded resume.
     */
    async userUResumeUpdate(requestParameters: UserUResumeUpdateRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<UserResume> {
        const response = await this.userUResumeUpdateRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     * A viewset for retrieving and updating all user info.
     */
    async userURetrieveRaw(requestParameters: UserURetrieveRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<UserPublic>> {
        if (requestParameters.id === null || requestParameters.id === undefined) {
            throw new runtime.RequiredError('id','Required parameter requestParameters.id was null or undefined when calling userURetrieve.');
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        if (this.configuration && this.configuration.accessToken) {
            const token = this.configuration.accessToken;
            const tokenString = await token("jwtAuth", []);

            if (tokenString) {
                headerParameters["Authorization"] = `Bearer ${tokenString}`;
            }
        }
        const response = await this.request({
            path: `/api/user/u/{id}/`.replace(`{${"id"}}`, encodeURIComponent(String(requestParameters.id))),
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => UserPublicFromJSON(jsonValue));
    }

    /**
     * A viewset for retrieving and updating all user info.
     */
    async userURetrieve(requestParameters: UserURetrieveRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<UserPublic> {
        const response = await this.userURetrieveRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     * Retrieve all teams associated with a user.
     */
    async userUTeamsRetrieveRaw(requestParameters: UserUTeamsRetrieveRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<{ [key: string]: TeamPublic; }>> {
        if (requestParameters.id === null || requestParameters.id === undefined) {
            throw new runtime.RequiredError('id','Required parameter requestParameters.id was null or undefined when calling userUTeamsRetrieve.');
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        if (this.configuration && this.configuration.accessToken) {
            const token = this.configuration.accessToken;
            const tokenString = await token("jwtAuth", []);

            if (tokenString) {
                headerParameters["Authorization"] = `Bearer ${tokenString}`;
            }
        }
        const response = await this.request({
            path: `/api/user/u/{id}/teams/`.replace(`{${"id"}}`, encodeURIComponent(String(requestParameters.id))),
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => runtime.mapValues(jsonValue, TeamPublicFromJSON));
    }

    /**
     * Retrieve all teams associated with a user.
     */
    async userUTeamsRetrieve(requestParameters: UserUTeamsRetrieveRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<{ [key: string]: TeamPublic; }> {
        const response = await this.userUTeamsRetrieveRaw(requestParameters, initOverrides);
        return await response.value();
    }

}
