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
/**
 *
 * @export
 * @interface TeamJoinRequest
 */
export interface TeamJoinRequest {
    /**
     *
     * @type {string}
     * @memberof TeamJoinRequest
     */
    join_key: string;
    /**
     *
     * @type {string}
     * @memberof TeamJoinRequest
     */
    name: string;
}

/**
 * Check if a given object implements the TeamJoinRequest interface.
 */
export function instanceOfTeamJoinRequest(value: object): boolean {
    let isInstance = true;
    isInstance = isInstance && "join_key" in value;
    isInstance = isInstance && "name" in value;

    return isInstance;
}

export function TeamJoinRequestFromJSON(json: any): TeamJoinRequest {
    return TeamJoinRequestFromJSONTyped(json, false);
}

export function TeamJoinRequestFromJSONTyped(json: any, ignoreDiscriminator: boolean): TeamJoinRequest {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {

        'join_key': json['join_key'],
        'name': json['name'],
    };
}

export function TeamJoinRequestToJSON(value?: TeamJoinRequest | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {

        'join_key': value.join_key,
        'name': value.name,
    };
}