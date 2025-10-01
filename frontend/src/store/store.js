import { configureStore } from '@reduxjs/toolkit'
import { persistStore, persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import { combineReducers } from '@reduxjs/toolkit'

import authSlice from './slices/authSlice'
import interviewSlice from './slices/interviewSlice'
import candidateSlice from './slices/candidateSlice'

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth', 'interview'] // Only persist auth and interview data
}

const rootReducer = combineReducers({
  auth: authSlice,
  interview: interviewSlice,
  candidate: candidateSlice,
})

const persistedReducer = persistReducer(persistConfig, rootReducer)

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
})

export const persistor = persistStore(store)

export default store