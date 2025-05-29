import { getAccountAPI } from '@/services/api';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

// First, create the thunk
// export const fetchAccount = createAsyncThunk(
//     'account/fetchAccount',
//     async () => {
//         // const response = await getAccountAPI();
//         // return response.data;
//         const response = await getAccountAPI();
//         console.log(">>> check response:", response);
//         return 123;
//     }
// )

export const fetchAccount = createAsyncThunk(
    'account/fetchAccount',
    async (_, { rejectWithValue, dispatch }) => {
        try {
            const response = await getAccountAPI();
            console.log('API response:', response);
            return response.data; // { user: { ... } }
        } catch (error) {
            console.error('Fetch account error:', error);
            if (error.status && error.message) {
                // Xử lý lỗi refresh token
                dispatch(setRefreshTokenAction({ status: error.status, message: error.message }));
            }
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);



interface IState {
    isAuthenticated: boolean;
    isLoading: boolean;
    isRefreshToken: boolean;
    errorRefreshToken: string;
    user: {
        id: number;
        email: string;
        fullName: string;
        phone: string;
        avatar: string;
        role: string;
        permissions?: {
            id: number;
            name: string;
            path: string;
            method: string;
            module: string;
        }[]
    };
    activeMenu: string;
}

const initialState: IState = {
    isAuthenticated: false,
    isLoading: true,
    isRefreshToken: false,
    errorRefreshToken: "",
    user: {
        id: 0,
        email: "",
        fullName: "",
        phone: "",
        avatar: "",
        role: "",
        permissions: [],
    },

    activeMenu: 'home'
};


export const accountSlice = createSlice({
    name: 'account',
    initialState,
    // The `reducers` field lets us define reducers and generate associated actions
    reducers: {
        // Use the PayloadAction type to declare the contents of `action.payload`

        setActiveMenu: (state, action) => {
            state.activeMenu = action.payload;
        },
        setLogoutAction: (state, action) => {
            localStorage.removeItem('access_token');
            state.isAuthenticated = false;
            state.user = {
                id: 0,
                email: "",
                fullName: "",
                phone: "",
                avatar: "",
                role: "",
                permissions: [],
            }
        },

        setUserLoginInfo: (state, action) => {
            state.isAuthenticated = true;
            state.isLoading = false;
            state.user.id = action?.payload?.id;
            state.user.email = action.payload.email;
            state.user.fullName = action.payload.fullName;
            state.user.phone = action.payload.phone;
            state.user.avatar = action.payload.avatar;
            state.user.role = action?.payload?.role;
            if (!action?.payload?.role) state.user.role = "";
            state.user.permissions = action?.payload?.permissions ?? [];
        },

        setRefreshTokenAction: (state, action) => {
            state.isRefreshToken = action.payload?.status ?? false;
            state.errorRefreshToken = action.payload?.message ?? "";
        }
    },
    extraReducers: (builder) => {
        builder.addCase(fetchAccount.pending, (state) => {
            state.isAuthenticated = false;
            state.isLoading = true;
        });

        builder.addCase(fetchAccount.fulfilled, (state, action) => {
            if (action.payload && action.payload.user) {
                state.isAuthenticated = true;
                state.isLoading = false;
                state.user.id = action.payload.user.id;
                state.user.email = action.payload.user.email;
                state.user.fullName = action.payload.user.fullName;
                state.user.phone = action.payload.user.phone;
                state.user.avatar = action.payload.user.avatar;
                state.user.role = action.payload.user.role || "";
                state.user.permissions = action.payload.user.permissions || [];
            }
        });

        builder.addCase(fetchAccount.rejected, (state, action) => {
            state.isAuthenticated = false;
            state.isLoading = false;
            console.error('Fetch account failed:', action.error.message);
        });

    },

});

export const {
    setActiveMenu, setRefreshTokenAction, setUserLoginInfo, setLogoutAction
} = accountSlice.actions;

export default accountSlice.reducer;
