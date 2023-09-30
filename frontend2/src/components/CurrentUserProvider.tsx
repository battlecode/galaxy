import React, { useState, useCallback, useMemo, useEffect } from "react";
import { type UserPrivate } from "../utils/types";
import {
  AuthStateEnum,
  type AuthState,
  CurrentUserContext,
} from "../contexts/CurrentUserContext";
import { removeApiTokens } from "../utils/cookies";
import { loginCheck } from "../utils/api/auth";
import { getUserUserProfile } from "../utils/api/user";
import Cookies from "js-cookie";

export const CurrentUserProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [userData, setUserData] = useState<{
    user?: UserPrivate;
    authState: AuthState;
  }>({
    authState: AuthStateEnum.LOADING,
  });

  // useCallback to avoid redefining login/logout each rerender
  const login = useCallback((user: UserPrivate): void => {
    setUserData({
      user,
      authState: AuthStateEnum.AUTHENTICATED,
    });
  }, []);
  const logout = useCallback((): void => {
    Cookies.remove("access");
    Cookies.remove("refresh");
    setUserData({
      authState: AuthStateEnum.NOT_AUTHENTICATED,
    });
  }, []);

  useEffect(() => {
    const checkLoggedIn = async (): Promise<void> => {
      if (!(await loginCheck())) {
        logout();
        return;
      }
      try {
        const user = await getUserUserProfile();
        login(user);
      } catch (error) {
        logout();
        removeApiTokens();
      }
    };
    void checkLoggedIn();
  }, []);

  const providedValue = useMemo(
    () => ({
      ...userData,
      login,
      logout,
    }),
    [login, logout, userData],
  );

  return (
    <CurrentUserContext.Provider value={providedValue}>
      {children}
    </CurrentUserContext.Provider>
  );
};
