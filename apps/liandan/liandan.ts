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
  getB_qq,
  createPlayerObject,
  Read_json
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
  丹方
} from '../../model/gameapi'
export class liandan extends APlugin {
  constructor() {
    super({
      /** 功能描述 */
      dsc: '基础模块',
      event: 'message',
      /** 优先级，数字越小等级越高 */
      priority: 600,
      rule: [
        {
          reg: /^(#|\/)?炼丹.*$/,
          fnc: 'liandan'
        },
        {
          reg: /^(#|\/)?查看全部丹方$/,
          fnc: 'check'
        },
        {
          reg: /^(#|\/)?查看丹方.*$/,
          fnc: 'check2'
        }
      ]
    })
  }
  async liandan(e: AMessage) {
    if (!(await existplayer(1, e.user_id))) return false
    const [danName, num] = e.msg
      .replace(/(\/|#)炼丹/, '')
      .trim()
      .split('*')
      .map(code => code.trim())
    let danList: any = await 丹方.findAll({ raw: true })
    danList = danList.find(item => item.name === danName)
    const itemList: any = await 道具列表.findAll({ raw: true })
    if (!danList || !num) return false
    const results = await Read_player(1, e.user_id)
    const userBag = results.bag
    const requiredMaterials = danList.材料.map(({ name, 数量 }) => ({
      name,
      数量: 数量 * Number(num)
    }))
    const errorMessages: string[] = []
    function checkMaterialAvailability(material) {
      const { name, 数量 } = material
      const itemType = (itemList.find(item => item.name === name) || {}).type
      const bagItem = userBag[itemType]?.find(item => item.name === name)
      if (!bagItem || bagItem.数量 < 数量)
        return errorMessages.push(`缺少${name}`)
      return true
    }
    if (!requiredMaterials.every(checkMaterialAvailability))
      return e.reply(`炼丹失败, ${errorMessages.join(', ')}`)
    for (const material of requiredMaterials) {
      const itemType = itemList.find(item => item.name === material.name)
      await Add_bag_thing(e.user_id, material.name, -material.数量, itemType)
    }
    const danType = itemList.find(item => item.name === danName)
    await Add_bag_thing(e.user_id, danName, Number(num), danType)
    e.reply(`炼丹成功, 获得${danName}*${num}`)
    return false
  }
  async check(e: AMessage) {
    const danList: any = await 丹方.findAll({ raw: true })
    const msg = danList.map(danfang => danfang.name)
    return e.reply(msg.join('\r'))
  }
  async check2(e: AMessage) {
    const danList: any = await 丹方.findAll({ raw: true })
    const [danName] = e.msg
      .replace(/(\/|#)查看丹方/, '')
      .trim()
      .split('*')
      .map(code => code.trim())
    const danfang = danList.find(item => item.name == danName)
    if (!danfang) return e.reply(`没有这个丹方`)
    let msg = `${danName}丹方信息`
    danfang.材料.forEach(cailiao => {
      msg += `\n${cailiao.name} * ${cailiao.数量}`
    })
    return e.reply(msg)
  }
}
