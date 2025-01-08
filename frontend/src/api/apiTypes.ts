import type { QueryClient, QueryKey } from "@tanstack/react-query";
import {
  type CountryEnum,
  GenderEnum as GeneratedGenderEnum,
} from "./_autogen";

export interface QueryKeyBuilder<T> {
  key: (request: T) => QueryKey;
}

export interface QueryKeyHolder {
  key: () => QueryKey;
}

export type QueryFuncBuilder<T, K = void> = (request: T) => Promise<K>;

export type PaginatedQueryFuncBuilder<T, K = void> = (
  request: T,
  queryClient: QueryClient,
  prefetchNext: boolean,
) => Promise<K>;

/**
 * Contains all of the information needed to represent a single useQuery hook.
 * - `queryKey`: a container for the query key, which should be "built" using `helpers.buildKey`
 * - `queryFn`: the function that will be called to fetch the data. This function should take a
 *  single argument, the `request` of type `K`, and return a `Promise<T>`.
 */
export interface QueryFactory<T, K> {
  queryKey: QueryKeyHolder | QueryKeyBuilder<T>;
  queryFn: QueryFuncBuilder<T, K>;
}

/**
 * Contains all of the information needed to represent a single paginated useQuery hook.
 *
 * Note that this interface is similar to `QueryFactory`, but includes a PaginatedQueryFuncBuilder<T, K>
 * which enables automatic prefetching of the next page of table data.
 * - `queryKey`: a container for the query key, which should be "built" using `helpers.buildKey`
 * - `queryFn`: the function that will be called to fetch the data. This function should take
 *  the `request` of type `T`, the `queryClient`, and a `prefetchNext` boolean, and return a `Promise<K>`.
 *
 * If `prefetchNext` is true, the query function will prefetch the next page of data.
 */
export interface PaginatedQueryFactory<T, K> {
  queryKey: QueryKeyBuilder<T>;
  queryFn: PaginatedQueryFuncBuilder<T, K>;
}

export interface PaginatedRequestMinimal {
  page?: number;
}
export interface PaginatedResultMinimal {
  count?: number;
  next?: string | null;
  previous?: string | null;
}

export enum GenderEnum {
  FEMALE = GeneratedGenderEnum.F,
  MALE = GeneratedGenderEnum.M,
  NONBINARY = GeneratedGenderEnum.N,
  SELF_DESCRIBED = GeneratedGenderEnum.Star,
  RATHER_NOT_SAY = GeneratedGenderEnum.QuestionMark,
}

export type Gender = `${GenderEnum}`;

export enum ScrimmageTypeEnum {
  ALL = "All",
  RANKED = "Ranked",
  UNRANKED = "Unranked",
}

