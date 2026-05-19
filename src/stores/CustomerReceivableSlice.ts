import axiosInstance from "@/utils/AxiosInstance";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import { RootState } from "./store";

export const getCustomerReceivables = createAsyncThunk(
    'customerReceivable/getList',
    async (params: { id_store: string; status?: string; id_customer?: string }, thunkAPI) => {
        try {
            const response = await axiosInstance.get('/customer_receivable', { params });
            return response.data.data;
        } catch (error: any) {
            if (error instanceof AxiosError) {
                return thunkAPI.rejectWithValue(error.response?.data?.message || 'Gagal mengambil data piutang');
            }
            return thunkAPI.rejectWithValue('Terjadi kesalahan jaringan');
        }
    }
);

export const getCustomerReceivableDue = createAsyncThunk(
    'customerReceivable/getDueReport',
    async (id_store: string, thunkAPI) => {
        try {
            const response = await axiosInstance.get(`/customer_receivable_due`, { params: { id_store } });
            return response.data.data;
        } catch (error: any) {
            if (error instanceof AxiosError) {
                return thunkAPI.rejectWithValue(error.response?.data?.message || 'Gagal mengambil laporan jatuh tempo');
            }
            return thunkAPI.rejectWithValue('Terjadi kesalahan jaringan');
        }
    }
);

export const payCustomerReceivable = createAsyncThunk(
    'customerReceivable/pay',
    async ({ id, data }: { id: string; data: any }, thunkAPI) => {
        try {
            const response = await axiosInstance.put(`/customer_receivable/pay/${id}`, data);
            return response.data.data;
        } catch (error: any) {
            if (error instanceof AxiosError) {
                return thunkAPI.rejectWithValue(error.response?.data?.message || 'Gagal memproses pembayaran');
            }
            return thunkAPI.rejectWithValue('Terjadi kesalahan jaringan');
        }
    }
);

const CustomerReceivableSlice = createSlice({
    name: 'customerReceivable',
    initialState: {
        list: [] as any[],
        dueReport: {
            total_nominal: 0,
            count: 0
        },
        loading: false,
        error: null as string | null
    },
    reducers: {
        clearError: (state) => { state.error = null; }
    },
    extraReducers: (builder) => {
        builder
            // Get List
            .addCase(getCustomerReceivables.pending, (state) => { state.loading = true; })
            .addCase(getCustomerReceivables.fulfilled, (state, action) => {
                state.loading = false;
                state.list = action.payload;
            })
            .addCase(getCustomerReceivables.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Due Report
            .addCase(getCustomerReceivableDue.fulfilled, (state, action) => {
                state.dueReport = {
                    total_nominal: action.payload.total_nominal,
                    count: action.payload.count
                };
            })
            // Payment
            .addCase(payCustomerReceivable.pending, (state) => { state.loading = true; })
            .addCase(payCustomerReceivable.fulfilled, (state, action) => {
                state.loading = false;
                // Update data di list setelah dibayar
                const index = state.list.findIndex(item => item._id === action.payload._id);
                if (index !== -1) {
                    state.list[index] = action.payload;
                }
            })
            .addCase(payCustomerReceivable.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    }
});

export default CustomerReceivableSlice.reducer;
export const { clearError } = CustomerReceivableSlice.actions;