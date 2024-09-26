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
  ClassRequirement,
  PaginatedClassRequirementList,
  PaginatedTeamPublicList,
  PatchedTeamPrivateRequest,
  TeamCreate,
  TeamCreateRequest,
  TeamJoinRequest,
  TeamPrivate,
  TeamPrivateRequest,
  TeamPublic,
  TeamReportRequest,
  UserPassed,
} from '../models';
import {
    ClassRequirementFromJSON,
    ClassRequirementToJSON,
    PaginatedClassRequirementListFromJSON,
    PaginatedClassRequirementListToJSON,
    PaginatedTeamPublicListFromJSON,
    PaginatedTeamPublicListToJSON,
    PatchedTeamPrivateRequestFromJSON,
    PatchedTeamPrivateRequestToJSON,
    TeamCreateFromJSON,
    TeamCreateToJSON,
    TeamCreateRequestFromJSON,
    TeamCreateRequestToJSON,
    TeamJoinRequestFromJSON,
    TeamJoinRequestToJSON,
    TeamPrivateFromJSON,
    TeamPrivateToJSON,
    TeamPrivateRequestFromJSON,
    TeamPrivateRequestToJSON,
    TeamPublicFromJSON,
    TeamPublicToJSON,
    TeamReportRequestFromJSON,
    TeamReportRequestToJSON,
    UserPassedFromJSON,
    UserPassedToJSON,
} from '../models';

export interface TeamRequirementCheckRetrieveRequest {
    episodeId: string;
    id: string;
}

export interface TeamRequirementComputeRetrieveRequest {
    episodeId: string;
    id: string;
}

export interface TeamRequirementListRequest {
    episodeId: string;
    page?: number;
}

export interface TeamRequirementReportRetrieveRequest {
    episodeId: string;
}

export interface TeamRequirementReportUpdateRequest {
    episodeId: string;
    teamReportRequest: TeamReportRequest;
}

export interface TeamRequirementRetrieveRequest {
    episodeId: string;
    id: string;
}

export interface TeamTAvatarCreateRequest {
    episodeId: string;
    avatar?: Blob;
}

export interface TeamTCreateRequest {
    episodeId: string;
    teamCreateRequest: TeamCreateRequest;
}

export interface TeamTJoinCreateRequest {
    episodeId: string;
    teamJoinRequest: TeamJoinRequest;
}

export interface TeamTLeaveCreateRequest {
    episodeId: string;
}

export interface TeamTListRequest {
    episodeId: string;
    ordering?: string;
    page?: number;
    search?: string;
}

export interface TeamTMePartialUpdateRequest {
    episodeId: string;
    patchedTeamPrivateRequest?: PatchedTeamPrivateRequest;
}

export interface TeamTMeRetrieveRequest {
    episodeId: string;
}

export interface TeamTMeUpdateRequest {
    episodeId: string;
    teamPrivateRequest?: TeamPrivateRequest;
}

export interface TeamTRetrieveRequest {
    episodeId: string;
    id: string;
}

/**
 * 
 */
export class TeamApi extends runtime.BaseAPI {

