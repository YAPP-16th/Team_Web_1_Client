import { createReducer, createSelector } from '@reduxjs/toolkit';
import { createRequestAction } from '../helpers';

export const ALARM_NOTICE = 'ALARM_NOTICE';

export const alaramNoticeConnection = createRequestAction(`${ALARM_NOTICE}/CONNECTION`);
export const alaramNoticeListLoad = createRequestAction(`${ALARM_NOTICE}/LIST_LOAD`);
export const alaramNoticeAdd = createRequestAction(`${ALARM_NOTICE}/ADD`);
export const alaramNoticeModify = createRequestAction(`${ALARM_NOTICE}/MODIFY`);
export const alaramNoticeReadNotice = createRequestAction(`${ALARM_NOTICE}/READ_NOTICE`);
export const alaramNoticeNoReturnNotice = createRequestAction(`${ALARM_NOTICE}/NO_RETURN_NOTICE`);

// Reducer
const initialState = {
  listData: [],
};
export const alaramNoticeReducer = createReducer(initialState, {
  [alaramNoticeListLoad.SUCCESS]: (state, { payload: listData }) => {
    state.listData = listData;
  },
  [alaramNoticeAdd.SUCCESS]: (state, { payload: data }) => {
    state.listData.push(data);
  },
  [alaramNoticeModify.SUCCESS]: (state, { payload: listData }) => {
    state.listData = listData;
  },
});

// Select
const selectAllState = createSelector(
  (state) => state,
  (state) => {
    return state;
  }
);
export const alaramNoticeSelector = {
  listData: (state) => selectAllState(state[ALARM_NOTICE].listData),
};
