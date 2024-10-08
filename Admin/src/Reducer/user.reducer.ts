import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { User } from "../models/user.model";
import {
  signUpAction,
  signInAction,
  updateUserAction,
} from "../Actions/user.actions";
import { UpdateProfileInfo } from "../Pages/Profile/AdminProfile";

interface authState {
  success: boolean;
  error: boolean;
  loading: boolean;
  userInfo: User;
}

const authState: authState = {
  success: false,
  error: false,
  loading: true,
  userInfo: {
    fullName: "",
    avatar: "",
    email: "",
    role: undefined,
    uid: "",
    totalSpent: 0,
    totalOrder: 0,
  },
};

const authSlice = createSlice({
  initialState: authState,
  name: "auth",
  reducers: {
    authLogout: (state) => {
      state.userInfo = {};
      state.success = false;
      state.loading = true;
    },
  },
  extraReducers: (builder) => {
    // action to add new user
    builder.addCase(signUpAction.pending, (state) => {
      state.loading = false;
    });
    builder.addCase(signUpAction.fulfilled, (state, action) => {
      state.loading = false;
      state.success = true;
      state.userInfo = action.payload;
    });
    builder.addCase(signUpAction.rejected, (state) => {
      state.loading = false;
      (state.success = false), (state.userInfo = {});
      state.error = false;
    });
    // action to login existing user
    builder.addCase(signInAction.pending, (state) => {
      state.loading = true;
      state.success = false;
    });
    builder.addCase(signInAction.fulfilled, (state, action) => {
      state.loading = false;
      state.success = true;
      state.userInfo = action.payload as User;
    });
    builder.addCase(signInAction.rejected, (state) => {
      state.error = true;
      state.loading = false;
      state.userInfo = {};
    });

        // Update existing user
        builder.addCase(updateUserAction.pending, (state) => {
          state.loading = true;
        });
        builder.addCase(
          updateUserAction.fulfilled,
          (state, action: PayloadAction<UpdateProfileInfo>) => {
            const payload = action.payload;
            const keys = Object.keys(payload) as Array<keyof UpdateProfileInfo>;
    
            keys.forEach((key) => {
              if (payload[key] !== undefined) {
                // Handle phoneNumber separately if needed
                if (key === "phoneNumber" && typeof payload[key] === "number") {
                  state.userInfo[key] = String(payload[key]); // Convert number to string
                } else {
                  state.userInfo[key] = payload[key] as string | undefined;
                }
              }
            });
          }
        );
  },
});
export const authReducer = authSlice.reducer;
export const { authLogout } = authSlice.actions;
