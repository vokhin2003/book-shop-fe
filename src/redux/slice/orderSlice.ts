import { IModelPaginate, IOrder } from "@/types/backend";
import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { fetchOrderAPI } from "@/services/api";

interface IState {
    isFetching: boolean;
    meta: {
        current: number;
        pageSize: number;
        pages: number;
        total: number;
    };
    result: IOrder[];
}

const initialState: IState = {
    isFetching: false,
    meta: {
        current: 1,
        pageSize: 10,
        pages: 0,
        total: 0,
    },
    result: [],
};

export const fetchOrder = createAsyncThunk(
    "order/fetchOrder",
    async ({ query }: { query: string }) => {
        const response = await fetchOrderAPI(query);
        return response
    }
);

const orderSlice = createSlice({
    name: "order",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchOrder.pending, (state) => {
                state.isFetching = true;
            })
            .addCase(
                fetchOrder.fulfilled,
                (state, action) => {
                    if (action.payload && action.payload.data) {
                        state.isFetching = false;
                        state.meta = action.payload.data.meta;
                        state.result = action.payload.data.result;
                    }
                }
            )
            .addCase(fetchOrder.rejected, (state, action) => {
                state.isFetching = false;
            });
    },
});

export default orderSlice.reducer; 