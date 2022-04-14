var app = getApp()
let db = wx.cloud.database();
Page({
  onPullDownRefresh: function () {
    setTimeout(function () {
      wx.stopPullDownRefresh()
    }, 1200)
  },
  data: {
    // 顶部菜单切换
    navbar: ["我发布的", "待发货", "待归还", "待用户评价", "已完成"],
    // 默认选中菜单
    currentTab: 0,
    goodList: [],
    orderList: []
  },
  onShow() {
    this.getMySellGood()
  },
  //顶部tab切换
  navbarTap: function (e) {
    let index = e.currentTarget.dataset.idx;
    this.setData({
      currentTab: index
    })
    if (index == 0) { //我发布的
      this.getMySellGood()
    } else if (index == 1) {
      this.getOrderList(0);
    } else if (index == 2) { 
      this.getOrderList(1)
    } else if (index == 3) { 
      this.getOrderList(2)
    } else if (index == 4) {
      this.getOrderList(3)
    }
  },
  //我发布的商品
  getMySellGood() {
    let openid = app._checkOpenid();
    if (!openid) {
      return;
    }
    wx.cloud.callFunction({
        name: "getGoodList",
        data: {
          action: 'seller'
        }
      })
      .then(res => {
        console.log('获取我发布的商品成功', res)
        this.setData({
          goodList: res.result.data
        })
      })
      .catch(res => {
        console.log('获取我发布的商品失败', res)
      })
  },


  // 获取用户订单列表
  getOrderList(status) {
    let openid = app._checkOpenid();
    if (!openid) {
      return;
    }
    //请求自己后台获取用户openid
    wx.cloud.callFunction({
        name: 'getOrderList',
        data: {
          action: 'seller',
          status: status
        }
      })
      .then(res => {
        console.log("用户订单列表", res)
        this.setData({
          list: res.result.data
        })
      }).catch(res => {
        console.log("用户订单列表失败", res)
      })
  },
  //去商品详情页
  goDetail(e) {
    wx.navigateTo({
      url: '/pages/detail/detail?goodid=' + e.currentTarget.dataset.id
    })
  },
  //删除商品
  delete(e) {
    let id = e.currentTarget.dataset.id
    wx.cloud.callFunction({
      name: 'changeGood',
      data: {
        action: 'remove',
        id: id
      }
    }).then(res => {
      console.log('删除成功', res)
      wx.showToast({
        title: '删除成功'
      })
      this.getMySellGood()
    }).catch(res => {
      console.log('删除失败', res)
      wx.showToast({
        icon: 'none',
        title: '删除失败'
      })
    })

  },
  //去发布页
  goFabu() {
    wx.switchTab({
      url: '/pages/fabu/fabu',
    })
  },
  //已送货
  songda(e) {
    let id = e.currentTarget.dataset.id
    wx.cloud.callFunction({
      name: 'changeGood',
      data: {
        action: 'songda',
        id: id
      }
    }).then(res => {
      console.log('修改订单成功', res)
      wx.showToast({
        title: '修改订单成功'
      })
      //-1订单取消,0新下单发货,1已收货待评价,2订单已完成
      this.getOrderList(0)
      wx.cloud.callFunction({
        name: 'getOrderList',
        data: {
          action: 'oneOrder',
          orderID: id
        }
      }).then(res => {
        console.log("查询成功", res)
        this.setData({
          goods: res.result.data.good
        })
        let user = {
          openid: this.data.goods.consumerID,
          usingTimes: this.data.goods.days
        }
        wx.cloud.callFunction({
          name: 'userDemo',
          data: {
            action: 'updateInfo',
            user: user
          }
        }).then(res => {
          console.log("更新成功", res)
        }).catch(res => {
          console.log("更新失败", res)
        })
      })
    }).catch(res => {
      console.log('修改订单失败', res)
      wx.showToast({
        icon: 'none',
        title: '修改订单失败'
      })
    })
  },
  //归还
  returnOrder(e) {
    let id = e.currentTarget.dataset.id
    wx.cloud.callFunction({
      name: 'getOrderList',
      data: {
        action: 'oneOrder',
        orderID: id
      }
    }).then(res => {
      console.log("id",id)
      console.log("查询成功", res)
      let goods = {
        goodsID: res.result.data.good.goodID,
        quantity: 1
      }
      db.collection('order').doc(id).update({
        data: {
          status:2
        }
      }).then(res => {
        console.log('归还成功', res)
        this.getOrderList(1)
        //取消订单后把商品数量加回去
        wx.cloud.callFunction({
          name: "modifyGoodsAttribute",
          data: {
            goods: goods
          },
          
        }).then(res => {
          console.log('添加商品数量成功', res)
          wx.showToast({
            title: '归还成功',
          })
          
        }).catch(res => {
          console.log('添加商品数量失败', res)
          wx.showToast({
            icon: 'none',
            title: '归还失败',
          })
        })
      }).catch(res => {
        console.log('归还失败', res)
        wx.showToast({
          icon: 'none',
          title: '归还失败',
        })
      })
    })
  }
})