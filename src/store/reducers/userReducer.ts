// src/store/reducers/userReducer.ts

import { createReducer } from "@reduxjs/toolkit";
import { setUser } from "../actions/userActions";

interface UserState {
  firstName?: string;
  imageUrl?: string;
  email?: string;
}

const initialState: UserState = {};

const userReducer = createReducer(initialState, (builder) => {
  builder.addCase(setUser, (state, action) => {
    return { ...state, ...action.payload };
  });
});

export default userReducer;
