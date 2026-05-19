import axiosInstance from "@/utils/AxiosInstance";
import { FilterParams, ITransaksi, ITransaksiBarang } from "@/utils/types";
import { CartItem } from "@/views/Transaksi/Pos";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { RootState } from "./store";

export const TransaksiPost = createAsyncThunk('transaksi/transaksiPost',async(data:ITransaksi,thunkAPI)=>{
    try {
        const activeStoreId = (thunkAPI.getState() as RootState).AdminSlice.activeStoreId;
        if (!activeStoreId) throw new Error("No active store selected.");
        data.id_store = activeStoreId;
        const res = await axiosInstance.post(`/penjualan_post`, data);
        console.log(res.data);
        return res.data;
    } catch (error: any) {
        return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
});

export const TransaksiGet = createAsyncThunk('transaksi/transaksiGet',async(params:FilterParams|undefined,thunkAPI)=>{
    try {
         const activeStoreId = (thunkAPI.getState() as RootState).AdminSlice.activeStoreId;
        if (!activeStoreId) throw new Error("No active store selected.");
        params = { 
            startDate: params?.startDate || "", 
            endDate: params?.endDate || "", 
            id_store: activeStoreId 
        };
        const res = await axiosInstance.get(`/penjualan`,{params: params});
        return res.data;
    } catch (error) {
        return thunkAPI.rejectWithValue(error);
    }
});

export const TransaksiBarangGet = createAsyncThunk('transaksi/getBarangTerjual',async(params:FilterParams|undefined,thunkAPI)=>{
    try {
        const activeStoreId = (thunkAPI.getState() as RootState).AdminSlice.activeStoreId;
        if (!activeStoreId) throw new Error("No active store selected.");

        const res = await axiosInstance.get(`/penjualan_barang`,{params: { ...params, id_store: activeStoreId }});
        return res.data as ITransaksiBarang[];
    } catch (error) {
        return thunkAPI.rejectWithValue(error);
    }
});

export const TransaksiGetItem = createAsyncThunk('transaksi/transaksiGetItem',async(no_penjualan:string,thunkAPI)=>{
    try {
        const res = await axiosInstance.get(`/penjualan_item/${no_penjualan}`);
        return res.data;
    } catch (error) {
        return thunkAPI.rejectWithValue(error);
    }
});


const TransaksiSlice = createSlice({
    name:"transaksiSlice",
    initialState:{
        transaksi:[] as ITransaksi[],
        transaksiDetail:[],
        transaksiDetailById:null as ITransaksi | null,
        transaksiBarang: [] as ITransaksiBarang[],
        receiptTemp : null as ITransaksi | null,
    },
    reducers:{},
    extraReducers:(builder)=>
        {
            builder.addCase(TransaksiPost.fulfilled,(state,action)=>{
                state.transaksi.push(action.payload);
                state.receiptTemp = action.payload;
            });
            builder.addCase(TransaksiGet.fulfilled,(state,action)=>{
                state.transaksi = action.payload;
            });
            builder.addCase(TransaksiGetItem.fulfilled,(state,action)=>{
                state.transaksiDetailById = action.payload;
            });
            builder.addCase(TransaksiBarangGet.fulfilled,(state,action)=>{
                state.transaksiBarang = action.payload || [];
            });
        }
    });


export const {} = TransaksiSlice.actions; 
export default TransaksiSlice.reducer;