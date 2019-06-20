const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    serverUrl:'',

    screenWidth: 350,
    videoList:[],
    totalPage:1,
    page:1,

    searchContent:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (params) {
    var that = this;
    var screenWidth = wx.getSystemInfoSync().screenWidth;
    that.setData({
      screenWidth: screenWidth,
    });
    var searchContent = '';
    if (params.search != null && params.search != '' && params.search != undefined){
      searchContent = params.search;
    }
    var isSaveRecord = params.isSaveRecord;
    

    if (isSaveRecord == null || isSaveRecord == '' || isSaveRecord == undefined){
      isSaveRecord = 0;
    }
    that.setData({
      searchContent: searchContent
    })

    var page = that.data.page;
    that.getAllVideoList(page, isSaveRecord);
  },


  getAllVideoList: function (page, isSaveRecord) {
    var that = this;
    var serverUrl = app.serverUrl;
    wx.showLoading({
      title: '加载中..',
    })
    var searchContent = that.data.searchContent;
    wx.request({
      url: serverUrl + '/video/showAll?page=' + page + "&isSaveRecord=" + isSaveRecord,
      method: 'POST',
      data:{
        videoDesc: searchContent
      },
      success: function (res) {
        wx.hideLoading();
        wx.hideNavigationBarLoading();
        wx.stopPullDownRefresh();

        console.log(res.data);

        if (page == 1) {
          that.setData({
            videoList: []
          });
        }

        var oldVideoList = that.data.videoList;
        var videoList = res.data.data.rows;

        that.setData({
          videoList: oldVideoList.concat(videoList),
          page: page,
          totalPage: res.data.data.total,
          serverUrl: serverUrl
        });

      }
    })
  },


  onPullDownRefresh:function(){
    wx.showNavigationBarLoading();
    this.getAllVideoList(1,0);
  },


  onReachBottom:function(){
    var that = this;
    var currentPage = that.data.page;
    var totalPage = that.data.totalPage;
    if(currentPage == totalPage){
      wx.showToast({
        title: '已经到底了~~',
        icon:'none'
      });
      return;
    }

    var page = currentPage + 1;
    that.getAllVideoList(page,0);
  },

  showVideoInfo:function(e){
    var that = this;
    var videoList = that.data.videoList;
    var arrindex = e.target.dataset.arrindex;
    var videoInfo = JSON.stringify(videoList[arrindex]);

    wx.redirectTo({
      url: '../videoInfo/videoInfo?videoInfo=' + videoInfo
    })
  }
  
})