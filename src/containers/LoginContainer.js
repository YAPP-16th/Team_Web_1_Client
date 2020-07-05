/* global chrome */
import React, {useState} from 'react'
import auth from '../commons/apis/auth'
import userAPI from '../commons/apis/user'
import {AlertModal} from '../components/modal'
import LoginPage from '../pages/LoginPage'

export default function LoginContainer() {
  let retry = true
  const [modalText, setModalText] = useState('')

  const onClickLogin = e => {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    const email = data.get("email")
    const password = data.get("password")
    const nLogin = userAPI.nLogin({ email, password })
    nLogin.then((res) => {
      auth.setAccessToken(res.data.token)
      window.location.href = "/index.html"
    })
    .catch((error) => {
      setModalText(error.response.data.message)
    })
  }

  const onClickGoogleLogin = e => {
    chrome.identity.getAuthToken({interactive: true}, token => {
      const gLogin = userAPI.gLogin({token})
      if(gLogin) {
        gLogin.then(res => {
          auth.setAccessToken(res.data.token)
          window.location.href = "/index.html"
        })
        .catch(error => {
	        const status = error.response && (error.response.status || "")
          if (status >= 400 && retry) {
            retry = false
            chrome.identity.removeCachedAuthToken({token}, onClickGoogleLogin)
          }
          else setModalText(error.response.data.message)
        })
      }

    })
  }

  const onModalClose = e => {
    e.preventDefault()
    setModalText('')
  }

  const props = {
    onClickGoogleLogin,
    onClickLogin
  }

  return (
    <>
      <LoginPage {...props} />
      <AlertModal
        modalText={modalText}
        btnCreate="false" 
        openBool={modalText ? true: false} 
        onClose={onModalClose}
      />
    </>
  )
}