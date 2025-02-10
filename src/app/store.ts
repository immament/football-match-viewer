// import type { Action, ThunkAction } from "@reduxjs/toolkit";
// import { combineSlices, configureStore } from "@reduxjs/toolkit";

// const rootReducer = combineSlices(matchSlice);

// export type RootState = ReturnType<typeof rootReducer>;

// export const setupStore = (preloadedState?: Partial<RootState>) => {
//   const store = configureStore({
//     reducer: rootReducer,
//     preloadedState,
//     middleware: (getDefaultMiddleware) =>
//       getDefaultMiddleware({ serializableCheck: false }),
//     devTools: { actionsDenylist: "match/updateStep" },
//     // .prepend(listenerMiddleware.middleware),
//   });
//   return store;
// };

// export type AppStore = ReturnType<typeof setupStore>;
// export type AppDispatch = AppStore["dispatch"];
// export type AppThunk<ThunkReturnType = void> = ThunkAction<
//   ThunkReturnType,
//   RootState,
//   unknown,
//   Action
// >;
