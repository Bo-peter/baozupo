// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

/**
 * 计算用户对商品的打分
 */
const db = cloud.database()
const $ = db.command.aggregate
// 云函数入口函数
exports.main = async (event, context) => {
  var user_avg = new Map()  //平均值缓存
  
  //合并订单 一个用户多次租赁一个物品 合并其时长 
  let res = await db.collection('order').aggregate()
    .group({
      _id: {
        openid: '$good.consumerID',
        goodID: '$good.goodID'
      },
      totalDays: $.sum('$good.days')
    })
    .end()


  let orderList = res.list //合并后的订单表
  //计算评分矩阵
  for (var i = 0; i < orderList.length; i++) {
    // let scoreLine = {
    //   openid: orderList[i]._id.openid,
    //   goodsID: orderList[i]._id.goodID,
    // }
    // //获取原有数据---
    // let res = await cloud.callFunction({
    //   name: "scoreTableDemo",
    //   data: {
    //     action: "getScore",
    //     scoreLine: scoreLine
    //   }
    // })
    // let old_totalDays = res.result.data.length? res.result.data[0].totalDays : 0;
    let old_totalDays = 0 ;
    //-------------------------

    //判断缓存中是否存在，不存在是区数据库获取
    if (!user_avg.has(orderList[i]._id.openid)) {
      //获取用户信息 {总时长和 使用次数}
      let userRes = await db.collection('user').where({
        openid: orderList[i]._id.openid
        //时间限制
      }).get()
      //------------错误数据
      if (userRes.data.length == 0) continue;
      //--------------

      let user = userRes.data[0]
      let average = user.usingTimes / user.usingNumber
      user_avg.set(orderList[i]._id.openid, average)
    }

    let average = user_avg.get(orderList[i]._id.openid)
    let score = 0;
    let totalDays = old_totalDays + orderList[i].totalDays;

    if (totalDays >= 2 * average) {
      score = 10;
    } else {
      score = (totalDays / (2 * average)) * 10;
    }
    if(score == 0)
    {
      continue
    }
    scoreLine = {
      openid: orderList[i]._id.openid,
      goodsID: orderList[i]._id.goodID,
      score: score,
      totalDays: totalDays
    }

    cloud.callFunction({
      name: 'scoreTableDemo',
      data: {
        action: "addScore",
        scoreLine: scoreLine
      }
    })
  }
}