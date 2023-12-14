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
import type { SaturnInvocationRequest } from './SaturnInvocationRequest';
import {
    SaturnInvocationRequestFromJSON,
    SaturnInvocationRequestFromJSONTyped,
    SaturnInvocationRequestToJSON,
} from './SaturnInvocationRequest';

/**
 *
 * @export
 * @interface MatchReportRequest
 */
export interface MatchReportRequest {
    /**
     *
     * @type {SaturnInvocationRequest}
     * @memberof MatchReportRequest
     */
    invocation: SaturnInvocationRequest;
    /**
     *
     * @type {Array<number>}
     * @memberof MatchReportRequest
     */
    scores?: Array<number>;
}

/**
 * Check if a given object implements the MatchReportRequest interface.
 */
export function instanceOfMatchReportRequest(value: object): boolean {
    let isInstance = true;
    isInstance = isInstance && "invocation" in value;

    return isInstance;
}

export function MatchReportRequestFromJSON(json: any): MatchReportRequest {
    return MatchReportRequestFromJSONTyped(json, false);
}

export function MatchReportRequestFromJSONTyped(json: any, ignoreDiscriminator: boolean): MatchReportRequest {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {

        'invocation': SaturnInvocationRequestFromJSON(json['invocation']),
        'scores': !exists(json, 'scores') ? undefined : json['scores'],
    };
}

export function MatchReportRequestToJSON(value?: MatchReportRequest | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {

        'invocation': SaturnInvocationRequestToJSON(value.invocation),
        'scores': value.scores,
    };
}