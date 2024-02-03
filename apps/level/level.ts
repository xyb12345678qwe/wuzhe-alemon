import {
  APlugin,
  AMessage,
  findIndexByName,
  Strand,
  getNonZeroKeys,
  startstatus,
  stopstatus,
  gettupo
} from '../../api'

export class level extends APlugin {
  constructor() {
    super({
      dsc: '基础模块',
      event: 'message',
      /** 优先级，数字越小等级越高 */
      priority: 600,
      rule: [
        {
          reg: /^(#|\/)开始修炼$/,
          fnc: 'x'
        },
        {
          reg: /^(#|\/)开始锻炼体魄$/,
          fnc: 'd'
        },
        {
          reg: /^(#|\/)开始修炼灵魂$/,
          fnc: 'l'
        },
        {
          reg: /^(#|\/)修为突破$/,
          fnc: 'po1'
        },
        {
          reg: /^(#|\/)体魄突破$/,
          fnc: 'po2'
        },
        {
          reg: /^(#|\/)灵魂突破$/,
          fnc: 'po3'
        }
      ]
    })
  }
  async po3(e: AMessage): Promise<boolean> {
    await gettupo(e, '灵魂境界', '灵魂境界', '灵魂力量')
    return false
  }
  async po2(e: AMessage): Promise<boolean> {
    await gettupo(e, '体魄境界', '体魄境界', '体魄力量')
    return false
  }
  async po1(e: AMessage): Promise<boolean> {
    await gettupo(e, '武者境界', '武者境界', '灵气')
    return false
  }
  async x(e: AMessage): Promise<boolean> {
    await startstatus(e, `修炼`, `修炼`)
    return false
  }

  async d(e: AMessage): Promise<boolean> {
    await startstatus(e, `锻炼`, `锻炼体魄`)
    return false
  }

  async l(e: AMessage): Promise<boolean> {
    await startstatus(e, `修炼灵魂`, `修炼灵魂`)
    return false
  }
}
