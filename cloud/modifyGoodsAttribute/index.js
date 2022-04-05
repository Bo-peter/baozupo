//添加销量
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})



// 云函数入口函数
exports.main = async (event, context) => {
  const db = cloud.database()
  const dbCommand = db.command
  return await db.collection('goods').doc(event.goods.goodsID)
    .update({
      data: {
        num: dbCommand.inc(event.goods.quantity)
      }
    })
}