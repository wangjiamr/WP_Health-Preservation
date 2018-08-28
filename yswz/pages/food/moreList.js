// pages/food/food.js
const { host, share} = require('../../utils/common.js')
const app=getApp()
Page({
  data: {
    page: 0,
    id:'',
    title:'',
    list :[],
    showHome:false
  },
  loadList:(that,append)=>{
    wx.showLoading({
      title: '努力加载中...',
    })
    //load  list
    wx.request({
      url: `${host}/food/subList/${that.data.id}`,
      data: {
        start: that.data.page * 10,
        limit: 10
      },
      success: function ({ data }) {
        if (data.errorCode === 0 && data.errorMsg === 'ok') {
          if (append) {
            that.setData({
              list: that.data.list.concat(data.list)
            })
          } else {
            that.setData({
              list: data.list
            })
          }
        }
        wx.hideLoading()
      },
      fail: function () {
        wx.hideLoading()
      }
    })
  },
  bindItemTap:  (e)=> {
    const item = e.currentTarget.dataset.item
    if (item) {
      wx.navigateTo({
        url: '../food/foodinfo?id=' + item.id
      })
    }
  },
  onLoad:function(option){
    if (!app.globalData.showGoHome) {
      app.globalData.showGoHome = !!option.from
    }
     this.setData({
       id:option.id,
       title:option.title,
       showHome: app.globalData.showGoHome
     })
    
    this.loadList(this)
  },
  onPullDownRefresh: function (options) {
    this.setData({
      page: 0
    })
    wx.showNavigationBarLoading();
    this.loadList(this)
    wx.hideNavigationBarLoading();
    wx.stopPullDownRefresh();
  },
  onReachBottom: function (options) {
    this.setData({
      page: this.data.page + 1
    })
    wx.showNavigationBarLoading();
    this.loadList(this,true)
    wx.hideNavigationBarLoading();
  },
  onShareAppMessage: function (options) {
    return share('养生食物', '', '', 'https://img.jinrongzhushou.com/banner/banner-food2.jpg')
  }
})