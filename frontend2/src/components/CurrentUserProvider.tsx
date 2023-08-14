import React, { useState, useEffect } from "react";
import { type UserPrivate } from "../utils/types";
import { AuthStateEnum, type AuthState, CurrentUserContext } from "../contexts/CurrentUserContext";
import { Api } from "../utils/api";
import { removeApiTokens, doApiTokensExist } from "../utils/cookies";

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
      // check if cookies exist before attempting to load user
      if (!doApiTokensExist()) {
        logout();
        return;
      }
      try {
        const user = await Api.getUserUserProfile();
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
