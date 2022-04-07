// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})
/**
 * 计算余弦相似性
 */
const db = cloud.database()
const $ = db.command.aggregate
// 云函数入口函数
exports.main = async (event, context) => {
  //根据goodsID获取到使用过的用户对该goods的score
  let res = await cloud.callFunction({
    name: "scoreTableDemo",
    data: {
      action: "accrodingToGoodsID"
    }
  })
  let list = res.result.list
  //计算任意两个用户对同一goods 的打分成绩
  for (var i = 0; i < list.length; i++) {
    let userScore = list[i].userScore
    let goodsID = list[i]._id
    for (var j = 0; j < userScore.length - 1; j++) {
      for (var k = j + 1; k < userScore.length; k++) {
        let mulScoreLine = {
          goodsID: goodsID,
          userOne: userScore[j].openid,
          userTwo: userScore[k].openid,
          //错误数据处理
          mulScore: userScore[j].score * userScore[k].score
        }
        let res = await cloud.callFunction({
          name: "mulScoreDemo",
          data: {
            action: "add",
            mulScoreLine: mulScoreLine
          }
        })
      }
    }
  }
  //计算一个用户对所有商品的打分平方和 在开方
  let resGetSumOfSquares = await cloud.callFunction({
    name: "scoreTableDemo",
    data: {
      action: "getSumOfSquares",
    }
  })
  let userSumOfSquares = new Map();

  let userScoreList = resGetSumOfSquares.result.list
  for (var i = 0; i < userScoreList.length; i++) {
    let scoreArray = userScoreList[i].scoreArray
    let ScorePowSum = 0;
    let ScoreSum = 0;
    for (var j = 0; j < scoreArray.length; j++) {
      ScorePowSum += scoreArray[j] * scoreArray[j];
      ScoreSum += scoreArray[j];
    }
    let user = {
      openid : userScoreList[i]._id,
      totalScore:ScoreSum
    }
    cloud.callFunction({
      name:"userDemo",
      data:{
        action:"updateTatalScore",
        user:user
      }
    })
    userSumOfSquares[userScoreList[i]._id] = Math.sqrt(ScorePowSum)
  }


  for (var i = 0; i < userScoreList.length - 1; i++) {
    for (var j = i + 1; j < userScoreList.length; j++) {
      let mulScoreLine = {
        userOne: userScoreList[i]._id,
        userTwo: userScoreList[j]._id
      }
      let resMulScoreDemo = await cloud.callFunction({
        name: "mulScoreDemo",
        data: {
          action: "getGroupMulScore",
          mulScoreLine: mulScoreLine
        }
      })
      let groupMulScore = resMulScoreDemo.result.data
      let groupMulScoreSum = 0;
      for (var k = 0; k < groupMulScore.length; k++) {
        groupMulScoreSum += groupMulScore[k].mulScore
      }
      let cosValue = (userSumOfSquares[userScoreList[i]._id] * userSumOfSquares[userScoreList[j]._id]) ? groupMulScoreSum / (userSumOfSquares[userScoreList[i]._id] * userSumOfSquares[userScoreList[j]._id]) : 0;

      let cosLine = {
        userOne: userScoreList[i]._id,
        userTwo: userScoreList[j]._id,
        cosValue: cosValue
      }
      if(cosValue == 0)
      {
        continue
      }
      cloud.callFunction({
        name: "cosTableDemo",
        data: {
          action: "add",
          cosLine: cosLine
        }
      })
    }
  }
}