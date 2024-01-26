import Cookies from "js-cookie";

export const removeApiTokens = (): void => {
  Cookies.remove("access");
  Cookies.remove("refresh");
};

export const setApiTokens = ({
  access,
  refresh,
}: {
  access: string;
  refresh: string;
}): void => {
  Cookies.set("access", access);
  Cookies.set("refresh", refresh);
};

export const doApiTokensExist = (): boolean => {
  return (
    Cookies.get("access") !== undefined && Cookies.get("refresh") !== undefined
  );
};
