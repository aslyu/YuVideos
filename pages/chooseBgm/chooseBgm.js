const app = getApp()

Page({
  data: {
   songList:[
   ],
   videoParams:{}
  },

    onLoad: function (params) {
      var that = this;
      var user = app.getGlobalUserInfo();
      var serverUrl = app.serverUrl;
      that.setData({
        videoParams:params
      });

      wx.showLoading({
        title: '加载中',
      });
      wx.request({
        url: serverUrl+'/bgm/list',
        method: 'POST',
        header: {
          'content-type': 'application/json',
          'userId': user.id,
          'userToken': user.userToken,
        },
        success:function(res){
          var realUrl = serverUrl + '/bgm/list';
          console.log(res.data);
          wx.hideLoading();
          if(res.data.status == 200){
            that.setData({
              songList:res.data.data
            })
          }
          if(res.data.status == 502){
            wx.navigateTo({
              url:'../userLogin/userLogin?redirectUrl=' + realUrl,              
      
            })
          }
        }
      })
    
    },

    upload:function(e){
      var that = this;
      var user = app.getGlobalUserInfo();
      var bgmId = e.detail.value.bgmId;
      var desc = e.detail.value.desc;
      console.log('bgmId' + bgmId);
      console.log('desc' + desc);

      var videoParams = that.data.videoParams;
      var duration = videoParams.duration;
      var tmpHeight = videoParams.tmpHeight;
      var tmpWidth = videoParams.tmpWidth;
      var tmpVideoUrl = videoParams.tmpVideoUrl;
      var tmpCoverUrl = videoParams.tmpCoverUrl;
      console.log(duration);
      wx.showLoading({
        title: '上传中...',
      }),

      wx.uploadFile({
        url: app.serverUrl + '/video/upload',
        formData: {
          userId: user.id,
          desc: desc,
          bgmId: bgmId,
          videoSeconds: duration,
          videoHeight: tmpHeight,
          videoWidth: tmpWidth
        },
        filePath: tmpVideoUrl,
        name: 'file',
        header: {
          'content-type': 'application/json',
          'userId': user.id,
          'userToken': user.userToken,
        },
        success: function (res) {
          var data = JSON.parse(res.data);
          console.log(res);
          wx.hideLoading();
          if (data.status == 200) {
            wx.showToast({
              title: '上传成功',
              icon: 'success',
              duration: 1000
            });
            wx.navigateBack({
              dalta:1,
            })
            // var videoId = data.data;
            // wx.uploadFile({
            //   url: app.serverUrl + '/video/uploadCover',
            //   formData: {
            //     userId: app.userInfo.id,
            //     videoId: videoId
            //   },
            //   filePath: tmpCoverUrl,
            //   name: 'file',
            //   header: {
            //     'content-type': 'application/json'
            //   },
            //   success: function (res) {
            //     var data = JSON.parse(res.data);
            //     wx.hideLoading();
            //     if (data.status == 200) {

            //         wx.navigateBack({
            //           dalta:1,
            //         })
                  
            //     } 
            //   }
            // })

          }else{
            wx.showToast({
              title: '上传失败',
              duration: 1000
            });
          } 
        }
      })  
    }
})

