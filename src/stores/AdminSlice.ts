import { Ilogin, Kategori, Supplier } from "@/utils/types";
import { createAsyncThunk,createSlice,PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "./store";
import axios from 'axios';
import qs from 'qs';
import axiosInstance from "@/utils/AxiosInstance";
import { StoreCreate, StoreGetAction } from "./StoreSlice";

const initialSupplier: Supplier[] = [];
let supplierId !: Supplier;


//==================================== Login ===========================================================================

export const LoginAdmin = createAsyncThunk('admin/loginAdmin',async(login:{username:string,password:string},thunkAPI)=>{
    try {
        const res = await axiosInstance.post(`/admin/login`,qs.stringify(login));
        return res.data;
    } catch (error: any) {
        return thunkAPI.rejectWithValue(error.response?.data?.message || "Email atau password salah");
    }
});

export const LoginGoogle = createAsyncThunk('admin/loginGoogle', async (idToken: string, thunkAPI) => {
    try {
        // Gunakan axiosInstance agar konsisten dengan interceptor dan config lainnya
        const res = await axiosInstance.post(`/login_google`, { idToken });
        return res.data;
    } catch (error: any) {
        // Menangkap pesan error dari server atau pesan error dari axios (Network Error, dll)
        return thunkAPI.rejectWithValue(error.response?.data?.message || error.message || "Login Google gagal");
    }
});

export const UpdateUser = createAsyncThunk('admin/updateUser', async (data: { id: string, tipe_bisnis: string }, thunkAPI) => {
    try {
        const { id, ...payload } = data;
        const response = await axiosInstance.put(`/user_update/${id}`, payload);
        return response.data;
    } catch (error: any) {
        return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
});

//=====================================================================================================================


// ================================================= Kategori Actions =================================================
export const KategoriGet = createAsyncThunk('admin/kategoriGet',async(_,thunkAPI)=>{
    try {
        const activeStoreId = (thunkAPI.getState() as RootState).AdminSlice.activeStoreId;
        const response = await axiosInstance.get(`/kategori?id_store=${activeStoreId}`);
        return response.data;
    } catch (error) {
        return thunkAPI.rejectWithValue((error as Error).message);
    }
});

export const KategoriCreate = createAsyncThunk('admin/kategoriAdd',async(data:Kategori,thunkAPI)=>{
    try {
        const activeStoreId = (thunkAPI.getState() as RootState).AdminSlice.activeStoreId;
        const newPayload = { ...data, id_store: activeStoreId };
        const response = await axiosInstance.post(`/kategori_post`,qs.stringify(newPayload));
        return response.data;
    } catch (error: any) {
        return thunkAPI.rejectWithValue(error.response?.data?.message || "Gagal menambah kategori");
    }
});

export const KategoriDelete = createAsyncThunk('admin/kategoriDelete',async(id:string,thunkAPI)=>{
    try {
        await axiosInstance.delete(`/kategori_delete/${id}`);
        return id;
    } catch (error) {
        return thunkAPI.rejectWithValue((error as Error).message);
    }
});

export const KategoriUpdate = createAsyncThunk('admin/kategoriUpdate',async(data:Kategori,thunkAPI)=>{
    try {
        const activeStoreId = (thunkAPI.getState() as RootState).AdminSlice.activeStoreId;
        const newPayload = { ...data, id_store: activeStoreId };
        await axiosInstance.put(`/kategori_update/${data._id}`,qs.stringify(newPayload));
        return;
    } catch (error) {
        return thunkAPI.rejectWithValue((error as Error).message);
    }
});
//=============================================================================================================

//============================================== Supplier Actions ==============================================


export const SupplierGet = createAsyncThunk('admin/supplierGet',async(_,thunkAPI)=>{
    try {
        const activeStoreId = (thunkAPI.getState() as RootState).AdminSlice.activeStoreId;
        const response = await axiosInstance.get(`/supplier?id_store=${activeStoreId}`);
        return response.data;
    } catch (error) {
        return thunkAPI.rejectWithValue((error as Error).message);
    }
});

export const SupplierGetId = createAsyncThunk('admin/supplierGetId',async(id:string,thunkAPI)=>{
    try {
        const activeStoreId = (thunkAPI.getState() as RootState).AdminSlice.activeStoreId;
        const response = await axiosInstance.get(`/supplierId/${id}?id_store=${activeStoreId}`);
        return response.data;
    } catch (error) {
        return thunkAPI.rejectWithValue((error as Error).message);
    }
});

export const SupplierCreate = createAsyncThunk('admin/supplierAdd',async(data:Supplier,thunkAPI)=>{
    try {
       const activeStoreId = (thunkAPI.getState() as RootState).AdminSlice.activeStoreId;
       const newPayload = { ...data, id_store: activeStoreId };
       const supplier = await axiosInstance.post(`/supplier_post`,qs.stringify(newPayload));
       //console.log(supplier.data);
       return supplier.data;
    } catch (error) {
        return thunkAPI.rejectWithValue((error as Error).message);
    }
});

export const supplierDelete = createAsyncThunk('admin/supplierDelete',async(id:string,thunkAPI)=>{
    try {
        await axiosInstance.delete(`/supplier_delete/${id}`);
        return id;
    } catch (error) {
        return thunkAPI.rejectWithValue((error as Error).message);
    }
});

export const SupplierEditData = createAsyncThunk('admin/supplierEdit',async(data:Supplier,thunkAPI)=>{
    try {
        const activeStoreId = (thunkAPI.getState() as RootState).AdminSlice.activeStoreId;
        const newPayload = { ...data, id_store: activeStoreId };
        await axiosInstance.put(`/supplier_update/${data._id}`,qs.stringify(newPayload));
        return data;
    } catch (error) {
        return thunkAPI.rejectWithValue((error as Error).message);
    }
});

//==============================================================================================================


//============================================== Barang Action =====================================================

//==============================================================================================================
const AdminSlice = createSlice({
    name:'AdminSlice',
    initialState:{
        kategori : [] as Kategori[],
        supplier: initialSupplier,
        supplierId : null as Supplier | null,
        loading: false,
        activeStoreId: null as string | null,
        isChatOpen: false,
        showSessionExpiredModal: false,
        isLogin : {
            username: '',
            kode_user: '',
            token: '',
            refreshToken: '',
            _id: '',
            id_store: null,
            role: null,
            available_stores: [],
            subscription_plan: 'free',
            subscription_status: 'trial',
            subscription_expiry: null
        } as Ilogin,
    },
    reducers:{
        resetLogin(state) {
            state.isLogin = {username:'',kode_user:'',token:'', refreshToken: '', _id: '',id_store: null, role: null, available_stores: [], subscription_plan: 'free', subscription_status: 'trial', subscription_expiry: null };
            state.activeStoreId = null;
            state.showSessionExpiredModal = false;
            localStorage.removeItem('persist:root'); // Jika menggunakan redux-persist
            sessionStorage.clear();
        },
        setSessionExpired(state, action: PayloadAction<boolean>) {
            state.showSessionExpiredModal = action.payload;
        },
        setAutoLogin(state, action: PayloadAction<Ilogin>) {
            // Gunakan spread operator agar semua field dari database masuk ke state
            state.isLogin = { ...state.isLogin, ...action.payload };
            state.activeStoreId = action.payload.id_store || null;
        },
        setActiveStoreId(state, action: PayloadAction<string | null>) {
            state.activeStoreId = action.payload;
            // Sinkronkan juga ke dalam objek isLogin untuk konsistensi data user
            if (state.isLogin) {
                state.isLogin.id_store = action.payload as any;
            }
        },
        setChatOpen(state, action: PayloadAction<boolean>) {
            state.isChatOpen = action.payload;
        },
    },
    extraReducers:(builder)=>{
        builder.addCase(LoginAdmin.fulfilled,(state,action:PayloadAction<Ilogin>)=>{
            state.isLogin = action.payload;
            state.activeStoreId = action.payload.id_store || null;
        })
        .addCase(LoginGoogle.fulfilled, (state, action: PayloadAction<Ilogin>) => {
            state.isLogin = action.payload;
            state.activeStoreId = action.payload.id_store || null;
        })
        .addCase(UpdateUser.fulfilled, (state, action: PayloadAction<any>) => {
            state.isLogin = { ...state.isLogin, ...action.payload };
        })
        .addCase(KategoriGet.fulfilled,(state,action:PayloadAction<Kategori[]>)=>{
            state.kategori = action.payload;
        })
        .addCase(KategoriDelete.fulfilled,(state,action:PayloadAction<string>)=>{
            state.kategori = state.kategori.filter(item => item._id !== action.payload);
        })
        .addCase(SupplierGet.fulfilled,(state,action:PayloadAction<Supplier[]>)=>{
            state.supplier = action.payload;
        }).
        addCase(SupplierGetId.fulfilled,(state,action:PayloadAction<Supplier>)=>{
            state.supplierId = action.payload;
        })
        .addCase(SupplierCreate.fulfilled, (state,action:PayloadAction<Supplier>) => {
            state.supplier.push(action.payload);
        })
        .addCase(SupplierEditData.fulfilled, (state,action:PayloadAction<Supplier>) => {
            const indexSupplier = state.supplier.findIndex(item => item._id === action.payload._id);
            state.supplier[indexSupplier] = action.payload;

        })
        .addCase(supplierDelete.fulfilled,(state,action:PayloadAction<string>)=>{
            state.supplier = state.supplier.filter(item=>item._id !== action.payload);
        })
        // Aturan #8: Sinkronisasi daftar toko ke AdminSlice agar tersedia global
        .addCase(StoreCreate.fulfilled, (state, action) => {
            if (state.isLogin) {
                if (!state.isLogin.available_stores) state.isLogin.available_stores = [];
                state.isLogin.available_stores.push(action.payload);
            }
        })
        .addCase(StoreGetAction.fulfilled, (state, action) => {
            if (state.isLogin) state.isLogin.available_stores = action.payload;
        })
        .addMatcher(
        (action) => action.type.endsWith('/pending'),
        (state) => {
            state.loading = true;
        }
        )
        // Gunakan Matcher untuk menangani SEMUA status fulfilled/rejected untuk mematikan loading
        .addMatcher(
        (action) => action.type.endsWith('/fulfilled') || action.type.endsWith('/rejected'),
        (state) => {
            state.loading = false;
        }
        );
    }
});


export const {resetLogin, setAutoLogin, setActiveStoreId, setSessionExpired, setChatOpen} = AdminSlice.actions;


export default AdminSlice.reducer;
