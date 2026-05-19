import axiosInstance from "@/utils/AxiosInstance";
import { IPembelian, IPembelianBarang, PembelianPayload } from "@/utils/types";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import qs from 'qs';
import { FilterParams } from "@/utils/types";
import { RootState } from "./store";

export const getPembelian = createAsyncThunk('pembelian/getPembelian',async(params: FilterParams | undefined, thunkAPI)=>{
    try {
        const activeStoreId = (thunkAPI.getState() as RootState).AdminSlice.activeStoreId;
        if (!activeStoreId) throw new Error("No active store selected.");
        const response = await axiosInstance.get('/pembelian',{params: { ...params, id_store: activeStoreId }});
        return response.data;
    } catch (error) {
        return thunkAPI.rejectWithValue((error as Error).message);
    }
});

export const getPembelianItem = createAsyncThunk('pembelian/getPembelianItem',async(no_pembelian:string, thunkAPI)=>{
    try {
        const activeStoreId = (thunkAPI.getState() as RootState).AdminSlice.activeStoreId;
        if (!activeStoreId) throw new Error("No active store selected.");
        const response = await axiosInstance.get(`/pembelianItem/${no_pembelian}`, { params: { id_store: activeStoreId } });
        return response.data;
    } catch (error) {
        return thunkAPI.rejectWithValue((error as Error).message);
    }
});

export const pembelianPost = createAsyncThunk('pembelian/pembelianPost',async(payload:PembelianPayload, thunkApi)=>{
    try {
        const activeStoreId = (thunkApi.getState() as RootState).AdminSlice.activeStoreId;
        if (!activeStoreId) throw new Error("No active store selected.");

        // Tambahkan id_store ke payload
        const newPayload = { ...payload, id_store: activeStoreId };
        const response = await axiosInstance.post('/pembelian_post', newPayload);
      return response.data;
    } catch (error) {
       if (axios.isAxiosError(error) && error.response) {
            // Ambil pesan spesifik dari backend
            // (Pastikan backend Anda mengirim key 'message' di JSON-nya)
            return thunkApi.rejectWithValue(error.response.data.message || error.message);
        }
        return thunkApi.rejectWithValue(error || "Terjadi kesalahan sistem");
    }
});


export const pembelianBatal = createAsyncThunk('pembelian/pembelianBatal',async(payload:{id:string,alasan_void:string},thunkAPI)=>{
    try {
        const activeStoreId = (thunkAPI.getState() as RootState).AdminSlice.activeStoreId;
        if (!activeStoreId) throw new Error("No active store selected.");
        // Tambahkan id_store ke payload
        const newPayload = { ...payload, id_store: activeStoreId };
        const res = await axiosInstance.post(`/pembelian_batal/${payload.id}`, qs.stringify(newPayload));
        return res.data;
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            return thunkAPI.rejectWithValue(error.response.data.message || error.message);
        }
        return thunkAPI.rejectWithValue(error || "Terjadi kesalahan sistem");
    }
});

export const pembelianPerBarang = createAsyncThunk(
  'pembelian/pembelianPerBarang', 
  async(params: FilterParams | undefined, thunkApi) => {
    try {
        const activeStoreId = (thunkApi.getState() as RootState).AdminSlice.activeStoreId;
        if (!activeStoreId) throw new Error("No active store selected.");

        const response = await axiosInstance.get('/pembelian_perBarang', { params: { ...params, id_store: activeStoreId } });
      return response.data;
    } catch (error) {
      return thunkApi.rejectWithValue((error as Error).message);
    }
  }
)

const PembelianSlice = createSlice({
    name:'PembelianSlice',
    initialState:{
        pembelianList : [] as IPembelian[],
        pembelianItem: null as IPembelian | null,
        pembelianPerbarang:[] as IPembelianBarang[],
    },
    reducers:{},
    extraReducers:(builder)=>{
        builder.addCase(getPembelian.fulfilled,(state,action)=>{
            state.pembelianList = action.payload;
        });
        builder.addCase(getPembelianItem.fulfilled,(state,action)=>{
            state.pembelianItem = action.payload;
        });
        builder.addCase(pembelianPerBarang.fulfilled, (state, action) => {
            state.pembelianPerbarang = action.payload;
        });
    }
});

export const {} = PembelianSlice.actions;
export default PembelianSlice.reducer;
