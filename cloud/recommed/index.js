// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

// 云函数入口函数
exports.main = async (event, context) => {
  let res0 = await cloud.callFunction({
    name: "computeScore",
  }) 
  console.log(res0)
  let res1 =  await cloud.callFunction({
    name: "computeCos",
  })
  console.log(res1)
  let res2=  await cloud.callFunction({
    name: "computePredictionScore",
  })
  console.log(res2)

}