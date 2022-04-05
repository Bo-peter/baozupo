const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const dbUser = cloud.database().collection('user')
const _ = cloud.database().command
// 云函数入口函数
exports.main = async (event, context) => {
  let user = event.user
  if (event.action == 'addNewUser') {
    let res = await dbUser.where({
      openid: user.openid
    }).count()
    if (res.total == 0) {
      try {
        res = await dbUser.add({
          data: {
            openid: user.openid
          }
        })
      } catch (e) {
        console.error(e)
      }
    }
    return res;
  } else if (event.action == 'updateInfo') {
    try{
      dbUser.where({
        openid:user.openid
      }).update({
        data:{
          usingTimes:_.inc(user.usingTimes),
          usingNumber:_.inc(1)
        },
      })
    }catch(e){
      console.error(e)
    }
  } else if(event.action == 'updateTatalScore'){
    try{
      dbUser.where({
        openid:user.openid
      }).update({
        data:{
          totalScore:user.totalScore
        },
      })
    }catch(e){
      console.error(e)
    }
  }else if(event.action == "getAll")
  {
    return await dbUser.get()
  }
  else {}


}