export const COUNTRIES: Record<CountryEnum, string> = {
  US: "United States of America",
  CA: "Canada",
  AU: "Australia",
  GB: "United Kingdom",
  NL: "Netherlands",
  KR: "South Korea",
  FR: "France",
  AF: "Afghanistan",
  AX: "Åland Islands",
  AL: "Albania",
  DZ: "Algeria",
  AS: "American Samoa",
  AD: "Andorra",
  AO: "Angola",
  AI: "Anguilla",
  AQ: "Antarctica",
  AG: "Antigua and Barbuda",
  AR: "Argentina",
  AM: "Armenia",
  AW: "Aruba",
  AT: "Austria",
  AZ: "Azerbaijan",
  BS: "Bahamas",
  BH: "Bahrain",
  BD: "Bangladesh",
  BB: "Barbados",
  BY: "Belarus",
  BE: "Belgium",
  BZ: "Belize",
  BJ: "Benin",
  BM: "Bermuda",
  BT: "Bhutan",
  BO: "Bolivia",
  BQ: "Bonaire, Sint Eustatius and Saba",
  BA: "Bosnia and Herzegovina",
  BW: "Botswana",
  BV: "Bouvet Island",
  BR: "Brazil",
  IO: "British Indian Ocean Territory",
  BN: "Brunei",
  BG: "Bulgaria",
  BF: "Burkina Faso",
  BI: "Burundi",
  CV: "Cabo Verde",
  KH: "Cambodia",
  CM: "Cameroon",
  KY: "Cayman Islands",
  CF: "Central African Republic",
  TD: "Chad",
  CL: "Chile",
  CN: "China",
  CX: "Christmas Island",
  CC: "Cocos (Keeling) Islands",
  CO: "Colombia",
  KM: "Comoros",
  CG: "Congo",
  CD: "Congo (the Democratic Republic of the)",
  CK: "Cook Islands",
  CR: "Costa Rica",
  CI: "Côte d'Ivoire",
  HR: "Croatia",
  CU: "Cuba",
  CW: "Curaçao",
  CY: "Cyprus",
  CZ: "Czechia",
  DK: "Denmark",
  DJ: "Djibouti",
  DM: "Dominica",
  DO: "Dominican Republic",
  EC: "Ecuador",
  EG: "Egypt",
  SV: "El Salvador",
  GQ: "Equatorial Guinea",
  ER: "Eritrea",
  EE: "Estonia",
  SZ: "Eswatini",
  ET: "Ethiopia",
  FK: "Falkland Islands (Malvinas)",
  FO: "Faroe Islands",
  FJ: "Fiji",
  FI: "Finland",
  GF: "French Guiana",
  PF: "French Polynesia",
  TF: "French Southern Territories",
  GA: "Gabon",
  GM: "Gambia",
  GE: "Georgia",
  DE: "Germany",
  GH: "Ghana",
  GI: "Gibraltar",
  GR: "Greece",
  GL: "Greenland",
  GD: "Grenada",
  GP: "Guadeloupe",
  GU: "Guam",
  GT: "Guatemala",
  GG: "Guernsey",
  GN: "Guinea",
  GW: "Guinea-Bissau",
  GY: "Guyana",
  HT: "Haiti",
  HM: "Heard Island and McDonald Islands",
  VA: "Holy See",
  HN: "Honduras",
  HK: "Hong Kong",
  HU: "Hungary",
  IS: "Iceland",
  IN: "India",
  ID: "Indonesia",
  IR: "Iran",
  IQ: "Iraq",
  IE: "Ireland",
  IM: "Isle of Man",
  IL: "Israel",
  IT: "Italy",
  JM: "Jamaica",
  JP: "Japan",
  JE: "Jersey",
  JO: "Jordan",
  KZ: "Kazakhstan",
  KE: "Kenya",
  KI: "Kiribati",
  KW: "Kuwait",
  KG: "Kyrgyzstan",
  LA: "Laos",
  LV: "Latvia",
  LB: "Lebanon",
  LS: "Lesotho",
  LR: "Liberia",
  LY: "Libya",
  LI: "Liechtenstein",
  LT: "Lithuania",
  LU: "Luxembourg",
  MO: "Macao",
  MG: "Madagascar",
  MW: "Malawi",
  MY: "Malaysia",
  MV: "Maldives",
  ML: "Mali",
  MT: "Malta",
  MH: "Marshall Islands",
  MQ: "Martinique",
  MR: "Mauritania",
  MU: "Mauritius",
  YT: "Mayotte",
  MX: "Mexico",
  FM: "Micronesia (Federated States of)",
  MD: "Moldova",
  MC: "Monaco",
  MN: "Mongolia",
  ME: "Montenegro",
  MS: "Montserrat",
  MA: "Morocco",
  MZ: "Mozambique",
  MM: "Myanmar",
  NA: "Namibia",
  NR: "Nauru",
  NP: "Nepal",
  NC: "New Caledonia",
  NZ: "New Zealand",
  NI: "Nicaragua",
  NE: "Niger",
  NG: "Nigeria",
  NU: "Niue",
  NF: "Norfolk Island",
  KP: "North Korea",
  MK: "North Macedonia",
  MP: "Northern Mariana Islands",
  NO: "Norway",
  OM: "Oman",
  PK: "Pakistan",
  PW: "Palau",
  PS: "Palestine, State of",
  PA: "Panama",
  PG: "Papua New Guinea",
  PY: "Paraguay",
  PE: "Peru",
  PH: "Philippines",
  PN: "Pitcairn",
  PL: "Poland",
  PT: "Portugal",
  PR: "Puerto Rico",
  QA: "Qatar",
  RE: "Réunion",
  RO: "Romania",
  RU: "Russia",
  RW: "Rwanda",
  BL: "Saint Barthélemy",
  SH: "Saint Helena, Ascension and Tristan da Cunha",
  KN: "Saint Kitts and Nevis",
  LC: "Saint Lucia",
  MF: "Saint Martin (French part)",
  PM: "Saint Pierre and Miquelon",
  VC: "Saint Vincent and the Grenadines",
  WS: "Samoa",
  SM: "San Marino",
  ST: "Sao Tome and Principe",
  SA: "Saudi Arabia",
  SN: "Senegal",
  RS: "Serbia",
  SC: "Seychelles",
  SL: "Sierra Leone",
  SG: "Singapore",
  SX: "Sint Maarten (Dutch part)",
  SK: "Slovakia",
  SI: "Slovenia",
  SB: "Solomon Islands",
  SO: "Somalia",
  ZA: "South Africa",
  GS: "South Georgia and the South Sandwich Islands",
  SS: "South Sudan",
  ES: "Spain",
  LK: "Sri Lanka",
  SD: "Sudan",
  SR: "Suriname",
  SJ: "Svalbard and Jan Mayen",
  SE: "Sweden",
  CH: "Switzerland",
  SY: "Syria",
  TW: "Taiwan",
  TJ: "Tajikistan",
  TZ: "Tanzania",
  TH: "Thailand",
  TL: "Timor-Leste",
  TG: "Togo",
  TK: "Tokelau",
  TO: "Tonga",
  TT: "Trinidad and Tobago",
  TN: "Tunisia",
  TR: "Turkey",
  TM: "Turkmenistan",
  TC: "Turks and Caicos Islands",
  TV: "Tuvalu",
  UG: "Uganda",
  UA: "Ukraine",
  AE: "United Arab Emirates",
  UM: "United States Minor Outlying Islands",
  UY: "Uruguay",
  UZ: "Uzbekistan",
  VU: "Vanuatu",
  VE: "Venezuela",
  VN: "Vietnam",
  VG: "Virgin Islands (British)",
  VI: "Virgin Islands (U.S.)",
  WF: "Wallis and Futuna",
  EH: "Western Sahara",
  YE: "Yemen",
  ZM: "Zambia",
  ZW: "Zimbabwe",
} as const;

export const HttpStatusCode = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const;
