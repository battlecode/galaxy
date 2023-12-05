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
 * @interface TeamReportRequest
 */
export interface TeamReportRequest {
    /**
     *
     * @type {Blob}
     * @memberof TeamReportRequest
     */
    report: Blob;
}

/**
 * Check if a given object implements the TeamReportRequest interface.
 */
export function instanceOfTeamReportRequest(value: object): boolean {
    let isInstance = true;
    isInstance = isInstance && "report" in value;

    return isInstance;
}

export function TeamReportRequestFromJSON(json: any): TeamReportRequest {
    return TeamReportRequestFromJSONTyped(json, false);
}

export function TeamReportRequestFromJSONTyped(json: any, ignoreDiscriminator: boolean): TeamReportRequest {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {

        'report': json['report'],
    };
}

export function TeamReportRequestToJSON(value?: TeamReportRequest | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {

        'report': value.report,
    };
}
