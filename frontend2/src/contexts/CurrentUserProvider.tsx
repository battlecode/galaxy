import React, { useMemo } from "react";
import {
  AuthStateEnum,
  type AuthState,
  CurrentUserContext,
} from "./CurrentUserContext";
import { useCurrentUserInfo, useIsLoggedIn } from "../api/user/useUser";
import _ from "lodash";

export const CurrentUserProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const isLoggedIn = useIsLoggedIn();
  const authState = useMemo((): AuthState => {
    if (!_.isNil(isLoggedIn.data) && isLoggedIn.data) {
      return AuthStateEnum.AUTHENTICATED;
    }
    if (isLoggedIn.isLoading) {
      return AuthStateEnum.LOADING;
    }
    return AuthStateEnum.NOT_AUTHENTICATED;
  }, [isLoggedIn]);

  const userData = useCurrentUserInfo();
  const user = useMemo(() => {
    if (userData.isSuccess) {
      return userData.data;
    }
    return undefined;
  }, [userData]);

  return (
    <CurrentUserContext.Provider value={{ authState, user }}>
      {children}
    </CurrentUserContext.Provider>
  );
};
