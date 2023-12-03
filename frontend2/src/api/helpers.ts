import Cookies from "js-cookie";
import { Configuration } from "./_autogen";

// fall back to localhost for now
export const BASE_URL =
  process.env.REACT_APP_BACKEND_URL ?? "http://localhost:8000";

export const DEFAULT_API_CONFIGURATION = new Configuration({
  basePath: BASE_URL,
  accessToken: () => Cookies.get("access") as string,
});

export const downloadFile = async (
  url: string,
  downloadFileName: string,
): Promise<void> => {
  const response = await fetch(url);
  const blob = await response.blob();

  // trigger download in user's browser
  const objUrl = window.URL.createObjectURL(blob);
  const aHelper = document.createElement("a");
  aHelper.style.display = "none";
  aHelper.href = objUrl;
  aHelper.download = downloadFileName;
  document.body.appendChild(aHelper);
  aHelper.click();
  window.URL.revokeObjectURL(objUrl);
};
