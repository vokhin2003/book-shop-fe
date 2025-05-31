
import { addToCartAPI, clearCartAPI, fetchCartAPI, removeFromCartAPI, updateCartAPI } from '@/services/api';
import { ICartItem } from '@/types/backend';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { act } from 'react';

export const fetchCart = createAsyncThunk(
    'cart/fetchCart',
    async (_, { rejectWithValue }) => {
        try {
            const response = await fetchCartAPI();
            console.log('API response:', response);
            if (response.statusCode === 200 && response.data)
                return response.data;
            else
                return rejectWithValue(response.message || 'Không thể lấy giỏ hàng');

        } catch (error) {
            console.log(">>> check error in cartSlice when fetchCart:", error);
            // return rejectWithValue(error.response?.data?.message || error.message || 'Đã có lỗi xảy ra');
            return rejectWithValue(error.message || 'Đã có lỗi xảy ra khi lấy giỏ hàng');
        }
    }
);

export const addToCart = createAsyncThunk(
    'cart/addToCart',
    async ({ bookId, quantity }: { bookId: number, quantity: number }, { rejectWithValue }) => {
        try {
            const res = await addToCartAPI(bookId, quantity);
            if (res.data && res.statusCode === 200) {
                return res.data;
            }
            return rejectWithValue(res.message || 'Không thể thêm sản phẩm vào giỏ hàng');
        } catch (error) {
            return rejectWithValue(error.message || 'Lỗi không xác định');
        }
    }
)

export const updateCart = createAsyncThunk(
    'cart/updateCart',
    async ({ bookId, quantity }: { bookId: number, quantity: number }, { rejectWithValue }) => {
        try {
            const res = await updateCartAPI(bookId, quantity);
            if (res.data && res.statusCode === 200) {
                return res.data;
            }
            return rejectWithValue(res.message || 'Không thể cập nhật sản phẩm trong giỏ hàng');
        } catch (error) {
            return rejectWithValue(error.message || 'Lỗi không xác định');
        }
    }
)

export const removeFromCart = createAsyncThunk(
    'cart/removeFromCart',
    async (bookId: number, { rejectWithValue }) => {
        try {
            const res = await removeFromCartAPI(bookId);
            if (res.statusCode === 200) {
                return bookId;
            }
            return rejectWithValue(res.message || 'Không thể xóa sản phẩm khỏi giỏ hàng');
        } catch (error) {
            return rejectWithValue(error.message || 'Lỗi không xác định');
        }
    }
)

export const clearCart = createAsyncThunk(
    'cart/clearCart',
    async (_, { rejectWithValue }) => {
        try {
            const res = await clearCartAPI();
            if (res.statusCode === 200) {
                return [];
            }
            return rejectWithValue(res.message || 'Không thể xóa giỏ hàng');
        } catch (error) {
            return rejectWithValue(error.message || 'Lỗi không xác định');
        }
    }
)



interface IState {
    isLoading: boolean;
    items: ICartItem[];
    error: string;
}

const initialState: IState = {
    isLoading: false,
    items: [],
    error: ""
};


export const cartSlice = createSlice({
    name: 'cart',
    initialState,
    // The `reducers` field lets us define reducers and generate associated actions
    reducers: {
        // Use the PayloadAction type to declare the contents of `action.payload`

        updateCartItem: (state, action: PayloadAction<ICartItem>) => {
            // console.log(">>> check action.payload in updateCartItem:", action.payload);
            const existingItem = state.items.find(item => item.book.id === action.payload.book.id);
            if (existingItem) {
                existingItem.quantity = action.payload.quantity;
            } else {
                state.items.push(action.payload);
            }
        },

        removeCartItem: (state, action: PayloadAction<number>) => {
            state.items = state.items.filter(item => item.book.id !== action.payload);
        },

        clearCartAction: (state) => {
            state.items = [];
            state.isLoading = false;
            state.error = "";
        }

    },
    extraReducers: (builder) => {

        builder
            .addCase(fetchCart.pending, (state) => {
                state.isLoading = true;
                state.error = "";
            })
            .addCase(fetchCart.rejected, (state, action) => {
                state.isLoading = false;
                // console.log(">>> check error in cartSlice when fetchCart rejected:", action.payload);
                state.error = action.payload as string || 'Đã có lỗi xảy ra khi lấy giỏ hàng';
            })
            .addCase(fetchCart.fulfilled, (state, action) => {
                state.isLoading = false;
                if (action.payload) {
                    state.items = action.payload;
                }
            });


        builder
            .addCase(addToCart.pending, (state) => {
                state.isLoading = true;
                state.error = ""
            })
            .addCase(addToCart.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string || 'Đã có lỗi xảy ra khi thêm sản phẩm vào giỏ hàng';
            })
            .addCase(addToCart.fulfilled, (state, action) => {
                state.isLoading = false;
                cartSlice.caseReducers.updateCartItem(state, {
                    type: 'cart/updateCartItem',
                    payload: action.payload
                })
            });

        builder
            .addCase(updateCart.pending, (state) => {
                state.isLoading = true;
                state.error = "";
            })
            .addCase(updateCart.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string || 'Đã có lỗi xảy ra khi cập nhật sản phẩm trong giỏ hàng';
            })
            .addCase(updateCart.fulfilled, (state, action) => {
                state.isLoading = false;
                cartSlice.caseReducers.updateCartItem(state, {
                    type: 'cart/updateCartItem',
                    payload: action.payload
                });
            });


        builder
            .addCase(removeFromCart.pending, (state) => {
                state.isLoading = true;
                state.error = "";
            })
            .addCase(removeFromCart.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string || 'Đã có lỗi xảy ra khi xóa sản phẩm khỏi giỏ hàng';
            })
            .addCase(removeFromCart.fulfilled, (state, action) => {
                state.isLoading = false;
                cartSlice.caseReducers.removeCartItem(state, {
                    type: 'cart/removeCartItem',
                    payload: action.payload as number
                })
            });

        builder
            .addCase(clearCart.pending, (state) => {
                state.isLoading = true;
                state.error = "";
            })
            .addCase(clearCart.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string || 'Đã có lỗi xảy ra khi xóa giỏ hàng';
            })
            .addCase(clearCart.fulfilled, (state) => {
                cartSlice.caseReducers.clearCartAction(state);
            });

    },

});

export const {
    clearCartAction
} = cartSlice.actions;

export default cartSlice.reducer;
