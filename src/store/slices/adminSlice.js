import { createSlice } from '@reduxjs/toolkit';

const adminToken = localStorage.getItem('adminToken');

const adminSlice = createSlice({
  name: 'admin',
  initialState: {
    accessToken: adminToken || null,
    isAuthenticated: !!adminToken,
  },
  reducers: {
    setAdminCredentials(state, action) {
      state.accessToken = action.payload.accessToken;
      state.isAuthenticated = true;
      localStorage.setItem('adminToken', action.payload.accessToken);
    },
    adminLogout(state) {
      state.accessToken = null;
      state.isAuthenticated = false;
      localStorage.removeItem('adminToken');
    },
  },
});

export const { setAdminCredentials, adminLogout } = adminSlice.actions;
export default adminSlice.reducer;
