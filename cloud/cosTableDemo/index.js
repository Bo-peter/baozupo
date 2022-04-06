const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const dbCosTable = cloud.database().collection('cosTable')
const _ = cloud.database().command
const $ = cloud.database().command.aggregate
// 云函数入口函数
exports.main = async (event, context) => {
  let cosLine = event.cosLine
  if(event.action == 'add'||event.action == 'update')
  {
    let res = await dbCosTable.where(_.and(
      [
        {userOne: _.or(_.eq(cosLine.userOne), _.eq(cosLine.userTwo))},
      {userTwo: _.or(_.eq(cosLine.userOne), _.eq(cosLine.userTwo))}
      ]
    )).count()
    //
    if (res.total == 0) {
      dbCosTable.add({
        data: {
          userOne: cosLine.userOne,
          userTwo: cosLine.userTwo,
          cosValue: cosLine.cosValue
        }
      })
    } else {
      dbCosTable.where(_.and(
        [
          {userOne: _.or(_.eq(cosLine.userOne), _.eq(cosLine.userTwo))},
        {userTwo: _.or(_.eq(cosLine.userOne), _.eq(cosLine.userTwo))}
        ]
      )).update({
        data: {
          cosValue: cosLine.cosValue
        }
      })
    }
  }
  else if(event.action == "getCosOrder")
  {
    return await dbCosTable.where(_.or([
      {userOne:_.eq(cosLine.userOne)},{
      userTwo:_.eq(cosLine.userOne)}
      ])).orderBy("cosValue","asc").limit(10).get()
  }
  else{}

}