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
export enum ScrimmageStatusEnum {
    P = 'P',
    Y = 'Y',
    N = 'N'
}


export function ScrimmageStatusEnumFromJSON(json: any): ScrimmageStatusEnum {
    return ScrimmageStatusEnumFromJSONTyped(json, false);
}

export function ScrimmageStatusEnumFromJSONTyped(json: any, ignoreDiscriminator: boolean): ScrimmageStatusEnum {
    return json as ScrimmageStatusEnum;
}

export function ScrimmageStatusEnumToJSON(value?: ScrimmageStatusEnum | null): any {
    return value as any;
}
