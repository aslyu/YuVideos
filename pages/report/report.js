const app =getApp()

Page({

  data: {
    reasonType:"请选择原因",
    reportReasonArray:app.reportReasonArray,
    publishUserId:"",
    videoId:''
  },

  onLoad: function (params) {
    var that = this;
    var videoId = params.videoId;
    var publishUserId = params.publishUserId;

    that.setData({
      videoId: videoId,
      publishUserId: publishUserId
    });
  },

  changeMe:function(e){
    var that = this;
    var index = e.detail.value;
    var reasonType = app.reportReasonArray[index];
    that.setData({
      reasonType: reasonType
    })
  },

  submitReport:function(e){
    var that = this;

    var reasonIndex = e.detail.value.reasonIndex;
    var reasonContent = e.detail.value.reasonContent;
    var user = app.getGlobalUserInfo();
    var currentUserId = user.id;

    if (reasonIndex == null || reasonIndex == '' || reasonIndex == undefined){
      wx.showToast({
        title: '请选择理由~',
        icon:'none'
      });
      return;
    }

    wx.request({
      url: app.serverUrl + '/user/reportUser',
      method:'POST',
      data:{
        dealUserId: that.data.publishUserId,
        dealVideoId: that.data.videoId,
        title: app.reportReasonArray[reasonIndex],
        content: reasonContent,
        userid: currentUserId
      },
      header:{
        'content-type': 'application/json',
        'userId': user.id,
        'userToken': user.userToken,
      },
      success:function(res){
        console.log(res);
        wx.showToast({
          title: res.data.data,
          duration:2000,
          icon:'none',
          success:function(){
            wx.navigateBack()
          }
        })
      }
    })
  },
})