// src/store/actions/userActions.ts

import { createAction } from "@reduxjs/toolkit";
//  Redux Toolkit's createAction function infers the type of the payload argument based on the type provided when creating the action.
//  We're providing the type explicitly, there's no risk of unsafe assignments or type mismatches.
//  eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
export const setUser = createAction<{
  firstName: string;
  imageUrl: string;
  email: string;
}>("user/setUser");
