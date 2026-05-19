import axiosInstance from "@/utils/AxiosInstance";
import { IJurnalKas } from "@/utils/types";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import { RootState } from "./store";


export const jurnalGet = createAsyncThunk('jurnal/jurnalGet',async(_,thunkAPI)=>{
    try {
        const activeStoreId = (thunkAPI.getState() as RootState).AdminSlice.activeStoreId;
        if (!activeStoreId) throw new Error("No active store selected.");
        const response = await axiosInstance.get('jurnal_kas',{params:{id_store: activeStoreId}});
        return response.data as IJurnalKas[];
    } catch (error) {        
        if(error instanceof AxiosError){
        return thunkAPI.rejectWithValue(error.response?.data.message || 'Error fetching jurnal');
        }
        return thunkAPI.rejectWithValue('Terjadi kesalahan jaringan');
    }
});

export const jurnalGetId = createAsyncThunk('jurnal/jurnalGetId',async(id:string,thunkAPI)=>{
    try {
        const response = await axiosInstance.get(`jurnal_kas_id/${id}`);
        return response.data as IJurnalKas;
    } catch (error) {
        if(error instanceof AxiosError){
        return thunkAPI.rejectWithValue(error.response?.data.message || 'Error deleting barang');
        }
        return thunkAPI.rejectWithValue('Terjadi kesalahan jaringan');
    }
});

export const saldoAwalPost = createAsyncThunk('jurnal/saldoAwalPost', async (data: any, thunkAPI) => {
    try {
        const activeStoreId = (thunkAPI.getState() as RootState).AdminSlice.activeStoreId;
        const res = await axiosInstance.post('/saldo_awal', { ...data, id_store: activeStoreId });
        return res.data;
    } catch (error: any) {
        return thunkAPI.rejectWithValue(error.response?.data?.message || 'Gagal menambahkan saldo awal');
    }
});


const JurnalSlice = createSlice({
    name:'jurnal',
    initialState:{
        jurnal:[] as IJurnalKas[],
        jurnalId: null as IJurnalKas | null
    },
    reducers:{},
    extraReducers:(builder)=>{
        builder.addCase(jurnalGet.fulfilled,(state,action)=>{
            state.jurnal = action.payload;
        });
        builder.addCase(jurnalGetId.fulfilled,(state,action)=>{
            state.jurnalId = action.payload;
        });
    }
});

export default JurnalSlice.reducer;
export const {} = JurnalSlice.actions;