import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const userLoginThunk = createAsyncThunk(
  'userLogin',
  async (userCredObj, thunkApi) => {
    try {
      // IMPORTANT: FastAPI's OAuth2 form expects 'x-www-form-urlencoded' data, not JSON.
      // We create URLSearchParams to format the data correctly.
      const params = new URLSearchParams();
      params.append('username', userCredObj.username);
      params.append('password', userCredObj.password);

      // Connect to your new FastAPI backend login URL
      const res = await axios.post('http://127.0.0.1:8000/login', params);

      // The token is in res.data.access_token
      const token = res.data.access_token;
      if (token) {
        localStorage.setItem('token', token);
        // We return the part of the response we need
        return res.data; 
      } else {
        return thunkApi.rejectWithValue(res.data.detail || "Login failed");
      }
    } catch (err) {
      return thunkApi.rejectWithValue(err.response?.data?.detail || err.message);
    }
  }
);

export const userSlice = createSlice({
  name: 'user-login',
  initialState: {
    isPending: false,
    loginUserStatus: false,
    currentUser: {},
    errorOccurred: false,
    errMsg: ''
  },
  reducers: {
    resetState: (state) => {
      state.isPending = false;
      state.loginUserStatus = false;
      state.currentUser = {};
      state.errorOccurred = false;
      state.errMsg = '';
      localStorage.removeItem('token');
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(userLoginThunk.pending, (state) => {
        state.isPending = true;
      })
      .addCase(userLoginThunk.fulfilled, (state, action) => {
        state.isPending = false;
        // The token itself is the main payload here. We can decode it later if needed.
        state.currentUser = action.payload; 
        state.loginUserStatus = true;
        state.errMsg = '';
        state.errorOccurred = false;
      })
      .addCase(userLoginThunk.rejected, (state, action) => {
        state.isPending = false;
        state.currentUser = {};
        state.loginUserStatus = false;
        state.errMsg = action.payload;
        state.errorOccurred = true;
      });
  }
});

export const { resetState } = userSlice.actions;
export default userSlice.reducer;