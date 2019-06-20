var videoUtil = require('../../utils/videoUtil.js')

const app = getApp()
Page({

  data: {
    serverUrl:'',
    publisher:[],
    cover: 'cover',
    videoId:'',
    src:'',
    videoInfo:{},
    userLikeVideo: false,

    commentsPage: 1,
    commentsTotalPage: 1,
    commentsList:[],

    placeholder:'说点什么...'
  },

  videoCtr:{},

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (params) {
    var that = this
    that.videoCtr = wx.createVideoContext("myVideo",that);
    var videoInfo = JSON.parse(params.videoInfo);

    var height = videoInfo.videoHeight;
    var width = videoInfo.videoWidth;
    var cover = "cover";
    if (width >= height){
      cover = "";
    }

    that.setData({
      serverUrl:app.serverUrl,
      videoId: videoInfo.id,
      src: app.serverUrl + videoInfo.videoPath,
      videoInfo: videoInfo,
      cover: cover
    });

    var user = app.getGlobalUserInfo();
    var loginUserId = "";
    if(user != null && user != '' && user != undefined){
      loginUserId = user.id;
    }

    wx.request({
      url: app.serverUrl + '/user/queryPublisher?loginUserId=' + loginUserId + "&videoId=" + videoInfo.id + "&publishUserId=" + videoInfo.userId,
      method:'POST',
      success:function(res){
        var publisher = res.data.data.publisher;
        var userLikeVideo = res.data.data.userLikeVideo;

        that.setData({
          publisher: publisher,
          userLikeVideo: userLikeVideo
        });
      }
    })
    that.getCommentsList(1);
  },
  
  onShow: function () {
    var that = this;
    that.videoCtr.play();
  },

  onHide: function () {
    var that = this;
    that.videoCtr.pause();
  },


  showSearch:function(){
    wx.navigateTo({
      url: '/pages/searchVideo/searchVideo',
    })
  },

  showPublisher:function(){
    var that = this;
    var user = app.getGlobalUserInfo();
    
    var videoInfo = that.data.videoInfo;
    
    var realUrl = '../mine/mine#publisherId@' + videoInfo.userId;

    if (user == null || user == '' || user == undefined) {
      wx.navigateTo({
        url: '../userLogin/userLogin?redirectUrl=' + realUrl,
      })
    } else {
     wx.navigateTo({
       url: '../mine/mine?publisherId=' + videoInfo.userId,
     })
    }
  },

  upload:function(){
    var that = this;
    var user = app.getGlobalUserInfo();

    var videoInfo = JSON.stringify(that.data.videoInfo);
    var realUrl = '../videoInfo/videoInfo#videoInfo@' +videoInfo;
    
    if (user == null || user == '' || user == undefined) {
      wx.navigateTo({
        url: '../userLogin/userLogin?redirectUrl=' + realUrl,
      })
    } else {
      videoUtil.uploadVideo();
    }
  },

  showIndex: function () {
   wx.redirectTo({
     url: '../list/list',
   })
  },

  showMine: function () {
    var user = app.getGlobalUserInfo();
    if(user == null || user == '' || user == undefined){
      wx.navigateTo({
        url: '../userLogin/userLogin',
      })
    }else{
      wx.navigateTo({
        url: '../mine/mine',
      })
    }
  },

  likeVideoOrNot: function(){

    var that = this;
    var videoInfo = that.data.videoInfo;
    var user = app.getGlobalUserInfo();

    if (user == null || user == '' || user == undefined) {
      wx.navigateTo({
        url: '../userLogin/userLogin',
      })
    } else {
      var userLikeVideo = that.data.userLikeVideo;
      var url = '/video/userLike?userId=' + user.id + '&videoId=' + videoInfo.id + '&videoCreaterId=' + videoInfo.userId;
      if (userLikeVideo){
        url = '/video/userUnLike?userId=' + user.id + '&videoId=' + videoInfo.id + '&videoCreaterId=' + videoInfo.userId;
      }
      wx.showLoading({
        title: '请等待...',
      })
      wx.request({
        url: app.serverUrl+url,
        method:'POST',
        header: {
          'content-type': 'application/json',
          'userId': user.id,
          'userToken': user.userToken,
        },
        success:function(){
          wx.hideLoading();
          that.setData({
            userLikeVideo: !userLikeVideo
          });
        }
      })

    }
  },

  shareMe: function () {
    var that = this;
    var user = app.getGlobalUserInfo();

    wx.showActionSheet({
      itemList: ['下载到本地', '举报用户', '分享到朋友圈', '分享到QQ空间', '分享到微博'],
      success: function (res) {
        console.log(res.tapIndex);
        if (res.tapIndex == 0) {
          // 下载
          wx.showLoading({
            title: '正在下载...',
          })
          wx.downloadFile({
            url:app.serverUrl + that.data.videoInfo.videoPath,
            success(res){
              if(res.statusCode == 200){
                wx.saveVideoToPhotosAlbum({
                  filePath: res.tempFilePath,
                  success:function(res){
                    wx.hideLoading();  
                  }
                })
              }
            }
          });
         
        } else if (res.tapIndex == 1) {
          // 举报
          var videoInfo = JSON.stringify(that.data.videoInfo);
          var realUrl = '../videoInfo/videoInfo#videoInfo@' + videoInfo;

          if(user == null || user == '' || user == undefined){
            wx.navigateTo({
              url: '../userLogin/userLogin?redirecUrl=' + realUrl,
            })
          }else{
            var publishUserId = that.data.videoInfo.userId;
            var videoId = that.data.videoInfo.id;
            var currentUserId = user.id;
            wx.navigateTo({
              url: '../report/report?videoId=' + videoId + "&publishUserId=" + publishUserId,
            })
          }
          
        } else {
          wx.showToast({
            title: '官方暂未开放...',
          })
        }
      }
    })
  },

  onShareAppMessage: function (res) {

    var that = this;
    var videoInfo = that.data.videoInfo;

    return {
      title: '短视频内容分析',
      path: "pages/videoInfo/videoInfo?videoInfo=" + JSON.stringify(videoInfo)
    }
  },

  leaveComment:function(){
    this.setData({
      commentFocus: true
    })
  },

  replyFocus: function (e) {
    var fatherCommentId = e.currentTarget.dataset.fathercommentid;
    var toUserId = e.currentTarget.dataset.touserid;
    var toNickname = e.currentTarget.dataset.tonickname;

    this.setData({
      placeholder: "回复  " + toNickname,
      replyFatherCommentId: fatherCommentId,
      replyToUserId: toUserId,
      commentFocus: true
    });
  },

  saveComment:function(e){
    var that = this;
    var content = e.detail.value;

    // 获取评论回复的fatherCommentId和toUserId
    var fatherCommentId = e.currentTarget.dataset.replyfathercommentid;
    var toUserId = e.currentTarget.dataset.replytouserid;

    var user = app.getGlobalUserInfo();
    var videoInfo = JSON.stringify(that.data.videoInfo);
    var realUrl = '../videoInfo/videoInfo#videoInfo@' + videoInfo;

    if (user == null || user == undefined || user == '') {
      wx.navigateTo({
        url: '../userLogin/userLogin?redirectUrl=' + realUrl,
      })
    } else {
      wx.showLoading({
        title: '请稍后...',
      })
      wx.request({
        url: app.serverUrl + '/video/saveComment?fatherCommentId=' + fatherCommentId + "&toUserId=" + toUserId,
        method: 'POST',
        header: {
          'content-type': 'application/json', // 默认值
          'userId': user.id,
          'userToken': user.userToken
        },
        data: {
          fromUserId: user.id,
          videoId: that.data.videoInfo.id,
          comment: content
        },
        success: function (res) {
          console.log(res.data)
          wx.hideLoading();

          that.setData({
            contentValue: "",
            commentsList: []
          });

          that.getCommentsList(1);
        }
      })
    }
  },

  getCommentsList: function (page) {
    var that = this;

    var videoId = that.data.videoInfo.id;

    wx.request({
      url: app.serverUrl + '/video/getVideoComments?videoId=' + videoId + "&page=" + page + "&pageSize=5",
      method: "POST",
      success: function (res) {
        console.log(res.data);

        var commentsList = res.data.data.rows;
        var newCommentsList = that.data.commentsList;

        that.setData({
          commentsList: newCommentsList.concat(commentsList),
          commentsPage: page,
          commentsTotalPage: res.data.data.total
        });
      }
    })
  },

  onReachBottom: function () {
    var that = this;
    var currentPage = that.data.commentsPage;
    var totalPage = that.data.commentsTotalPage;
    if (currentPage === totalPage) {
      return;
    }
    var page = currentPage + 1;
    that.getCommentsList(page);
  }

})