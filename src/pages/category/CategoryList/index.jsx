/* global chrome */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';

import Drawer from '@material-ui/core/Drawer';
import List from '@material-ui/core/List';
import CategoryHeader from './CategoryHeader';
import CategoryListItem from './CategoryListItem';
import CategoryButtonGroup from './CategoryButtonGroup';

import { useStyles } from './style';
import { useToast } from '@modules/ui';
import useDialog from '@modules/ui/hooks/useDialog';
import { DROP_ZONE, DRAG, useDrag, useDropZone } from '@modules/ui';

import {
  useCategories,
  categorySelect,
  selectSelectedCategory,
  categoriesReadThunk,
  categoryCreateThunk,
  categoryModifyThunk,
} from '@modules/category';

const { CATEGORY } = DRAG;

export default function CategoryList(props) {
  const classes = useStyles();
  const dispatch = useDispatch();
  const { pending, error, categories, reload } = useCategories();
  const { setDragData, clearDragData, listData } = useDrag(CATEGORY);
  const { openToast } = useToast();

  const selectedCategory = useSelector(selectSelectedCategory);
  const favoritedArr = categories?.filter((data) => data.is_favorited === true);
  const notFavoritedArr = categories?.filter((data) => data.is_favorited === false);

  const {
    selectedLinkList,
    setSelectedLinkList,
    draggedHistoryList,
    setDraggedHistoryList,
    isEditCategoryTitle,
    editCategoryTitle,
  } = props;

  let getCategory, writeCategory, updateCategory, deleteCategory;
  let getLink, writeLink, deleteLink;

  const [draggedCategoryData, setDraggedCategoryData] = useState({
    draggedCategory: '',
    draggedId: 0,
    draggedName: '',
    draggedOrder: 0,
    dragFinished: false,
  });

  const {
    draggedCategory,
    draggedId,
    draggedName,
    draggedOrder,
    dragFinished,
  } = draggedCategoryData;
  const [overedTabOrder, setOveredTabOrder] = useState(0);
  const [overedTabFavorite, setOveredTabFavorite] = useState(null);
  const [overedTabId, setOveredTabId] = useState(0);

  const [dragHistoryFinished, setDragHistoryFinished] = useState(false);

  const timeId = useRef();

  useEffect(() => {
    if (dragHistoryFinished) {
      // if (overedTabId === selectedCategory?.id) getLink({ category: selectedCategory?.id });
      (async function () {
        try {
          await dispatch(categoriesReadThunk());
          timeId.current = setTimeout(() => {
            setDragHistoryFinished(false);
          }, 1000);
        } catch (error) {
          const errorMsg = error.hasOwnProperty('response')
            ? error.response.data.message
            : error.message;
          openToast({ type: 'error', message: errorMsg });
        }
      })();
      getCategory({}).then(() => {});
    }

    return () => clearTimeout(timeId.current);
  }, [dragHistoryFinished]);

  const firstFavoriteDragOver = (e) => {
    e.stopPropagation();
    e.preventDefault();
    setOveredTabOrder(draggedOrder);
    setOveredTabFavorite(true);
  };

  const firstCategoryDragOver = (e) => {
    e.stopPropagation();
    e.preventDefault();
    setOveredTabOrder(draggedOrder);
    setOveredTabFavorite(false);
  };

  const dragStart = (e, id, name, order) => {
    e.stopPropagation();
    const target = e.currentTarget;
    if (!target) return;
    target.style.opacity = 0.3;
    e.dataTransfer.dropEffect = 'move';
    setDragData({
      draggedCategory: target,
      draggedId: id,
      draggedName: name,
      draggedOrder: order,
    });
    // setDraggedCategoryData({
    //   ...draggedCategoryData,
    //   draggedCategory: target,
    //   draggedId: id,
    //   draggedName: name,
    //   draggedOrder: order,
    // });

    e.dataTransfer.setData('text/html', target);
    e.dataTransfer.setData('text/type', 'category');
    e.dataTransfer.effectAllowed = 'move';
  };

  const dragEnd = async (e, id, name, order, favorited) => {
    try {
      e.preventDefault();
      e.stopPropagation();
      if (draggedCategory && e.dataTransfer.dropEffect === 'move') {
        await dispatch(categoryModifyThunk({ id, name, order, is_favorited: favorited }));
        await dispatch(categoriesReadThunk());
        setDragData({
          ...listData,
          dragFinished: true,
        });
        // setDraggedCategoryData({
        //   ...draggedCategoryData,
        //   dragFinished: true,
        // });
        draggedCategory.style.opacity = 1;

        setTimeout(() => {
          clearDragData();

          // setDraggedCategoryData({
          //   ...draggedCategoryData,
          //   draggedCategory: '',
          //   draggedId: 0,
          //   draggedName: '',
          //   draggedOrder: 0,
          //   dragFinished: false,
          // });
          setOveredTabOrder(0);
          setOveredTabFavorite(null);
        }, 1000);
      } else if (draggedCategory) {
        draggedCategory.style.opacity = 1;
      }
    } catch (error) {
      const errorMsg = error.hasOwnProperty('response')
        ? error.response.data.message
        : error.message;
      openToast({ type: 'error', message: errorMsg });
    }
  };

  const dragOver = (e, id, order, favorited) => {
    e.preventDefault();
    e.stopPropagation();
    if (
      draggedHistoryList?.length !== 0 &&
      draggedHistoryList?.[0]?.dataset?.type === 'link' &&
      !draggedCategory
    ) {
      setOveredTabId(id);
      e.dataTransfer.dropEffect = 'move';
    } else if (draggedCategory?.dataset?.type === 'category' && draggedCategory) {
      setOveredTabOrder(order);
      setOveredTabFavorite(favorited);

      e.currentTarget.previousSibling.style.opacity = 1;
      e.dataTransfer.dropEffect = 'move';
    }
  };

  const dragLeave = (e) => {
    e.currentTarget.previousSibling.style.opacity = 0;
  };

  const drop = (e) => {
    e.stopPropagation();
    const type = e.dataTransfer.getData('text/type');
    const filteredLinkList = [];
    selectedLinkList.forEach((link) => filteredLinkList.push(link.path));

    if (type === 'category') {
      e.preventDefault();
      if (e.currentTarget.dataset.dropzone) {
        const dropzone = e.currentTarget.dataset.dropzone;
        if (dropzone === 'first-favorite-dropzone' || dropzone === 'first-category-dropzone') {
          e.currentTarget.previousSibling.style.opacity = 1;
        }
      } else {
        e.currentTarget.previousSibling.style.opacity = 0;
      }
    } else if (type === 'link') {
      e.preventDefault();
      writeLink({ category: overedTabId, path: filteredLinkList }).then(() =>
        setDragHistoryFinished(true)
      );
      setSelectedLinkList([]);
      setDraggedHistoryList([]);
    }
  };

  return (
    <div>
      <nav className={classes.drawer}>
        <Drawer classes={{ paper: classes.drawerPaper }} variant="permanent" open>
          <div>
            <div className={classes.layout}>
              <CategoryHeader type="favorite" />
              {favoritedArr?.length !== 0 ? null : (
                <FirstFavoriteDropZone
                  className={classes.firstFavoriteDropZone}
                  data-dropzone="first-favorite-dropzone"
                  onDragOver={firstFavoriteDragOver}
                  onDrop={(e) => drop(e, draggedId, draggedName, overedTabOrder, overedTabFavorite)}
                >
                  Drag the category here!
                </FirstFavoriteDropZone>
              )}
              <List>
                {favoritedArr?.map((data) => (
                  <CategoryListItemWrapper
                    className={
                      classes.listItem +
                      (data.id === selectedCategory?.id ? ' ' + classes.selected : '')
                    }
                    key={data.id}
                    data-type="category"
                    draggable="true"
                    onDragStart={(e) => dragStart(e, data.id, data.name, data.order)}
                    onDragEnd={(e) =>
                      dragEnd(e, draggedId, draggedName, overedTabOrder, overedTabFavorite)
                    }
                    onDragOver={(e) =>
                      dragOver(
                        e,
                        data.id,
                        draggedOrder < data.order ? data.order - 1 : data.order,
                        data.is_favorited
                      )
                    }
                    onDragLeave={dragLeave}
                    onDrop={drop}
                  >
                    <CategoryListItem
                      categoryData={data}
                      selected={data.id === selectedCategory?.id}
                      isEditTitle={isEditCategoryTitle}
                      dragFinished={data.id === draggedId ? dragFinished : false}
                      historyDragFinished={
                        dragHistoryFinished && data.id === overedTabId ? true : null
                      }
                      selectedCategoryTitle={
                        isEditCategoryTitle ? editCategoryTitle : selectedCategory?.name
                      }
                    />
                  </CategoryListItemWrapper>
                ))}
              </List>
              <CategoryHeader type="category" />
              <CategoryButtonGroup />
              <NotFavoriteDropZone
                className={
                  !notFavoritedArr?.length ? classes.hiddenCategoryDropZone : classes.hidden
                }
                data-dropzone="first-cateogory-dropzone"
                onDragOver={firstCategoryDragOver}
                onDrop={(e) => drop(e, draggedId, draggedName, overedTabOrder, overedTabFavorite)}
              />
              <List>
                {notFavoritedArr?.map((data) => (
                  <CategoryListItemWrapper
                    className={
                      classes.listItem +
                      (data.id === selectedCategory?.id ? ' ' + classes.selected : '')
                    }
                    key={data.id}
                    data-type="category"
                    draggable="true"
                    onDragStart={(e) => dragStart(e, data.id, data.name, data.order)}
                    onDragEnd={(e) =>
                      dragEnd(e, draggedId, draggedName, overedTabOrder, overedTabFavorite)
                    }
                    onDragOver={(e) =>
                      dragOver(
                        e,
                        data.id,
                        draggedOrder < data.order ? data.order - 1 : data.order,
                        data.is_favorited
                      )
                    }
                    onDragLeave={dragLeave}
                    onDrop={drop}
                  >
                    <CategoryListItem
                      categoryData={data}
                      selected={data.id === selectedCategory?.id}
                      isEditTitle={isEditCategoryTitle}
                      dragFinished={data.id === draggedId ? dragFinished : false}
                      historyDragFinished={
                        dragHistoryFinished && data.id === overedTabId ? true : null
                      }
                      selectedCategoryTitle={
                        isEditCategoryTitle ? editCategoryTitle : selectedCategory?.name
                      }
                    />
                  </CategoryListItemWrapper>
                ))}
              </List>
            </div>
          </div>
        </Drawer>
      </nav>
    </div>
  );
}

const FirstFavoriteDropZone = styled.div``;
const NotFavoriteDropZone = styled.div``;
const CategoryListItemWrapper = styled.div``;
