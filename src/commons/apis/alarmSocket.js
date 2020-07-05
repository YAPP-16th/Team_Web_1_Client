import auth from './auth'
import { api } from '../http'
import queryData from '../queryData'
import { getQueryParams } from '../quryParam'

let retry = 1
let ws = null

const alarmSocket = {
  onConnection(settingWs) {
    settingWs = settingWs || {}
    const queryParams = getQueryParams({token: auth.getAccessToken()})
    ws = new WebSocket(api.SOCKET_ALARM+queryParams)
    const { onmessage, onerror, onclose } = settingWs
    ws.onmessage = onmessage
    ws.onerror = onerror
    ws.onclose = onclose
  },
  onmessage(callback) {
    if (!ws) this.onConnection()
    try{
      if(callback && typeof callback === "function") ws.onmessage = callback
      else {
        ws.onmessage = function(e) {
          const { data } = JSON.parse(e.data)
          console.log(data)
        }
      }
      return ws
    } catch(error) {
      return {error}
    }
  },
  onclose(callback) {
    if(callback && typeof callback === "function") ws.onclose = callback
    else {
      ws.onclose = (_e) => {
        if(retry <= 10) {
          setTimeout(() => {
            const prevWs = this.getWs()
            this.onConnection(prevWs)
            retry++
          },2000)
        }
      }
    }
    return ws
  },
  getWs() {
    return ws
  },
  alarmRead(socketAlarmInfo) {
    try {
      const { alarm_id } = socketAlarmInfo
      if(!alarm_id) throw new Error("id값은 필수 입니다.")
      const alarmReadMessageKeys = Object.keys(queryData["alarmReadMessage"])
      const alarmReadMessage = {}
      Object.entries(socketAlarmInfo).forEach(([key, value]) => {
        if (alarmReadMessageKeys.includes(key)) alarmReadMessage[key] = value
      })
      ws.send(JSON.stringify(alarmReadMessage))
    }
    catch(error) {
      return {error}
    }
  },
  alarmNoReturn(socketAlarmInfo) {
    try {
      const { alarm_id } = socketAlarmInfo
      if(!alarm_id) throw new Error("id값은 필수 입니다.")
      const alarmNoReturnMessageKeys = Object.keys(queryData["alarmNoReturnMessage"])
      const alarmNoReturnMessage = {}
      Object.entries(socketAlarmInfo).forEach(([key, value]) => {
        if (alarmNoReturnMessageKeys.includes(key)) alarmNoReturnMessage[key] = value
      })
      ws.send(JSON.stringify(alarmNoReturnMessage))
    }
    catch(error) {
      return {error}
    }
  }
}

export default alarmSocket