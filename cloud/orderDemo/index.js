const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const dbOrder = cloud.database().collection("order")
const _ = cloud.database().command
const $ =cloud.database().command.aggregate
// 云函数入口函数
exports.main = async (event, context) => {
  
let orderInfo = event.orderInfo
if(event.action == "userOrder")
{
 return  await dbOrder.aggregate()
  .match({
    consumerID:_.eq(orderInfo.consumerID)
  })
  .group({
    _id:'$goodsID'
  }).end()
}
else{}

}