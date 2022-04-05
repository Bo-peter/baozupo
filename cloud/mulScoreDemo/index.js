const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const dbMulScore = cloud.database().collection('mulScore')
const _ = cloud.database().command
// 云函数入口函数
exports.main = async (event, context) => {
  let mulScoreLine = event.mulScoreLine
  if (event.action == "add" || event.action == 'update') {
    let res = await dbMulScore.where(_.and([
      {userOne: _.or(_.eq(mulScoreLine.userOne), _.eq(mulScoreLine.userTwo))},
      {userTwo: _.or(_.eq(mulScoreLine.userOne), _.eq(mulScoreLine.userTwo))},
      {goodsID: mulScoreLine.goodsID}
    ])).count()
    //
    if (res.total == 0) {
      dbMulScore.add({
        data: {
          userOne: mulScoreLine.userOne,
          userTwo: mulScoreLine.userTwo,
          goodsID: mulScoreLine.goodsID,
          mulScore: mulScoreLine.mulScore
        }
      })
    } else {
      dbMulScore.where(_.and([
        {userOne: _.or(_.eq(mulScoreLine.userOne), _.eq(mulScoreLine.userTwo))},
        {userTwo: _.or(_.eq(mulScoreLine.userOne), _.eq(mulScoreLine.userTwo))},
        {goodsID: mulScoreLine.goodsID}
      ])).update({
        data: {
          mulScore: mulScoreLine.mulScore
        }
      })
    }
  } else if(event.action == "getGroupMulScore")
  {
    return  await dbMulScore.where(_.and([
      {userOne: _.or(_.eq(mulScoreLine.userOne), _.eq(mulScoreLine.userTwo))},
      {userTwo: _.or(_.eq(mulScoreLine.userOne), _.eq(mulScoreLine.userTwo))}
    ])).get()
    
  } 
  else {}
}