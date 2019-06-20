const app = getApp()
// pages/iaudio/iaudio.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    src: String,
    songName: String,
    singer: String,
    duration: String
  },

  /**
   * 组件的初始数据
   */
  data: {
      mysong:{},
      isPlaying:false,
      ico:'play'

  },

  ready(){
    var mysong = wx.createInnerAudioContext();
    mysong.autoplay = false;
    mysong.src = app.serverUrl+this.data.src;
    this.setData({
      mysong:mysong
    })  
  },

  /**
   * 组件的方法列表
   */
  methods: {
    display(){
        var isPlaying = this.data.isPlaying;
        if(isPlaying){
          this.setData({
            isPlaying: false,
            ico: 'play'
          })
          this.data.mysong.pause();
        }else{
          this.setData({
            isPlaying: true,
            ico: 'pause'
          })
          this.data.mysong.play();
        }
    }
  }
})
