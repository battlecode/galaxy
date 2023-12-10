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
 * @interface SubmissionReportRequest
 */
export interface SubmissionReportRequest {
    /**
     * 
     * @type {SaturnInvocationRequest}
     * @memberof SubmissionReportRequest
     */
    invocation: SaturnInvocationRequest;
    /**
     * 
     * @type {boolean}
     * @memberof SubmissionReportRequest
     */
    accepted?: boolean;
}

/**
 * Check if a given object implements the SubmissionReportRequest interface.
 */
export function instanceOfSubmissionReportRequest(value: object): boolean {
    let isInstance = true;
    isInstance = isInstance && "invocation" in value;

    return isInstance;
}

export function SubmissionReportRequestFromJSON(json: any): SubmissionReportRequest {
    return SubmissionReportRequestFromJSONTyped(json, false);
}

export function SubmissionReportRequestFromJSONTyped(json: any, ignoreDiscriminator: boolean): SubmissionReportRequest {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'invocation': SaturnInvocationRequestFromJSON(json['invocation']),
        'accepted': !exists(json, 'accepted') ? undefined : json['accepted'],
    };
}

export function SubmissionReportRequestToJSON(value?: SubmissionReportRequest | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'invocation': SaturnInvocationRequestToJSON(value.invocation),
        'accepted': value.accepted,
    };
}

