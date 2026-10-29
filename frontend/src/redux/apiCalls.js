import { registerFailure, registerStart, registerSuccess, loginFailure, loginStart, loginSuccess } from "./userRedux";
import { publicRequest, errorMessage } from "../requestMethods";

export const login = async (dispatch, credentials) => {
  dispatch(loginStart());
  try {
    const res = await publicRequest.post("/auth/login", credentials);
    dispatch(loginSuccess(res.data)); // { user, token }
  } catch (err) {
    dispatch(loginFailure(errorMessage(err, "Login failed")));
  }
};

export const register = async (dispatch, user) => {
  dispatch(registerStart());
  try {
    const res = await publicRequest.post("/auth/register", user);
    dispatch(registerSuccess(res.data)); // { user, token }
  } catch (err) {
    dispatch(registerFailure(errorMessage(err, "Registration failed")));
  }
};
