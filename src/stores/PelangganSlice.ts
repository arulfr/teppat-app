import axiosInstance from "@/utils/AxiosInstance";
import { IPelanggan } from "@/utils/types";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { RootState } from "./store";

export const pelangganGet = createAsyncThunk('pelanggan/pelangganGet', async(_,ThunkApi)=>{
    try {
        const activeStoreId = (ThunkApi.getState() as RootState).AdminSlice.activeStoreId;
        if (!activeStoreId) throw new Error("No active store selected.");
        const res = await axiosInstance.get('/pelanggan',{params:{id_store:activeStoreId}});
        return res.data;
    } catch (error) {
        return ThunkApi.rejectWithValue((error as Error).message);
    }
});

export const pelangganPost = createAsyncThunk('pelanggan/pelangganPost', async(payload:IPelanggan,ThunkApi)=>{
    try {
        const activeStoreId = (ThunkApi.getState() as RootState).AdminSlice.activeStoreId;
        if (!activeStoreId) throw new Error("No active store selected.");
        const newPayload = { ...payload, id_store: activeStoreId };
        const res = await axiosInstance.post('/pelanggan_post',newPayload);
        return res.data;
    } catch (error) {
        return ThunkApi.rejectWithValue((error as Error).message);
    }
});

export const pelangganUpdate = createAsyncThunk('pelanggan/pelangganUpdate', async(payload:IPelanggan,ThunkApi)=>{
    try {
        const activeStoreId = (ThunkApi.getState() as RootState).AdminSlice.activeStoreId;
        if (!activeStoreId) throw new Error("No active store selected.");
        const res = await axiosInstance.put(`/pelanggan_update/${payload._id}`, { ...payload, id_store: activeStoreId });
        return res.data;
    } catch (error) {  
        return ThunkApi.rejectWithValue((error as Error).message);
    }
});

export const pelangganDelete = createAsyncThunk('pelanggan/pelangganDelete', async(id:string,ThunkApi)=>{
    try {
         await axiosInstance.delete(`/pelanggan_delete/${id}`);
        return id;
    } catch (error) {
        return ThunkApi.rejectWithValue((error as Error).message);
    }
});

const PelangganSlice = createSlice({
    name: "pelangganSlice",
    initialState: {
        // Define your initial state here
        pelanggan : [] as IPelanggan[],
    },
    extraReducers: (builder) => {
        // Define your extra reducers here
        builder.addCase(pelangganGet.fulfilled, (state, action) => {
            state.pelanggan = action.payload.data;
        });
        builder.addCase(pelangganPost.fulfilled, (state, action) => {
            state.pelanggan.push(action.payload);
        });
        builder.addCase(pelangganUpdate.fulfilled, (state, action) => {
            const index = state.pelanggan.findIndex(pel => pel._id === action.payload._id);
            if (index !== -1) {
                state.pelanggan[index] = action.payload;
            }
        });
        builder.addCase(pelangganDelete.fulfilled, (state, action) => {
            state.pelanggan = state.pelanggan.filter(pel => pel._id !== action.payload);
        });
    },
    reducers: {
        // Define your reducers here
    }
});

export const {} = PelangganSlice.actions;
export default PelangganSlice.reducer;