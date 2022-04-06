const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

// 云函数入口函数
exports.main = async (event, context) => {
  let userGetAll = await cloud.callFunction({
    name: "userDemo",
    data: {
      action: "getAll"
    }
  })
  
  let userList = userGetAll.result.data
  let averageScore = new Map();
  let scoreTable = new Map();
  
  for(var i = 0; i < userList.length; i++ )
  {
    averageScore[userList[i].openid] = userList[i].usingNumber?userList[i].totalScore/userList[i].usingNumber:0
  }
  
  for (var i = 0; i < userList.length; i++) {
    
    //找见与预测用户余弦相似性最高的人 
    let cosLine = {
      userOne: userList[i].openid
    }
    let CosOrderRes = await cloud.callFunction({
      name: "cosTableDemo",
      data: {
        action: "getCosOrder",
        cosLine: cosLine
      }
    })
    let cosOrder  = CosOrderRes.result.data
    let predictionGoods = new Set();
    let andOtherUserCos = new Map();


    //找到与预测用户相似的人所租赁的商品
    for(var j=0;j<cosOrder.length;j++)
    {
      let orderInfo ={}
      if(cosOrder[j].userOne == userList[i].openid)
      {
         orderInfo ={
          consumerID:cosOrder[j].userTwo
        } 
        andOtherUserCos.set(cosOrder[j].userTwo,cosOrder[j].cosValue)
      }
      else
      {
        orderInfo ={
          consumerID:cosOrder[j].userOne
        } 
       
        andOtherUserCos.set(cosOrder[j].userOne,cosOrder[j].cosValue)
      }
      let userOrder = await cloud.callFunction({
        name :"orderDemo",
        data:{
          action:"userOrder",
          orderInfo:orderInfo
        }
      })
      for(var k =0;k<userOrder.result.list.length;k++)
      {
        predictionGoods.add(userOrder.result.list[k]._id)
      }
    }
    //找到预测用户 所租赁过的商品 并与前作差
    let orderInfo ={
      consumerID:userList[i].openid
    } 
    let userOrder = await cloud.callFunction({
      name :"orderDemo",
      data:{
        action:"userOrder",
        orderInfo:orderInfo
      }
    })
    for(var j =0;j<userOrder.result.list.length;j++)
    {
      predictionGoods.delete(userOrder.result.list[j]._id)
    }


    for ( let goodsID of predictionGoods.values() ){
      for (var openid of andOtherUserCos.keys())
      {
        let key = openid+":"+goodsID;
        if(!scoreTable.has(key))
        {
          let scoreLine = {
            openid : openid,
            goodsID:goodsID
          }
          let scoreRes = await cloud.callFunction({
            name:"scoreTableDemo",
            data:{
              action:"getScore",
              scoreLine:scoreLine
            }
          })
          scoreTable.set(key,scoreRes.result.data.length?scoreRes.result.data[0].score:0)
        }
      }
      let top = 0;
      let bottom = 0
      
      for (var openid of andOtherUserCos.keys()) 
      {
        top +=  andOtherUserCos.get(openid)*(scoreTable.get(openid+":"+goodsID) - averageScore[openid])
        bottom +=  Math.abs(andOtherUserCos.get(openid))
      }
      let predictionScore = averageScore[userList[i].openid] + (top/bottom)
      let predictionScoreLine = {
        openid:userList[i].openid,
        goodsID:goodsID,
        predictionScore:predictionScore
      }
      cloud.callFunction({
        name:"predictionScoreDemo",
        data:{
          action:"add",
          predictionScoreLine:predictionScoreLine
        }
      })
    }
    

  }

}