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

export interface UserProfilePrivate {
    gender: models.GenderEnum;

    gender_details?: string;

    school?: string;

    biography?: string;

    kerberos?: string;

    avatar_url: string;

    has_avatar: boolean;

    has_resume: boolean;

    country: models.CountryEnum;

}
export namespace UserProfilePrivate {
}
