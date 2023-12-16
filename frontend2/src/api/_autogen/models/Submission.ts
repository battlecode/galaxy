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
import type { StatusBccEnum } from './StatusBccEnum';
import {
    StatusBccEnumFromJSON,
    StatusBccEnumFromJSONTyped,
    StatusBccEnumToJSON,
} from './StatusBccEnum';

/**
 * 
 * @export
 * @interface Submission
 */
export interface Submission {
    /**
     * 
     * @type {number}
     * @memberof Submission
     */
    readonly id: number;
    /**
     * 
     * @type {StatusBccEnum}
     * @memberof Submission
     */
    readonly status: StatusBccEnum;
    /**
     * 
     * @type {string}
     * @memberof Submission
     */
    readonly logs: string;
    /**
     * 
     * @type {string}
     * @memberof Submission
     */
    readonly episode: string;
    /**
     * 
     * @type {number}
     * @memberof Submission
     */
    readonly team: number;
    /**
     * 
     * @type {string}
     * @memberof Submission
     */
    readonly teamname: string;
    /**
     * 
     * @type {number}
     * @memberof Submission
     */
    readonly user: number;
    /**
     * 
     * @type {string}
     * @memberof Submission
     */
    readonly username: string;
    /**
     * 
     * @type {Date}
     * @memberof Submission
     */
    readonly created: Date;
    /**
     * 
     * @type {boolean}
     * @memberof Submission
     */
    readonly accepted: boolean;
    /**
     * 
     * @type {string}
     * @memberof Submission
     */
    _package?: string;
    /**
     * 
     * @type {string}
     * @memberof Submission
     */
    description?: string;
}

/**
 * Check if a given object implements the Submission interface.
 */
export function instanceOfSubmission(value: object): boolean {
    let isInstance = true;
    isInstance = isInstance && "id" in value;
    isInstance = isInstance && "status" in value;
    isInstance = isInstance && "logs" in value;
    isInstance = isInstance && "episode" in value;
    isInstance = isInstance && "team" in value;
    isInstance = isInstance && "teamname" in value;
    isInstance = isInstance && "user" in value;
    isInstance = isInstance && "username" in value;
    isInstance = isInstance && "created" in value;
    isInstance = isInstance && "accepted" in value;

    return isInstance;
}

export function SubmissionFromJSON(json: any): Submission {
    return SubmissionFromJSONTyped(json, false);
}

export function SubmissionFromJSONTyped(json: any, ignoreDiscriminator: boolean): Submission {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'id': json['id'],
        'status': StatusBccEnumFromJSON(json['status']),
        'logs': json['logs'],
        'episode': json['episode'],
        'team': json['team'],
        'teamname': json['teamname'],
        'user': json['user'],
        'username': json['username'],
        'created': (new Date(json['created'])),
        'accepted': json['accepted'],
        '_package': !exists(json, 'package') ? undefined : json['package'],
        'description': !exists(json, 'description') ? undefined : json['description'],
    };
}

export function SubmissionToJSON(value?: Submission | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'package': value._package,
        'description': value.description,
    };
}

