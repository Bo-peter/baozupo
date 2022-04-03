const App = getApp()
let DB = wx.cloud.database()
let goods_id = ''
Page({
  data: {
    total_price: 0, // 总价，初始为0
    start_date:"",
    end_date:"",
    goods:''
  },
  onLoad(opt) {
    goods_id = opt.goodid
    console.log('商品id', goods_id)
    this.getGoodDetail()
    this.getCommentList();
  },
  //获取评论列表
  getCommentList() {
    wx.cloud.callFunction({
      name: 'getComment',
      data: {
        goods_id: goods_id
      }
    }).then(res => {
      console.log("查询评论结果", res)
      if (res && res.result && res.result.data) {
        let dataList = res.result.data;
        this.setData({
          list: dataList
        })
      } else {
        this.setData({
          list: []
        })
      }
    }).catch(res => {
      console.log("查询评论失败", res)
    })
  },
  //修改开始日期
  modifyStartDate:function(e){
    this.setData({
      start_date:e.detail.value
    })
  },
  //修改结束日期
  modifyEndDate:function(e){
    this.setData({
      end_date:e.detail.value
    })
  },
  //获取商品详情
  getGoodDetail() {
    DB.collection('goods').doc(goods_id).get()
      .then(res => {
        console.log('获取商品详情成功', res)
        let goods = res.data
        this.setData({
          goods: goods
        })
      })
      .catch(res => {
        console.log('获取商品详情失败', res)
      })
  },


  // 跳转确认订单页面
  gotoOrder: function () {
    if(this.data.goods.masterID == wx.getStorageSync('openid'))
    {
      wx.showModal({
        title: '提示',
        content: '不能租赁自己发布商品哦'
      })
      return;
    }

    var now_date = this.getNowTime( new Date());
    var now_times = new Date(now_date).getTime();
    var start_date = new Date(this.data.start_date.replace(/-/g,"/"));
    var end_date = new Date(this.data.end_date.replace(/-/g,"/"));
    var days = end_date.getTime() - start_date.getTime();
    var day = parseInt(days/(1000*60*60*24));
    if(this.data.start_date == "" || this.data.end_date == "")
    {
      wx.showModal({
        title: '提示',
        content: '请选择租赁日期'
      })
      return;
    }
    
    if(now_times-start_date>0)
    {
      wx.showModal({
        title: '提示',
        content: '租赁开始日期最低为今天'
      })
      return;
    }
    if(day < 0 )
    {
      wx.showModal({
        title: '提示',
        content: '请正确选择租赁日期'
      })
      return;
    }
    wx.setStorageSync('goods', this.data.goods)
    wx.setStorageSync('starttime', this.data.start_date)
    wx.setStorageSync('endtime', this.data.end_date)
    wx.setStorageSync('day', day)

 
    let userInfo = App.globalData.userInfo;
    if (!userInfo || !userInfo.nickName) {
      this.showLoginView()
      return;
    }
    wx.navigateTo({
      url: '/pages/pay/pay'
    })
  },

    getNowTime:function(now)
    {
      var year = now.getFullYear();
      var month = now.getMonth()+1;
      var day = now.getDate();
      if(month<10){
        month = '0'+month;
      }
      if(day<10){
        day = '0'+day;
      }
      var formatDate = year+'/'+month+'/'+day;
      return formatDate;
    },
  /**
   * 授权登录相关
   */
  //弹起登录弹窗
  showLoginView() {
    this.setData({
      isShowAddressSetting: true
    })
  },
  //关闭登录弹窗
  closeLoginView() {
    this.setData({
      isShowAddressSetting: false
    })
  },
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
        wx.navigateTo({
          url: '/pages/pay/pay'
        })
      },
      fail: res => {
        console.log("获取用户信息失败", res)
      }
    })
  },
  //预览图片，放大预览
  previewImg(event) {
    let index = event.currentTarget.dataset.index
    wx.previewImage({
      current: this.data.goods.img[index], // 当前显示图片的http链接
      urls: this.data.goods.img // 需要预览的图片http链接列表
    })
  }
})