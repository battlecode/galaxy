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
import type { MatchRating } from './MatchRating';
import {
    MatchRatingFromJSON,
    MatchRatingFromJSONTyped,
    MatchRatingToJSON,
} from './MatchRating';
import type { TeamPublic } from './TeamPublic';
import {
    TeamPublicFromJSON,
    TeamPublicFromJSONTyped,
    TeamPublicToJSON,
} from './TeamPublic';

/**
 * 
 * @export
 * @interface TeamRating
 */
export interface TeamRating {
    /**
     * 
     * @type {TeamPublic}
     * @memberof TeamRating
     */
    team: TeamPublic;
    /**
     * 
     * @type {Array<MatchRating>}
     * @memberof TeamRating
     */
    rating_history: Array<MatchRating>;
}

/**
 * Check if a given object implements the TeamRating interface.
 */
export function instanceOfTeamRating(value: object): boolean {
    let isInstance = true;
    isInstance = isInstance && "team" in value;
    isInstance = isInstance && "rating_history" in value;

    return isInstance;
}

export function TeamRatingFromJSON(json: any): TeamRating {
    return TeamRatingFromJSONTyped(json, false);
}

export function TeamRatingFromJSONTyped(json: any, ignoreDiscriminator: boolean): TeamRating {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'team': TeamPublicFromJSON(json['team']),
        'rating_history': ((json['rating_history'] as Array<any>).map(MatchRatingFromJSON)),
    };
}

export function TeamRatingToJSON(value?: TeamRating | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'team': TeamPublicToJSON(value.team),
        'rating_history': ((value.rating_history as Array<any>).map(MatchRatingToJSON)),
    };
}

