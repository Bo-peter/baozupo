//添加销量
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})



// 云函数入口函数
exports.main = async (event, context) => {

  let update_result = []
  const DB = cloud.database()
  const DBCommand = DB.command
  event.goods.forEach(item => {
    let one_result = DB.collection('goods').doc(item._id)
      .update({
        data: {
          status:item.status,
          type:item.type,
          price:item.price,
          num: DBCommand.inc(item.quantity)
        }
      })
    update_result.push(one_result)
  })

  return await Promise.all(update_result).then(res => {
    return res
  }).catch(res => {
    return res
  })

}