let app = getApp();
const db = wx.cloud.database()
Page({
  onPullDownRefresh: function() {
    setTimeout(function(){
      wx.stopPullDownRefresh()
    },1200)
  },
  data: { //页面的初始数据   
    isShowMyAddress: false, //是否显示我的地址
    isShowAddressSetting: false, //授权失败再次授权的弹窗
    beizhu: "", // 备注信息
    payWayList: [{ //模拟支付方式列表
      "id": 1,
      "package": "会员卡支付"
    }, {
      "id": 2,
      "package": "微信支付"
    }, {
      "id": 3,
      "package": "银行卡支付"
    }],
    totalPrice: 0, //总价
    maskFlag: true, // 遮罩
    good:'',
    days:0
  },
  onLoad() {
    //获取缓存地址
    this.setData({
      days:wx.getStorageSync('day'),
      good:wx.getStorageSync('goods')
    })
    this.setData({
      totalPrice: this.data.good.price * this.data.days,
    })
  },

  // 获取备注信息
  getRemark(e) {
    this.setData({
      beizhu: e.detail.value
    })
  },
  //打开支付方式弹窗
  choosePayWay() {
    var that = this;

    // 支付方式打开动画
    var animation = wx.createAnimation({
      duration: 200,
      timingFunction: 'ease-in-out',
      delay: 0
    });
    that.animation = animation;
    animation.translate(0, -285).step();
    that.setData({
      animationData: that.animation.export(),
    });
    that.setData({
      maskFlag: false,
    });
  },
  // 支付方式关闭方法
  closePayWay() {
    var that = this
    // 支付方式关闭动画
    that.animation.translate(0, 285).step();
    that.setData({
      animationData: that.animation.export()
    });
    that.setData({
      maskFlag: true
    });
  },


  //提交订单
  submitOrder(e) {
    console.log(this.data.Address )
    if(!this.data.isShowMyAddress)
    {
      wx.showModal({
        title: '提示',
        content: '请输入地址'
      })
      return;
    }
    let startTime = wx.getStorageSync('starttime')
    let endTime = wx.getStorageSync('endtime')
    let consumerID = wx.getStorageSync('openid')
    let goodorder = ({
      goodName:this.data.good.name,
      goodPrice:this.data.good.price,
      masterID : this.data.good.masterID,
      consumerID:consumerID,
      startTime:startTime,
      endTime:endTime,
      days:this.data.days,
      goodID:this.data.good._id
    })
    let res = db.collection("order").add({
      data: {
        name: this.data.address.userName,
        address: this.data.address.address,
        phone: this.data.address.phone,
        beizhu: this.data.beizhu,
        masterID : this.data.good.masterID,
        consumerID:consumerID,
        goodsID:this.data.good._id,
        days:this.data.days,
        _createTime: new Date().getTime(), //创建的时间
        totalPrice: this.data.good.price*this.data.days, //总价钱
        good: goodorder, //存json字符串
        status: 0, //-1订单取消,0新下单发货,1已收货待评价,2订单已完成
        // _createTime: db.serverDate() //创建的时间
      }
    })
   
      console.log("支付成功", res)
      // 支付方式关闭动画
      this.animation.translate(0, 285).step();
      this.setData({
        animationData: this.animation.export()
      });
      this.setData({
        maskFlag: true
      });
      wx.showToast({
        title: '下单成功！',
      })
      let goods = {
        goodsID : this.data.good._id,
        quantity:-1
      }
      //支付成功后，把商品数量减少对应个数
      wx.cloud.callFunction({
        name: "modifyGoodsAttribute",
        data: {
          action:'update',
          goods: goods
        }
      }).then(res => {
        console.log('添加销量成功', res)
        wx.switchTab({
          url: '../me/me',
        })
      }).catch(res => {
        console.log('添加销量失败', res)
        wx.showToast({
          icon: 'none',
          title: '支付失败',
        })
      })
  },
  // 管理收获地址
  addAdress() {
    wx.chooseAddress({
      success: res => {
        console.log(res);
        app._saveAddress(res);
        this.getAddress(res);
      },
      //现在获取地址，不需要授权了
      fail: res => {
        console.log("获取地址失败", res)
        app.showErrorToastUtils('您取消了操作!，请重新获取地址');

      }
    })

  },

  getAddress(addressStro) {
    if (addressStro) {
      var address = app._getAddress(addressStro);
      var city = app._getCity(addressStro);
      console.log(city);
      if (address) {
        this.setData({
          isShowMyAddress: true,
          address: {
            userName: addressStro.userName,
            phone: addressStro.telNumber,
            city: city,
            address: address
          },
        })
      }
    }
  }



})