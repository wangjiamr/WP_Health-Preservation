//index.js
//获取应用实例
const app = getApp()
const { host, share,  appid, foodAppId} = require('../../utils/common.js')
const { sendFormId } = require('../../utils/increase.js')

Page({
  data: {
    bannerList: [],
    indicatorDots: true,
    indicatorColor: "#000",
    indicatorActiveColor: "#fff",
    autoplay: true,
    interval: 5000,
    duration: 500,
    page:0,
    newList: [],
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    userInfo: {},
    hasUserInfo: false,
    isReady: false,
    showTip: false,
    percent:null,
    walletStatus:null,
    windowHeight: app.globalData.height,
    goldCoin:null,
    showMoneyTip:null
  },
  loadNewsList:function(append){
    wx.showLoading({
      title: '努力加载中...',
    })
    var that = this
    wx.request({
      url: `${host}/article/main`,
      data: {
        start: that.data.page*10,
        limit: 10
      },
      success: function ({ data }) {
        if (data.errorCode === 0 && data.errorMsg === 'ok') {  
          if(append){
            that.setData({
              newList: that.data.newList.concat(data.list)
            })
          }else{
            that.setData({
              newList: data.list
            })
          }
        }
        wx.hideLoading()
      },
      fail: function (r) {
        wx.hideLoading()
        that.setData({
          refreshing: false
        })
      }
    })
  },
  loadBannderList:(that)=>{
    wx.request({
      url: `${host}/app/banner/${appid}`,
      success: function ({ data }) {
        if (data.errorCode === 0 && data.errorMsg === 'ok') {
          const list = data.list
          if (list && list.length > 0) {
            const array = new Array()

            list.forEach((item) => {
              let openType = item.action.indexOf('article_') > -1 ? 'navigate' : 'switchTab'
              var url = '', id = null
              if (item.action.indexOf('foodFit_') > -1) {
                const params = item.action.split('_')
                id = params[1]
                url = `/pages/foodConflict/main`
              } else if (item.action.indexOf('food_') > -1) {
                const params = item.action.split('_')
                id = params[1]
                url = `/pages/food/main`
              } else if (item.action.indexOf('article_') > -1) {
                const params = item.action.split('_')
                url = `/pages/choicest/content?id=${params[1]}&category=${params[2]}`
              } else if (item.action === 'regimen') {
                url = '/pages/time/list'
              } else if (item.action === 'money') {
                openType ="navigate"
                url = '/pages/redpackets/wallet'
              }
              array.push({
                id: id,
                openType: openType,
                url: url,
                title: item.title,
                imgSrc: item.imgSrc
              })
            })
            that.setData({
              bannerList: array
            })
          }
        }
      }
    })
  },
  onLoad: function (options) {
   // wx.removeStorageSync('postInfoDate')
    //forward 
    if(options.from==='share'){
      const id=options.id
      const category = options.category
      wx.navigateTo({
        url: `../choicest/content?id=${id}&category=${category}`,
      })
    }
    this.loadNewsList()
    this.loadBannderList(this)
    var that=this
    setTimeout(() => {
      that.setData({
        isReady: true
      })
    }, 1000)
  },
  getUserInfo: function (e) {
    if (e.detail.errMsg === "getUserInfo:ok") {
      app.globalData.userInfo = e.detail.userInfo
      this.setData({
        userInfo: e.detail.userInfo,
        hasUserInfo: true
      })
    }
  },
  bindTapNewsView:function(e){
    if (e.detail.formId) {
      sendFormId(e.detail.formId,'article')
    }
    const item=e.currentTarget.dataset.item
    if(item){
      wx.navigateTo({
        url: `../choicest/content?id=${item.id}&category=${item.category}`,
      })
    }
  },
  pullDownRefresh:function(options){
    this.setData({
      page: 0,
    })
    wx.showNavigationBarLoading();
    this.loadNewsList()
    wx.hideNavigationBarLoading();
    wx.stopPullDownRefresh();
  },
  reachBottom:function(options){
    this.setData({
      page: this.data.page+1
    })
    wx.showNavigationBarLoading();
    this.loadNewsList(true)
    wx.hideNavigationBarLoading();
  },
  onShareAppMessage: function (options) {
    const title = app.globalData.shareTab1 || '专家养生文摘'
    return share(title, '', '', 'https://img.jinrongzhushou.com/banner/banner-Information3.png')
  },
  pageScroll: function (res) {
    const s = res.scrollTop || res.detail.scrollTop
    const mobileInfo = wx.getSystemInfoSync();
    const isIOS = mobileInfo.system && mobileInfo.system.indexOf('iOS') > -1
    const show = wx.getStorageSync('showTip')
    if (s > 150 && !isIOS && !show) {
      this.setData({
        showTip: true
      })
    } else {
      this.setData({
        showTip: false
      })
    }
  },
  closeTip: function () {
    wx.setStorageSync('showTip', 'N')
    this.setData({
      showTip: false
    })
  },
  bannerItemTap:(e)=>{
    const item=e.currentTarget.dataset.item
    if(item){
      if (item.openType ==='navigate'){
        if (item.url === '/pages/redpackets/wallet' && !app.globalData.walletOpen){
          wx.showToast({
            title: app.globalData.openTip||'未开通钱包',
            icon:'none'
          })
          setTimeout(()=>{
            wx.hideToast()
          },1500)
        }else{
          wx.navigateTo({
            url: item.url,
          })
        }
      } else if (item.openType === 'switchTab'){
        if (item.id) {
          app.globalData.goDetail = true
          app.globalData.detailId = item.id
        }
        wx.switchTab({
          url: item.url,
        })
      }
    }
  },
  onShow:function(){
    const show = wx.getStorageSync('showTip')
    if (show) {
      this.setData({
        showTip: false
      })
    }
    
    this.setData({
      percent:app.globalData.currentPercent||0,
      walletStatus: app.globalData.walletOpen||0,
      goldCoin: app.globalData.todayCoin,
      showMoneyTip: app.globalData.showRedPacketsTip === null ? true : app.globalData.showRedPacketsTip
    })
  }
})
