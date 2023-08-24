import Cookies from "js-cookie";
import { Configuration } from "../types";

// hacky, fall back to localhost for now
export const BASE_URL =
  process.env.REACT_APP_BACKEND_URL ?? "http://localhost:8000";
export const DEFAULT_API_CONFIGURATION = new Configuration({
  basePath: BASE_URL,
  accessToken: () => Cookies.get("access") as string,
});
