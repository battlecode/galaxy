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

import * as models from './models';

export interface Tournament {
    name_short: string;

    name_long: string;

    blurb?: string;

    episode: string;

    style: models.StyleEnum;

    display_date: string;

    eligibility_includes?: Array<number>;

    eligibility_excludes?: Array<number>;

    require_resume: boolean;

    is_public: boolean;

    submission_freeze: string;

    submission_unfreeze: string;

    is_eligible: boolean;

}
export namespace Tournament {
}
