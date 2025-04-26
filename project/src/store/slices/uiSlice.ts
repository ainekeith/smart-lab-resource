import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UiState {
  themeMode: 'light' | 'dark';
  sidebarOpen: boolean;
}

const getInitialTheme = (): 'light' | 'dark' => {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark' || savedTheme === 'light') {
    return savedTheme;
  }
  // Check for system preference
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const initialState: UiState = {
  themeMode: getInitialTheme(),
  sidebarOpen: true,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.themeMode = state.themeMode === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme', state.themeMode);
    },
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.themeMode = action.payload;
      localStorage.setItem('theme', action.payload);
    },
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },
  },
});

export const { toggleTheme, setTheme, toggleSidebar, setSidebarOpen } = uiSlice.actions;
export default uiSlice.reducer;