    /**
     * A viewset for retrieving and checking class requirements.
     */
    async teamRequirementCheckRetrieveRaw(requestParameters: TeamRequirementCheckRetrieveRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<UserPassed>> {
        if (requestParameters.episodeId === null || requestParameters.episodeId === undefined) {
            throw new runtime.RequiredError('episodeId','Required parameter requestParameters.episodeId was null or undefined when calling teamRequirementCheckRetrieve.');
        }

        if (requestParameters.id === null || requestParameters.id === undefined) {
            throw new runtime.RequiredError('id','Required parameter requestParameters.id was null or undefined when calling teamRequirementCheckRetrieve.');
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
            path: `/api/team/{episode_id}/requirement/{id}/check/`.replace(`{${"episode_id"}}`, encodeURIComponent(String(requestParameters.episodeId))).replace(`{${"id"}}`, encodeURIComponent(String(requestParameters.id))),
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => UserPassedFromJSON(jsonValue));
    }

    /**
     * A viewset for retrieving and checking class requirements.
     */
    async teamRequirementCheckRetrieve(requestParameters: TeamRequirementCheckRetrieveRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<UserPassed> {
        const response = await this.teamRequirementCheckRetrieveRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     * A viewset for retrieving and checking class requirements.
     */
    async teamRequirementComputeRetrieveRaw(requestParameters: TeamRequirementComputeRetrieveRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<UserPassed>> {
        if (requestParameters.episodeId === null || requestParameters.episodeId === undefined) {
            throw new runtime.RequiredError('episodeId','Required parameter requestParameters.episodeId was null or undefined when calling teamRequirementComputeRetrieve.');
        }

        if (requestParameters.id === null || requestParameters.id === undefined) {
            throw new runtime.RequiredError('id','Required parameter requestParameters.id was null or undefined when calling teamRequirementComputeRetrieve.');
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
            path: `/api/team/{episode_id}/requirement/{id}/compute/`.replace(`{${"episode_id"}}`, encodeURIComponent(String(requestParameters.episodeId))).replace(`{${"id"}}`, encodeURIComponent(String(requestParameters.id))),
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => UserPassedFromJSON(jsonValue));
    }

    /**
     * A viewset for retrieving and checking class requirements.
     */
    async teamRequirementComputeRetrieve(requestParameters: TeamRequirementComputeRetrieveRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<UserPassed> {
        const response = await this.teamRequirementComputeRetrieveRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     * A viewset for retrieving and checking class requirements.
     */
    async teamRequirementListRaw(requestParameters: TeamRequirementListRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<PaginatedClassRequirementList>> {
        if (requestParameters.episodeId === null || requestParameters.episodeId === undefined) {
            throw new runtime.RequiredError('episodeId','Required parameter requestParameters.episodeId was null or undefined when calling teamRequirementList.');
        }

        const queryParameters: any = {};

        if (requestParameters.page !== undefined) {
            queryParameters['page'] = requestParameters.page;
        }

        const headerParameters: runtime.HTTPHeaders = {};

        if (this.configuration && this.configuration.accessToken) {
            const token = this.configuration.accessToken;
            const tokenString = await token("jwtAuth", []);

            if (tokenString) {
                headerParameters["Authorization"] = `Bearer ${tokenString}`;
            }
        }
        const response = await this.request({
            path: `/api/team/{episode_id}/requirement/`.replace(`{${"episode_id"}}`, encodeURIComponent(String(requestParameters.episodeId))),
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => PaginatedClassRequirementListFromJSON(jsonValue));
    }

    /**
     * A viewset for retrieving and checking class requirements.
     */
    async teamRequirementList(requestParameters: TeamRequirementListRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<PaginatedClassRequirementList> {
        const response = await this.teamRequirementListRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     * Retrieve or update team strategy report
     */
    async teamRequirementReportRetrieveRaw(requestParameters: TeamRequirementReportRetrieveRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<void>> {
        if (requestParameters.episodeId === null || requestParameters.episodeId === undefined) {
            throw new runtime.RequiredError('episodeId','Required parameter requestParameters.episodeId was null or undefined when calling teamRequirementReportRetrieve.');
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
            path: `/api/team/{episode_id}/requirement/report/`.replace(`{${"episode_id"}}`, encodeURIComponent(String(requestParameters.episodeId))),
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.VoidApiResponse(response);
    }

    /**
     * Retrieve or update team strategy report
     */
    async teamRequirementReportRetrieve(requestParameters: TeamRequirementReportRetrieveRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<void> {
        await this.teamRequirementReportRetrieveRaw(requestParameters, initOverrides);
    }

    /**
     * Retrieve or update team strategy report
     */
    async teamRequirementReportUpdateRaw(requestParameters: TeamRequirementReportUpdateRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<void>> {
        if (requestParameters.episodeId === null || requestParameters.episodeId === undefined) {
            throw new runtime.RequiredError('episodeId','Required parameter requestParameters.episodeId was null or undefined when calling teamRequirementReportUpdate.');
        }

        if (requestParameters.teamReportRequest === null || requestParameters.teamReportRequest === undefined) {
            throw new runtime.RequiredError('teamReportRequest','Required parameter requestParameters.teamReportRequest was null or undefined when calling teamRequirementReportUpdate.');
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
            path: `/api/team/{episode_id}/requirement/report/`.replace(`{${"episode_id"}}`, encodeURIComponent(String(requestParameters.episodeId))),
            method: 'PUT',
            headers: headerParameters,
            query: queryParameters,
            body: TeamReportRequestToJSON(requestParameters.teamReportRequest),
        }, initOverrides);

        return new runtime.VoidApiResponse(response);
    }

    /**
     * Retrieve or update team strategy report
     */
    async teamRequirementReportUpdate(requestParameters: TeamRequirementReportUpdateRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<void> {
        await this.teamRequirementReportUpdateRaw(requestParameters, initOverrides);
    }

    /**
     * A viewset for retrieving and checking class requirements.
     */
    async teamRequirementRetrieveRaw(requestParameters: TeamRequirementRetrieveRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<ClassRequirement>> {
        if (requestParameters.episodeId === null || requestParameters.episodeId === undefined) {
            throw new runtime.RequiredError('episodeId','Required parameter requestParameters.episodeId was null or undefined when calling teamRequirementRetrieve.');
        }

        if (requestParameters.id === null || requestParameters.id === undefined) {
            throw new runtime.RequiredError('id','Required parameter requestParameters.id was null or undefined when calling teamRequirementRetrieve.');
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
            path: `/api/team/{episode_id}/requirement/{id}/`.replace(`{${"episode_id"}}`, encodeURIComponent(String(requestParameters.episodeId))).replace(`{${"id"}}`, encodeURIComponent(String(requestParameters.id))),
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => ClassRequirementFromJSON(jsonValue));
    }

    /**
     * A viewset for retrieving and checking class requirements.
     */
    async teamRequirementRetrieve(requestParameters: TeamRequirementRetrieveRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<ClassRequirement> {
        const response = await this.teamRequirementRetrieveRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     * Update uploaded avatar.
     */
    async teamTAvatarCreateRaw(requestParameters: TeamTAvatarCreateRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<void>> {
        if (requestParameters.episodeId === null || requestParameters.episodeId === undefined) {
            throw new runtime.RequiredError('episodeId','Required parameter requestParameters.episodeId was null or undefined when calling teamTAvatarCreate.');
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
        const consumes: runtime.Consume[] = [
            { contentType: 'multipart/form-data' },
        ];
        // @ts-ignore: canConsumeForm may be unused
        const canConsumeForm = runtime.canConsumeForm(consumes);

        let formParams: { append(param: string, value: any): any };
        let useForm = false;
        // use FormData to transmit files using content-type "multipart/form-data"
        useForm = canConsumeForm;
        if (useForm) {
            formParams = new FormData();
        } else {
            formParams = new URLSearchParams();
        }

        if (requestParameters.avatar !== undefined) {
            formParams.append('avatar', requestParameters.avatar as any);
        }

        const response = await this.request({
            path: `/api/team/{episode_id}/t/avatar/`.replace(`{${"episode_id"}}`, encodeURIComponent(String(requestParameters.episodeId))),
            method: 'POST',
            headers: headerParameters,
            query: queryParameters,
            body: formParams,
        }, initOverrides);

        return new runtime.VoidApiResponse(response);
    }

    /**
     * Update uploaded avatar.
     */
    async teamTAvatarCreate(requestParameters: TeamTAvatarCreateRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<void> {
        await this.teamTAvatarCreateRaw(requestParameters, initOverrides);
    }

    /**
     * A viewset for retrieving and updating all team/team profile info.  When creating a team, add the logged in user as the sole member.
     */
    async teamTCreateRaw(requestParameters: TeamTCreateRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<TeamCreate>> {
        if (requestParameters.episodeId === null || requestParameters.episodeId === undefined) {
            throw new runtime.RequiredError('episodeId','Required parameter requestParameters.episodeId was null or undefined when calling teamTCreate.');
        }

        if (requestParameters.teamCreateRequest === null || requestParameters.teamCreateRequest === undefined) {
            throw new runtime.RequiredError('teamCreateRequest','Required parameter requestParameters.teamCreateRequest was null or undefined when calling teamTCreate.');
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
            path: `/api/team/{episode_id}/t/`.replace(`{${"episode_id"}}`, encodeURIComponent(String(requestParameters.episodeId))),
            method: 'POST',
            headers: headerParameters,
            query: queryParameters,
            body: TeamCreateRequestToJSON(requestParameters.teamCreateRequest),
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => TeamCreateFromJSON(jsonValue));
    }

    /**
     * A viewset for retrieving and updating all team/team profile info.  When creating a team, add the logged in user as the sole member.
     */
    async teamTCreate(requestParameters: TeamTCreateRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<TeamCreate> {
        const response = await this.teamTCreateRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     * A viewset for retrieving and updating all team/team profile info.  When creating a team, add the logged in user as the sole member.
     */
    async teamTJoinCreateRaw(requestParameters: TeamTJoinCreateRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<void>> {
        if (requestParameters.episodeId === null || requestParameters.episodeId === undefined) {
            throw new runtime.RequiredError('episodeId','Required parameter requestParameters.episodeId was null or undefined when calling teamTJoinCreate.');
        }

        if (requestParameters.teamJoinRequest === null || requestParameters.teamJoinRequest === undefined) {
            throw new runtime.RequiredError('teamJoinRequest','Required parameter requestParameters.teamJoinRequest was null or undefined when calling teamTJoinCreate.');
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
            path: `/api/team/{episode_id}/t/join/`.replace(`{${"episode_id"}}`, encodeURIComponent(String(requestParameters.episodeId))),
            method: 'POST',
            headers: headerParameters,
            query: queryParameters,
            body: TeamJoinRequestToJSON(requestParameters.teamJoinRequest),
        }, initOverrides);

        return new runtime.VoidApiResponse(response);
    }

    /**
     * A viewset for retrieving and updating all team/team profile info.  When creating a team, add the logged in user as the sole member.
     */
    async teamTJoinCreate(requestParameters: TeamTJoinCreateRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<void> {
        await this.teamTJoinCreateRaw(requestParameters, initOverrides);
    }

    /**
     * Leave a team.
     */
    async teamTLeaveCreateRaw(requestParameters: TeamTLeaveCreateRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<void>> {
        if (requestParameters.episodeId === null || requestParameters.episodeId === undefined) {
            throw new runtime.RequiredError('episodeId','Required parameter requestParameters.episodeId was null or undefined when calling teamTLeaveCreate.');
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
            path: `/api/team/{episode_id}/t/leave/`.replace(`{${"episode_id"}}`, encodeURIComponent(String(requestParameters.episodeId))),
            method: 'POST',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.VoidApiResponse(response);
    }

    /**
     * Leave a team.
     */
    async teamTLeaveCreate(requestParameters: TeamTLeaveCreateRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<void> {
        await this.teamTLeaveCreateRaw(requestParameters, initOverrides);
    }

    /**
     * A viewset for retrieving and updating all team/team profile info.  When creating a team, add the logged in user as the sole member.
     */
    async teamTListRaw(requestParameters: TeamTListRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<PaginatedTeamPublicList>> {
        if (requestParameters.episodeId === null || requestParameters.episodeId === undefined) {
            throw new runtime.RequiredError('episodeId','Required parameter requestParameters.episodeId was null or undefined when calling teamTList.');
        }

        const queryParameters: any = {};

        if (requestParameters.ordering !== undefined) {
            queryParameters['ordering'] = requestParameters.ordering;
        }

        if (requestParameters.page !== undefined) {
            queryParameters['page'] = requestParameters.page;
        }

        if (requestParameters.search !== undefined) {
            queryParameters['search'] = requestParameters.search;
        }

        const headerParameters: runtime.HTTPHeaders = {};

        if (this.configuration && this.configuration.accessToken) {
            const token = this.configuration.accessToken;
            const tokenString = await token("jwtAuth", []);

            if (tokenString) {
                headerParameters["Authorization"] = `Bearer ${tokenString}`;
            }
        }
        const response = await this.request({
            path: `/api/team/{episode_id}/t/`.replace(`{${"episode_id"}}`, encodeURIComponent(String(requestParameters.episodeId))),
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => PaginatedTeamPublicListFromJSON(jsonValue));
    }

    /**
     * A viewset for retrieving and updating all team/team profile info.  When creating a team, add the logged in user as the sole member.
     */
    async teamTList(requestParameters: TeamTListRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<PaginatedTeamPublicList> {
        const response = await this.teamTListRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     * Retrieve or update information about the current team.
     */
    async teamTMePartialUpdateRaw(requestParameters: TeamTMePartialUpdateRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<TeamPrivate>> {
        if (requestParameters.episodeId === null || requestParameters.episodeId === undefined) {
            throw new runtime.RequiredError('episodeId','Required parameter requestParameters.episodeId was null or undefined when calling teamTMePartialUpdate.');
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
            path: `/api/team/{episode_id}/t/me/`.replace(`{${"episode_id"}}`, encodeURIComponent(String(requestParameters.episodeId))),
            method: 'PATCH',
            headers: headerParameters,
            query: queryParameters,
            body: PatchedTeamPrivateRequestToJSON(requestParameters.patchedTeamPrivateRequest),
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => TeamPrivateFromJSON(jsonValue));
    }

    /**
     * Retrieve or update information about the current team.
     */
    async teamTMePartialUpdate(requestParameters: TeamTMePartialUpdateRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<TeamPrivate> {
        const response = await this.teamTMePartialUpdateRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     * Retrieve or update information about the current team.
     */
    async teamTMeRetrieveRaw(requestParameters: TeamTMeRetrieveRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<TeamPrivate>> {
        if (requestParameters.episodeId === null || requestParameters.episodeId === undefined) {
            throw new runtime.RequiredError('episodeId','Required parameter requestParameters.episodeId was null or undefined when calling teamTMeRetrieve.');
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
            path: `/api/team/{episode_id}/t/me/`.replace(`{${"episode_id"}}`, encodeURIComponent(String(requestParameters.episodeId))),
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => TeamPrivateFromJSON(jsonValue));
    }

    /**
     * Retrieve or update information about the current team.
     */
    async teamTMeRetrieve(requestParameters: TeamTMeRetrieveRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<TeamPrivate> {
        const response = await this.teamTMeRetrieveRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     * Retrieve or update information about the current team.
     */
    async teamTMeUpdateRaw(requestParameters: TeamTMeUpdateRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<TeamPrivate>> {
        if (requestParameters.episodeId === null || requestParameters.episodeId === undefined) {
            throw new runtime.RequiredError('episodeId','Required parameter requestParameters.episodeId was null or undefined when calling teamTMeUpdate.');
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
            path: `/api/team/{episode_id}/t/me/`.replace(`{${"episode_id"}}`, encodeURIComponent(String(requestParameters.episodeId))),
            method: 'PUT',
            headers: headerParameters,
            query: queryParameters,
            body: TeamPrivateRequestToJSON(requestParameters.teamPrivateRequest),
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => TeamPrivateFromJSON(jsonValue));
    }

    /**
     * Retrieve or update information about the current team.
     */
    async teamTMeUpdate(requestParameters: TeamTMeUpdateRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<TeamPrivate> {
        const response = await this.teamTMeUpdateRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     * A viewset for retrieving and updating all team/team profile info.  When creating a team, add the logged in user as the sole member.
     */
    async teamTRetrieveRaw(requestParameters: TeamTRetrieveRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<TeamPublic>> {
        if (requestParameters.episodeId === null || requestParameters.episodeId === undefined) {
            throw new runtime.RequiredError('episodeId','Required parameter requestParameters.episodeId was null or undefined when calling teamTRetrieve.');
        }

        if (requestParameters.id === null || requestParameters.id === undefined) {
            throw new runtime.RequiredError('id','Required parameter requestParameters.id was null or undefined when calling teamTRetrieve.');
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
            path: `/api/team/{episode_id}/t/{id}/`.replace(`{${"episode_id"}}`, encodeURIComponent(String(requestParameters.episodeId))).replace(`{${"id"}}`, encodeURIComponent(String(requestParameters.id))),
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => TeamPublicFromJSON(jsonValue));
    }

    /**
     * A viewset for retrieving and updating all team/team profile info.  When creating a team, add the logged in user as the sole member.
     */
    async teamTRetrieve(requestParameters: TeamTRetrieveRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<TeamPublic> {
        const response = await this.teamTRetrieveRaw(requestParameters, initOverrides);
        return await response.value();
    }

}
