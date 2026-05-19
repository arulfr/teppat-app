import { ILayanan } from "@/utils/types";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { RootState } from "./store";
import axiosInstance from "@/utils/AxiosInstance";
import { AxiosError } from "axios";

export const fetchLayanan = createAsyncThunk(
    'layanan/fetchLayanans',
    async (_, thunkAPI) => {
        try {
            const activeStoreId = (thunkAPI.getState() as RootState).AdminSlice.activeStoreId;
            const response = await axiosInstance.get('/layanan', { params: { id_store: activeStoreId } });
            return response.data as ILayanan[];
        } catch (error: any) {
            if (error instanceof AxiosError) {
                return thunkAPI.rejectWithValue(error.response?.data?.message || 'Gagal mengambil data layanan');
            }
            return thunkAPI.rejectWithValue('Terjadi kesalahan jaringan');
        }
    }
);

export const layananPost = createAsyncThunk(
    'layanan/layananPost',
    async (data: Partial<ILayanan>, thunkAPI) => {
        try {
            const activeStoreId = (thunkAPI.getState() as RootState).AdminSlice.activeStoreId;
            const response = await axiosInstance.post('/layanan_post', { ...data, id_store: activeStoreId });
            return response.data as ILayanan;
        } catch (error: any) {
            if (error instanceof AxiosError) {
                return thunkAPI.rejectWithValue(error.response?.data?.message || 'Gagal membuat layanan');
            }
            return thunkAPI.rejectWithValue('Terjadi kesalahan jaringan');
        }
    }
);

export const layananUpdate = createAsyncThunk(
    'layanan/layananUpdate',
    async (data: Partial<ILayanan>, thunkAPI) => {
        try {
            const response = await axiosInstance.put(`/layanan_update/${data._id}`, data);
            return response.data as ILayanan;
        } catch (error: any) {
            if (error instanceof AxiosError) {
                return thunkAPI.rejectWithValue(error.response?.data?.message || 'Gagal update layanan');
            }
            return thunkAPI.rejectWithValue('Terjadi kesalahan jaringan');
        }
    }
);

export const layananDelete = createAsyncThunk(
    'layanan/layananDelete',
    async (id: string, thunkAPI) => {
        try {
            await axiosInstance.delete(`/layanan_delete/${id}`);
            return id;
        } catch (error: any) {
            if (error instanceof AxiosError) {
                return thunkAPI.rejectWithValue(error.response?.data?.message || 'Gagal hapus layanan');
            }
            return thunkAPI.rejectWithValue('Terjadi kesalahan jaringan');
        }
    }
);

const LayananSlice = createSlice({
    name: 'layanan',
    initialState: {
        layanan: [] as ILayanan[],
        loading: false,
        error: null as string | null
    },
    reducers: {
        clearError: (state) => { state.error = null; }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchLayanan.pending, (state) => { state.loading = true; })
            .addCase(fetchLayanan.fulfilled, (state, action) => {
                state.loading = false;
                state.layanan = action.payload;
            })
            .addCase(fetchLayanan.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(layananPost.fulfilled, (state, action) => {
                state.layanan.unshift(action.payload);
            })
            .addCase(layananUpdate.fulfilled, (state, action) => {
                const index = state.layanan.findIndex(l => l._id === action.payload._id);
                if (index !== -1) {
                    state.layanan[index] = action.payload;
                }
            })
            .addCase(layananDelete.fulfilled, (state, action) => {
                state.layanan = state.layanan.filter(l => l._id !== action.payload);
            });
    }
});

export default LayananSlice.reducer;
export const { clearError } = LayananSlice.actions;
