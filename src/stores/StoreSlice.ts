import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import axiosInstance from "@/utils/AxiosInstance";
import qs from "qs";
import { IStore } from "@/utils/types";

export const StoreCreate = createAsyncThunk('store/create', async (data: IStore, thunkAPI) => {
    try {
        const response = await axiosInstance.post('/store_post', qs.stringify(data));
        return response.data;
    } catch (error: any) {
        return thunkAPI.rejectWithValue(error.response?.data?.message || 'Error creating store');
    }
});

export const StoreGetAction = createAsyncThunk('store/get', async (_, thunkAPI) => {
    try {
        const response = await axiosInstance.get('/store_get');
        return response.data;
    } catch (error: any) {
        return thunkAPI.rejectWithValue(error.response?.data?.message || 'Error fetching stores');
    }
});

export const StoreGetIdAction = createAsyncThunk('store/getById', async (id: string, thunkAPI) => {
    try {
        const response = await axiosInstance.get(`/store_id/${id}`);
        return response.data;
    } catch (error: any) {
        return thunkAPI.rejectWithValue(error.response?.data?.message || 'Error fetching store by ID');
    }
});

export const StoreUpdateAction = createAsyncThunk('store/update', async ({ id, data }: { id: string, data: Partial<IStore> }, thunkAPI) => {
    try {
        const response = await axiosInstance.put(`/store_update/${id}`, qs.stringify(data));
        return response.data;
    } catch (error: any) {
        return thunkAPI.rejectWithValue(error.response?.data?.message || 'Error updating store');
    }
});

const StoreSlice = createSlice({
    name: 'store',
    initialState: {
        stores: [] as IStore[],
        storeId: null as IStore[] | null,
        loading: false,
        error: null as string | null
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(StoreCreate.pending, (state) => {
                state.loading = true;
            })
            .addCase(StoreCreate.fulfilled, (state, action) => {
                state.loading = false;
                state.stores.push(action.payload);
            })
            .addCase(StoreCreate.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(StoreGetAction.pending, (state) => {
                state.loading = true;
            })
            .addCase(StoreGetAction.fulfilled, (state, action) => {
                state.loading = false;
                state.stores = action.payload;
            })
            .addCase(StoreUpdateAction.pending, (state) => {
                state.loading = true;
            })
            .addCase(StoreUpdateAction.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.stores.findIndex(s => s._id === action.payload._id);
                if (index !== -1) state.stores[index] = action.payload;
            })
            .addCase(StoreUpdateAction.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(StoreGetIdAction.pending, (state) => {
                state.loading = true;
            })
            .addCase(StoreGetIdAction.fulfilled, (state, action) => {
                state.loading = false;
                // Karena action ini mengembalikan satu objek store
                const index = state.stores.findIndex(s => s._id === action.payload._id);
                if (index !== -1) {
                    state.stores[index] = action.payload;
                } else {
                    state.stores.push(action.payload);
                }
            })
            .addCase(StoreGetIdAction.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    }
});

export default StoreSlice.reducer;