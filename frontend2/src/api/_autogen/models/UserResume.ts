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
 * @interface UserResume
 */
export interface UserResume {
    /**
     *
     * @type {boolean}
     * @memberof UserResume
     */
    readonly ready: boolean;
    /**
     *
     * @type {string}
     * @memberof UserResume
     */
    readonly url: string;
    /**
     *
     * @type {string}
     * @memberof UserResume
     */
    readonly reason: string;
}

/**
 * Check if a given object implements the UserResume interface.
 */
export function instanceOfUserResume(value: object): boolean {
    let isInstance = true;
    isInstance = isInstance && "ready" in value;
    isInstance = isInstance && "url" in value;
    isInstance = isInstance && "reason" in value;

    return isInstance;
}

export function UserResumeFromJSON(json: any): UserResume {
    return UserResumeFromJSONTyped(json, false);
}

export function UserResumeFromJSONTyped(json: any, ignoreDiscriminator: boolean): UserResume {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {

        'ready': json['ready'],
        'url': json['url'],
        'reason': json['reason'],
    };
}

export function UserResumeToJSON(value?: UserResume | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {

    };
}