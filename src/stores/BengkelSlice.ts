import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "@/utils/AxiosInstance";
import { RootState } from "./store";

interface BengkelState {
  workOrders: any[];
  mekanik: any[];
  vehicles: any[];
  serviceHistory: any[];
  serviceReminders: any[];
  loading: boolean;
  error: string | null;
}

// Thunk untuk menyelesaikan Work Order (Potong Stok & Update Status)
export const completeWorkOrder = createAsyncThunk(
  "bengkel/completeWorkOrder",
  async (id: string, { rejectWithValue }) => {
    try {
      // Menyesuaikan dengan router: /work_order_status/:id
      const response = await axiosInstance.put(`/work_order_status/${id}`, { status: 'done' });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

// Thunk untuk update status Work Order (misal dari pending ke on_progress)
export const updateWorkOrderStatus = createAsyncThunk(
    "bengkel/updateWorkOrderStatus",
    async ({ id, status }: { id: string; status: string }, { rejectWithValue }) => {
      try {
        const response = await axiosInstance.put(`/work_order_status/${id}`, { status });
        return response.data;
      } catch (error: any) {
        return rejectWithValue(error.response?.data?.message || "Gagal update status");
      }
    }
);

// Thunk untuk mengambil satu detail Work Order
export const fetchWorkOrderById = createAsyncThunk(
  "bengkel/fetchWorkOrderById",
  async (id: string, thunkAPI) => {
    try {
      const response = await axiosInstance.get("/work_order", { params: { _id: id } });
      if (!response.data || response.data.length === 0) {
        return thunkAPI.rejectWithValue("Data SPK tidak ditemukan di database");
      }
      return response.data[0]; // Backend return array untuk list
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || "Gagal mengambil detail SPK");
    }
  }
);

// Thunk untuk mengambil detail mekanik berdasarkan ID
export const fetchMekanikById = createAsyncThunk(
  "bengkel/fetchMekanikById",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/mekanik/${id}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

// Thunk untuk mengambil semua Work Order
export const fetchWorkOrders = createAsyncThunk(
  "bengkel/fetchWorkOrders",
  async (params: { id_store?: string | null; status?: string } | undefined, thunkAPI) => {
    try {
      const activeStoreId = (thunkAPI.getState() as RootState).AdminSlice.activeStoreId;
      if (!activeStoreId) {
        return thunkAPI.rejectWithValue("Pilih toko terlebih dahulu");
      }
      const response = await axiosInstance.get("/work_order", { params: { id_store: activeStoreId, ...params } });
      return response.data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || "Gagal mengambil data SPK");
    }
  }
);

// Thunk untuk mengambil daftar Mekanik
export const fetchMekaniks = createAsyncThunk(
  "bengkel/fetchMekaniks",
  async (_, thunkAPI) => {
    try {
      const activeStoreId = (thunkAPI.getState() as RootState).AdminSlice.activeStoreId;
      if (!activeStoreId) {
        return thunkAPI.rejectWithValue("Pilih toko terlebih dahulu");
      }
      const response = await axiosInstance.get("/mekanik", { params: { id_store: activeStoreId } });
      return response.data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || "Gagal mengambil data mekanik");
    }
  }
);

// Thunk CRUD Mekanik
export const mekanikPost = createAsyncThunk("bengkel/mekanikPost", async (data: any, thunkAPI) => {
  try {
    const activeStoreId = (thunkAPI.getState() as RootState).AdminSlice.activeStoreId;
    if (!activeStoreId) {
      return thunkAPI.rejectWithValue("Pilih toko terlebih dahulu");
    }
    const response = await axiosInstance.post("/mekanik_post", { ...data, id_store: activeStoreId });
    return response.data;
  } catch (error: any) {
    return thunkAPI.rejectWithValue(error.response.data.message);
  }
});

export const workOrderPost = createAsyncThunk("bengkel/workOrderPost", async (data: any, thunkAPI) => {
    try {
      const activeStoreId = (thunkAPI.getState() as RootState).AdminSlice.activeStoreId;
      if (!activeStoreId) {
        return thunkAPI.rejectWithValue("Pilih toko terlebih dahulu");
      }

      // Pastikan data yang dikirim tidak berisi string "undefined" atau "null"
      const payload = {
        ...data,
        id_store: activeStoreId,
      };

      const response = await axiosInstance.post("/work_order_post", payload);
      return response.data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || "Terjadi kesalahan pada server");
    }
});

export const workOrderUpdate = createAsyncThunk("bengkel/workOrderUpdate", async (data: any, thunkAPI) => {
    try {
        // Mengambil _id dari data dan sisanya sebagai payload update
        const { _id, ...updateData } = data;
        const response = await axiosInstance.put(`/work_order_update/${_id}`, updateData);
        return response.data;
    } catch (error: any) {
        return thunkAPI.rejectWithValue(error.response?.data?.message || "Gagal memperbarui SPK");
    }
});

