import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { favouriteReducer } from "./Reducer/favourite.reducer";

import OrderReducer from "./Reducer/order.reducer";
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import storage from "redux-persist/lib/storage";
import { userReducer } from "./Reducer/user.reducer";
import { cartReducer } from "./Reducer/product.reducer";

const rootReducer = combineReducers({
  auth: userReducer,
  cart: cartReducer,
  order: OrderReducer,
  favourite: favouriteReducer,
});

const persistConfig = {
  key: "root",
  version: 1,
  storage,
};

const reducerPersist = persistReducer(persistConfig, rootReducer);

export const Store = configureStore({
  reducer: {
    root: reducerPersist,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export let persistor = persistStore(Store);

export type RootState = ReturnType<typeof Store.getState>;
export type AppDispatch = typeof Store.dispatch;