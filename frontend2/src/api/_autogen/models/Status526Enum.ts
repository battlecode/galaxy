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

/**
 * 
 * @export
 * @enum {string}
 */
export enum Status526Enum {
    R = 'R',
    X = 'X',
    S = 'S',
    O = 'O'
}


export function Status526EnumFromJSON(json: any): Status526Enum {
    return Status526EnumFromJSONTyped(json, false);
}

export function Status526EnumFromJSONTyped(json: any, ignoreDiscriminator: boolean): Status526Enum {
    return json as Status526Enum;
}

export function Status526EnumToJSON(value?: Status526Enum | null): any {
    return value as any;
}

