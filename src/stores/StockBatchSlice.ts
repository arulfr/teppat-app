import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "@/utils/AxiosInstance";
import { RootState } from "./store";

export const getStockBatches = createAsyncThunk('stockBatch/get', async (_, thunkAPI) => {
    try {
        const activeStoreId = (thunkAPI.getState() as RootState).AdminSlice.activeStoreId;
        if (!activeStoreId) throw new Error("No active store selected.");

        const response = await axiosInstance.get('/stock_batch', { 
            params: { id_store: activeStoreId } 
        });
        return response.data;
    } catch (error) {
        return thunkAPI.rejectWithValue(error);
    }
});

const StockBatchSlice = createSlice({
    name: 'StockBatchSlice',
    initialState: {
        stockBatches: [] as any[],
    },
    reducers: {
        setStockBatches: (state, action) => {
            state.stockBatches = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder.addCase(getStockBatches.fulfilled, (state, action) => {
            state.stockBatches = action.payload;
        });
    }
});

export const { setStockBatches } = StockBatchSlice.actions;
export default StockBatchSlice.reducer;