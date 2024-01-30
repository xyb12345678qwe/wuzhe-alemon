import { APlugin ,AMessage,findIndexByName,Strand,getNonZeroKeys,startstatus,stopstatus,gettupo,getstring,checkZeroValue,checkAllZeroValues,
    checkNameExists,Add_bag_thing, player_zhandou,determineWinner,getB_qq,createPlayerObject, 
    findThings,
    Add_bag_things} from "../../api";
import { create_player,existplayer,Read_player,Write_player,武者境界, 灵魂境界,体魄境界,user_id,finduid,兑换码} from '../../model/gameapi';
  export class exchange extends APlugin  {
      constructor() {
          super({
              dsc: '基础模块',
              event: 'message',
              /** 优先级，数字越小等级越高 */
              priority: 600,
              rule: [
                  {
                      reg: /^(#|\/)?兑换码.*$/,
                      fnc: 'exchange',
                  },
                  {
                    reg: /^(#|\/)?查看开局兑换码.*$/,
                    fnc: 'check',
                },
              ],
          });
      }
    async exchange(e:AMessage){
      const usr_qq = e.user_id;
      const [thing_name] = e.msg.replace(/(\/|#)?兑换码/, "").trim().split("*").map(code => code.trim());
      if (!await existplayer(1, usr_qq) || !thing_name) return false;
      let { player, id: uid } = await Read_player(1, usr_qq);
      let exchange_thing:any = await 兑换码.findOne({ where: { name: thing_name }, raw: true });
      if (!exchange_thing) return e.reply(`兑换码${thing_name}不存在`);
      const currentMilliseconds = new Date().getTime();
      const start_time = exchange_thing.start_time;
      const end_time = exchange_thing.end_time;
      const start_date = new Date(start_time.replace(/年|月/g, '/').replace(/日|时|分/g, ':'));
      const end_date = new Date(end_time.replace(/年|月/g, '/').replace(/日|时|分/g, ':'));
      const startTimeInMillis = start_date.getTime();
      const endTimeInMillis = end_date.getTime();
      console.log(`start:${startTimeInMillis},end:${endTimeInMillis}`);
      if (currentMilliseconds < startTimeInMillis) return e.reply(`兑换码${thing_name}还没有开放,开放时间为【${exchange_thing.start_time}】`);
      if (currentMilliseconds > endTimeInMillis) return e.reply(`兑换码${thing_name}已过期,截至时间为【${exchange_thing.end_time}】`);
      if (exchange_thing.people.includes(uid.uid)) return e.reply(`此兑换码${thing_name}你已经用过`);
      if (exchange_thing.限制人数 == exchange_thing.people.length) return e.reply(`兑换码${thing_name}使用人数已到上限${exchange_thing.限制人数}人`);
      const exchange_thing_list = exchange_thing.thing;
      const msg:any[] = [];
      for (const element of exchange_thing_list) {
        if (element.name !== "灵气" && element.name !== "体魄力量" && element.name !== "灵魂力量" && element.name !== "金钱") {
          const thing = (await findThings(element.name)).one_item;
          if (!thing) {
            console.log(`${element.name}物品没有找到,请修复,查看兑换码文件物品名是否有问题`);
            e.reply(`${element.name}物品没有找到,请修复,查看兑换码文件物品名是否有问题`);
          } else {
            await Add_bag_thing(usr_qq, element.name, element.num, thing);
          }
        } else {
          player[element.name] += element.num;
        }
        msg.push(`\n${element.name}*${element.num}`);
      }
      exchange_thing.people.push(uid.uid);
      await 兑换码.update(exchange_thing, { where: { name: thing_name } });
      await Write_player(usr_qq, player, false, false, false);
      return e.reply(`兑换成功获得${msg}`);
    }
    async check(e:AMessage){
        e.reply(e.segment.at(e.user_id) + `开局礼包名:开局礼包`)
    } 
    
    }