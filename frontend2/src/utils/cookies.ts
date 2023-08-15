import Cookies from "js-cookie";

export const removeApiTokens = (): void => {
  Cookies.remove("access");
  Cookies.remove("refresh");
};

export const doApiTokensExist = (): boolean => {
  return (
    Cookies.get("access") !== undefined && Cookies.get("refresh") !== undefined
  );
};
