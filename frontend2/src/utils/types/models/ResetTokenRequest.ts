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
 * @interface ResetTokenRequest
 */
export interface ResetTokenRequest {
    /**
     * 
     * @type {string}
     * @memberof ResetTokenRequest
     */
    token: string;
}

/**
 * Check if a given object implements the ResetTokenRequest interface.
 */
export function instanceOfResetTokenRequest(value: object): boolean {
    let isInstance = true;
    isInstance = isInstance && "token" in value;

    return isInstance;
}

export function ResetTokenRequestFromJSON(json: any): ResetTokenRequest {
    return ResetTokenRequestFromJSONTyped(json, false);
}

export function ResetTokenRequestFromJSONTyped(json: any, ignoreDiscriminator: boolean): ResetTokenRequest {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'token': json['token'],
    };
}

export function ResetTokenRequestToJSON(value?: ResetTokenRequest | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'token': value.token,
    };
}

