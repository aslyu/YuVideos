  function uploadVideo() {
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

        if (duration > 60) {
          wx.showToast({
            title: '视频长度不能超过1分钟',
            icon: 'none',
            duration: 1000
          })
        } else if (duration < 1) {
          wx.showToast({
            title: '视频长度不能少于1秒',
            icon: 'none',
            duration: 1000
          })
        } else {
          wx.navigateTo({
            url: '/pages/chooseBgm/chooseBgm?duration=' + duration +
              "&tmpHeight=" + tmpHeight +
              "&tmpWidth=" + tmpWidth +
              "&tmpVideoUrl=" + tmpVideoUrl +
              "&tmpCoverUrl=" + tmpCoverUrl,
          })
        }

      }
    })
  }

  module.exports = {
    uploadVideo: uploadVideo
  }