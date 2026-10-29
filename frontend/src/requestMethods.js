import axios from "axios";
import { store } from "./redux/store";
import { logout } from "./redux/userRedux";

// One place to configure the backend address (see frontend/.env -> REACT_APP_API_URL)
export const API_ORIGIN = (process.env.REACT_APP_API_URL || "http://localhost:8000").replace(/\/+$/, "");
export const BASE_URL = `${API_ORIGIN}/api/`;
export const IMAGES_URL = `${API_ORIGIN}/images/`;
export const pf = IMAGES_URL;

// Turns a stored file path ("/uploads/x.pdf") into a full URL. Old absolute URLs are left as they are.
export const assetUrl = (path, fallback = "") => {
  if (!path) return fallback;
  if (/^https?:\/\//i.test(path)) return path;
  return API_ORIGIN + (path.startsWith("/") ? path : "/" + path);
};

export const publicRequest = axios.create({ baseURL: BASE_URL });
export const userRequest = publicRequest;

// attach the login token to every request
publicRequest.interceptors.request.use((config) => {
  const token = store.getState().user.token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// if the server says our token is no longer valid, log out cleanly
publicRequest.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && store.getState().user.token) {
      store.dispatch(logout());
    }
    return Promise.reject(err);
  }
);

export const errorMessage = (err, fallback = "Something went wrong") =>
  err?.response?.data?.error || (err?.request && !err?.response ? "Cannot reach the server" : fallback);
