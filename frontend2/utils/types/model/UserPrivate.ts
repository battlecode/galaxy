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

export interface UserPrivate {
    id: number;

    profile?: models.UserProfilePrivate;

    /**
     * Required. 150 characters or fewer. Letters, digits and @/./+/-/_ only.
     */
    username: string;

    email: string;

    first_name: string;

    last_name: string;

    /**
     * Designates whether the user can log into this admin site.
     */
    is_staff: boolean;

}
