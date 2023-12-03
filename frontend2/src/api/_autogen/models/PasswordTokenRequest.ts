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
 * @interface PasswordTokenRequest
 */
export interface PasswordTokenRequest {
    /**
     *
     * @type {string}
     * @memberof PasswordTokenRequest
     */
    password: string;
    /**
     *
     * @type {string}
     * @memberof PasswordTokenRequest
     */
    token: string;
}

/**
 * Check if a given object implements the PasswordTokenRequest interface.
 */
export function instanceOfPasswordTokenRequest(value: object): boolean {
    let isInstance = true;
    isInstance = isInstance && "password" in value;
    isInstance = isInstance && "token" in value;

    return isInstance;
}

export function PasswordTokenRequestFromJSON(json: any): PasswordTokenRequest {
    return PasswordTokenRequestFromJSONTyped(json, false);
}

export function PasswordTokenRequestFromJSONTyped(json: any, ignoreDiscriminator: boolean): PasswordTokenRequest {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {

        'password': json['password'],
        'token': json['token'],
    };
}

export function PasswordTokenRequestToJSON(value?: PasswordTokenRequest | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {

        'password': value.password,
        'token': value.token,
    };
}
