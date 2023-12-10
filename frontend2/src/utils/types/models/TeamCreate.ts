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
import type { Status526Enum } from './Status526Enum';
import {
    Status526EnumFromJSON,
    Status526EnumFromJSONTyped,
    Status526EnumToJSON,
} from './Status526Enum';
import type { TeamProfilePrivate } from './TeamProfilePrivate';
import {
    TeamProfilePrivateFromJSON,
    TeamProfilePrivateFromJSONTyped,
    TeamProfilePrivateToJSON,
} from './TeamProfilePrivate';
import type { UserPublic } from './UserPublic';
import {
    UserPublicFromJSON,
    UserPublicFromJSONTyped,
    UserPublicToJSON,
} from './UserPublic';

/**
 * 
 * @export
 * @interface TeamCreate
 */
export interface TeamCreate {
    /**
     * 
     * @type {number}
     * @memberof TeamCreate
     */
    readonly id: number;
    /**
     * 
     * @type {TeamProfilePrivate}
     * @memberof TeamCreate
     */
    profile?: TeamProfilePrivate;
    /**
     * 
     * @type {string}
     * @memberof TeamCreate
     */
    episode?: string;
    /**
     * 
     * @type {string}
     * @memberof TeamCreate
     */
    name: string;
    /**
     * 
     * @type {Array<UserPublic>}
     * @memberof TeamCreate
     */
    readonly members: Array<UserPublic>;
    /**
     * 
     * @type {string}
     * @memberof TeamCreate
     */
    readonly join_key: string;
    /**
     * 
     * @type {Status526Enum}
     * @memberof TeamCreate
     */
    readonly status: Status526Enum;
}

/**
 * Check if a given object implements the TeamCreate interface.
 */
export function instanceOfTeamCreate(value: object): boolean {
    let isInstance = true;
    isInstance = isInstance && "id" in value;
    isInstance = isInstance && "name" in value;
    isInstance = isInstance && "members" in value;
    isInstance = isInstance && "join_key" in value;
    isInstance = isInstance && "status" in value;

    return isInstance;
}

export function TeamCreateFromJSON(json: any): TeamCreate {
    return TeamCreateFromJSONTyped(json, false);
}

export function TeamCreateFromJSONTyped(json: any, ignoreDiscriminator: boolean): TeamCreate {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'id': json['id'],
        'profile': !exists(json, 'profile') ? undefined : TeamProfilePrivateFromJSON(json['profile']),
        'episode': !exists(json, 'episode') ? undefined : json['episode'],
        'name': json['name'],
        'members': ((json['members'] as Array<any>).map(UserPublicFromJSON)),
        'join_key': json['join_key'],
        'status': Status526EnumFromJSON(json['status']),
    };
}

export function TeamCreateToJSON(value?: TeamCreate | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'profile': TeamProfilePrivateToJSON(value.profile),
        'episode': value.episode,
        'name': value.name,
    };
}

