function setCookies() {
    console.log("setCookies")
    // Get the values from localStorage
    var userId = localStorage.getItem('realm-web:app(allwomenstalk-ebogu):userIds');
    userId = JSON.parse(userId)[0];
    var deviceId = localStorage.getItem('realm-web:app(allwomenstalk-ebogu):deviceId');
    var accessToken = localStorage.getItem('realm-web:app(allwomenstalk-ebogu):user(' + userId + '):accessToken');
    var profile = localStorage.getItem('realm-web:app(allwomenstalk-ebogu):user(' + userId + '):profile');
    var providerType = localStorage.getItem('realm-web:app(allwomenstalk-ebogu):user(' + userId + '):providerType');
    var refreshToken = localStorage.getItem('realm-web:app(allwomenstalk-ebogu):user(' + userId + '):refreshToken');

    // Set the cookies for all subdomains of allwomenstalk.com
    var cookieOptions = { domain: '.allwomenstalk.com' };
    document.cookie = 'realm:userId=' + userId + '; ' + cookieOptions;
    document.cookie = 'realm:deviceId=' + deviceId + '; ' + cookieOptions;
    document.cookie = 'realm:accessToken=' + accessToken + '; ' + cookieOptions;
    document.cookie = 'realm:profile=' + profile + '; ' + cookieOptions;
    document.cookie = 'realm:providerType=' + providerType + '; ' + cookieOptions;
    document.cookie = 'realm:refreshToken=' + refreshToken + '; ' + cookieOptions;
}

function getCookies () {
    // Get the values from the cookies
    var userId = getCookie('realm:userId');
    var deviceId = getCookie('realm:deviceId');
    var accessToken = getCookie('realm:accessToken');
    var profile = getCookie('realm:profile');
    var providerType = getCookie('realm:providerType');
    var refreshToken = getCookie('realm:refreshToken');

    // Set the values in localStorage
    if (userId !== undefined) {
        var userIds = JSON.stringify([userId]);
        localStorage.setItem('realm-web:app(allwomenstalk-ebogu):userIds', userIds);
    } else {
        return false;
    }
    if (deviceId !== undefined) {
        localStorage.setItem('realm-web:app(allwomenstalk-ebogu):deviceId', deviceId);
      }
      if (accessToken !== undefined) {
        localStorage.setItem('realm-web:app(allwomenstalk-ebogu):user(' + userId + '):accessToken', accessToken);
      }
      if (profile !== undefined) {
        localStorage.setItem('realm-web:app(allwomenstalk-ebogu):user(' + userId + '):profile', profile);
      }
      if (providerType !== undefined) {
        localStorage.setItem('realm-web:app(allwomenstalk-ebogu):user(' + userId + '):providerType', providerType);
      }
      if (refreshToken !== undefined) {
        localStorage.setItem('realm-web:app(allwomenstalk-ebogu):user(' + userId + '):refreshToken', refreshToken);
      }
      
    // Function to get a cookie by name
    function getCookie(name) {
        var value = "; " + document.cookie;
        var parts = value.split("; " + name + "=");
        if (parts.length == 2) return parts.pop().split(";").shift();
    }

}

function deleteRealmCookies() {
    // Set the cookies to expire in the past
    var cookieOptions = { domain: '.allwomenstalk.com', expires: new Date(0) };
    document.cookie = 'realm:userId=; ' + cookieOptions;
    document.cookie = 'realm:deviceId=; ' + cookieOptions;
    document.cookie = 'realm:accessToken=; ' + cookieOptions;
    document.cookie = 'realm:profile=; ' + cookieOptions;
    document.cookie = 'realm:providerType=; ' + cookieOptions;
    document.cookie = 'realm:refreshToken=; ' + cookieOptions;
  }
  