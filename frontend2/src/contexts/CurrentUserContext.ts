import { createContext, useContext } from "react";
import { type UserPrivate } from "../utils/types";

export enum AuthStateEnum {
  LOADING = "loading",
  AUTHENTICATED = "authenticated",
  NOT_AUTHENTICATED = "not_authenticated",
}

export type AuthState = `${AuthStateEnum}`;

interface CurrentUserContextType {
  authState: AuthState;
  user?: UserPrivate;
}

export const CurrentUserContext = createContext<CurrentUserContextType | null>(
  null,
);

export const useCurrentUser = (): CurrentUserContextType => {
  const currentUserContext = useContext(CurrentUserContext);

  if (currentUserContext === null) {
    throw new Error(
      "useCurrentUser has to be used within <CurrentUserContext.Provider>",
    );
  }

  return currentUserContext;
};
