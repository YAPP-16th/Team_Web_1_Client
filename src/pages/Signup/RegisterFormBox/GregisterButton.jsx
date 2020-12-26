/* global chrome */
import React from 'react';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';

import Button from '@material-ui/core/Button';

import LogoGoogle from '@images/logo-google.png';

import { setAccessToken } from '@commons/http/auth';
import { userGregisterThunk } from '@modules/user';

let retry = true;
function GregisterButton() {
  const dispatch = useDispatch();

  const handleGoogleSignup = async (e) => {
    e.preventDefault();
    chrome.identity.getAuthToken({ interactive: true }, async (token) => {
      try {
        const res = await dispatch(userGregisterThunk({ token }));
        setAccessToken(res.token);
        window.location.href = '/index.html';
      } catch (error) {
        const status = error.response && error.response.status;
        if (status >= 400 && retry) {
          retry = false;
          chrome.identity.removeCachedAuthToken({ token }, handleGoogleSignup);
        } else toast.error(error?.response?.data?.message || '네트워크 오류!!');
      }
    });
  };

  return (
    <Button
      className="btn-GoogleLogin"
      onClick={handleGoogleSignup}
      startIcon={<img className="logo-google" alt="URLink" src={LogoGoogle} />}
    >
      구글 이메일로 회원가입
    </Button>
  );
}

export default GregisterButton;