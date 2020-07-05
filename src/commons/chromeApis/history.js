/* global chrome */
/**
 * * Get Chrome History information -> callback Pattern
 * @param {String} text String
 * @param {Date} startTime Date
 * @param {Date} endTime Date
 * @param {Number} maxResults Number
 * @param {Function} callback Function
 * @returns {Object} search
 *  * first : (true|false) 해당 날짜의 첫번째 게시글
 *  * id: "11081" (history Id)
 *  * favicon: "https://www.google.com/s2/favicons?domain=${url}"
 *  * lastVisitTime: 1588933029447.23
 *  * title: "React App"
 *  * typedCount: 0 (사용자가 주소(typing in the address)를 입력하여 이 페이지를 탐색 한 횟수)
 *  * url: "chrome-extension://fljjldbbgojlhkhamhcgamibbjlincej/index.html?index=1"
 *  * hostName: "chrome-extension://fljjldbbgojlhkhamhcgamibbjlincej/index.html"
 *  * visitCount: 24 (사용자가이 페이지를 탐색(navigated to this page) 한 횟수)
 */
const historyAPI = {
  get: ({ text, startTime, endTime, maxResults, callback }) => {
    startTime = startTime ? startTime : 0
    endTime = endTime ? endTime : Date.now()
    if(!chrome.history) {
      if (callback && typeof (callback) === "function") callback(urlTempList)
      else return;
    }
    else {
      chrome.history.search(
        { text, startTime, endTime, maxResults },
        (historyItemList) => {
          historyItemList = historyItemList.filter(historyItem => (startTime <= historyItem.lastVisitTime && historyItem.lastVisitTime <= endTime))
          historyItemList.sort((preHistory, curHistory) => (curHistory.lastVisitTime - preHistory.lastVisitTime))
          let prevDate = ""
          historyItemList.map(function (historyItem) {
            const url = document.createElement('a')
            let curDate = new Date(historyItem.lastVisitTime).toLocaleDateString()
            url.href = historyItem.url
            historyItem.hostName = url.hostname
            historyItem.favicon = `https://www.google.com/s2/favicons?domain=${url.hostname}`
            if (curDate !== prevDate) {
              historyItem.first = true
              prevDate = curDate
            }
            else historyItem.first = false
            return historyItem
          })
          if (callback && typeof (callback) === "function") callback(historyItemList)
          else console.log(historyItemList)
        }
      )
    }
  }
}

const urlTempList = [
  {
    "id": "1",
    "lastVisitTime": 1588933029447.23,
    "title": "React App",
    "typedCount": 0,
    "url": "https://www.naver.com",
    "visitCount": 24,
  },
  {
    "id": "2",
    "lastVisitTime": 1588933029447.23,
    "title": "React App",
    "typedCount": 0,
    "url": "https://www.naver.com",
    "visitCount": 24,
  },
  {
    "id": "3",
    "lastVisitTime": 1588933029447.23,
    "title": "React App",
    "typedCount": 0,
    "url": "https://www.naver.com",
    "visitCount": 24,
  },
  {
    "id": "4",
    "lastVisitTime": 1588933029447.23,
    "title": "React App",
    "typedCount": 0,
    "url": "https://www.naver.com",
    "visitCount": 24,
  },
  {
    "id": "5",
    "lastVisitTime": 1588933029447.23,
    "title": "React App",
    "typedCount": 0,
    "url": "https://www.naver.com",
    "visitCount": 24,
  }
]

export default historyAPI