import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  customers: [],
  currentCustomer: null,
  loading: false,
  error: null,
};

const customersSlice = createSlice({
  name: 'customers',
  initialState,
  reducers: {
    clearCurrentCustomer: (state) => {
      state.currentCustomer = null;
    },
    setListaClientes: (state, { payload }) => {
      state.customers = payload;
    },
    setCliente: (state, { payload }) => {
      state.currentCustomer = payload;
    },
    setLoading: (state, { payload }) => {
      state.loading = payload;
    },
    setError: (state, { payload }) => {
      state.error = payload;
    },
  },
});

export const { clearCurrentCustomer, setListaClientes, setCliente, setLoading, setError } = customersSlice.actions;
export { customersSlice };
