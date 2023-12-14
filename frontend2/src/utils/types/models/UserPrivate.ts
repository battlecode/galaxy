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
import type { UserProfilePrivate } from './UserProfilePrivate';
import {
    UserProfilePrivateFromJSON,
    UserProfilePrivateFromJSONTyped,
    UserProfilePrivateToJSON,
} from './UserProfilePrivate';

/**
 * 
 * @export
 * @interface UserPrivate
 */
export interface UserPrivate {
    /**
     * 
     * @type {number}
     * @memberof UserPrivate
     */
    readonly id: number;
    /**
     * 
     * @type {UserProfilePrivate}
     * @memberof UserPrivate
     */
    profile?: UserProfilePrivate;
    /**
     * Required. 150 characters or fewer. Letters, digits and @/./+/-/_ only.
     * @type {string}
     * @memberof UserPrivate
     */
    readonly username: string;
    /**
     * 
     * @type {string}
     * @memberof UserPrivate
     */
    email: string;
    /**
     * 
     * @type {string}
     * @memberof UserPrivate
     */
    first_name: string;
    /**
     * 
     * @type {string}
     * @memberof UserPrivate
     */
    last_name: string;
    /**
     * Designates whether the user can log into this admin site.
     * @type {boolean}
     * @memberof UserPrivate
     */
    readonly is_staff: boolean;
}

/**
 * Check if a given object implements the UserPrivate interface.
 */
export function instanceOfUserPrivate(value: object): boolean {
    let isInstance = true;
    isInstance = isInstance && "id" in value;
    isInstance = isInstance && "username" in value;
    isInstance = isInstance && "email" in value;
    isInstance = isInstance && "first_name" in value;
    isInstance = isInstance && "last_name" in value;
    isInstance = isInstance && "is_staff" in value;

    return isInstance;
}

export function UserPrivateFromJSON(json: any): UserPrivate {
    return UserPrivateFromJSONTyped(json, false);
}

export function UserPrivateFromJSONTyped(json: any, ignoreDiscriminator: boolean): UserPrivate {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'id': json['id'],
        'profile': !exists(json, 'profile') ? undefined : UserProfilePrivateFromJSON(json['profile']),
        'username': json['username'],
        'email': json['email'],
        'first_name': json['first_name'],
        'last_name': json['last_name'],
        'is_staff': json['is_staff'],
    };
}

export function UserPrivateToJSON(value?: UserPrivate | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'profile': UserProfilePrivateToJSON(value.profile),
        'email': value.email,
        'first_name': value.first_name,
        'last_name': value.last_name,
    };
}
