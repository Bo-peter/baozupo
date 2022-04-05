const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const dbScoreTable = cloud.database().collection('scroingTable')
const _ = cloud.database().command
const $ = cloud.database().command.aggregate
// 云函数入口函数
exports.main = async (event, context) => {
  let scoreLine = event.scoreLine
  if (event.action == 'addScore') {
    let res = await dbScoreTable.where({
      openid: scoreLine.openid,
      goodsID: scoreLine.goodsID
    }).count()
    if (res.total == 0) {
      dbScoreTable.add({
        data: {
          openid: scoreLine.openid,
          goodsID: scoreLine.goodsID,
          score: scoreLine.score
        }
      })
    } else {
      dbScoreTable.where({
        openid: scoreLine.openid,
        goodsID: scoreLine.goodsID
      }).update({
        data: {
          score: scoreLine.score,
          totalDays: scoreLine.totalDays
        }
      })
    }
  } else if (event.action == 'getScore') {
    return await dbScoreTable.where({
      openid: scoreLine.openid,
      goodsID: scoreLine.goodsID
    }).get()
  }
  else if(event.action == "accrodingToGoodsID") {
   return  await dbScoreTable.aggregate()
      .group({
        _id: '$goodsID',
        userScore: $.push({
          openid:'$openid',
          score:'$score'
        })
      }).end()
  } else if(event.action == "getSumOfSquares")
  {
     return  await dbScoreTable.aggregate()
      .group({
        _id: '$openid',
        scoreArray:$.push('$score')
      }).end()
  }
  else {}

}