App({
  userInfo: null,
  serverUrl: "https://huangguiyu.com/v",
  beiyongUrl: "http://460b15cf.nat123.cc",

  setGlobalUserInfo: function(user) {
    wx.setStorageSync("userInfo", user);
  },

  getGlobalUserInfo: function() {
    return wx.getStorageSync("userInfo");
  },

  reportReasonArray:[
    "色情低俗",
    "政治敏感",
    "辱骂谩骂",
    "违法违纪",
    "暴力血腥",
    "引入不适",
    "广告垃圾",
    "其他原因"
  ]

})