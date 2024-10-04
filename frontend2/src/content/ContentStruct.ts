export type QuickStartPageKey =
  | "overview"
  | "creation"
  | "installation"
  | "resources"
  | "community";
export enum QuickStartPage {
  OVERVIEW = "overview",
  ACCOUNT_AND_TEAM_CREATION = "creation",
  INSTALLATION = "installation",
  RESOURCES = "resources",
  JOIN_THE_COMMUNITY = "community",
}

export type ResourcesPageKey =
  | "specification"
  | "resources"
  | "tools"
  | "lectures";
export enum ResourcesPage {
  GAME_SPECIFICATION = "specification",
  CODING_RESOURCES = "resources",
  THIRD_PARTY_TOOLS = "tools",
  LECTURES = "lectures",
}

export type CommonIssuesPageKey =
  | "installation"
  | "client"
  | "other"
  | "things";
export enum CommonIssuesPage {
  INSTALLATION_ISSUES = "installation",
  CLIENT_ISSUES = "client",
  OTHER_ISSUES = "other",
  THINGS_TO_TRY = "things",
}

export type DebuggingTipsPageKey =
  | "debugging"
  | "intellij"
  | "eclipse"
  | "second_method";
export enum DebuggingTipsPage {
  DEBUGGING = "debugging",
  INTELLIJ = "intellij",
  ECLIPSE = "eclipse",
  SECOND_METHOD = "second_method",
}

export type TourneyPageKey = "schedule" | "prizes" | "format" | "rules";
export enum TourneyPage {
  SCHEDULE = "schedule",
  PRIZES = "prizes",
  FORMAT = "format",
  RULES = "rules",
}
