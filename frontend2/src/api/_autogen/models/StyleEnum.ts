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
export enum StyleEnum {
    Se = 'SE',
    De = 'DE'
}


export function StyleEnumFromJSON(json: any): StyleEnum {
    return StyleEnumFromJSONTyped(json, false);
}

export function StyleEnumFromJSONTyped(json: any, ignoreDiscriminator: boolean): StyleEnum {
    return json as StyleEnum;
}

export function StyleEnumToJSON(value?: StyleEnum | null): any {
    return value as any;
}

