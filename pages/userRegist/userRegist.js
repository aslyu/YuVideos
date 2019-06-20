const app = getApp()

Page({
    data: {

    },

  regist:function(e){
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
        url: app.serverUrl+'/regist',
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
              title: '注册成功！',
              icon: 'none',
              duration: 3000
            })
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

  toLogin:function(){
    wx.navigateTo({
      url: '/pages/userLogin/userLogin',
    })
  }
})