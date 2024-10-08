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
 * @interface MatchRating
 */
export interface MatchRating {
    /**
     * 
     * @type {number}
     * @memberof MatchRating
     */
    rating: number;
    /**
     * 
     * @type {Date}
     * @memberof MatchRating
     */
    timestamp: Date;
}

/**
 * Check if a given object implements the MatchRating interface.
 */
export function instanceOfMatchRating(value: object): boolean {
    let isInstance = true;
    isInstance = isInstance && "rating" in value;
    isInstance = isInstance && "timestamp" in value;

    return isInstance;
}

export function MatchRatingFromJSON(json: any): MatchRating {
    return MatchRatingFromJSONTyped(json, false);
}

export function MatchRatingFromJSONTyped(json: any, ignoreDiscriminator: boolean): MatchRating {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'rating': json['rating'],
        'timestamp': (new Date(json['timestamp'])),
    };
}

export function MatchRatingToJSON(value?: MatchRating | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'rating': value.rating,
        'timestamp': (value.timestamp.toISOString()),
    };
}

