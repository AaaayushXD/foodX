import { createSlice } from "@reduxjs/toolkit";
import { Favourite } from "../models/favourite.model";
import toast from "react-hot-toast";

const favouriteState: Favourite = {
  favourite: [],
};

const favouriteSlice = createSlice({
  name: "favourite",
  initialState: favouriteState,
  reducers: {
    addToFavourite: (state, action) => {
      const productId = state.favourite.findIndex(
        (product) => product.id === action.payload.id
      );
      if (productId > -1) {
        toast.success("Product already exist");
      } else {
        state.favourite.push(action.payload);
      }
    },
    removeFavourite: (state, action) => {
      state.favourite = state.favourite.filter(
        (product) => product.id !== action.payload
      );
    },
    resetFavourite: (state, action) => {
      state.favourite = [];
    },
  },
});

export const favouriteReducer = favouriteSlice.reducer;
export const { addToFavourite, removeFavourite, resetFavourite } =
  favouriteSlice.actions;