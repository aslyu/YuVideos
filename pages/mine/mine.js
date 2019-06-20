const app = getApp()

Page({
  data: {
    faceUrl: "../resource/images/noneface.png",
    isMe:true,
    isFollow:false,

    videoSelClass: "video-info",
    isSelectedWork: "video-info-selected",
    isSelectedLike: "",
    isSelectedFollow: "",

    myVideoList: [],
    myVideoPage: 1,
    myVideoTotal: 1,

    likeVideoList: [],
    likeVideoPage: 1,
    likeVideoTotal: 1,

    followVideoList: [],
    followVideoPage: 1,
    followVideoTotal: 1,

    myWorkFalg: false,
    myLikesFalg: true,
    myFollowFalg: true

  },

  onLoad:function(params){
    var that = this;
    var publisherId = params.publisherId;
    var user = app.getGlobalUserInfo();
    
    var userId = user.id;
    if(publisherId != null && publisherId != '' && publisherId != undefined){
      userId = publisherId;
      that.setData({
        isMe: false,
        publisherId: publisherId
      })
    }
    that.setData({
      userId:userId,
    });
    wx.showLoading({
      title: '请等待...',
    })
    wx.request({
      url: app.serverUrl + '/user/query?userId=' + userId + '&fanId=' + user.id,
      method:'POST',
      header:{
        'content-type':'application/json',
        'userId':user.id,
        'userToken':user.userToken,
      },
      success:function(res){
        console.log(res.data);
        wx.hideLoading();
        if(res.data.status == 200){
          var userData = res.data.data;
          var faceUrl = "../resource/images/noneface.png";
          if (userData.faceImage != null && userData.faceImage != '' &&         userData.faceImage != undefined){ 
            faceUrl = app.serverUrl + userData.faceImage;
          }
          that.setData({
            faceUrl: faceUrl,
            fansCounts: userData.fansCounts,
            followCounts: userData.followCounts,
            receiveLikeCounts: userData.receiveLikeCounts,
            nickname: userData.nickname,
            isFollow: userData.follow
          })
          that.getMyVideoList(1);
        } else if (res.data.status == 502){
          wx.showToast({
            title: res.data.msg,
            duration:3000,
            icon: 'none',
            success: function () {
              wx.redirectTo({
                url: '../userLogin/userLogin',
              })
            },
          });
        }
      }
    })
  },


  followMe:function(e){
    var that = this;
    var user = app.getGlobalUserInfo();
    var userId = user.id;
    var publisherId = that.data.publisherId;

    var followType = e.currentTarget.dataset.followtype;
    var url = '';
    if (followType == '1'){
      url = '/user/beyourfans?userId=' + publisherId + '&fanId=' + userId; 
    }else{
      url = '/user/dontyourfans?userId=' + publisherId + '&fanId=' + userId; 
    }

    wx.showLoading();
    wx.request({
      url: app.serverUrl + url,
      method: 'POST',
      header: {
        'content-type': 'application/json',
        'userId': user.id,
        'userToken': user.userToken,
      },
      success:function(res){
        wx.hideLoading();
        if (followType == '1') {
          that.setData({
            isFollow:true,
            fansCounts: ++that.data.fansCounts
          })
        } else {
          that.setData({
            isFollow: false,
            fansCounts: --that.data.fansCounts
          })
      }
      }
    })
  },

  logout:function(){
    var user = app.getGlobalUserInfo();

    wx.showLoading({
      title: '请等待...',
    })
    wx.request({
      url: app.serverUrl +'/logout?userId='+user.id,
      method: 'post',
      data: {
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
           title: '注销成功',
           icon:'success',
           duration:1000
         });
          // app.userInfo=null;
          wx.removeStorageSync("userInfo");
          wx.navigateTo({
            url: '../userLogin/userLogin',
          })
        } 
      }
    })

  },
    
  changeFace:function(){
    var that = this;
    var user = app.getGlobalUserInfo();
    wx.chooseImage({
      count: 1,
      sizeType: ['original','compressed'],
      sourceType: ['album','camera'],
      success: function(res) {
        console.log(res);
        var tempFilePaths = res.tempFilePaths;
        console.log(tempFilePaths);

        wx.showLoading({
          title: '上传中...',
        }),

        wx.uploadFile({
          url: app.serverUrl +'/user/uploadFace?userId='+user.id,
          filePath: tempFilePaths[0],
          name: 'file',
          header: {
            'content-type': 'application/json',
            'userId': user.id,
            'userToken': user.userToken,
          },
          success:function(res){
            var data = JSON.parse(res.data);
            console.log(data);
            wx.hideLoading();
            if (data.status == 200) {
            wx.showToast({
              title: '上传成功',
              icon:'success'
            });
            var imageUrl = data.data;
            that.setData({
              faceUrl: app.serverUrl+imageUrl
            })
            } else if (data.status == 500){
              wx.showToast({
                title: data.msg
              });
            }
          }
        })
      },
    })
  },

  uploadVideo:function(){
    var that = this;
    wx.chooseVideo({
      sourceType: ['album', 'camera'],
      maxDuration: 60,
      camera: 'back',
      
      success(res) {
        console.log(res);
        console.log(res.tempFilePath);
        var duration = res.duration;
        var tmpHeight = res.height;
        var tmpWidth = res.width;
        var tmpVideoUrl = res.tempFilePath;
        var tmpCoverUrl = res.thumbTempFilePath;

        if(duration > 60){
          wx.showToast({
            title: '视频长度不能超过1分钟',
            icon:'none',
            duration:1000
          })
        } else if (duration < 1){
          wx.showToast({
            title: '视频长度不能少于1秒',
            icon: 'none',
            duration: 1000
          })
        }else{
          wx.navigateTo({
            url: '/pages/chooseBgm/chooseBgm?duration='+duration
              + "&tmpHeight=" + tmpHeight
              + "&tmpWidth=" + tmpWidth
              + "&tmpVideoUrl=" + tmpVideoUrl
              + "&tmpCoverUrl=" + tmpCoverUrl,
          })
        }

      }
    })
  },

  doSelectWork:function(){
    this.setData({
      isSelectedWork: "video-info-selected",
      isSelectedLike: "",
      isSelectedFollow: "",

      myVideoList: [],
      myVideoPage: 1,
      myVideoTotal: 1,

      likeVideoList: [],
      likeVideoPage: 1,
      likeVideoTotal: 1,

      followVideoList: [],
      followVideoPage: 1,
      followVideoTotal: 1,

      myWorkFalg: false,
      myLikesFalg: true,
      myFollowFalg: true
    });
    this.getMyVideoList(1);
  },

  doSelectLike: function () {
    this.setData({
      isSelectedWork: "",
      isSelectedLike: "video-info-selected",
      isSelectedFollow: "",

      myVideoList: [],
      myVideoPage: 1,
      myVideoTotal: 1,

      likeVideoList: [],
      likeVideoPage: 1,
      likeVideoTotal: 1,

      followVideoList: [],
      followVideoPage: 1,
      followVideoTotal: 1,

      myWorkFalg: true,
      myLikesFalg: false,
      myFollowFalg: true
    });
    this.getMyLikesList(1);
  },

  doSelectFollow: function () {
    this.setData({
      isSelectedWork: "",
      isSelectedLike: "",
      isSelectedFollow: "video-info-selected",

      myVideoList: [],
      myVideoPage: 1,
      myVideoTotal: 1,

      likeVideoList: [],
      likeVideoPage: 1,
      likeVideoTotal: 1,

      followVideoList: [],
      followVideoPage: 1,
      followVideoTotal: 1,

      myWorkFalg: true,
      myLikesFalg: true,
      myFollowFalg: false
    });
    this.getMyFollowList(1);
  },


  getMyVideoList: function (page) {
    var that = this;
    var serverUrl = app.serverUrl;
    wx.showLoading();
    wx.request({
      url: serverUrl + '/video/showAll?page=' + page + "&pageSize=6",
      method: 'POST',
      data: {
        userId: that.data.userId
      },
      success: function (res) {
        wx.hideLoading();
        var myVideoList = res.data.data.rows;
        console.log(res.data);
        var newVideoList = that.data.myVideoList;

        that.setData({
          myVideoPaeg: page,
          myVideoList: newVideoList.concat(myVideoList),
          myVideoTotal: res.data.data.total,
          serverUrl: app.serverUrl
        });

      }
    })
  },

  getMyLikesList: function (page) {
    var that = this;
    var serverUrl = app.serverUrl;
    wx.showLoading();
    wx.request({
      url: serverUrl + '/video/showMyLike?userId=' + that.data.userId + "&page=" + page + "&pageSize=6",
      method: 'POST',
      success: function (res) {
        wx.hideLoading();
        var likeVideoList = res.data.data.rows;
        console.log(res.data);
        var newVideoList = that.data.likeVideoList;

        that.setData({
          likeVideoPaeg: page,
          likeVideoList: newVideoList.concat(likeVideoList),
          likeVideoTotal: res.data.data.total,
          serverUrl: app.serverUrl
        });

      }
    })
  },

  getMyFollowList:function(page){
    var that = this;
    var serverUrl = app.serverUrl;
    wx.showLoading();
    wx.request({
      url: serverUrl + '/video/showMyFollow?userId=' + that.data.userId + "&page=" + page + "&pageSize=6",
      method: 'POST',
      success: function (res) {
        wx.hideLoading();
        var followVideoList = res.data.data.rows;
        console.log(res.data);
        var newVideoList = that.data.followVideoList;

        that.setData({
          followVideoPaeg: page,
          followVideoList: newVideoList.concat(followVideoList),
          followVideoTotal: res.data.data.total,
          serverUrl: app.serverUrl
        });

      }
    })
  },

  // 点击跳转到视频详情页面
  showVideo: function (e) {
    console.log(e);

    var myWorkFalg = this.data.myWorkFalg;
    var myLikesFalg = this.data.myLikesFalg;
    var myFollowFalg = this.data.myFollowFalg;

    if (!myWorkFalg) {
      var videoList = this.data.myVideoList;
    } else if (!myLikesFalg) {
      var videoList = this.data.likeVideoList;
    } else if (!myFollowFalg) {
      var videoList = this.data.followVideoList;
    }

    var arrindex = e.target.dataset.arrindex;
    var videoInfo = JSON.stringify(videoList[arrindex]);
    wx.redirectTo({
      url: '../videoInfo/videoInfo?videoInfo=' + videoInfo
      
    })

  },

  // 到底部后触发加载
  onReachBottom: function () {
    var myWorkFalg = this.data.myWorkFalg;
    var myLikesFalg = this.data.myLikesFalg;
    var myFollowFalg = this.data.myFollowFalg;

    if (!myWorkFalg) {
      var currentPage = this.data.myVideoPage;
      var totalPage = this.data.myVideoTotal;
      // 获取总页数进行判断，如果当前页数和总页数相等，则不分页
      if (currentPage === totalPage) {
        wx.showToast({
          title: '已经没有视频啦...',
          icon: "none"
        });
        return;
      }
      var page = currentPage + 1;
      this.getMyVideoList(page);
    } else if (!myLikesFalg) {
      var currentPage = this.data.likeVideoPage;
      var totalPage = this.data.myLikesTotal;
      // 获取总页数进行判断，如果当前页数和总页数相等，则不分页
      if (currentPage === totalPage) {
        wx.showToast({
          title: '已经没有视频啦...',
          icon: "none"
        });
        return;
      }
      var page = currentPage + 1;
      this.getMyLikesList(page);
    } else if (!myFollowFalg) {
      var currentPage = this.data.followVideoPage;
      var totalPage = this.data.followVideoTotal;
      // 获取总页数进行判断，如果当前页数和总页数相等，则不分页
      if (currentPage === totalPage) {
        wx.showToast({
          title: '已经没有视频啦...',
          icon: "none"
        });
        return;
      }
      var page = currentPage + 1;
      this.getMyFollowList(page);
    }

  }

})