/* global chrome */
// * React
import React, { useState, useEffect, useRef, useCallback } from 'react'

// * dispatch
import {useLinkState, useLinkDispatch, useCategoryState, useCategoryDispatch} from '../../containers/category/CategoryContainer'

// * UI (CSS)
import Drawer from '@material-ui/core/Drawer'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import Button from '@material-ui/core/Button'
import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline'
import DeleteIcon from '@material-ui/icons/Delete'
import Paper from '@material-ui/core/Paper'
import Input from '@material-ui/core/Input'
import Grid from '@material-ui/core/Grid'
import ToggleButton from '@material-ui/lab/ToggleButton'
import AddToPhotosIcon from '@material-ui/icons/AddToPhotos'
import {useStyles, StyledToggleButtonGroup} from './styles/CategoryDrawer'
import clsx from 'clsx'

import SearchIcon from '../../images/search.png'
import CategoryEmptyIcon from '../../images/group-5.svg'
import linkListEmptyIcon from '../../images/group-11.png'
import linkListSearchEmptyIcon from '../../images/group-17.png'

// * components
import CategoryCard from '../../components/category/CategoryCard'
import {AlertModal} from '../../components/modal'
import CategoryAppBar from './CategoryAppBar'
import CategoryTab from './CategoryTab'
import CategorySearchPopOver from './CategorySearchPopOver'
import Snackbar from '../Snackbar'
import useEventListener from '../../hooks/useEventListener'

