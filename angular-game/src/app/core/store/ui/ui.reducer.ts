import { createReducer, on } from '@ngrx/store';
import { showLoading, hideLoading, setError, clearError } from './ui.actions';

export interface UIState {
  loading: boolean;
  error: string | null;
}

export const initialState: UIState = {
  loading: false,
  error: null,
};

export const uiReducer = createReducer(
  initialState,
  on(showLoading, (state) => ({
    ...state,
    loading: true,
  })),
  on(hideLoading, (state) => ({
    ...state,
    loading: false,
  })),
  on(setError, (state, { error }) => ({
    ...state,
    error,
  })),
  on(clearError, (state) => ({
    ...state,
    error: null,
  }))
);