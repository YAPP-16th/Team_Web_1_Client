import { call, takeEvery, takeLatest } from 'redux-saga/effects';
import { createReducer } from '@reduxjs/toolkit';

import { createRequestAction, createRequestSaga, createRequestThunk } from '../helpers';
import * as api from './api';

import { setAccessToken, removeAccessToken } from '@commons/http/auth';
import { getAuthToken, removeCachedAuthToken } from '@commons/chromeApis/OAuth';

export const userRegister = createRequestAction('user/REGISTER');
export const userRegisterThunk = createRequestThunk(userRegister);

export const userLogin = createRequestAction('user/LOGIN');
export const userLoginThunk = createRequestThunk(userLogin);

export const userLogout = createRequestAction('user/LOGOUT');
export const userLogoutThunk = createRequestThunk(userLogout);

export const userGregister = createRequestAction('user/G_REGISTER');
export const userGregisterThunk = createRequestThunk(userGregister);

export const userGlogin = createRequestAction('user/G_LOGIN');
export const userGloginThunk = createRequestThunk(userGlogin);

export const userRead = createRequestAction('user/READ');
export const userReadThunk = createRequestThunk(userRead);

export const userModify = createRequestAction('user/MODIFY');
export const userModifyThunk = createRequestThunk(userModify);

export const userRemove = createRequestAction('user/REMOVE');
export const userRemoveThunk = createRequestThunk(userRemove);

const initialState = {
  data: {},
};

// Reducer
export const userReducer = createReducer(initialState, {
  [userRead.SUCCESS]: (state, { payload }) => {
    // state.data =
  },
});

// Saga
const watchUserRegister = createRequestSaga(userRegister, function* (action) {
  const { data } = yield call(api.nRegister, action.payload);
  yield call(setAccessToken, data.token);
  return data;
});

const watchUserLogin = createRequestSaga(userLogin, function* (action) {
  const { data } = yield call(api.nLogin, action.payload);
  yield call(setAccessToken, data.token);
  return data;
});

const watchUserLogout = createRequestSaga(userLogout, function* (_action) {
  yield call(removeAccessToken);
});

const watchUserGregister = createRequestSaga(userGregister, function* (_action) {
  let token;
  try {
    token = yield call(getAuthToken);
    const { data } = yield call(api.gRegister, { token });
    yield call(setAccessToken, data.token);
    return data;
  } catch (error) {
    if (token && error.response?.status >= 400) {
      yield call(removeCachedAuthToken, token);
    }
    throw error;
  }
});

const watchUserGlogin = createRequestSaga(userGlogin, function* (_action) {
  let token;
  try {
    token = yield call(getAuthToken);
    const { data } = yield call(api.gLogin, { token });
    yield call(setAccessToken, data.token);
    return data;
  } catch (error) {
    if (token && error.response?.status >= 400) {
      yield call(removeCachedAuthToken, token);
    }
    throw error;
  }
});

const watchUserRead = createRequestSaga(userRead, function* (action) {
  const { data } = yield call(api.userRead, action.payload, null);
  return data;
});

const watchUserModify = createRequestSaga(userModify, function* (action) {
  const { data } = yield call(api.userModiify, action.payload, null);
  return data;
});

const watchUserRemove = createRequestSaga(userRemove, function* (action) {
  const { data } = yield call(api.userRemove, action.payload);
  yield call(removeAccessToken);
  return data;
});

export function* userSaga() {
  yield takeLatest(userRegister.REQUEST, watchUserRegister);
  yield takeLatest(userLogin.REQUEST, watchUserLogin);
  yield takeLatest(userLogout.REQUEST, watchUserLogout);
  yield takeLatest(userGregister.REQUEST, watchUserGregister);
  yield takeLatest(userGlogin.REQUEST, watchUserGlogin);
  
  yield takeEvery(userRead.REQUEST, watchUserRead);
  yield takeEvery(userModify.REQUEST, watchUserModify);
  yield takeLatest(userRemove.REQUEST, watchUserRemove);
}
