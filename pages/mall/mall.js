let app = getApp();
//云数据库相关
const db = wx.cloud.database({});
let windowHeight = 0
Page({
  onPullDownRefresh: function() {
    setTimeout(function(){
      wx.stopPullDownRefresh()
    },1200)
  },
  data: {
    // 分类相关
    menuArr: [],
    leftActiveNum: 0,
    Tab: 0,
    heightArr: [] //用来存储右侧每个条目的高度
  },
  //去商品详情页
  goDetail(e) {
    wx.navigateTo({
      url: '/pages/detail/detail?goodid=' + e.currentTarget.dataset.id
    })
  },
  onShow() {
    //获取商品数据
    this.getList()
    console.log("进入")
  },
  //获取商品数据
  getList() {
    wx.cloud.callFunction({
      name: "getGoodList",
      data: {
        action: 'getAll'
      }
    }).then(res => {
      let dataList = res.result.data;
      console.log("商品数据", res)
      //遍历2，进行分类
      // arr 传过来的原数组
      let tempArr = [];
      let endData = [];
      dataList.forEach(item => {
        if (tempArr.indexOf(item.type) === -1) {
          endData.push({
            title: item.type,
            list: [item]
          });
          tempArr.push(item.type);
        } else {
          for (let j = 0; j < endData.length; j++) {
            if (endData[j].title == item.type) {
              endData[j].list.push(item);
              break;
            }
          }
        }
      })
      //过滤数组，添加id
      endData.map((item, index) => {
        item.id = index
      })
      console.log('过滤后', endData)
      this.setData({
        menuArr: endData,
      })
      this.getHeightArr()
    }).catch(res => {
      console.log("商品数据请求失败", res)
    })
  },

  /**
   * 分类相关
   */
  getHeightArr() {
    let _this = this;
    // setTimeout(() => {
    wx.getSystemInfo({
      success: function (res) {
        windowHeight = (res.windowHeight * (750 / res.windowWidth)); //将高度乘以换算后的该设备的rpx与px的比例
        console.log("windowHeight", windowHeight) //最后获得转化后得rpx单位的窗口高度
      }
    })
    // 获得每个元素据顶部的高度， 组成一个数组， 通过高度与scrollTop的对比来知道目前滑动到那个区域
    let heightArr = [];
    let h = 0;
    //创建节点选择器
    const query = wx.createSelectorQuery();
    //选择id
    query.selectAll('.rightblock').boundingClientRect()
    query.selectViewport().scrollOffset()
    query.exec(function (res) {
      //res就是 所有标签为contlist的元素的信息 的数组
      res[0].forEach((item) => {
        //这里的高度是每个栏目块到顶部的距离
        h += item.height;
        heightArr.push(h);
      })
      _this.setData({
        heightArr: heightArr
      })
    })
    console.log("heightArr", heightArr)

    // }, 300)
  },

  //点击左侧栏目
  leftClickFn(e) {
    this.setData({
      leftActiveNum: e.target.dataset.myid,
      Tab: e.target.dataset.myid
    })
    console.log('点击了')
  },
  //右侧滚动时触发这个事件
  rightScrollFn(e) {
    let wucha = 15 //避免部分机型上有问题，给出一个误差范围
    let st = e.detail.scrollTop;
    let myArr = this.data.heightArr;
    for (let i = 0; i < myArr.length; i++) {
      //找出是滚动到了第一个栏目，然后设置栏目选中状态
      if (st >= myArr[i] && st < myArr[i + 1] - wucha) {
        console.log("找到的i", i)
        this.setData({
          leftActiveNum: i + 1
        });
        return;
      } else if (st < myArr[0] - wucha) {
        this.setData({
          leftActiveNum: 0
        });
      }

    }
  },
 })