import React, {useState, useRef, useEffect} from 'react'
import Paper from '@material-ui/core/Paper'
import InputBase from '@material-ui/core/Input'
import {useCategoryDispatch} from '../../containers/category/CategoryContainer'
import useStyles from './styles/CategoryTab'
import star from '../../images/star.svg'

export default function CategoryTab(props) {

  const {
    text, 
    id, 
    order, 
    isFavorited, 
    urlCount, 
    selected, 
    dragFinished, 
    historyDragFinished, 
    setSelectedCategoryTitle
  } = props

  const classes = useStyles()

  const dispatch = useCategoryDispatch()
  const [categoryTitle, setCategoryTitle] = useState(text)
  const [prevCategoryTitle, setPrevCategoryTitle] = useState(text)
  const [disabled, setDisabled] = useState(true)

  const inputRef = useRef()

  const handleChange = (event) => {
    setCategoryTitle(event.target.value)
  }

  const onDoubleClick = (e) => {
    e.stopPropagation()
    e.preventDefault()
    setDisabled(!disabled)
    
    inputRef.current.focus()
    console.log('input1', inputRef.current)
  }

  const updateText = (e) => {
    e.stopPropagation()
      if (e.keyCode === 13) {
        if (!e.target.value) {
          dispatch.updateCategory(id, prevCategoryTitle, order, isFavorited)
          .then((_res) => dispatch.getCategory())
          setDisabled(!disabled)
          setSelectedCategoryTitle(prevCategoryTitle)
          setCategoryTitle(prevCategoryTitle)
        } else {
          dispatch.updateCategory(id, categoryTitle, order, isFavorited)
          .then((_res) => dispatch.getCategory())
          setDisabled(!disabled)
          setSelectedCategoryTitle(categoryTitle)
        }
      }
  }

  useEffect(() => {

    if (!selected && !disabled) {
      // console.log('input2', inputRef.current)
      // inputRef.current.blur()
      dispatch.updateCategory(id, prevCategoryTitle, order, isFavorited)
      .then((_res) => {
        dispatch.getCategory()
        inputRef.current.blur()

      })
      setDisabled(!disabled)
      setCategoryTitle(prevCategoryTitle)
      console.log('input2', inputRef.current)


    }

  },[disabled, selected, prevCategoryTitle])


  return (
    <div className={
      classes.listTab
      + (selected ? ' ' + classes.selected : '')
      + (!disabled && selected ? ' ' + classes.modifying : '')}>
      <Paper 
        component="div" 
        className={classes.root + (dragFinished || historyDragFinished ? ' dragFinished' : '')
} 
        id={`${id}`}
      >
      <InputBase 
        disableUnderline={true}
        inputRef={inputRef}
        className={classes.input + (selected ? ' selected': '')}
        disabled={disabled}
        autoFocus={true}
        onDoubleClick={onDoubleClick}
        value={categoryTitle}
        onChange={handleChange}
        onKeyUp={updateText}
      />
      <div className={classes.linkBox}>
        <div className={classes.urlCountBox + (!isFavorited ? ' ' + classes.marginRight : '')}>
          {urlCount === 0 ? '링크 없음' : urlCount + ' 링크'} 
        </div>
        {isFavorited ? <img className={classes.favoriteStar} alt="favorite-star" src={star} /> : ''}
      </div>
      </Paper>
    </div>
  )
}