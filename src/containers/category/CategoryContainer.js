import React, { useState, useEffect, createContext, useContext } from 'react'
import categoryAPI from '../../commons/apis/category'
import linkAPI from '../../commons/apis/link'
import historyAPI from '../../commons/chromeApis/history'
import alarmSocket from '../../commons/apis/alarmSocket'
import alarmAPI from '../../commons/apis/alarm'
import userAPI from '../../commons/apis/user'
import Snackbar from '../../components/Snackbar'
import CategoryDrawer from '../../components/category/CategoryDrawer'

// * Category context API
const CategoryStateContext = createContext(null)
const CategoryDispatchContext = createContext(null)

// * History context API
const LinkStateContext = createContext(null)
const LinkDispatchContext = createContext(null)

// * custom HOOK : 자식 컴포넌트에서 부모에게 state 변경 요청할 수 있도록 하기
export function useCategoryState() {
  return useContext(CategoryStateContext)
}
export function useCategoryDispatch() {
  return useContext(CategoryDispatchContext)
}
export function useLinkState() {
  return useContext(LinkStateContext)
}
export function useLinkDispatch() {
  return useContext(LinkDispatchContext)
}

export default function CategoryContainer() {

  const [categoryState, setCategory] = useState([])
  const [linkState, setLink] = useState([])
  const [alarmList, setAlarmList] = useState([])

  // * 드래그된 히스토리 target
  const [draggedHistoryList, setDraggedHistoryList] = useState([])
  const [selectedLinkList, setSelectedLinkList] = useState([])

  const [alertText, setAlertText] = useState('')
  const [alertType, setAlerType] = useState('')

  // * Snackbar Alert Close
  const alertClose = () => {
    setAlertText('')
  }

  // * 전체 카테고리 가져오기 => setCategory
  const getCategory = async (categoryInfo) => {
    try {
      const response = await categoryAPI.get(categoryInfo)
      if(response.hasOwnProperty("error")) throw response.error
      setCategory(response.data)
      return response
    } catch (error) {
      const errorMsg = error.hasOwnProperty("response") ? error.response.data.message : error.message 
      console.warn(errorMsg)
    }
  }

  // * 카테고리 작성
  const writeCategory = async (categoryInfo) => {
    try {
      const response = await categoryAPI.write(categoryInfo)
      if(response.hasOwnProperty("error")) throw response.error
      return response
    }
    catch (error) {
      const errorMsg = error.hasOwnProperty("response") ? error.response.data.message : error.message 
      console.warn(errorMsg)
    }
  }

  // * 카테고리 수정
  const updateCategory = async (categoryInfo) => {
    try {
      const response = await categoryAPI.update(categoryInfo)
      if (response.hasOwnProperty("error")) throw response.error
      return response
    }
    catch (error) {
      const errorMsg = error.hasOwnProperty("response") ? error.response.data.message : error.message
      console.warn(errorMsg)
    }
  }

  // * 카테고리 삭제 => setAlerType, setAlertText
  const deleteCategory = async (categoryInfo) => {
    try {
      const response = await categoryAPI.remove(categoryInfo)
      if (response.hasOwnProperty("error")) throw response.error
      setAlerType("info")
      setAlertText('선택하신 카테고리가 삭제되었습니다.')
      return response
    }
    catch (error) {
      const errorMsg = error.hasOwnProperty("response") ? error.response.data.message : error.message
      setAlerType("error")
      setAlertText(errorMsg)
    }
  }

  // * 전체 링크 리스트 가져오기 => setLink
  const getLink = async (linkInfo) => {
    try {
      const response = await linkAPI.get(linkInfo)
      if (response.hasOwnProperty("error")) throw response.error
      setLink([...response.data])
      return response
    } catch (error) {
      const errorMsg = error.hasOwnProperty("response") ? error.response.data.message : error.message
      console.warn(errorMsg)
    }
  }

  // * 링크 작성 => getLink, getCategory
  const writeLink = async (linkInfo) => {
    try {
      // const { category } = linkInfo
      const response = await linkAPI.write(linkInfo)
      if (response.hasOwnProperty("error")) throw response.error
      // await getLink({category})
      // await getCategory({})
      return response
    } catch (error) {
      const errorMsg = error.hasOwnProperty("response") ? error.response.data.message : error.message
      setAlerType("error")
      setAlertText(errorMsg)
    }
  }

  // * 링크 정보, 페보릿 수정 => getLink
  const updateLink = async (linkInfo) => {
    try {
      const { category } = linkInfo
      const response = await linkAPI.update(linkInfo)
      if (response.hasOwnProperty("error")) throw response.error
      await getLink({category})
      return response
    } catch (error) {
      const errorMsg = error.hasOwnProperty("response") ? error.response.data.message : error.message
      setAlerType("error")
      setAlertText(errorMsg)
    }
  }

  // * 링크 삭제
  const deleteLink = async (linkInfo) => {
    try {
      const response = await linkAPI.remove(linkInfo)
      if (response.hasOwnProperty("error")) throw response.error
      return response
    } catch (error) {
      const errorMsg = error.hasOwnProperty("response") ? error.response.data.message : error.message
      console.warn(errorMsg)
    }
  }
  
  // * 검색기록 조회
  const getHistory = (historyInfo) => {
    historyAPI.get(historyInfo)
  }

  // * 알람 읽음 SOCKET
  const onAlarmRead = (socketAlarmInfo) => {
    try {
      const response = alarmSocket.alarmRead(socketAlarmInfo)
      if(response.hasOwnProperty("error")) throw response.error
    } catch (error) {
      const errorMsg = error.hasOwnProperty("response") ? error.response.data.message : error.message
      console.warn(errorMsg)
    }
  }
  
  // * 알람 받지 않기 SOCKET
  const onNoReturnAlarm = (socketAlarmInfo) => {
    try {
      const response = alarmSocket.alarmNoReturn(socketAlarmInfo)
      if(response.hasOwnProperty("error")) throw response.error
    } catch (error) {
      const errorMsg = error.hasOwnProperty("response") ? error.response.data.message : error.message
      console.warn(errorMsg)
    }
  }
  
  // * 알람 등록 하기 => getLink
  const writeAlarm = async (alarmInfo) => {
    try {
      const { category } = alarmInfo
      const response = await alarmAPI.write(alarmInfo)
      if(response.hasOwnProperty("error")) throw response.error
      setAlerType("info")
      setAlertText('알람이 설정되었습니다.')
      await getLink({category})
      return response
    }
    catch (error) {
      const errorMsg = error.hasOwnProperty("response") ? error.response.data.message : error.message 
      setAlerType("error")
      setAlertText(errorMsg)
    }
  }

  // * 유저 정보
  const getUser = async (userInfo) => {
    try {
      const response = await userAPI.get(userInfo)
      if(response.hasOwnProperty("error")) throw response.error
      return response
    }
    catch (error) {
      const errorMsg = error.hasOwnProperty("response") ? error.response.data.message : error.message 
      console.warn(errorMsg)
    }
  }

  const categoryDispatch = {
    getCategory,
    writeCategory,
    updateCategory,
    deleteCategory
  }

  const linkDispatch = {
    getLink,
    writeLink,
    deleteLink,
    updateLink
  }

  const props = {
    draggedHistoryList,
    selectedLinkList,
    alarmList,

    setSelectedLinkList,
    setDraggedHistoryList,

    getHistory, // * CHROME HISTORY

    onAlarmRead, // * ALRAM SOCKET
    writeAlarm, // * ALRAM SOCKET
    onNoReturnAlarm, // * ALRAM SOCKET

    getUser // * USER API
  }

  useEffect(() => {
    // * SOCKET CONNECTION => setAlarmList
    alarmSocket.onmessage(function(e) {
      const { message, status } = JSON.parse(e.data)
      if(status === "alarm" || status === "initial"){
        setAlarmList(alarmList => alarmList.concat(message))
      }
      else if(status === "update") {
        setAlarmList(message)
      }
    })
    alarmSocket.onclose()
  },[])

  return (
    <CategoryStateContext.Provider value={categoryState}>
      <CategoryDispatchContext.Provider value={categoryDispatch}>
        <LinkStateContext.Provider value={[linkState, setLink]}>
          <LinkDispatchContext.Provider value={linkDispatch}>
            <CategoryDrawer {...props}/>
            <Snackbar open={alertText ? true : false}
              type={alertType}
              alertText={alertText}
              handleClose={alertClose}
            />
          </LinkDispatchContext.Provider>
        </LinkStateContext.Provider>
      </CategoryDispatchContext.Provider>
    </CategoryStateContext.Provider>
  )
}