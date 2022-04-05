// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})
const db = cloud.database()
const $ = db.command.aggregate
// 云函数入口函数
exports.main = async (event, context) => {
  var user_avg = new Map()
  let res = await db.collection('order').aggregate()
    .group({
      _id: {
        openid: '$good.consumerID',
        goodID: '$good.goodID'
      },
      totalDays: $.sum('$good.days')
    })
    .end()


  let list = res.list

  for (var i = 0; i < list.length; i++) {
    let scoreLine = {
      openid: list[i]._id.openid,
      goodsID: list[i]._id.goodID,
    }
    let res = await cloud.callFunction({
      name: "scoreTableDemo",
      data: {
        action: "getScore",
        scoreLine: scoreLine
      }
    })
    let old_totalDays = res.result.data? res.result.data[0].totalDays : 0;

    if (!user_avg.has(list[i]._id.openid)) {
      let userRes = await db.collection('user').where({
        openid: list[i]._id.openid
        //时间限制
      }).get()
      //------------错误数据
      if (userRes.data.length == 0) continue;
      //--------------
      let user = userRes.data[0]
      let average = user.usingTimes / user.usingNumber
      user_avg.set(list[i]._id.openid, average)
    }
    let average = user_avg.get(list[i]._id.openid)
    let score = 0;
    let totalDays = old_totalDays + list[i].totalDays;
    if (totalDays >= 2 * average) {
      score = 10;
    } else {
      score = (totalDays / (2 * average)) * 10;
    }
    scoreLine = {
      openid: list[i]._id.openid,
      goodsID: list[i]._id.goodID,
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