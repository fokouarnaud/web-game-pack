import { createFeatureSelector, createSelector } from '@ngrx/store';
import { UIState } from './ui.reducer';

export const selectUIState = createFeatureSelector<UIState>('ui');

export const selectIsLoading = createSelector(
  selectUIState,
  (state) => state.loading
);

export const selectError = createSelector(
  selectUIState,
  (state) => state.error
);