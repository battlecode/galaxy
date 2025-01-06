export enum QuickStartPage {
  OVERVIEW = "Overview",
  ACCOUNT_AND_TEAM_CREATION = "Account and Team Creation",
  INSTALLATION_AND_SETUP = "Installation and Setup",
  RESOURCES = "Resources",
  JOIN_THE_COMMUNITY = "Join the Community!",
}
export type QuickStartPageKey = `${QuickStartPage}`;

export enum ResourcesPage {
  GAME_SPECIFICATION = "Game Specifications",
  CODING_RESOURCES = "Coding Resources",
  THIRD_PARTY_TOOLS = "Third-party Tools",
  LECTURES = "Lectures",
}
export type ResourcesPageKey = `${ResourcesPage}`;

export enum CommonIssuesPage {
  INSTALLATION_ISSUES = "Installation Issues",
  CLIENT_ISSUES = "Client Issues",
  OTHER_ISSUES = "Other Issues",
  THINGS_TO_TRY = "Things to Try When Nothing Else Helps",
}
export type CommonIssuesPageKey = `${CommonIssuesPage}`;

export enum DebuggingTipsPage {
  DEBUGGING = "Debugging",
  INTELLIJ = "Debugging in IntelliJ",
  ECLIPSE = "Debugging in Eclipse",
  SECOND_METHOD = "Second Method: Debugging in IntelliJ",
}
export type DebuggingTipsPageKey = `${DebuggingTipsPage}`;

export enum TourneyPage {
  SCHEDULE = "Tournament Schedule",
  PRIZES = "Prizes",
  FORMAT = "Tournament Format",
  RULES = "Eligibility Rules",
}
export type TourneyPageKey = `${TourneyPage}`;

export type PageKey =
  | QuickStartPageKey
  | ResourcesPageKey
  | TourneyPageKey
  | DebuggingTipsPageKey
  | CommonIssuesPageKey;
