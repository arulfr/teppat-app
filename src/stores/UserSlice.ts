import axiosInstance from "@/utils/AxiosInstance";
import { IUser } from "@/utils/types";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { RootState } from "./store";
import { AxiosError } from "axios";

export const userGet = createAsyncThunk('user/userGet',async(_,thunkAPI)=>{
    try {
        const activeStoreId = (thunkAPI.getState() as RootState).AdminSlice.activeStoreId;
        if (!activeStoreId) throw new Error("No active store selected.");
        
        const res = await axiosInstance.get('/user',{params:{id_store:activeStoreId}});
        return res.data;
    } catch (error) {
        if (error instanceof AxiosError) {
            return thunkAPI.rejectWithValue(error.response?.data.message || 'Gagal mengambil daftar user');
        }
        return thunkAPI.rejectWithValue(error);
    }
});

export const userGetId = createAsyncThunk('user/userId',async(id:string,thunkAPI)=>{
    try {
        const res = await axiosInstance.get(`/userId/${id}`);
        return res.data;
    } catch (error) {
        if (error instanceof AxiosError) {
            return thunkAPI.rejectWithValue(error.response?.data.message || 'Gagal mengambil detail user');
        }
        return thunkAPI.rejectWithValue(error);
    }
});

export const userPost = createAsyncThunk('user/userPost',async(data:IUser,thunkAPI)=>{
    try {
        const state = thunkAPI.getState() as RootState;
        const activeStoreId = state.AdminSlice.activeStoreId;
        const currentUserId = state.AdminSlice.isLogin._id;

        // Menyesuaikan payload agar konsisten dengan Model User di MongoDB (id_stores: array)
        // Dan menyertakan id_owner agar backend bisa mengecek limit staf
        const payload = { 
            ...data, 
            id_owner: currentUserId, 
            id_stores: activeStoreId ? [activeStoreId] : [] 
        };

        const res = await axiosInstance.post('/user_post', payload);
        return res.data;
    } catch (error) {
        if (error instanceof AxiosError) {
            return thunkAPI.rejectWithValue(error.response?.data.message || 'Gagal membuat user baru');
        }
        return thunkAPI.rejectWithValue(error);
    }
});

export const userUpdateAccessMenu = createAsyncThunk('user/updateAccessMenu', async (payload: { userId: string, access_menu: string[] }, thunkAPI) => {
    try {
        const res = await axiosInstance.put('/user_access_menu', payload);
        return res.data;
    } catch (error: any) {
        return thunkAPI.rejectWithValue(error.response?.data?.message || 'Error updating access menu');
    }
});

export const userUpdate = createAsyncThunk('user/userUpdate',async(data:IUser,thunkAPI)=>{
    try {
        const res = await axiosInstance.put(`/user_update/${data._id}`,data);
        return res.data;
    } catch (error) {
        if (error instanceof AxiosError) {
            return thunkAPI.rejectWithValue(error.response?.data.message || 'Gagal memperbarui data user');
        }
        return thunkAPI.rejectWithValue(error);
    }
});

export const userDelete = createAsyncThunk('user/userDelete',async(id:string,thunkAPI)=>{
    try {
        await axiosInstance.delete(`/user_delete/${id}`);
        return id;
    } catch (error) {
        if (error instanceof AxiosError) {
            return thunkAPI.rejectWithValue(error.response?.data.message || 'Gagal menghapus user');
        }
        return thunkAPI.rejectWithValue(error);
    }
});

export const userAddStoreAccess = createAsyncThunk('user/addStoreAccess', async (payload: { userId: string, storeId: string }, thunkAPI) => {
    try {
        const res = await axiosInstance.post('/user_add_store', payload);
        return { ...payload, message: res.data.message };
    } catch (error: any) {
        return thunkAPI.rejectWithValue(error.response?.data?.message || 'Error adding store access');
    }
});

export const userRemoveStoreAccess = createAsyncThunk('user/removeStoreAccess', async (payload: { userId: string, storeId: string }, thunkAPI) => {
    try {
        const res = await axiosInstance.post('/user_remove_store', payload);
        return { ...payload, message: res.data.message };
    } catch (error: any) {
        return thunkAPI.rejectWithValue(error.response?.data?.message || 'Error removing store access');
    }
});

const UserSlice = createSlice({
    name:"userSlice",
     initialState:{
        userData: [] as IUser[],
        userId: null as IUser | null,
    },
    reducers:{},
    extraReducers(builder) {
        builder.addCase(userGet.fulfilled,(state,action)=>{
            state.userData = action.payload;
        }),
        builder.addCase(userGetId.fulfilled,(state,action)=>{
            state.userId = action.payload;
        })
        builder.addCase(userPost.fulfilled,(state,action)=>{
            state.userData.push(action.payload);
        }),
        builder.addCase(userUpdate.fulfilled,(state,action)=>{
            const index = state.userData.findIndex((item)=>item._id === action.payload._id);
            state.userData[index] = action.payload
        }),
        builder.addCase(userDelete.fulfilled,(state,action)=>{
            state.userData = state.userData.filter(item=>item._id !== action.payload);

        }),
        builder.addCase(userUpdateAccessMenu.fulfilled, (state, action) => {
            const index = state.userData.findIndex((item) => item._id === action.payload._id);
            if (index !== -1) state.userData[index] = action.payload;
        }),
        builder.addCase(userAddStoreAccess.fulfilled, (state, action) => {
            const { userId, storeId } = action.payload;
            const userIndex = state.userData.findIndex((u) => u._id === userId);
            if (userIndex !== -1) {
                const user = state.userData[userIndex] as any;
                if (!user.id_stores) user.id_stores = [];
                if (!user.id_stores.includes(storeId)) {
                    user.id_stores.push(storeId);
                }
            }
            if (state.userId && state.userId._id === userId) {
                const user = state.userId as any;
                if (!user.id_stores) user.id_stores = [];
                if (!user.id_stores.includes(storeId)) {
                    user.id_stores.push(storeId);
                }
            }
        }),
        builder.addCase(userRemoveStoreAccess.fulfilled, (state, action) => {
            const { userId, storeId } = action.payload;
            const userIndex = state.userData.findIndex((u) => u._id === userId);
            if (userIndex !== -1) {
                const user = state.userData[userIndex] as any;
                if (user.id_stores) {
                    user.id_stores = user.id_stores.filter((id: string) => id !== storeId);
                }
            }
            if (state.userId && state.userId._id === userId) {
                const user = state.userId as any;
                if (user.id_stores) {
                    user.id_stores = user.id_stores.filter((id: string) => id !== storeId);
                }
            }
        })
    }

});


export const {} =  UserSlice.actions;
export default UserSlice.reducer;
