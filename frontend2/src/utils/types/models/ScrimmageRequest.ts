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
import type { PlayerOrderEnum } from './PlayerOrderEnum';
import {
    PlayerOrderEnumFromJSON,
    PlayerOrderEnumFromJSONTyped,
    PlayerOrderEnumToJSON,
} from './PlayerOrderEnum';
import type { ScrimmageStatusEnum } from './ScrimmageStatusEnum';
import {
    ScrimmageStatusEnumFromJSON,
    ScrimmageStatusEnumFromJSONTyped,
    ScrimmageStatusEnumToJSON,
} from './ScrimmageStatusEnum';

/**
 * 
 * @export
 * @interface ScrimmageRequest
 */
export interface ScrimmageRequest {
    /**
     * 
     * @type {number}
     * @memberof ScrimmageRequest
     */
    readonly id: number;
    /**
     * 
     * @type {string}
     * @memberof ScrimmageRequest
     */
    readonly episode: string;
    /**
     * 
     * @type {Date}
     * @memberof ScrimmageRequest
     */
    readonly created: Date;
    /**
     * 
     * @type {ScrimmageStatusEnum}
     * @memberof ScrimmageRequest
     */
    readonly status: ScrimmageStatusEnum;
    /**
     * 
     * @type {boolean}
     * @memberof ScrimmageRequest
     */
    is_ranked: boolean;
    /**
     * 
     * @type {number}
     * @memberof ScrimmageRequest
     */
    readonly requested_by: number;
    /**
     * 
     * @type {string}
     * @memberof ScrimmageRequest
     */
    readonly requested_by_name: string;
    /**
     * 
     * @type {number}
     * @memberof ScrimmageRequest
     */
    readonly requested_by_rating: number;
    /**
     * 
     * @type {number}
     * @memberof ScrimmageRequest
     */
    requested_to: number;
    /**
     * 
     * @type {string}
     * @memberof ScrimmageRequest
     */
    readonly requested_to_name: string;
    /**
     * 
     * @type {number}
     * @memberof ScrimmageRequest
     */
    readonly requested_to_rating: number;
    /**
     * 
     * @type {PlayerOrderEnum}
     * @memberof ScrimmageRequest
     */
    player_order: PlayerOrderEnum;
    /**
     * 
     * @type {Array<string>}
     * @memberof ScrimmageRequest
     */
    readonly maps: Array<string>;
}

/**
 * Check if a given object implements the ScrimmageRequest interface.
 */
export function instanceOfScrimmageRequest(value: object): boolean {
    let isInstance = true;
    isInstance = isInstance && "id" in value;
    isInstance = isInstance && "episode" in value;
    isInstance = isInstance && "created" in value;
    isInstance = isInstance && "status" in value;
    isInstance = isInstance && "is_ranked" in value;
    isInstance = isInstance && "requested_by" in value;
    isInstance = isInstance && "requested_by_name" in value;
    isInstance = isInstance && "requested_by_rating" in value;
    isInstance = isInstance && "requested_to" in value;
    isInstance = isInstance && "requested_to_name" in value;
    isInstance = isInstance && "requested_to_rating" in value;
    isInstance = isInstance && "player_order" in value;
    isInstance = isInstance && "maps" in value;

    return isInstance;
}

export function ScrimmageRequestFromJSON(json: any): ScrimmageRequest {
    return ScrimmageRequestFromJSONTyped(json, false);
}

export function ScrimmageRequestFromJSONTyped(json: any, ignoreDiscriminator: boolean): ScrimmageRequest {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'id': json['id'],
        'episode': json['episode'],
        'created': (new Date(json['created'])),
        'status': ScrimmageStatusEnumFromJSON(json['status']),
        'is_ranked': json['is_ranked'],
        'requested_by': json['requested_by'],
        'requested_by_name': json['requested_by_name'],
        'requested_by_rating': json['requested_by_rating'],
        'requested_to': json['requested_to'],
        'requested_to_name': json['requested_to_name'],
        'requested_to_rating': json['requested_to_rating'],
        'player_order': PlayerOrderEnumFromJSON(json['player_order']),
        'maps': json['maps'],
    };
}

export function ScrimmageRequestToJSON(value?: ScrimmageRequest | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'is_ranked': value.is_ranked,
        'requested_to': value.requested_to,
        'player_order': PlayerOrderEnumToJSON(value.player_order),
    };
}

