import React, { useState, useEffect } from "react";
import { type UserPrivate } from "../utils/types";
import {
  AuthStateEnum,
  type AuthState,
  CurrentUserContext,
} from "../contexts/CurrentUserContext";
import { removeApiTokens } from "../utils/cookies";
import { loginCheck } from "../utils/api/auth";
import { getUserUserProfile } from "../utils/api/user";

export const CurrentUserProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [userData, setUserData] = useState<{
    user?: UserPrivate;
    authState: AuthState;
  }>({
    authState: AuthStateEnum.LOADING,
  });

  const login = (user: UserPrivate): void => {
    setUserData({
      user,
      authState: AuthStateEnum.AUTHENTICATED,
    });
  };
  const logout = (): void => {
    setUserData({
      authState: AuthStateEnum.NOT_AUTHENTICATED,
    });
  };

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

  return (
    <CurrentUserContext.Provider
      value={{
        authState: userData.authState,
        user: userData.user,
        login,
        logout,
      }}
    >
      {children}
    </CurrentUserContext.Provider>
  );
};
