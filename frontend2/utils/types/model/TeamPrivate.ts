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

export interface TeamPrivate {
    id: number;

    profile?: models.TeamProfilePrivate;

    episode?: string;

    name: string;

    members: Array<models.UserPublic>;

    join_key: string;

    status: models.Status526Enum;

}
export namespace TeamPrivate {
}
