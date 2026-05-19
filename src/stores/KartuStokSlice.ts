import axiosInstance from "@/utils/AxiosInstance";
import { FilterParams } from "@/utils/types";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { RootState } from "./store";

export const kartuStokget = createAsyncThunk('kartuStok/kartuStokGet',async(params:FilterParams | undefined,thunkAPI)=>{
    try {
        const activeStoreId = (thunkAPI.getState() as RootState).AdminSlice.activeStoreId;
        if (!activeStoreId) throw new Error("No active store selected.");

        const res = await axiosInstance.get('/kartu_stok',{params: { ...params, id_store: activeStoreId }});
        return res.data;
    } catch (error) {
        
    }
})

const KartuStokSlice = createSlice({
    name:'kartuStok',
    initialState:{
        kartu_stok:[] as Array<Record<string,string>>
    },
    reducers : {},
    extraReducers: (builder)=>{
        builder.addCase(kartuStokget.fulfilled,(state,action)=>{
            state.kartu_stok = action.payload;
        })
    }
});


export const {} = KartuStokSlice.actions;
export default KartuStokSlice.reducer;