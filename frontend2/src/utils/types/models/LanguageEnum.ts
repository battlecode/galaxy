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
export enum LanguageEnum {
    Java8 = 'java8',
    Py3 = 'py3'
}


export function LanguageEnumFromJSON(json: any): LanguageEnum {
    return LanguageEnumFromJSONTyped(json, false);
}

export function LanguageEnumFromJSONTyped(json: any, ignoreDiscriminator: boolean): LanguageEnum {
    return json as LanguageEnum;
}

export function LanguageEnumToJSON(value?: LanguageEnum | null): any {
    return value as any;
}

