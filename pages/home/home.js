const App = getApp()

let searchKey = '' //搜索词
Page({
  data: {
    banner: [{
        picUrl: '/image/top1.png'
      },
      {
        picUrl: '/image/top2.png'
      }
    ],
    goodList: []
  },
  //页面可见
  onShow() {
    this.demo()
  },
  onPullDownRefresh: function () {
    setTimeout(function () {
      wx.stopPullDownRefresh()
    }, 1200)
    this.getHotGood();
  },

  //轮播图点击事件
  onLoad() {
    this.getTopBanner(); //请求顶部轮播图
    this.getHotGood();
  },

  //测试使用
  demo() {
    wx.cloud.callFunction({
      name:"computePredictionScore"
    })
    // let predictionScoreLine = {
    //   openid:"oHp7c5KKIYNFqG-4eu-wZ_gcDpyg"
    // }
    // wx.cloud.callFunction({
    //   name:"predictionScoreDemo",
    //   data:{
    //     action:"getPredictionGoods",
    //     predictionScoreLine:predictionScoreLine
    //   }
    // })
  },



 
  //去二手商城页
  goToPublish() {
    let userInfo = App.globalData.userInfo;
    if (!userInfo || !userInfo.nickName) {
      wx.showModal({
        title: '提示',
        content: '请登录',
        success  :(res)=> {
          if (res.confirm) {
            console.log('用户点击确定')
            this.goLogin()
          } else if (res.cancel) {
            console.log('用户点击取消')
          }
        }
      })
      return;
    }
    wx.navigateTo({
      url: '/pages/publish/publish'
    })
  },
  //去新发布商品列表页
  goToNew() {
    wx.navigateTo({
      url: '/pages/newGood/newGood'
    })
  },
  //客服电话
  goToPhone() {
    wx.makePhoneCall({
      phoneNumber: '15667259820'
    })
  },
  //去上门回收页
  goHuiShou() {
    wx.navigateTo({
      url: '/pages/huishou/huishou',
    })
  },
  //获取用户输入的搜索词
  getSearchKey(e) {
    searchKey = e.detail.value
  },
  //搜索点击事件
  goSearch() {
    wx.navigateTo({
      url: '/pages/newGood/newGood?searchKey=' + searchKey,
    })
  },
  //获取首页顶部轮播图
  getTopBanner() {
    wx.cloud.database().collection("lunbotu").get()
      .then(res => {
        console.log("首页banner成功", res.data)
        if (res.data && res.data.length > 0) {
          this.setData({
            banner: res.data
          })
        }
      }).catch(res => {
        console.log("首页banner失败", res)
      })
  },
  //获取首页推荐位的商品
  getHotGood() {
    let openid = wx.getStorageSync('openid') ? wx.getStorageSync('openid') : 0;
    wx.cloud.callFunction({
      name: "getGoodList",
      data: {
        action: 'getHot',
        openid: openid
      }
    }).then(res => {
      console.log("首页推荐商品数据", res.result)
      this.setData({
        goodList: res.result,
      })
    }).catch(res => {
      console.log("菜品数据请求失败", res)
    })
  },
  //去商品详情页
  goDetail(e) {
    wx.navigateTo({
      url: '/pages/detail/detail?goodid=' + e.currentTarget.dataset.id
    })
  },


   /**
   * 授权登录相关
   */
  //授权登录
  goLogin() {
    wx.getUserProfile({
      desc: '用于完善会员资料', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
      success: (res) => {
        console.log("获取用户信息成功", res)
        let user = res.userInfo
        this.setData({
          isShowAddressSetting: false
        })
        user.openid = App.globalData.openid;
        App._saveUserInfo(user);
        wx.cloud.callFunction({
            name: 'userDemo',
            data: {
              action: 'addNewUser',
              user: user
            }
          }).then(res => {
            console.log("用户登记成功", res)
          }).catch(res => {
            console.log("用户登记失败", res)
          })
      },
      fail: res => {
        console.log("获取用户信息失败", res)
      }
    })
  }
})

