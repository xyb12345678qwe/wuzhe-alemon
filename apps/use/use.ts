import { APlugin ,AMessage,findIndexByName,Strand,getNonZeroKeys,startstatus,stopstatus,gettupo,getstring,checkZeroValue,checkAllZeroValues,
    checkNameExists,player_zhanli,Add_bag_thing, player_zhandou,determineWinner,getB_qq,createPlayerObject,_item,oImages,Read_json,Write_json,findThings} from "../../api";
import { getlingqi,create_player,existplayer,Read_player,Write_player,武者境界, 灵魂境界,体魄境界,user_id,finduid,妖兽地点,功法列表, 道具列表, 丹方,猎杀妖兽地点} from '../../model/gameapi';
export class use extends APlugin  {
    constructor() {
        super({
            /** 功能名称 */
            name: 'use',
            /** 功能描述 */
            dsc: '基础模块',
            event: 'message',
            /** 优先级，数字越小等级越高 */
            priority: 600,
            rule: [
                {
                    reg: /^(#|\/)?使用.*$/,
                    fnc: 'use',
                }
            ],
            });
        }
        async use(e:AMessage):Promise<boolean>{
            const usr_qq = e.user_id;
            const playerExists = await existplayer(1, usr_qq);
            const [thing_name, num] = e.msg.replace(/(\/|#)?使用/, "").trim().split("*").map(code => code.trim());
            if (!playerExists || !thing_name || !num) return false;
            let [results,thing_list]:any = await Promise.all([
                Read_player(1,usr_qq),
                findThings(thing_name)
            ]);
            if(!thing_list) return false;
            let thing = thing_list.one_item;
            if(!thing) return e.reply(`没有找到这个物品`)
            let { player, bag } = results;
            let bag_thing = bag[thing.type].find(item => item.name === thing_name)
            let shezhi = await Read_json(2);
            const daoju_shezhi = shezhi.find(item => item.type == "道具类");
            if (!thing.能否消耗 && thing.能否消耗 == "否") return e.reply(`此物品不能使用`);
            if (!bag_thing) return e.reply(`你没有这个物品`);
            if (bag_thing.数量 < num) return e.reply(`数量不足,还差${Number(num) - bag_thing.数量}`);
            let msg = [`使用成功`];
            if(thing.type == "功法"){
                const gongfa = bag.已学习功法.find(item => item.name == thing_name);
                if(gongfa) return e.reply('已学习过'+ thing_name)
                else{
                    thing.all_功效.forEach((element:number) => {
                            player[element]=(player[element]||0)+thing.功效[element]
                    });
                }
            }
            if (thing_name.includes(`灵器经验石`)) {
                const exp = daoju_shezhi.thing[thing_name] * Number(num)
                if (!exp) return e.reply(`数值暂未设置`)
                player.本命灵器.exp += exp;
                msg.push(`灵器经验增加${exp},目前经验${player.本命灵器.exp}`);
            }else if(thing_name.includes(`聚神丹`)){
                const exp = daoju_shezhi.thing[thing_name] * Number(num)
                if (!exp) return e.reply(`数值暂未设置`)
                player.灵魂力量 += exp;
                msg.push(`灵魂力量增加${exp},目前灵魂力量${player.灵魂力量}`);
            }
            if (msg.length === 1 && thing.type !== "功法") return e.reply(`道具目前没有设置可使用的处理代码`);
            if(thing.type == "功法")thing.type ="已学习功法";
            await Promise.all([
                Add_bag_thing(usr_qq, thing.name, -num, thing),
                Write_player(usr_qq, player,false,false,false),
            ]); 
            return e.reply(msg.join(''));
    }
    
    }
  