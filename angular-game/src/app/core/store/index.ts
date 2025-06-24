import { ActionReducerMap, MetaReducer } from '@ngrx/store';
import { environment } from '@environments/environment';

import { authReducer, AuthState } from '@features/auth/store/auth.reducer';
import { lessonReducer, LessonState } from '@features/lessons/store/lesson.reducer';
import { voiceReducer, VoiceState } from '@features/voice/store/voice.reducer';
import { uiReducer, UIState } from './ui/ui.reducer';

export interface AppState {
  auth: AuthState;
  lessons: LessonState;
  voice: VoiceState;
  ui: UIState;
}

export const reducers: ActionReducerMap<AppState> = {
  auth: authReducer,
  lessons: lessonReducer,
  voice: voiceReducer,
  ui: uiReducer,
};

export const metaReducers: MetaReducer<AppState>[] = !environment.production ? [] : [];