const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const dbPredictionScore = cloud.database().collection('predictionScore')
const _ = cloud.database().command
// 云函数入口函数
exports.main = async (event, context) => {
  let predictionScoreLine = event.predictionScoreLine
  if(event.action == "add" || event.action == "update")
  {
    let res = await dbPredictionScore.where({
      openid : predictionScoreLine.openid,
      goodsID : predictionScoreLine.goodsID
    }).count()
    if(res.total == 0)
    {
      dbPredictionScore.add({
        data:{
          openid : predictionScoreLine.openid,
          goodsID : predictionScoreLine.goodsID,
          predictionScore :predictionScoreLine.predictionScore
        } 
      })
    }
    else
    {
      dbPredictionScore.where({
        openid : predictionScoreLine.openid,
        goodsID : predictionScoreLine.goodsID
      }).update({
        data:{
          predictionScore :predictionScoreLine.predictionScore
        }
      })
    }
  }
  else if (event.action == "getPredictionGoods")
  {
    return await dbPredictionScore.where({
      openid :predictionScoreLine.openid,
      predictionScore:_.gt(0)
    }).limit(20).get()
  }
  else {}


}