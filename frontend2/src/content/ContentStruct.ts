export enum QuickStartPage {
  OVERVIEW = "overview",
  ACCOUNT_AND_TEAM_CREATION = "creation",
  INSTALLATION = "installation",
  RESOURCES = "resources",
  JOIN_THE_COMMUNITY = "community",
}
export type QuickStartPageKey = `${QuickStartPage}`;

export enum ResourcesPage {
  GAME_SPECIFICATION = "specification",
  CODING_RESOURCES = "resources",
  THIRD_PARTY_TOOLS = "tools",
  LECTURES = "lectures",
}
export type ResourcesPageKey = `${ResourcesPage}`

export enum CommonIssuesPage {
  INSTALLATION_ISSUES = "installation",
  CLIENT_ISSUES = "client",
  OTHER_ISSUES = "other",
  THINGS_TO_TRY = "things",
}
export type CommonIssuesPageKey = `${CommonIssuesPage}`

export enum DebuggingTipsPage {
  DEBUGGING = "debugging",
  INTELLIJ = "intellij",
  ECLIPSE = "eclipse",
  SECOND_METHOD = "second_method",
}
export type DebuggingTipsPageKey = `${DebuggingTipsPage}`

export enum TourneyPage {
  SCHEDULE = "schedule",
  PRIZES = "prizes",
  FORMAT = "format",
  RULES = "rules",
}
export type TourneyPageKey = `${TourneyPage}`