export const mekanikUpdate = createAsyncThunk("bengkel/mekanikUpdate", async (data: any, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.put(`/mekanik_update/${data._id}`, data);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response.data.message);
  }
});

export const mekanikDelete = createAsyncThunk("bengkel/mekanikDelete", async (id: string, { rejectWithValue }) => {
  try {
    await axiosInstance.delete(`/mekanik_delete/${id}`);
    return id;
  } catch (error: any) {
    return rejectWithValue(error.response.data.message);
  }
});

// Thunk Kendaraan
export const fetchVehicles = createAsyncThunk("bengkel/fetchVehicles", async (params: any = {}, thunkAPI) => {
  try {
    const activeStoreId = (thunkAPI.getState() as RootState).AdminSlice.activeStoreId;
    if (!activeStoreId) {
      return thunkAPI.rejectWithValue("Pilih toko terlebih dahulu");
    }
    const response = await axiosInstance.get("/kendaraan", { params: { id_store: activeStoreId, ...params } });
    return response.data;
  } catch (error: any) {
    return thunkAPI.rejectWithValue(error.response.data.message);
  }
});

export const kendaraanUpdate = createAsyncThunk("bengkel/kendaraanUpdate", async (data: any, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.put(`/kendaraan_update/${data._id}`, data);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response.data.message);
  }
});

// Thunk Riwayat & Reminder
export const fetchServiceHistory = createAsyncThunk("bengkel/fetchServiceHistory", async (id_kendaraan: string, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.get(`/riwayat_servis/${id_kendaraan}`);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response.data.message);
  }
});

export const kendaraanPost = createAsyncThunk("bengkel/kendaraanPost", async (data: any, thunkAPI) => {
  try {
    const response = await axiosInstance.post("/kendaraan_post", data);
    return response.data;
  } catch (error: any) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || "Gagal mendaftarkan kendaraan");
  }
});

export const fetchServiceReminders = createAsyncThunk("bengkel/fetchServiceReminders", async (_, thunkAPI) => {
  try {
    const activeStoreId = (thunkAPI.getState() as RootState).AdminSlice.activeStoreId;
    if (!activeStoreId) {
      return thunkAPI.rejectWithValue("Pilih toko terlebih dahulu");
    }
    const response = await axiosInstance.get("/service_reminder", { params: { id_store: activeStoreId } });
    return response.data;
  } catch (error: any) {
    return thunkAPI.rejectWithValue(error.response.data.message);
  }
});

const initialState: BengkelState = {
  workOrders: [],
  mekanik: [],
  vehicles: [],
  serviceHistory: [],
  serviceReminders: [],
  loading: false,
  error: null,
};

const bengkelSlice = createSlice({
  name: "bengkel",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(completeWorkOrder.pending, (state) => {
        state.loading = true;
      })
      .addCase(completeWorkOrder.fulfilled, (state, action) => {
        state.loading = false;
        // Pastikan ID yang digunakan sesuai dengan response backend
        const index = state.workOrders.findIndex((wo: any) => wo._id === action.meta.arg);
        if (index !== -1) {
          state.workOrders[index].status = "done";
        }
      })
      .addCase(completeWorkOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Tambahkan handler untuk fetching data agar masuk ke state
      .addCase(fetchWorkOrders.fulfilled, (state, action) => {
        state.workOrders = action.payload;
      })
      .addCase(updateWorkOrderStatus.fulfilled, (state, action) => {
        const index = state.workOrders.findIndex((wo: any) => wo._id === action.payload._id);
        if (index !== -1) {
          state.workOrders[index] = action.payload;
        }
      })
      .addCase(workOrderUpdate.fulfilled, (state, action) => {
        const index = state.workOrders.findIndex((wo: any) => wo._id === action.payload._id);
        if (index !== -1) {
          state.workOrders[index] = action.payload;
        }
      })
      .addCase(fetchMekaniks.fulfilled, (state, action) => {
        state.mekanik = action.payload;
      })
      .addCase(fetchVehicles.fulfilled, (state, action) => {
        state.vehicles = action.payload;
      })
      .addCase(kendaraanPost.fulfilled, (state, action) => {
        state.vehicles.push(action.payload);
      })
      .addCase(fetchServiceHistory.fulfilled, (state, action) => {
        state.serviceHistory = action.payload;
      })
      .addCase(fetchServiceReminders.fulfilled, (state, action) => {
        state.serviceReminders = action.payload;
      })
      // Matcher untuk menangani loading state secara global di slice ini
      .addMatcher(
        (action) => action.type.endsWith("/pending"),
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )
      .addMatcher(
        (action) => action.type.endsWith("/fulfilled") || action.type.endsWith("/rejected"),
        (state) => {
          state.loading = false;
        }
      );
      
  },
});

export default bengkelSlice.reducer;