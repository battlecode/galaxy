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
import type { UserProfilePublicRequest } from './UserProfilePublicRequest';
import {
    UserProfilePublicRequestFromJSON,
    UserProfilePublicRequestFromJSONTyped,
    UserProfilePublicRequestToJSON,
} from './UserProfilePublicRequest';

/**
 * 
 * @export
 * @interface UserPublicRequest
 */
export interface UserPublicRequest {
    /**
     * 
     * @type {UserProfilePublicRequest}
     * @memberof UserPublicRequest
     */
    profile?: UserProfilePublicRequest;
    /**
     * Required. 150 characters or fewer. Letters, digits and @/./+/-/_ only.
     * @type {string}
     * @memberof UserPublicRequest
     */
    username: string;
}

/**
 * Check if a given object implements the UserPublicRequest interface.
 */
export function instanceOfUserPublicRequest(value: object): boolean {
    let isInstance = true;
    isInstance = isInstance && "username" in value;

    return isInstance;
}

export function UserPublicRequestFromJSON(json: any): UserPublicRequest {
    return UserPublicRequestFromJSONTyped(json, false);
}

export function UserPublicRequestFromJSONTyped(json: any, ignoreDiscriminator: boolean): UserPublicRequest {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'profile': !exists(json, 'profile') ? undefined : UserProfilePublicRequestFromJSON(json['profile']),
        'username': json['username'],
    };
}

export function UserPublicRequestToJSON(value?: UserPublicRequest | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'profile': UserProfilePublicRequestToJSON(value.profile),
        'username': value.username,
    };
}

