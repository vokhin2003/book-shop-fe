import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { IRole } from '@/types/backend';
import { fetchRoleAPI } from '@/services/api';

interface IState {
    isFetching: boolean;
    meta: {
        current: number;
        pageSize: number;
        pages: number;
        total: number;
    },
    result: IRole[];
    // isFetchSingle: boolean;
    // singleRole: IRole
}
// First, create the thunk
export const fetchRole = createAsyncThunk(
    'resume/fetchRole',
    async ({ query }: { query: string }) => {
        const response = await fetchRoleAPI(query);
        return response;
    }
)

// export const fetchRoleById = createAsyncThunk(
//     'resume/fetchRoleById',
//     async (id: string) => {
//         const response = await callFetchRoleById(id);
//         return response;
//     }
// )


const initialState: IState = {
    isFetching: false,
    // isFetchSingle: true,
    meta: {
        current: 1,
        pageSize: 10,
        pages: 0,
        total: 0
    },
    result: [],
    // singleRole: {
    //     id: "",
    //     name: "",
    //     description: "",
    //     active: false,
    //     permissions: []
    // }
};


export const roleSlice = createSlice({
    name: 'role',
    initialState,
    // The `reducers` field lets us define reducers and generate associated actions
    reducers: {

        // resetSingleRole: (state, action) => {
        //     state.singleRole = {
        //         id: "",
        //         name: "",
        //         description: "",
        //         active: false,
        //         permissions: []
        //     }
        // },

    },
    extraReducers: (builder) => {
        // Add reducers for additional action types here, and handle loading state as needed
        builder.addCase(fetchRole.pending, (state, action) => {
            state.isFetching = true;
            // Add user to the state array
            // state.courseOrder = action.payload;
        })

        builder.addCase(fetchRole.rejected, (state, action) => {
            state.isFetching = false;
            // Add user to the state array
            // state.courseOrder = action.payload;
        })

        builder.addCase(fetchRole.fulfilled, (state, action) => {
            if (action.payload && action.payload.data) {
                state.isFetching = false;
                state.meta = action.payload.data.meta;
                state.result = action.payload.data.result;
            }
            // Add user to the state array

            // state.courseOrder = action.payload;
        })

        // builder.addCase(fetchRoleById.pending, (state, action) => {
        //     state.isFetchSingle = true;
        //     state.singleRole = {
        //         id: "",
        //         name: "",
        //         description: "",
        //         active: false,
        //         permissions: []
        //     }
        //     // Add user to the state array
        //     // state.courseOrder = action.payload;
        // })

        // builder.addCase(fetchRoleById.rejected, (state, action) => {
        //     state.isFetchSingle = false;
        //     state.singleRole = {
        //         id: "",
        //         name: "",
        //         description: "",
        //         active: false,
        //         permissions: []
        //     }
        //     // Add user to the state array
        //     // state.courseOrder = action.payload;
        // })

        // builder.addCase(fetchRoleById.fulfilled, (state, action) => {
        //     if (action.payload && action.payload.data) {
        //         state.isFetchSingle = false;
        //         state.singleRole = action.payload.data;
        //     }
        // })
    },

});

// export const {
//     resetSingleRole
// } = roleSlice.actions;

export default roleSlice.reducer;
