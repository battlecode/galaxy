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
import type { EligibilityCriterion } from './EligibilityCriterion';
import {
    EligibilityCriterionFromJSON,
    EligibilityCriterionFromJSONTyped,
    EligibilityCriterionToJSON,
} from './EligibilityCriterion';
import type { LanguageEnum } from './LanguageEnum';
import {
    LanguageEnumFromJSON,
    LanguageEnumFromJSONTyped,
    LanguageEnumToJSON,
} from './LanguageEnum';

/**
 *
 * @export
 * @interface Episode
 */
export interface Episode {
    /**
     *
     * @type {string}
     * @memberof Episode
     */
    name_short: string;
    /**
     *
     * @type {string}
     * @memberof Episode
     */
    name_long: string;
    /**
     *
     * @type {string}
     * @memberof Episode
     */
    blurb?: string;
    /**
     *
     * @type {Date}
     * @memberof Episode
     */
    game_release: Date;
    /**
     *
     * @type {LanguageEnum}
     * @memberof Episode
     */
    language: LanguageEnum;
    /**
     *
     * @type {string}
     * @memberof Episode
     */
    scaffold?: string;
    /**
     *
     * @type {string}
     * @memberof Episode
     */
    artifact_name?: string;
    /**
     *
     * @type {string}
     * @memberof Episode
     */
    release_version_public?: string;
    /**
     *
     * @type {string}
     * @memberof Episode
     */
    release_version_saturn?: string;
    /**
     *
     * @type {Array<EligibilityCriterion>}
     * @memberof Episode
     */
    eligibility_criteria: Array<EligibilityCriterion>;
    /**
     *
     * @type {boolean}
     * @memberof Episode
     */
    readonly frozen: boolean;
}

/**
 * Check if a given object implements the Episode interface.
 */
export function instanceOfEpisode(value: object): boolean {
    let isInstance = true;
    isInstance = isInstance && "name_short" in value;
    isInstance = isInstance && "name_long" in value;
    isInstance = isInstance && "game_release" in value;
    isInstance = isInstance && "language" in value;
    isInstance = isInstance && "eligibility_criteria" in value;
    isInstance = isInstance && "frozen" in value;

    return isInstance;
}

export function EpisodeFromJSON(json: any): Episode {
    return EpisodeFromJSONTyped(json, false);
}

export function EpisodeFromJSONTyped(json: any, ignoreDiscriminator: boolean): Episode {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {

        'name_short': json['name_short'],
        'name_long': json['name_long'],
        'blurb': !exists(json, 'blurb') ? undefined : json['blurb'],
        'game_release': (new Date(json['game_release'])),
        'language': LanguageEnumFromJSON(json['language']),
        'scaffold': !exists(json, 'scaffold') ? undefined : json['scaffold'],
        'artifact_name': !exists(json, 'artifact_name') ? undefined : json['artifact_name'],
        'release_version_public': !exists(json, 'release_version_public') ? undefined : json['release_version_public'],
        'release_version_saturn': !exists(json, 'release_version_saturn') ? undefined : json['release_version_saturn'],
        'eligibility_criteria': ((json['eligibility_criteria'] as Array<any>).map(EligibilityCriterionFromJSON)),
        'frozen': json['frozen'],
    };
}

export function EpisodeToJSON(value?: Episode | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {

        'name_short': value.name_short,
        'name_long': value.name_long,
        'blurb': value.blurb,
        'game_release': (value.game_release.toISOString()),
        'language': LanguageEnumToJSON(value.language),
        'scaffold': value.scaffold,
        'artifact_name': value.artifact_name,
        'release_version_public': value.release_version_public,
        'release_version_saturn': value.release_version_saturn,
        'eligibility_criteria': ((value.eligibility_criteria as Array<any>).map(EligibilityCriterionToJSON)),
    };
}