export default function CategoryDrawer(props) {

  const classes = useStyles()

  const {
    getCategory,
    writeCategory,
    updateCategory,
    deleteCategory
  } = useCategoryDispatch()
  const { 
    getLink, 
    writeLink, 
    deleteLink 
  } = useLinkDispatch()
  const { 
    draggedHistoryList,
    setDraggedHistoryList,
    selectedLinkList,
    setSelectedLinkList,
    writeAlarm,
    // getUser,
  } = props
  
  const [links, setLink] = useLinkState()
  const categories = useCategoryState()
  const favoritedArr = categories.filter(data => data.is_favorited === true)
  const notFavoritedArr = categories.filter(data => data.is_favorited === false)

  const [newCategoryTitle, setNewCategoryTitle] = useState('')
  const [toggleAlignment, setToggleAlignment] = useState('left')
  const [searchValue, setSearchValue] = useState('')
  const [selectedCategoryId, setSelectedCategoryId] = useState('')
  const [selectedCategoryTitle, setSelectedCategoryTitle] = useState('')

  const [addOpen, setAddOpen] = useState(true)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [enterOpen, setEnterOpen] = useState(false)

  useEffect(() => {
    if (!selectedCategoryId) {
      setAddOpen(true)
      setDeleteOpen(false)
      getCategory({}).then((response) => {
        const {data} = response
        if(data.length) {
          setSelectedCategoryId(data[0]?.id)
          setSelectedCategoryTitle(data[0]?.name)
        }
        else {
          setSelectedCategoryTitle('')
          setLink([])
        }
      })
    } 
    else if (selectedCategoryId) { // * category Select
      getLink({ category: selectedCategoryId })
    }
  }, [selectedCategoryId])

  const handleClickCategoryTitle = () => {
    getLink({ category: selectedCategoryId })
  }

  const handleChangeNewCategoryTitle = (e) => {
    let checks = /[a-zA-Z]/
    if(checks.test(e.target.value)) {
        if(e.target.value.length >= 14) return
    } else if (e.target.value.length >= 7) return
    setNewCategoryTitle(e.target.value)
  }

  const handleToggleChange = (event, newAlignment) => {
    setToggleAlignment(newAlignment)
  }

  const handlePressEnterSearchValue = e => {
    const { keyCode } = e
    const { value } = e.target
    let path, title
    if (keyCode === 13) {
      if (toggleAlignment === 'left') path = value
      else if (toggleAlignment === 'right') title = value
      setSearchValue(value)
      getLink({ category: selectedCategoryId, path, title })
    }
  }

  const addTab = (e) => {
    e.stopPropagation()
    if (!newCategoryTitle) {
      setAddOpen(true)
      setEnterOpen(false)
      setNewCategoryTitle('')
    } else {
      setAddOpen(true)
      setEnterOpen(false)
      writeCategory({ name: newCategoryTitle, is_favorited: false })
      .then((res) => {
        setNewCategoryTitle('')
        setSelectedCategoryId(res.data.id)
        setSelectedCategoryTitle(res.data.name)
        getCategory({})
        return res.data
      })
    }
  }

  const pressEnterAddTab = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.keyCode === 13) {
      addTab(e)
    }
  }

  const cancelAddTab = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setAddOpen(true)
    setEnterOpen(false)
    setNewCategoryTitle('')
  }

  const openDeleteModal = (e) => {
    e.stopPropagation()
    setDeleteOpen(true)
    setDeleteModalOpen(true)
  }

  const closeDeleteModal = (e) => {
    e.stopPropagation()
    setDeleteModalOpen(false)
    setDeleteOpen(false)
    setAddOpen(true)
  }
  
  const deleteTab = (e) => {
    e.stopPropagation()
    deleteCategory({ id: selectedCategoryId })
    .then(() => {
      setDeleteModalOpen(false)
      setDeleteOpen(false)
      setAddOpen(true)
      setSelectedCategoryId('')
    })
  }

  const handleClickCategory = (e, id, name) => {
    e.stopPropagation()
    setAddOpen(false)
    if(addOpen) setDeleteOpen(true)
    setSelectedCategoryId(id)
    setSelectedCategoryTitle(name)
    // getLink(selectedCategoryId)
  }

  const openEnterTab = (e) => {
    e.stopPropagation()
    setAddOpen(false)
    setEnterOpen(true)
  }

  
  const onClickAddInput = e => {
    e.preventDefault()
    e.stopPropagation()
  }

  /*
    아래는 drag n drop 로직
  */

  const [draggedCategoryData, setDraggedTargetData] = useState({
    draggedCategory : '',
    draggedId: 0,
    draggedName: '',
    draggedOrder: 0,
    dragFinished: false
  })
  const {draggedCategory, draggedId, draggedName, draggedOrder, dragFinished} = draggedCategoryData  
  const [overedTabId, setOveredTabId] = useState(0)
  const [overedTabOrder, setOveredTabOrder] = useState(0)
  const [overedTabFavorite, setOveredTabFavorite] = useState(null)
  const [dragHistoryFinished, setDragHistoryFinished] = useState(false)
  
  const dragStart = (e, id, name, order) => {
    e.stopPropagation()
    const target = e.currentTarget
    setDraggedTargetData({
      ...draggedCategoryData,
      draggedCategory: target,
      draggedId: id,
      draggedName: name,
      draggedOrder: order
    })

    e.dataTransfer.setData('text/html', target)
    e.dataTransfer.setData("text/type", 'category')
    e.dataTransfer.effectAllowed = 'move'
  }

  const dragOver = (e, id, order, favorited) => {
    e.preventDefault()
    e.stopPropagation()
    

    if(draggedHistoryList.length !== 0 && draggedHistoryList[0].dataset.type === 'link' && !draggedCategory) {
      setOveredTabId(id)
      e.dataTransfer.dropEffect = "move"
    } else if(draggedCategory.dataset.type === 'category' && draggedCategory) {
      setOveredTabOrder(order)
      setOveredTabFavorite(favorited)
      draggedCategory.style.display='none'
      e.currentTarget.previousSibling.style.opacity = 1
      e.dataTransfer.dropEffect = "move"
    }
  }

  const dragLeave = (e) => {
    e.currentTarget.previousSibling.style.opacity = 0
  }
  
  const dragEnd = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDraggedTargetData({
      ...draggedCategoryData,
      draggedName: ''
    })

    if (e.dataTransfer.dropEffect === 'none') {
      draggedCategory.style.display='block'
    }
  }

  const drop = (e, id, name, order, favorited) => {
    e.stopPropagation()
    const type = e.dataTransfer.getData('text/type')
    const filteredLinkList = [] 
    selectedLinkList.forEach(link => filteredLinkList.push(link.path))
    if(type === 'category') {
      e.preventDefault()
      if(e.currentTarget.dataset.dropzone) {
        const dropzone = e.currentTarget.dataset.dropzone
        if(dropzone === 'first-favorite-dropzone' || dropzone === 'first-category-dropzone') {
          e.currentTarget.previousSibling.style.opacity = 1
        } else {
        e.currentTarget.previousSibling.style.opacity = 0
        }
      } else {
        e.currentTarget.previousSibling.style.opacity = 0
      }       
      updateCategory({ id, name, order, is_favorited: favorited })
      .then(() =>  setDraggedTargetData({
        ...draggedCategoryData,
        dragFinished: true,
      }))
    } else if(type === 'link') {
      e.preventDefault()
      writeLink({ category: overedTabId, path: filteredLinkList })
        .then(() => setDragHistoryFinished(true))
      setSelectedLinkList([])
      setDraggedHistoryList([])
    } else {
      draggedCategory.style.display='block'
    }
  }

  const firstFavoriteDragOver = (e) => {
    e.stopPropagation()
    e.preventDefault()
    draggedCategory.style.display='none'
    setOveredTabOrder(draggedOrder)
    setOveredTabFavorite(true)
  }  

  const firstCategoryDragOver = (e) => {
    e.stopPropagation()
    e.preventDefault()
    draggedCategory.style.display='none'
    setOveredTabOrder(draggedOrder)
    setOveredTabFavorite(false)
  }  

  const lastCategoryDragOver = (e) => {
    e.stopPropagation()
    e.preventDefault()
    draggedCategory.style.display='none'
    e.currentTarget.previousSibling.style.opacity = 1
    const dropzone = e.currentTarget.dataset.dropzone
    if(dropzone === 'last-favorite-dropzone') {
      setOveredTabOrder(favoritedArr[favoritedArr.length-1].order)
      setOveredTabFavorite(true)
    } else if(dropzone === 'last-category-dropzone') {
      setOveredTabOrder(categories.length)
      setOveredTabFavorite(false)
    }
  }  

  const dragOverOnCardArea =(e) => {
    e.stopPropagation()
    e.preventDefault()
    setOveredTabId(selectedCategoryId)
  }

  const dropOnCardArea = (e) => {
    e.stopPropagation()
    const type = e.dataTransfer.getData('text/type')
    const filteredLinkList = [] 
    selectedLinkList.forEach(link => filteredLinkList.push(link.path))

    if(type === 'link') {
      e.preventDefault()
      writeLink({ category: selectedCategoryId, path: filteredLinkList })
        .then(() => setDragHistoryFinished(true))
      setSelectedLinkList([])
      setDraggedHistoryList([])
    }
  }



  const timeId = useRef()

  useEffect(() => {
    // add Animation when finished dragging
    if(dragFinished) {
      getCategory({})
      .then(() => {
        draggedCategory.style.display='block'
        timeId.current = setTimeout(() => {
          setDraggedTargetData({
            ...draggedCategoryData,
            draggedCategory : '',
            draggedId: 0,
            draggedName: '',
            draggedOrder: 0,
            dragFinished: false
          })
        }, 1000)  
      })
    } else if(dragHistoryFinished) {
      if(overedTabId === selectedCategoryId) getLink({ category: selectedCategoryId })
      getCategory({})
        .then(() => {
          timeId.current = setTimeout(() => {
            setDragHistoryFinished(false)
          }, 1000)
        })
    }
    return () => {
      clearTimeout(timeId.current)
    }

  },[draggedCategory, dragFinished, dragHistoryFinished])
  
  const drawer = (
    <div>
      <div className="list-tab-layout">
        <div className="favorite-header">
          <div className="favorite-text">
            Favorite
          </div>
          <hr />
        </div>
        <div 
          className={(!favoritedArr.length ? classes.firstFavoriteDropZone : classes.hidden)}
          data-dropzone='first-favorite-dropzone'
          onDragOver={firstFavoriteDragOver}
          onDrop={(e) => drop(e, draggedId, draggedName, overedTabOrder, overedTabFavorite)}
        >
          Drag the category here!
        </div>
        <List>
          {favoritedArr.map((data, index) => (
            <React.Fragment key={data.id}>
              <div className={classes.dragline} />
              <ListItem className={classes.listItem + (data.id === selectedCategoryId ? ' '+classes.selected : '' )}
                key={data.id}
                data-type='category' 
                draggable='true'
                onClick={(e) => handleClickCategory(e, data.id, data.name)}
                onDragStart={(e) => dragStart(e, data.id, data.name, data.order)}
                onDragEnd={dragEnd}
                onDragOver={(e) => dragOver(e, data.id, (draggedOrder < data.order ? data.order-1 : data.order) , data.is_favorited)}
                onDragLeave={dragLeave}
                onDrop={(e) => drop(e, draggedId, draggedName, overedTabOrder, overedTabFavorite)}
              >
                <CategoryTab 
                  key={data.id} 
                  text={data.name} 
                  id={data.id} 
                  order={data.order}
                  isFavorited={data.is_favorited}
                  urlCount={data.url_count}
                  selected={(data.id === selectedCategoryId)} 
                  dragFinished={(data.id === draggedId ? dragFinished : false)} 
                  historyDragFinished={(dragHistoryFinished && data.id === overedTabId ? true : null)}
                  setSelectedCategoryTitle={setSelectedCategoryTitle}
                />
              </ListItem>
            </React.Fragment>
          ))}
          <div className={classes.dragline} />
          <div 
            className={(favoritedArr.length && draggedName ? classes.hiddenDropZone: classes.hidden)}
            data-dropzone='last-favorite-dropzone'
            onDragLeave={dragLeave}
            onDragOver={lastCategoryDragOver}
            onDrop={(e) => drop(e, draggedId, draggedName, overedTabOrder, overedTabFavorite)}
          >
          </div>
        </List>
        <div className="category-header">
          <div className="category-text">
            Category
          </div>
          <hr />
        </div>
        <Button className={classes.addButton + (addOpen ? '' : ' '+classes.hidden)} 
          variant="contained"
          onClick={openEnterTab}
        >
          <AddCircleOutlineIcon style={{color: "#cccccc"}} />
        </Button>
        <Button className={classes.deleteButton + (deleteOpen ? ' '+classes.block : '')} 
          variant="contained" 
          onClick={openDeleteModal}
        >
          <DeleteIcon style={{color: "#cccccc"}} />
        </Button>
        <Paper className={classes.enterTab + (enterOpen ? ' '+classes.flex : '')}
          component="div" 
        >
          <Input className={classes.input}
            disableUnderline={true}
            placeholder="New one"
            value={newCategoryTitle}
            onChange={handleChangeNewCategoryTitle}
            onKeyUp={pressEnterAddTab}
            onClick={onClickAddInput}
          />
            <Button className={classes.okBtn} onClick={addTab}>
              확인
            </Button>
            <Button className={classes.cancelBtn} onClick={cancelAddTab}>
              취소
            </Button>
        </Paper>
        <div 
          className={(!notFavoritedArr.length ? classes.hiddenDropZone: classes.hidden)}
          data-dropzone='first-cateogory-dropzone'          
          onDragOver={firstCategoryDragOver}
          onDrop={(e) => drop(e, draggedId, draggedName, overedTabOrder, overedTabFavorite)}
        />
        <List>
          {notFavoritedArr.map((data, index) => (
            <React.Fragment key={data.id}>
              <div className={classes.dragline} />
              <ListItem className={classes.listItem + (data.id === selectedCategoryId ? ' '+classes.selected : '' )}
                key={data.id} 
                data-type='category' 
                draggable='true'
                onClick={(e) => handleClickCategory(e, data.id, data.name)}
                onDragStart={(e) => dragStart(e, data.id, data.name, data.order)}
                onDragEnd={dragEnd}
                onDragOver={(e) => dragOver(e, data.id, (draggedOrder < data.order ? data.order-1 : data.order) , data.is_favorited)}
                onDragLeave={dragLeave}
                onDrop={(e) => drop(e, draggedId, draggedName, overedTabOrder, overedTabFavorite)}
              >
                <CategoryTab 
                key={data.id} 
                text={data.name} 
                id={data.id} 
                order={data.order}
                isFavorited={data.is_favorited}
                urlCount={data.url_count}
                selected={(data.id === selectedCategoryId)} 
                dragFinished={(data.id === draggedId ? dragFinished : false)} 
                historyDragFinished={(dragHistoryFinished && data.id === overedTabId ? true : false)}
                setSelectedCategoryTitle={setSelectedCategoryTitle}
                />
              </ListItem>
            </React.Fragment>
          ))}
          <div className={classes.dragline} />
          <div 
            className={(notFavoritedArr.length && draggedName ? classes.hiddenCategoryDropZone: classes.hidden)}
            data-dropzone='last-category-dropzone'
            onDragLeave={dragLeave}
            onDragOver={lastCategoryDragOver}
            onDrop={(e) => drop(e, draggedId, draggedName, overedTabOrder, overedTabFavorite)}
          >
          </div>
        </List>
      </div>

      <AlertModal 
        btnText = '삭제'
        modalText = '카테고리를 삭제하면 안에 저장된 모든 탭이 삭제 됩니다. 그래도 삭제 하시겠습니까?'
        openBool = {deleteModalOpen} 
        onClose = {closeDeleteModal}
        onClickOk = {deleteTab} 
      />
    </div>
  )

  const searchPopOverBtn = (
    <CategorySearchPopOver>
      <Grid  className={classes.popover}>
        <Grid className={classes.popoverDiv}>
          <img  className={classes.searchIcon}
            alt='search icon'
            src={SearchIcon}
            />
          <span className={classes.searchBtnText}>
            Search
          </span>
        </Grid>
        <Grid>
          <input className={classes.textfield}
            placeholder="검색어를 입력해 주세요."
            onKeyDown={handlePressEnterSearchValue}
          />
        </Grid>
        <Grid>
          <StyledToggleButtonGroup 
            size="small"
            value={toggleAlignment}
            exclusive
            onChange={handleToggleChange}
          >
            <ToggleButton className={classes.popoverBtn}
              value='left'
              variant='contained'
              size='small'
            >
              도메인
            </ToggleButton>
            <ToggleButton className={classes.popoverBtn}
              value='right'
              variant='contained'
              size='small'
            >
              단어
            </ToggleButton>
          </StyledToggleButtonGroup>
        </Grid>
      </Grid> 
    </CategorySearchPopOver>
  )
  
  // TODO Refactoring
  // Category Cards List Business Logic
  const [selectedCardList, setSelectedCardList] = useState([])
  const [deleteSuccessAlert, setDeleteSuccessAlert] = useState(false)
  const [isReset, setIsReset] = useState(false)

  useEffect(() => {
    if (isReset) {
      setSelectedCardList([])
    }
  }, [isReset])

  const handleClickExceptCard = useCallback(() => {
      setSelectedCardList([])
      setIsReset(true)
      return
  })

  const handleClickChangeToAddBtn = useCallback(() => {
      setAddOpen(true)
      setDeleteOpen(false) 
      setEnterOpen(false)
      return 
  })

  useEventListener('click', handleClickExceptCard)
  useEventListener('click', handleClickChangeToAddBtn)

  const handleSelectedCard = linkObj => e => {
    if (selectedCardList.indexOf(linkObj) !== -1) {
      selectedCardList.splice(selectedCardList.indexOf(linkObj), 1)
      setSelectedCardList([...selectedCardList])
      return
    }
    setSelectedCardList([...selectedCardList, linkObj])
  }

  const handleClickOpenSelectedCardList = () => {
    selectedCardList.forEach((card, idx) => {
      chrome.tabs.create({url: card.path})
    })
    setIsReset(true)
  }

  const handleClickDeleteSelectedCardList = () => {
    Promise.all(selectedCardList.map(card => deleteLink({ id: card.id }))).then(() => {
      setDeleteSuccessAlert(true)
      setIsReset(true)
      setSelectedCategoryId('')
    })
  }

  const handleDeleteSuccessAlertClose = e => {
    setDeleteSuccessAlert(false)
  }

  return (
    <div className={classes.root}>
      <nav className={classes.drawer}>
        <Drawer classes={{paper: classes.drawerPaper}}
          variant="permanent"
          open
        >
          {drawer}
        </Drawer>
      </nav>
      <div className={clsx(classes.coverBackground, {
          [classes.flex]: selectedLinkList.length !== 0
        })}
        onDrop={dropOnCardArea}
        onDragOver={dragOverOnCardArea}>
        <AddToPhotosIcon className={classes.addLinkIcon} />
      </div>
      <main className={classes.content}>
        <Grid container className={classes.toolbar}>
          <Grid item>
            <button className={classes.mainFont} onClick={handleClickCategoryTitle}>
              {selectedCategoryTitle}
            </button>
          </Grid>
          <Grid item>
            {searchPopOverBtn}
          </Grid>
          {
            (selectedCardList.length > 0) 
            ? <Grid>
                <Button onClick={handleClickOpenSelectedCardList}>
                  탭 열기
                </Button>
                <Button color="secondary" 
                  onClick={handleClickDeleteSelectedCardList}
                >
                  탭 삭제
                </Button>
              </Grid> 
            : null
          }
        </Grid>
        <Grid container>
          { 
            links.length ? links?.map((linkObj, idx) => 
              <Grid item key={idx} className={classes.gridCard}>
                <CategoryCard key={idx}
                  linkInfo={linkObj}
                  handleSelectedCard={handleSelectedCard(linkObj)}
                  isReset={isReset}
                  setIsReset={setIsReset}
                  writeAlarm={writeAlarm}
                />
              </Grid>) 
            : categories.length === 0 ? 
              <img className={classes.imgCenter} 
                src={CategoryEmptyIcon} 
                alt='category list empty'
              />
            :  searchValue ? 
              <img className={classes.imgCenter}
                src={linkListSearchEmptyIcon} 
                alt='link list search empty'
              />
          : <img className={classes.imgCenter}
              src={linkListEmptyIcon} 
              alt='link list empty'
            />
          }
        </Grid>
        <Snackbar open={deleteSuccessAlert}
          alertText="선택하신 카드가 삭제되었습니다."
          handleClose={handleDeleteSuccessAlertClose}
        />
      </main>
      <CategoryAppBar {...props} />
    </div>
  )
}