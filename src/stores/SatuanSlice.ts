import axiosInstance from "@/utils/AxiosInstance";
import { ISatuan } from "@/utils/types";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import { RootState } from "./store";

export const getSatuan = createAsyncThunk('satuan/getSatuan', async (_,thunkAPI) => {
    try {
        const activeStoreId = (thunkAPI.getState() as RootState).AdminSlice.activeStoreId;
        if (!activeStoreId) throw new Error("ID Toko tidak ditemukan.");
        const res = await axiosInstance.get(`/satuan?id_store=${activeStoreId}`);
        return res.data;
    } catch (error: any) {
        if (error instanceof AxiosError) {
            return thunkAPI.rejectWithValue(error.response?.data?.message || 'Gagal mengambil data satuan');
        }
        return thunkAPI.rejectWithValue(error.message || "Terjadi kesalahan sistem");
    }
} );


export const satuanAdd = createAsyncThunk('satuan/satuanAdd', async (data: ISatuan,thunkAPI) => {
    try {
        const activeStoreId = (thunkAPI.getState() as RootState).AdminSlice.activeStoreId;
        if (!activeStoreId) throw new Error("ID Toko tidak ditemukan.");
        const newPayload = { ...data, id_store: activeStoreId };
        const res = await axiosInstance.post('/satuan_post', newPayload);
        return res.data;
    } catch (error: any) {
        return thunkAPI.rejectWithValue(error.response?.data?.message || "Gagal menambah kategori");
    }   
    }
);

export const updateSatuan = createAsyncThunk('satuan/updateSatuan', async ({ id, data }: { id: string; data: ISatuan }, thunkAPI) => {
    try {
        const activeStoreId = (thunkAPI.getState() as RootState).AdminSlice.activeStoreId;
        if (!activeStoreId) throw new Error("ID Toko tidak ditemukan.");
        const newPayload = { ...data, id_store: activeStoreId };
        const res = await axiosInstance.put(`/satuan_update/${id}`, newPayload);
        return res.data;
    } catch (error: any) {
        if (error instanceof AxiosError) {
            return thunkAPI.rejectWithValue(error.response?.data?.message || 'Gagal memperbarui satuan');
        }
        return thunkAPI.rejectWithValue(error.message || "Terjadi kesalahan sistem");
    }
});

export const deleteSatuan = createAsyncThunk('satuan/deleteSatuan', async (id: string, thunkAPI) => {
    try {
        const activeStoreId = (thunkAPI.getState() as RootState).AdminSlice.activeStoreId;
        if (!activeStoreId) throw new Error("ID Toko tidak ditemukan.");

        // Menambahkan id_store ke query parameter sesuai Aturan #3
        await axiosInstance.delete(`/satuan_delete/${id}`, { params: { id_store: activeStoreId } });
        return id;
    } catch (error: any) {
        if (error instanceof AxiosError) {
            return thunkAPI.rejectWithValue(error.response?.data?.message || 'Gagal menghapus satuan');
        }
        return thunkAPI.rejectWithValue(error.message || "Terjadi kesalahan sistem");
    }
});


const SatuanSlice = createSlice({
    name: "satuan",
    initialState: {
        satuan : [] as ISatuan[],
        loading: false,
        error: null as string | null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(getSatuan.fulfilled, (state, action) => {
            state.satuan = action.payload;
        });
        builder.addCase(satuanAdd.fulfilled, (state, action) => {
            state.satuan.push(action.payload);
        });
        builder.addCase(updateSatuan.fulfilled, (state, action) => {
            const index = state.satuan.findIndex(item => item._id === action.payload._id);
            if (index !== -1) {
                state.satuan[index] = action.payload;
            }
        })
        builder.addCase(deleteSatuan.fulfilled, (state, action) => {
            state.satuan = state.satuan.filter(item => item._id !== action.payload);
        })
        .addMatcher(
        (action) => action.type.endsWith('/fulfilled') || action.type.endsWith('/rejected'),
        (state) => {
            state.loading = false;
        }
        );
        
    }
});

export const {} = SatuanSlice.actions;
export default SatuanSlice.reducer;

//