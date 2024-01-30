import { APlugin ,AMessage,findIndexByName,Strand,getNonZeroKeys,startstatus,stopstatus,gettupo,getstring,checkZeroValue,checkAllZeroValues,
    checkNameExists,Add_bag_thing, player_zhandou,determineWinner,getB_qq,createPlayerObject,oImages,Read_json,Write_json,findThings,
    AEvent,
    Add_生命} from "../../api";
import { create_player,existplayer,Read_player,Write_player,武者境界, 灵魂境界,体魄境界,user_id,finduid,妖兽地点,功法列表, 道具列表, 丹方,猎杀妖兽地点,getLingqi} from '../../model/gameapi';
export class use extends APlugin  {
    constructor() {
        super({
            /** 功能描述 */
            dsc: '基础模块',
            event: 'message',
            /** 优先级，数字越小等级越高 */
            priority: 600,
            rule: [
                {
                    reg: /^(#|\/)?使用.*$/,
                    fnc: 'use',
                },
                {
                    reg: /^(#|\/)?出售.*$/,
                    fnc: 'sell',
                }
            ],
            });
        }
        async sell(e:AEvent){
            const usr_qq = e.user_id;
            const playerExists = await existplayer(1, usr_qq);
            const [thing_name, num] = e.msg.replace(/(\/|#)?出售/, "").trim().split("*").map(code => code.trim());
            if (!playerExists || !thing_name || !num) return false;
            let thing_num = parseInt(num);
            let [{player,bag},thing]:any = await Promise.all([
                Read_player(1,usr_qq),
                (await findThings(thing_name)).one_item
            ]);
            if(!thing) return e.reply(`没有这个物品`);
            let bag_thing = bag[thing.type].find(item => item.name === thing_name);
            if(!bag_thing)return e.reply(`你没有这个东西`);
            if(bag_thing.数量 < thing_num)return e.reply(`数量不足,还差${thing_num - bag_thing.数量}`);
            player.金钱 += parseInt(thing.价格) * thing_num;
            bag_thing.数量 -= thing_num;
            e.reply(`出售完毕,当前物品剩余数量为${bag_thing.数量}`);
            await Write_player(usr_qq,player,bag);
        }
        async use(e:AEvent){
            const usr_qq = e.user_id;
            const playerExists = await existplayer(1, usr_qq);
            const [thing_name, thing_num] = e.msg.replace(/(\/|#)?使用/, "").trim().split("*").map(code => code.trim());
            if (!playerExists || !thing_name || !thing_num) return false;
            let num = parseInt(thing_num);
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
            }else if (thing_name.includes(`灵器经验石`) || thing_name.includes(`聚神丹`) || thing_name.includes(`体质经验丹`)) {
                const exp = daoju_shezhi.thing[thing_name] * Number(num);
                if (!exp) return e.reply(`数值暂未设置`);
            
                if (thing_name.includes(`体质经验丹`) && player.体质 === "无") return e.reply(`先去觉醒体质`);
            
                if (thing_name.includes(`灵器经验石`)) {
                    player.本命灵器.exp += exp;
                    msg.push(`灵器经验增加${exp},目前经验${player.本命灵器.exp}`);
                } else if (thing_name.includes(`聚神丹`)) {
                    player.灵魂力量 += exp;
                    msg.push(`灵魂力量增加${exp},目前灵魂力量${player.灵魂力量}`);
                } else if (thing_name.includes(`体质经验丹`)) {
                    player.体质.exp += exp;
                    msg.push(`体质经验增加${exp},目前体质经验${player.体质.exp}`);
                }
            }else if(thing_name == '灵器重铸石'){
                const lingqi:any = await getLingqi(e);
                if(lingqi){
                    player.攻击加成 -= player.本命灵器.攻击加成;
                    player.防御加成 -= player.本命灵器.防御加成;
                    player.暴击加成 -= player.本命灵器.暴击加成;
                    player.爆伤加成 -= player.本命灵器.爆伤加成;
                    player.生命加成 -= player.本命灵器.生命加成;
                    player.闪避加成 -= player.本命灵器.闪避加成;
                    player.本命灵器 = lingqi;
                    player.攻击加成 += lingqi.攻击加成;
                    player.防御加成 += lingqi.防御加成;
                    player.暴击加成 += lingqi.暴击加成;
                    player.爆伤加成 += lingqi.爆伤加成;
                    player.生命加成 += lingqi.生命加成;
                    player.闪避加成 += lingqi.闪避加成;
                }
            }else if(thing_name == "长生散"){
                player.当前生命 = await Add_生命(usr_qq,daoju_shezhi.thing[thing_name] * num);
                msg.push(`目前的生命值是${player.当前生命}`)
            }else{
                 return e.reply(`道具目前没有设置可使用的处理代码`);
            }
            if(thing.type == "功法")thing.type ="已学习功法";
            await Promise.all([
                Add_bag_thing(usr_qq, thing.name, -num, thing),
                Write_player(usr_qq, player,false,false,false),
            ]); 
            return e.reply(msg.join(''));
    }
    
    }
  