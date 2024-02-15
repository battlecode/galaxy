import React from "react";
import { AuthStateEnum, CurrentUserContext } from "./CurrentUserContext";
import { useCurrentUserInfo, useIsLoggedIn } from "../api/user/useUser";
import _ from "lodash";
import { useQueryClient } from "@tanstack/react-query";

export const CurrentUserProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const queryClient = useQueryClient();
  const isLoggedIn = useIsLoggedIn(queryClient);
  const authState =
    !_.isNil(isLoggedIn.data) && isLoggedIn.data
      ? AuthStateEnum.AUTHENTICATED
      : isLoggedIn.isLoading
      ? AuthStateEnum.LOADING
      : AuthStateEnum.NOT_AUTHENTICATED;

  const userData = useCurrentUserInfo();

  return (
    <CurrentUserContext.Provider value={{ authState, user: userData.data }}>
      {children}
    </CurrentUserContext.Provider>
  );
};
