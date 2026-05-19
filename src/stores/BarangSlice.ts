import axiosInstance from "@/utils/AxiosInstance";
import { IBarang } from "@/utils/types";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import { RootState } from "./store";


export const getBarangList = createAsyncThunk('barang/getBarangList',async(_,thunkAPI)=>{
    try {
        const activeStoreId = (thunkAPI.getState() as RootState).AdminSlice.activeStoreId;
        if (!activeStoreId) throw new Error("No active store selected.");

        const BarangResponse = await axiosInstance.get('/barang', { params: { id_store: activeStoreId } });
        return BarangResponse.data;
    } catch (error) {
        if (error instanceof AxiosError) {
            return thunkAPI.rejectWithValue(error.response?.data.message || 'Error fetching barang list');
        }
        return thunkAPI.rejectWithValue((error as Error).message);
    }
});

export const BarangPost = createAsyncThunk('barang/BarangPost',async(payload:IBarang,thunkAPI)=>{
    try {
        const activeStoreId = (thunkAPI.getState() as RootState).AdminSlice.activeStoreId;
        if (!activeStoreId) throw new Error("No active store selected.");

        const newPayload = { ...payload, id_store: activeStoreId };
        const response = await axiosInstance.post('/barang_post',newPayload);
        return response.data;
    } catch (error) {
        if (error instanceof AxiosError) {
            return thunkAPI.rejectWithValue(error.response?.data.message || 'Error posting barang');
        }
        return thunkAPI.rejectWithValue((error as Error).message);
    }
});

export const barangUpdate = createAsyncThunk('barang/barangUpdate',async(payload:IBarang,thunkAPI)=>{
    try {
        const activeStoreId = (thunkAPI.getState() as RootState).AdminSlice.activeStoreId;
        if (!activeStoreId) throw new Error("No active store selected.");

        const newPayload = { ...payload, id_store: activeStoreId };
        const response = await axiosInstance.put(`/barang_update/${payload._id}`,newPayload);
        return response.data;
    } catch (error) {
        if(error instanceof AxiosError){
            return thunkAPI.rejectWithValue(error.response?.data.message || 'Error editing barang');
        }
        return thunkAPI.rejectWithValue((error as Error).message);
    }
});

export const deleteBarang = createAsyncThunk('barang/deleteBarang',async(id:string,thunkAPI)=>{
    try {
        await axiosInstance.delete(`/barang_delete/${id}`);
        return id;
    } catch (error) {
        if(error instanceof AxiosError){
        return thunkAPI.rejectWithValue(error.response?.data.message || 'Error deleting barang');
        }
        return thunkAPI.rejectWithValue('Terjadi kesalahan jaringan');
    }
});

const BarangSlice = createSlice({
    name:'BarangSlice',
    initialState:{
        BarangList : [] as IBarang[],
    },
    reducers:{},
    extraReducers:(builder)=>{
        builder.addCase(getBarangList.fulfilled,(state,action)=>{
            state.BarangList = action.payload;
        });
        builder.addCase(BarangPost.fulfilled,(state,action)=>{
            state.BarangList.push(action.payload);
        });
        builder.addCase(barangUpdate.fulfilled,(state,action)=>{
            const index = state.BarangList.findIndex(item=>item._id === action.payload._id);
            state.BarangList[index] = action.payload;
        });
        builder.addCase(deleteBarang.fulfilled,(state,action)=>{
            state.BarangList = state.BarangList.filter(item=>item._id !== action.payload);
        });
    }
});


export const {} = BarangSlice.actions;
export default BarangSlice.reducer;