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
 * @interface GameMap
 */
export interface GameMap {
    /**
     *
     * @type {number}
     * @memberof GameMap
     */
    readonly id: number;
    /**
     *
     * @type {string}
     * @memberof GameMap
     */
    readonly episode: string;
    /**
     *
     * @type {string}
     * @memberof GameMap
     */
    readonly name: string;
    /**
     *
     * @type {boolean}
     * @memberof GameMap
     */
    readonly is_public: boolean;
}

/**
 * Check if a given object implements the GameMap interface.
 */
export function instanceOfGameMap(value: object): boolean {
    let isInstance = true;
    isInstance = isInstance && "id" in value;
    isInstance = isInstance && "episode" in value;
    isInstance = isInstance && "name" in value;
    isInstance = isInstance && "is_public" in value;

    return isInstance;
}

export function GameMapFromJSON(json: any): GameMap {
    return GameMapFromJSONTyped(json, false);
}

export function GameMapFromJSONTyped(json: any, ignoreDiscriminator: boolean): GameMap {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {

        'id': json['id'],
        'episode': json['episode'],
        'name': json['name'],
        'is_public': json['is_public'],
    };
}

export function GameMapToJSON(value?: GameMap | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {

    };
}
