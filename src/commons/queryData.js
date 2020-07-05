const queryData = {

  // ****************** USER ****************************** //
  /**
   * * 일반 회원가입 POST
   * * /user/sign-up/
   * * Authorization: JWT 불필요
   */
  nRegister: {
    "sign_up_type": "", // * (normal default [server])
    "email": "",
    "username": "",
    "password": ""
  },
  
  /**
   * * 일반 로그인 POST
   * * /user/sign-in/
   * * Authorization: JWT 불필요
   */
  nLogin: {
    "email": "",
    "password": ""
  },
  
  /**
   * * 구글 로그인 POST
   * * /user/google/sign-in/
   * * Authorization: JWT 불필요
   * * email, password 불필요
   */
  gLogin: {
    "token": ""
  },
  
  /**
   * * 구글 회원가입 POST
   * * /user/google/sign-up/
   * * Authorization: JWT 불필요
   * * email, password 불필요
   */
  gRegister: {
    "token": ""
  },
  
  /**
   * * 로그아웃 POST
   * * /user/sign-out/
   * * JWT 불필요
   * * email, password 불필요
   */
  logout: {},
  
  /**
   * * 회원정보 조회 GET
   * * user/{userId}/ (option)
   * * JWT 필요
   */
  userRead: {},

  /**
   * * 회원정보 부분 수정 PATCH
   * * user/{userId}/ (option)
   * * JWT 필요
   */
  userUpdate: {
    // "sign_up_type": "",
    // "email": "",
    "username": "",
    "password": ""
  },
  
  /**
   * * 회원정보 삭제 DELETE
   * * user/{userId}/ (option)
   * * JWT 필요
   */
  userDelete: {},
  // ****************** USER - END ************************ //
  

  // ****************** TOEKN ****************************** //
  /**
   * * JWT 발급 POST
   * * /user/token/
   * * JWT 불필요
   */
  // !! deprecated
  getToken: {
    "email": "",
    "password": ""
  },
  
  /**
   * * JWT 갱신 POST
   * * /user/token/refresh/
   * * JWT 불필요
   */
  updateToken: {
    "refresh": ""
  },
  
  /**
   * * JWT 검사 POST
   * * /user/token/verify/
   * * JWT 불필요
   */
  checkToken: {
    "token": ""
  },
  // ****************** TOEKN - END ************************ //
  

  // ****************** CATEGORY *************************** //
  /**
 * * 카테고리 리스트 조회 GET
 * * category/ -> list
 * * category/{categoryId}/
 * * JWT 필요
 */
  categoryRead: {},
  
  /**
 * * 카테고리 등록 POST
 * * category/
 * * JWT 필요
 */
  categoryWrite: {
    "name": "",
    "is_favorited": ""
  },
  
  /**
 * * 카테고리 수정 PATCH
 * * category/{categoryId}/
 * * JWT 필요
 */
  categoryUpdate: {
    "name": "",
    "is_favorited": "",
    "order": ""
  },
  
  /**
 * * 카테고리 삭제 DLETE
 * * category/{id}/
 * * JWT 필요
 */
  categoryDelete: {},
  // ****************** CATEGORY - END ********************** //
  

  // ****************** LINK ******************************* //
  /**
   * * Link 리스트 조회 GET
   * * url/?category={categoryId}&path={path}&title={title}
   * * JWT 필요
   */
  linkRead: {},
  
  /**
   * * URL 등록 POST
   * * url/?category={categoryId}
   * * JWT 필요
   */
  linkWrite: {
    "path": []
  },

  /**
   * * URL 등록 PATCH
   * * /url/{urlId}/
   * * JWT 필요
   */
  linkUpdate: {
    "title": "",
    "description": "",
    "is_favorited": ""
  },

  /**
   * * URL 삭제 DELETE
   * * url/{urlId}/
   * * JWT 필요
   */
  linkDelete: {},
  // ****************** LINK - END ************************* //
  
  
  // ****************** ALRAM ***************************** //
  /**
   * * alarm 리스트 모두 조회 GET
   * * alarm/
   * * JWT 필요
   */
  alarmRead: {},
  
  /**
   * * alarm 등록 POST
   * * alarm/?category={categoryId}&url={urlId} (all Required)
   * * JWT 필요
   */
  alarmWrite: {
    "name": "",
    "reserved_time": {
      "year": "",
      "month": "",
      "day": "",
      "hour": "",
      "minute": ""
    }
  },

  /**
   * * alarm 등록 DELETE
   * * alarm/{alarmId}/ (Required)
   * * JWT 필요
   */
  alarmDelete: {},
  // ****************** ALRAM - END ************************ //

  // ****************** ALRAM - SOCKET ************************ //
  /**
   * * alarm Read
   * * 알람 봤다고 요청
   */
  alarmReadMessage: {
    "alarm_id": "",
    "action": "" // * read
  },

  /**
   * * alarm No message return
   * * 알람에 노출하지 않기로 요청
   */
  alarmNoReturnMessage: {
    "alarm_id": "",
    "action": "" // * done
  }
  
  // ****************** ALRAM - - SOCKET - END *****************//
}

export default queryData