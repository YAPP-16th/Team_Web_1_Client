import { createReducer, createAction, createSelector } from '@reduxjs/toolkit'

import { createRequestAction, createRequestThunk } from '../helpers'

export const CATEGORY = 'CATEGORY'

export const categoriesRead = createRequestAction(`${CATEGORY}/READ`)
export const categoriesReadThunk = createRequestThunk(categoriesRead)

export const categoryCreate = createRequestAction(`${CATEGORY}/CREATE`)
export const categoryCreateThunk = createRequestThunk(categoryCreate)

export const categoryModify = createRequestAction(`${CATEGORY}/MODIFY`)
export const categoryModifyThunk = createRequestThunk(categoryModify)

export const categoryRemove = createRequestAction(`${CATEGORY}/REMOVE`)
export const categoryRemoveThunk = createRequestThunk(categoryRemove)

export const categorySelect = createAction(`${CATEGORY}/SELECT`)

// Reducer
const initialState = {
  listData: [],
  selectedCategory: {},
}
export const categoryReducer = createReducer(initialState, {
  [categoriesRead.SUCCESS]: (state, { payload, meta }) => {
    state.listData = payload

    if (meta?.key === 'isFirstCategory') {
      state.selectedCategory = {
        ...state.selectedCategory,
        ...payload.filter((item) => !Boolean(item.is_favorited))[0],
      }
    }
  },

  [categorySelect]: (state, { payload }) => {
    state.selectedCategory = { ...state.selectedCategory, ...payload }
  },
})

// Select
const selectFavoriteCategoriesState = createSelector(
  (state) => state.listData,
  (listData) => {
    return listData.filter((item) => Boolean(item.is_favorited))
  }
)
const selectNormalCategoriesState = createSelector(
  (state) => state.listData,
  (listData) => {
    return listData.filter((item) => !Boolean(item.is_favorited))
  }
)
export const categorySelector = {
  listData: (state) => state[CATEGORY].listData,
  favoriteCategories: (state) => selectFavoriteCategoriesState(state[CATEGORY]),
  normalCategories: (state) => selectNormalCategoriesState(state[CATEGORY]),
  selectedCategory: (state) => state[CATEGORY].selectedCategory,
}
