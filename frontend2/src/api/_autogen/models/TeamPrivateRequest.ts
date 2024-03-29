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

import { exists, mapValues } from '../runtime';
import type { TeamProfilePrivateRequest } from './TeamProfilePrivateRequest';
import {
    TeamProfilePrivateRequestFromJSON,
    TeamProfilePrivateRequestFromJSONTyped,
    TeamProfilePrivateRequestToJSON,
} from './TeamProfilePrivateRequest';

/**
 * 
 * @export
 * @interface TeamPrivateRequest
 */
export interface TeamPrivateRequest {
    /**
     * 
     * @type {TeamProfilePrivateRequest}
     * @memberof TeamPrivateRequest
     */
    profile?: TeamProfilePrivateRequest;
}

/**
 * Check if a given object implements the TeamPrivateRequest interface.
 */
export function instanceOfTeamPrivateRequest(value: object): boolean {
    let isInstance = true;

    return isInstance;
}

export function TeamPrivateRequestFromJSON(json: any): TeamPrivateRequest {
    return TeamPrivateRequestFromJSONTyped(json, false);
}

export function TeamPrivateRequestFromJSONTyped(json: any, ignoreDiscriminator: boolean): TeamPrivateRequest {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'profile': !exists(json, 'profile') ? undefined : TeamProfilePrivateRequestFromJSON(json['profile']),
    };
}

export function TeamPrivateRequestToJSON(value?: TeamPrivateRequest | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'profile': TeamProfilePrivateRequestToJSON(value.profile),
    };
}

