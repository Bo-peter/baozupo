// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})
const dbGoods = cloud.database().collection('goods')
const _ = cloud.database().command
const $ = cloud.database().command.aggregate
// 云函数入口函数
exports.main = async (event, context) => {
  let goodsLine = event.goodsLine
  if(event.action == "getGoodsInfo")
  {
    return await dbGoods.doc(goodsLine.goodsID).get()
  }
  else {}

}