// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})
const db = cloud.database()
const _ = db.command
const $ = _.aggregate
const dbGood = db.collection('goods')

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  if (event.action == 'search' && event.searchKey) { //搜索商品
    return await dbGood.where({
        name: db.RegExp({
          regexp: event.searchKey,
          options: 'i'
        }),
        status: '上架',
        num: _.gt(0) //剩余数量需要大于0
      })
      .orderBy('_createTime', 'desc').get()
  } else if (event.action == 'getNew') { //获取最新的商品
    return await dbGood.where({
        status: '上架',
        num: _.gt(0) //剩余数量需要大于0
      })
      .orderBy('_createTime', 'desc')
      .get()
  } else if (event.action == 'getHot') { 
    let predictionGoodsNum = 0
    let set = new Set()
    let goodsList = []
    if(event.openid != 0){
      let predictionScoreLine = {
        openid : event.openid
      }
      let predictionGoodsRes = await cloud.callFunction({
        name:"predictionScoreDemo",
        data:{
          action:"getPredictionGoods",
          predictionScoreLine:predictionScoreLine
        }
      })
      let predictionGoods = predictionGoodsRes.result.data
      for(var i = 0;i<predictionGoods.length;i++)
      {
        let goodsLine = {
          goodsID :predictionGoods[i].goodsID
        }
        let goods = await cloud.callFunction({
          name : "goodsDemo",
          data:{
            action : "getGoodsInfo",
            goodsLine:goodsLine
          }
         
        })
        set.add(predictionGoods[i].goodsID)
        goodsList[predictionGoodsNum++] = goods.result.data
      }
    }
    if(event.openid == 0|| predictionGoodsNum<20){
      let goodsRadomRes =  await dbGood.aggregate().match({
        status: '上架',
        tuijian: true,
        num: _.gt(0) //剩余数量需要大于0
      }).sample({
        size: 20
      }).end()
      let goodsRadom = goodsRadomRes.list
      for(var i = 0;i<goodsRadom.length&&predictionGoodsNum<20;i++)
      {
        if(!set.has(goodsRadom[i]._id))
        {
          goodsList[predictionGoodsNum++] = goodsRadom[i]
          set.add(goodsRadom[i]._id);
        }
      }
    }
    return  goodsList;
  } else if (event.action == 'seller') { //获取我发布的商品
    return await dbGood.where({
        _openid: wxContext.OPENID
      })
      .get()
  } else { //获取100条
    return await dbGood.where({
      status: '上架',
      num: _.gt(0) //剩余数量需要大于0
    }).get()
  }
}