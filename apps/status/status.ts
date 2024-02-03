import {
  APlugin,
  AMessage,
  findIndexByName,
  Strand,
  getNonZeroKeys,
  startstatus,
  stopstatus,
  gettupo,
  getstring,
  checkZeroValue,
  checkAllZeroValues,
  checkNameExists,
  Add_bag_thing,
  player_zhandou,
  determineWinner,
  Read_json,
  getUserStatus,
  getString2,
  oImages,
  createPlayerObject,
  getCacheData,
  findThings
} from '../../api'
import {
  create_player,
  existplayer,
  Read_player,
  Write_player,
  武者境界,
  灵魂境界,
  体魄境界,
  user_id,
  finduid,
  妖兽地点,
  功法列表,
  道具列表,
  丹方,
  猎杀妖兽地点
} from '../../model/gameapi'
export class liesha extends APlugin {
  constructor() {
    super({
      /** 功能描述 */
      dsc: '基础模块',
      event: 'message',
      /** 优先级，数字越小等级越高 */
      priority: 600,
      rule: [
        {
          reg: /^(#|\/)?状态结算$/,
          fnc: 'xx'
        }
      ]
    })
  }
  async xx(e: AMessage) {
    const usr_qq = e.user_id
    if (!(await existplayer(1, usr_qq))) return false
    let results = await Read_player(1, usr_qq)
    let status = results.status
    let player = results.player
    const activeStatus = await getNonZeroKeys(status)
    console.log(activeStatus)
    if (!activeStatus) return e.reply(`没有状态`)
    const now = Date.now()
    const time = now - status[activeStatus]
    const isHunting1 = activeStatus === '猎妖'
    if (isHunting1 && player.猎妖目标 === '无') {
      e.reply(`出现错误，存档力的猎妖目标为无，自动设置为金钱豹`)
      player.猎妖目标 = '金钱豹'
    }
    let huntingLocation: any = await 猎杀妖兽地点.findAll({ raw: true })
    let daojulist: any = await 道具列表.findAll({ raw: true })
    let shezhi = await Read_json(2)
    if (player.猎妖目标 && player.猎妖目标 !== '无')
      huntingLocation = huntingLocation.find(
        item => item.name == player.猎妖目标
      )
    if (isHunting1) {
      if (time < 5 * 60 * 1000) return e.reply(`时间未到`)
      const [A_player, B_player] = await Promise.all([
        createPlayerObject(player),
        createPlayerObject(huntingLocation)
      ])
      const msg = await player_zhandou(A_player, B_player)
      const name = msg.winner
      const isWinner = name === player.name
      const dropItem = isWinner ? calculateDropItem() : null
      const resultMsg = isWinner
        ? `恭喜你打赢了${huntingLocation.name}，获得${dropItem}*1`
        : `恭喜你没打赢了${huntingLocation.name}，获得空气*1`

      await updatePlayerStatus()

      return e.reply(resultMsg)

      // 辅助函数
      function calculateDropItem() {
        const random = Math.random()
        const dropItems = huntingLocation.掉落物
        const dropItemsLength = dropItems.length
        const cumulativeProbabilities: any = []
        let cumulativeProbability = 0

        for (let i = 0; i < dropItemsLength; i++) {
          cumulativeProbability += dropItems[i].概率
          cumulativeProbabilities.push(cumulativeProbability)
        }

        const targetProbability = random * cumulativeProbability
        let low = 0
        let high = dropItemsLength - 1

        while (low <= high) {
          const mid = Math.floor((low + high) / 2)
          if (targetProbability <= cumulativeProbabilities[mid]) {
            return dropItems[mid].name
          } else {
            low = mid + 1
          }
        }

        const randomIndex = Math.floor(random * dropItemsLength)
        return dropItems[randomIndex].name
      }

      async function updatePlayerStatus() {
        player.当前生命 -= msg.A_damage
        status.猎妖 = 0
        player.猎妖目标 = '无'
        await Write_player(usr_qq, player, false, false, status)
      }
    } else if (activeStatus == '打工') {
      return await stopstatus(e, `打工`, `金钱`, `元`, 10)
    } else if (activeStatus == '猎杀妖兽') {
      const time = (now - status.猎杀妖兽) / 60000 // 将时间转换为分钟
      let x
      const rank = await getString2(
        player.武者境界,
        'E阶',
        'D阶',
        'C阶',
        'B阶',
        'A阶'
      )
      switch (rank) {
        case 'E阶':
          x = 0.9
          break
        case 'D阶':
          x = 1.15
          break
        case 'C阶':
          x = 1.35
          break
        case 'B阶':
          x = 1.65
          break
        case 'A阶':
          x = 1.9
          break
        default:
          x = 1
          break // 如果没有匹配的境界，默认为1
      }
      const money = Math.floor(time * x)
      const xiuwei = Math.floor(time * 0.3)
      const tipo = Math.floor(time * 0.35)
      player.体魄力量 = tipo
      player.灵气 += xiuwei
      player.金钱 += money
      e.reply(`结束成功，获得金钱${money}元,修为${xiuwei}体魄力量${tipo}`)
    } else if (activeStatus == '修炼') {
      return await stopstatus(e, `修炼`, `灵气`, `灵气`, 0.4)
    } else if (activeStatus == '锻炼') {
      return await stopstatus(e, `锻炼`, `体魄力量`, `体魄力量`, 0.4)
    } else if (activeStatus == '修炼灵魂') {
      return await stopstatus(e, `修炼灵魂`, `灵魂力量`, `灵魂力量`, 0.2)
    } else if (activeStatus == '采药') {
      const timeInMinutes = (now - status.采药) / 60000
      if (timeInMinutes < 30) {
        if (Math.random() < 0.5) {
          return e.reply(`没用采到药材`)
        }
      }
      const caiyao = shezhi.find(item => item.type === '采药')
      const cishu = Math.max(Math.ceil(timeInMinutes / 30), 1)
      const obtainedItems = new Map()

      const randomNumber = itemName => {
        if (itemName === '低级强灵草') {
          return Math.floor(Math.random() * 10) + 5
        } else {
          return Math.floor(Math.random() * 5)
        }
      }
      const addItemsToBag = items => {
        const promiseArr = items.map(([itemName, quantity]) => {
          const daoju = daojulist.find(d => d.name === itemName)
          return Add_bag_thing(usr_qq, itemName, quantity, daoju)
        })
        return Promise.all(promiseArr)
      }

      for (let i = 0; i < cishu; i++) {
        const randomNum = Math.random()
        const thing = caiyao.thing.find(t => t.概率 <= randomNum)
        const itemName = thing.name
        const itemQuantity = randomNumber(itemName)
        if (obtainedItems.has(itemName)) {
          obtainedItems.set(
            itemName,
            obtainedItems.get(itemName) + itemQuantity
          )
        } else {
          obtainedItems.set(itemName, itemQuantity)
        }
      }
      const itemsToAdd = Array.from(obtainedItems)
      addItemsToBag(itemsToAdd)
        .then(() => {
          let msg = ''
          obtainedItems.forEach((quantity, item) => {
            msg += `
            获得${item}${quantity}`
          })
          e.reply(msg)
        })
        .catch(err => {
          console.error(err)
          e.reply('采集药材出现错误,请稍后重试')
        })
    } else if (activeStatus == '秘境') {
      const timeInMinutes = (now - status.秘境) / 60000
      if (timeInMinutes < 5) return e.reply(`没到时间`)
      let 秘境 = (await getCacheData('秘境列表')).find(
        item => item.name == player.秘境目标.目标
      )
      let 怪物列表 = await getCacheData('秘境怪物列表')
      console.log(player.秘境目标.目标)
      const filteredData = 怪物列表.filter(item =>
        item['对应秘境'].some(m => m === player.秘境目标.目标)
      )
      console.log(filteredData.length)
      console.log(filteredData)

      if (filteredData.length > 0) {
        const randomItem =
          filteredData[Math.floor(Math.random() * filteredData.length)]
        const [A_player, B_player] = await Promise.all([
          createPlayerObject(player),
          createPlayerObject(randomItem)
        ])
        const msg = await player_zhandou(A_player, B_player)
        const name = msg.winner
        if (name == player.name) {
          let totalWeight = 0
          for (let i = 0; i < 秘境.thing.length; i++) {
            totalWeight += 秘境.thing[i].权重
          }

          const random = Math.random() * totalWeight
          let thing_name
          let cumulativeWeight = 0

          for (let i = 0; i < 秘境.thing.length; i++) {
            cumulativeWeight += 秘境.thing[i].权重
            if (random <= cumulativeWeight) {
              thing_name = 秘境.thing[i].name
              break
            }
          }

          // 权重归一化
          for (let i = 0; i < 秘境.thing.length; i++) {
            秘境.thing[i].权重 /= totalWeight
          }

          // 根据归一化权重进行随机选择
          let cumulativeProbability = 0

          for (let i = 0; i < 秘境.thing.length; i++) {
            cumulativeProbability += 秘境.thing[i].权重
            if (random <= cumulativeProbability) {
              thing_name = 秘境.thing[i].name
              break
            }
          }
          let thing = await findThings(thing_name)
          msg.result.push(`恭喜打赢了${B_player.name}获得${thing_name}*1`)
          await Add_bag_thing(usr_qq, thing_name, 1, thing)
        }
        let get_data = { temp: msg.result }
        const img = await oImages('/public/html/msg/msg.html', get_data)
        if (img) e.reply(img)
      }
    }
    status[activeStatus] = 0
    await Write_player(e.user_id, player, false, false, status)
    return true
  }
}
