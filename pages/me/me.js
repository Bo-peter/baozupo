
const app = getApp();
Page({
  onPullDownRefresh: function() {
    setTimeout(function(){
      wx.stopPullDownRefresh()
    },1200)
  },
  // 页面的初始数据
  data: {
    isShowUserName: false,
    userInfo: null,
  },
  //获取用户信息
  getUserProfile() {
    wx.getUserProfile({
      desc: '用于完善会员资料', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
      success: (res) => {
        console.log("获取用户信息成功", res)
        let user = res.userInfo
        this.setData({
          isShowUserName: true,
          userInfo: user,
        })
        user.openid = app.globalData.openid;
        wx.cloud.callFunction({
          name:'userDemo',
          data:{
            action:'addNewUser',
            user:user
          }
        }).then(res => {
          console.log("用户登记成功", res)
        }).catch(res => {
          console.log("用户登记失败", res)
        }),
        app._saveUserInfo(user);
      },
      fail: res => {
        console.log("获取用户信息失败", res)
      }
    })
  },
 
  //退出登录
  logout () {
    this.setData({
      isShowUserName: false,
      userInfo: null,
    })
    app._saveUserInfo(null);
  },
  // 去我的订单页
  goToMyOrder: function () {
    wx.navigateTo({
      url: '/pages/myOrder/myOrder',
    })
  },
  goToPublish: function () {
    wx.navigateTo({
      url: '/pages/publish/publish',
    })
  },
  // 去我的评论页
  goToMyComment: function () {
    wx.navigateTo({
      url: '/pages/myComment/myComment',
    })
  },
  //去我的发布页
  goToSeller() {
    wx.navigateTo({
      url: '/pages/seller/seller',
    })
  },
  onShow() {
    var user = app.globalData.userInfo;
    if (user && user.nickName) {
      this.setData({
        isShowUserName: true,
        userInfo: user,
      })
    }
  },
})