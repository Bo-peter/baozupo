const app = getApp()

const dbScoreTable = wx.cloud.database().collection('scroingTable')
const _ = wx.cloud.database().command
const $ = wx.cloud.database().command.aggregate
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
  },
  //页面可见
  onShow() {
    this.getTopBanner(); //请求顶部轮播图
    this.getHotGood();
    this.demo()
  },
  onPullDownRefresh: function () {
    setTimeout(function () {
      wx.stopPullDownRefresh()
    }, 1200)
  },
  //轮播图点击事件

  demo() {
    // let cosLine = {
    //   cosValue: 0,
    //   userOne: "oHp7c5PFtVlHcPCY-lvRyfytThQI",
    //   userTwo: "oHp7c5BP_RUrWBjlkNCZewfPISvU"
    // }
    // wx.cloud.callFunction({
    //   name: "cosTableDemo",
    //   data: {
    //     action: "add",
    //     cosLine: cosLine
    //   }
    // })
    wx.cloud.callFunction({
      name: "computeCos"
    }).then(res=>{
      console.log(res)
    }).catch(res=>{
      console.log(res)
    })
    // let mulScoreLine = {
    //   userOne: "oHp7c5PFtVlHcPCY-lvRyfytThQI",
    //   userTwo: "oHp7c5KKIYNFqG-4eu-wZ_gcDpyg"
    // }
    // wx.cloud.callFunction({
    //   name: "mulScoreDemo",
    //   data: {
    //     action: "getGroupMulScore",
    //     mulScoreLine: mulScoreLine
    //   }
    // })

  },


  //去二手商城页
  goToPublish() {
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
    wx.cloud.callFunction({
      name: "getGoodList",
      data: {
        action: 'getHot'
      }
    }).then(res => {
      console.log("首页推荐商品数据", res.result)
      this.setData({
        goodList: res.result.data,
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
})