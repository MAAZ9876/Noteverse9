import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
  name: "user",
  initialState: {
    currentUser: null,
    token: null,
    isFetching: false,
    error: null,
    searchedValue: null,
  },
  reducers: {
    loginStart: (state) => {
      state.isFetching = true;
      state.error = null;
    },
    loginSuccess: (state, action) => {
      state.isFetching = false;
      state.currentUser = action.payload.user;
      state.token = action.payload.token;
      state.error = null;
    },
    loginFailure: (state, action) => {
      state.isFetching = false;
      state.error = action.payload || "Something went wrong...";
    },
    registerStart: (state) => {
      state.isFetching = true;
      state.error = null;
    },
    registerSuccess: (state, action) => {
      state.isFetching = false;
      state.currentUser = action.payload.user;
      state.token = action.payload.token;
      state.error = null;
    },
    registerFailure: (state, action) => {
      state.isFetching = false;
      state.error = action.payload || "Something went wrong...";
    },
    clearError: (state) => {
      state.error = null;
    },
    logout: (state) => {
      state.currentUser = null;
      state.token = null;
      state.isFetching = false;
      state.error = null;
    },
    updateUser: (state, action) => {
      if (state.currentUser) state.currentUser = { ...state.currentUser, ...action.payload };
    },
    search: (state, action) => {
      state.searchedValue = action.payload;
    },
    follow: (state, action) => {
      if (!state.currentUser) return;
      if (!state.currentUser.followings.includes(action.payload)) {
        state.currentUser.followings = [...state.currentUser.followings, action.payload];
      }
    },
    unFollow: (state, action) => {
      if (!state.currentUser) return;
      state.currentUser.followings = state.currentUser.followings.filter((f) => f !== action.payload);
    },
  },
});

export const {
  registerStart,
  registerSuccess,
  registerFailure,
  loginStart,
  loginSuccess,
  loginFailure,
  clearError,
  logout,
  updateUser,
  search,
  follow,
  unFollow,
} = userSlice.actions;
export default userSlice.reducer;
