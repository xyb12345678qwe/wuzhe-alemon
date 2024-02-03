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
  getCacheData,
  equiment_type as type,
  filter_equiment,
  findThings,
  AEvent,
  createPlayerObject
} from '../../api'
import {
  existplayer,
  Read_player,
  Write_player,
  武者境界,
  灵魂境界,
  体魄境界,
  finduid,
  装备列表,
  transaction_record,
  findTransaction,
  updateTransaction,
  auction_record,
  all_zongmen,
  武圣塔
} from '../../model/gameapi'
let shezhi = []
export class tower extends APlugin {
  constructor() {
    super({
      dsc: '基础模块',
      event: 'message',
      priority: 600,
      rule: [
        {
          reg: /^(#|\/)?查看武圣塔.*$/,
          fnc: 'check_tower'
        },
        {
          reg: /^(#|\/)?挑战武圣塔.*$/,
          fnc: 'challenge_tower'
        },
        {
          reg: /^(#|\/)?创建武圣塔$/,
          fnc: 'create_tower'
        },
        {
          reg: /^(#|\/)?我的武圣塔$/,
          fnc: 'my_tower'
        }
      ]
    })
  }
  async my_tower(e: AEvent) {
    const usr_qq = e.user_id
    if (!(await existplayer(1, usr_qq))) return false
    let { player } = await Read_player(1, usr_qq)
    let tower: any = await 武圣塔.findOne({
      where: { uid: player.uid },
      raw: true
    })
    if (!tower) return e.reply(`你没有武圣塔`)
    let msg2: any[] = []
    if (tower.挑战者.lenght > 0) {
      let maxChallenge = [
        tower.挑战者.reduce((max, current) => {
          if (current['挑战数'] > max['挑战数']) {
            return [current]
          } else if (current['挑战数'] === max['挑战数']) {
            return [...max, current]
          } else {
            return [max]
          }
        })
      ]
      maxChallenge.forEach(element => {
        msg2.push(`\n${element.name}【${element.uid}】,塔数${element.挑战数}`)
      })
      console.log(maxChallenge)
    }
    let msg = [
      '武圣塔名:' + tower.name + '\n',
      '武圣:' + tower.武圣名 + '\n',
      '挑战者:' + msg2
    ]
    e.reply(msg)
  }
  async check_tower(e: AEvent) {
    let [page] = e.msg
      .replace(/(\/|#)?查看武圣塔/, '')
      .trim()
      .split('*')
      .map(code => code.trim())
    let pages = parseInt(page)
    if (pages <= 0) return e.reply(`页数不能小于等于0`)
    if (!pages) pages = 1
    let all_武圣塔 = await 武圣塔.findAll({ raw: true })
    let all_pages = Math.ceil(all_武圣塔.length / 10)
    if (all_pages < pages) return e.reply(`没有这一页`)
    const startIndex = 10 * (Number(pages) - 1)
    const endIndex = startIndex + 10
    const pageData: any = all_武圣塔.slice(startIndex, endIndex) // 获取当前页的数据
    let msg: any[] = [`*****武圣塔*****`]
    pageData.forEach(item => {
      msg.push(`\n武圣塔:${item.name},武圣${item.武圣名}`)
    })
    e.reply(msg)
    return
  }
  async challenge_tower(e: AEvent) {
    const usr_qq = e.user_id
    if (!(await existplayer(1, usr_qq))) return false
    let { player } = await Read_player(1, usr_qq)
    const [tower_name] = e.msg
      .replace(/(\/|#)?挑战武圣塔/, '')
      .trim()
      .split('*')
      .map(code => code.trim())
    const tower: any = await 武圣塔.findOne({
      raw: true,
      where: { name: tower_name }
    })
    if (!tower) return e.reply(`没有这座武圣塔`)
    if (tower.uid == player.uid) return e.reply(`不能自己挑战自己的塔`)
    const challenger = tower.挑战者.find(item => item.uid == player.uid)
    const type = ['攻击加成', '防御加成', '暴击加成', '爆伤加成', '生命加成']
    const 武者境界 = await getCacheData('武者境界')
    const num = 武者境界.findIndex(item => item.name == tower.武圣实力.境界)
    let B_player = await createPlayerObject({ ...tower.武圣实力 })
    if (challenger) {
      if (tower.挑战者.挑战数 == num) return e.reply(`已闯到塔的最高一层`)
      const pageData = 武者境界.slice(tower.挑战者.挑战数 + 2, num) // 获取当前页的数据
      pageData.forEach(element => {
        type.forEach(item => {
          B_player[item] -= element[item]
        })
      })
    } else {
      const pageData = 武者境界.slice(1, num)
      pageData.forEach(element => {
        type.forEach(item => {
          B_player[item] -= element[item]
        })
      })
    }
    const A_player = await createPlayerObject({ ...player })
    B_player.当前生命 = B_player.生命加成
    let msg = await player_zhandou(A_player, { ...B_player })
    let temp = msg.result
    console.log(msg.winner)
    if (msg.winner == player.name) {
      player.灵气 += 1000 * (tower.挑战者.挑战数 || 1)
      player.体魄力量 += 800 * (tower.挑战者.挑战数 || 1)
      player.灵魂力量 += 800 * (tower.挑战者.挑战数 || 1)
      if (!challenger) {
        tower.挑战者.push({
          uid: player.uid,
          name: player.name,
          挑战数: 1
        })
      } else {
        challenger.挑战数 += 1
      }
    }
    await 武圣塔.upsert({ name: tower_name, ...tower })
    let get_data = { temp }
    const img = await oImages('/public/html/msg/msg.html', get_data)
    await Write_player(usr_qq, player)
    e.reply(img || '')
  }
  async create_tower(e: AEvent) {
    const usr_qq = e.user_id
    if (!(await existplayer(1, usr_qq))) return false
    let { player } = await Read_player(1, usr_qq)
    const 武者境界 = await getCacheData('武者境界')
    const num = 武者境界.findIndex(item => item.name == '武圣')
    const num2 = 武者境界.findIndex(item => item.name == player.武者境界)
    if (num2 < num) return e.reply(`至少需要武圣境界才能创立武圣塔`)
    if (await 武圣塔.findOne({ where: { uid: player.uid } }))
      return e.reply(`你已经创建过武圣塔`)
    this.subscribe('create_tower2')
    e.reply(`请输入武圣塔名称`)
  }
  async create_tower2(e: AEvent) {
    let all_tower: any = await 武圣塔.findAll({ raw: true })
    let isAllNameEqual = all_tower.every(tower => tower.name === e.msg)
    if (isAllNameEqual) {
      this.cancel()
      this.subscribe('create_tower2')
      return e.reply(`此名字已存在，请重新输入名称`)
    }
    let { player } = await Read_player(1, e.user_id)
    const A_player: any = await createPlayerObject({ ...player })
    A_player.境界 = player.武者境界
    await 武圣塔.create({
      name: e.msg,
      武圣名: player.name,
      武圣实力: A_player,
      uid: player.uid,
      挑战者: []
    })
    this.cancel()
    e.reply(`武圣塔创立成功`)
  }
}
