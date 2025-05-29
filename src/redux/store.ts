import {
    Action,
    configureStore,
    ThunkAction,
} from '@reduxjs/toolkit';
import accountReducer from './slice/accountSlice';
import userReducer from './slice/userSlice';
import roleReducer from "./slice/roleSlice"
import permissionReducer from "./slice/permissionSlice"
import bookReducer from "./slice/bookSlice"
import categoryReducer from "./slice/categorySlice"
import cartReducer from "./slice/cartSlice"

export const store = configureStore({
    reducer: {
        account: accountReducer,
        user: userReducer,
        role: roleReducer,
        permission: permissionReducer,
        book: bookReducer,
        category: categoryReducer,
        cart: cartReducer
    },
});


export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
    ReturnType,
    RootState,
    unknown,
    Action<string>
>;