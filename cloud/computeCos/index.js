// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})
const db = cloud.database()
const $ = db.command.aggregate
// 云函数入口函数
exports.main = async (event, context) => {
  let res = await cloud.callFunction({
    name: "scoreTableDemo",
    data: {
      action: "accrodingToGoodsID"
    }
  })
  let list = res.result.list
  for (var i = 0; i < list.length; i++) {
    let userScore = list[i].userScore
    let goodsID = list[i]._id
    for (var j = 0; j < userScore.length - 1; j++) {
      for (var k = j+1; k < userScore.length; k++) {
        let mulScoreLine = {
          goodsID: goodsID,
          userOne: userScore[j].openid,
          userTwo: userScore[k].openid,
          //错误数据处理
          mulScore: userScore[j].score * userScore[k].score
        }
        cloud.callFunction({
          name: "scoreTableDemo",
          data: {
            action: "add",
            mulScoreLine: mulScoreLine
          }
        })
      }
          let resGetSumOfSquares = await cloud.callFunction({
            name: "scoreTableDemo",
            data:{
              action: "getSumOfSquares",
            }
          })
          let userSumOfSquares = new Map();
          
          let userScoreList = resGetSumOfSquares.result.list
          for(var i=0;i<userScoreList.length;i++)
          {
            let scoreArray = userScoreList[i].scoreArray
            let result = 0;
            for(var j =0 ;j<scoreArray.length;j++)
            {
              result += scoreArray[j]*scoreArray[j];
            }
            userSumOfSquares[userScoreList[i]._id] = Math.sqrt(result)
          }

         
          for (var i = 0; i < userScoreList.length - 1; i++) {
            for (var j = i+1; j < userScoreList.length; j++) {
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
              let cosValue = (userSumOfSquares[userScoreList[i]._id] * userSumOfSquares[userScoreList[j]._id])?groupMulScoreSum / (userSumOfSquares[userScoreList[i]._id] * userSumOfSquares[userScoreList[j]._id]):0;
              
              let cosLine = {
                userOne: userScoreList[i]._id,
                userTwo: userScoreList[j]._id,
                cosValue: cosValue
              }
              console.log(cosLine)
              cloud.callFunction({
                name:"cosTableDemo",
                data:{
                  action:"add",
                  cosLine : cosLine
                }
              })
            }
          }
        

      
    }
  }

}