const app = getApp()

Page({
  data: {

  },

  onLoad:function(params){
    var that = this;
    var redirectUrl = '';
    if (params.redirectUrl != null && params.redirectUrl != undefined && params.redirectUrl != ''){
      redirectUrl = params.redirectUrl;
      redirectUrl = redirectUrl.replace(/#/g, "?");
      redirectUrl = redirectUrl.replace(/@/g, "=");
    }
    


    that.redirectUrl = redirectUrl;
  },

  login: function (e) {
    var that = this;
    var formObject = e.detail.value;
    var username = e.detail.value.username;
    var password = e.detail.value.password;
    if (username.length == 0 || password.length == 0) {
      wx.showToast({
        title: '用户名或密码不能为空',
        icon: 'none',
        duration: 3000
      })
    } else {
      wx.showLoading({
        title: '请等待...',
      })
      wx.request({
        url: app.serverUrl+'/login',
        method: 'post',
        data: {
          "password": password,
          "username": username
        },
        header: {
          'content-type': 'application/json'
        },
        success(res) {
          console.log(res.data);
          wx.hideLoading();
          var status = res.data.status;
          if (status == 200) {
            wx.showToast({
              title: '登录成功！',
              icon: 'success',
              duration: 3000
            })
            app.setGlobalUserInfo(res.data.data);

            var redirectUrl = that.redirectUrl;
            if (redirectUrl != null && redirectUrl != undefined && redirectUrl != ''){
              wx.reLaunch({
                url: redirectUrl,
              })
            }else{
              wx.redirectTo({
                url: '../mine/mine',
              })
            }

          } else if (status == 500) {
            wx.showToast({
              title: res.data.msg,
              icon: 'none',
              duration: 3000
            })
          }
        }
      })
    }


  },

  toRegist: function () {
    wx.navigateTo({
      url: '/pages/userRegist/userRegist',
    })
  }
})