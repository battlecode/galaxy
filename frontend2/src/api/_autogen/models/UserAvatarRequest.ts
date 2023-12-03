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
 * @interface UserAvatarRequest
 */
export interface UserAvatarRequest {
    /**
     *
     * @type {Blob}
     * @memberof UserAvatarRequest
     */
    avatar: Blob;
}

/**
 * Check if a given object implements the UserAvatarRequest interface.
 */
export function instanceOfUserAvatarRequest(value: object): boolean {
    let isInstance = true;
    isInstance = isInstance && "avatar" in value;

    return isInstance;
}

export function UserAvatarRequestFromJSON(json: any): UserAvatarRequest {
    return UserAvatarRequestFromJSONTyped(json, false);
}

export function UserAvatarRequestFromJSONTyped(json: any, ignoreDiscriminator: boolean): UserAvatarRequest {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {

        'avatar': json['avatar'],
    };
}

export function UserAvatarRequestToJSON(value?: UserAvatarRequest | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {

        'avatar': value.avatar,
    };
}
