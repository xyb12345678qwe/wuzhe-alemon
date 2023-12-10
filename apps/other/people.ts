import { APlugin, AMessage } from 'alemonjs'
import { Read_json } from '../../api';
export class TestPeople extends APlugin {
  constructor() {
    super({
      dsc: '成员加入',
      event: 'GUILD_MEMBERS',
      eventType: 'CREATE',
      rule: [
        {
          fnc: 'peopleAdd',
          dsc: '成员加入',
          doc: '成员加入'
        }
      ]
    })
  }
  /**
   * @param e 消息对象
   * @returns
   */
  async peopleAdd(e: AMessage): Promise<boolean> {
    console.log(e);
    let shezhi = await Read_json(2);
    let chanenl_id_list = shezhi.find(item => item.type == "chanenl_id");
    console.log(chanenl_id_list);
    if(chanenl_id_list.num == "无") return false;
    const MessageChannel = e.Message({ channel_id: chanenl_id_list.num })
    MessageChannel.reply(`${e.segment.at(e.user_id)}加入频道`)
    MessageChannel.reply(`${e.user_id}加入频道`)
    console.log(e.event, '成员加入')
    return true
  }
}

export class PeopleDelete extends APlugin {
  constructor() {
    super({
      dsc: '成员更新',
      event: 'GUILD_MEMBERS',
      eventType: 'UPDATE',
      rule: [
        {
          fnc: 'peopleDelete',
          dsc: '成员更新',
          doc: '成员更新'
        }
      ]
    })
  }
  /**
   * @param e 消息对象
   * @returns
   */
  async peopleDelete(e: AMessage): Promise<boolean> {
    console.log(e.event, '成员更新')
    return true
  }
}

export class PeopleUpdata extends APlugin {
  constructor() {
    super({
      dsc: '成员退出',
      event: 'GUILD_MEMBERS',
      eventType: 'DELETE',
      rule: [
        {
          fnc: 'peopleUpdata',
          dsc: '成员退出',
          doc: '成员退出'
        }
      ]
    })
  }
  /**
   * @param e 消息对象
   * @returns
   */
  async peopleUpdata(e: AMessage): Promise<boolean> {
    console.log(e.event, '成员退出')
    let shezhi = await Read_json(2);
    let chanenl_id_list = shezhi.find(item => item.type == "chanenl_id");
    if(chanenl_id_list == "无") return false;
    const MessageChannel = e.Message({ channel_id: chanenl_id_list.num })
    MessageChannel.reply(`${e.user_id}退出频道`)
    return true
  }
}
