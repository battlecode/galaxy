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
 * @interface UserPassed
 */
export interface UserPassed {
    /**
     * 
     * @type {number}
     * @memberof UserPassed
     */
    id: number;
    /**
     * 
     * @type {string}
     * @memberof UserPassed
     */
    username: string;
    /**
     * 
     * @type {string}
     * @memberof UserPassed
     */
    email: string;
    /**
     * 
     * @type {boolean}
     * @memberof UserPassed
     */
    passed: boolean;
}

/**
 * Check if a given object implements the UserPassed interface.
 */
export function instanceOfUserPassed(value: object): boolean {
    let isInstance = true;
    isInstance = isInstance && "id" in value;
    isInstance = isInstance && "username" in value;
    isInstance = isInstance && "email" in value;
    isInstance = isInstance && "passed" in value;

    return isInstance;
}

export function UserPassedFromJSON(json: any): UserPassed {
    return UserPassedFromJSONTyped(json, false);
}

export function UserPassedFromJSONTyped(json: any, ignoreDiscriminator: boolean): UserPassed {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'id': json['id'],
        'username': json['username'],
        'email': json['email'],
        'passed': json['passed'],
    };
}

export function UserPassedToJSON(value?: UserPassed | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'id': value.id,
        'username': value.username,
        'email': value.email,
        'passed': value.passed,
    };
}

