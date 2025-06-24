import { createAction, props } from '@ngrx/store';

export const showLoading = createAction('[UI] Show Loading');
export const hideLoading = createAction('[UI] Hide Loading');
export const setError = createAction('[UI] Set Error', props<{ error: string }>());
export const clearError = createAction('[UI] Clear Error');