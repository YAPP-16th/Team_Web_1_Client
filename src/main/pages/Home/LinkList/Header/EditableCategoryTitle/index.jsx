import React, { useCallback, useEffect, useRef, useState, useMemo } from 'react'

import { yupResolver } from '@hookform/resolvers/yup'
import IconButton from '@material-ui/core/IconButton'
import InputBase from '@material-ui/core/InputBase'
import Typography from '@material-ui/core/Typography'
import CreateIcon from '@material-ui/icons/Create'
import DoneIcon from '@material-ui/icons/Done'
import clsx from 'clsx'
import { useForm } from 'react-hook-form'
import { useSelector, useDispatch } from 'react-redux'
import * as yup from 'yup'

import useOutsideAlerter from '@hooks/useOutsideAlerter'
import { categorySelect, categorySelector, categoryModifyThunk } from '@modules/category'
import { isObjkeysEmpty } from '@utils/filter'

import useStyles from './style'

const CATEGORY_NAME_MAX_LENTH = 6
const CATEGORY_SCHEMA = yup.object({
  name: yup.string().max(CATEGORY_NAME_MAX_LENTH).required(),
})

function EditableCategoryTitle() {
  const classes = useStyles()
  const dispatch = useDispatch()
  const category = useSelector(categorySelector.selectedCategory)
  const defaultValues = useMemo(() => {
    return { name: category?.name }
  }, [category])
  const { register, handleSubmit: checkSubmit, reset, errors } = useForm({
    mode: 'all',
    defaultValues,
    resolver: yupResolver(CATEGORY_SCHEMA),
  })

  const rootRef = useRef(null)
  const [isEditable, setIsEditable] = useState(false)

  useEffect(() => {
    reset(defaultValues)
  }, [reset, defaultValues])

  const handleShowEdit = useCallback(() => {
    setIsEditable(true)
  }, [])

  const handleCancelEdit = useCallback(() => {
    setIsEditable(false)
  }, [])

  const handleEditDone = useMemo(() => {
    return checkSubmit(async (formData) => {
      const response = await dispatch(
        categoryModifyThunk({
          id: category.id,
          name: formData.name,
        })
      )
      dispatch(categorySelect({ ...response }))
      setIsEditable(false)
    })
  }, [category, checkSubmit, dispatch])

  const handleEditKeyUp = useCallback(
    (e) => {
      if (e.key === 'Enter') handleEditDone()
    },
    [handleEditDone]
  )

  useOutsideAlerter(rootRef, isEditable, handleCancelEdit)

  if (!category.id) return null

  return (
    <div className={classes.root} ref={rootRef}>
      {isEditable ? (
        <>
          <InputBase
            name="name"
            onKeyUp={handleEditKeyUp}
            autoFocus
            inputProps={{
              maxLength: CATEGORY_NAME_MAX_LENTH,
            }}
            inputRef={register}
          />
          <IconButton
            aria-label="카테고리 제목 수정 하기"
            className={clsx({
              [classes.editIconActive]: !isObjkeysEmpty(errors),
            })}
            onClick={handleEditDone}
            disabled={isObjkeysEmpty(errors)}
          >
            <DoneIcon fontSize="small" />
          </IconButton>
        </>
      ) : (
        <>
          <Typography variant="h6" component="span">
            {category?.name}
          </Typography>
          <IconButton aria-label="카테고리 제목 수정 모드 전환" onClick={handleShowEdit}>
            <CreateIcon fontSize="small" />
          </IconButton>
        </>
      )}
    </div>
  )
}

export default EditableCategoryTitle
