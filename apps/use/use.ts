import { plugin,AMessage,existplayer,Read_player,Write_player,Write_playerData,getlingqi,isNotNull,pic ,findIndexByName,Strand,getNonZeroKeys,startstatus,stopstatus,gettupo,getstring,checkZeroValue,checkAllZeroValues,
    checkNameExists,player_zhanli,Add_bag_thing, player_zhandou,determineWinner,getB_qq,createPlayerObject,_item,Read_json_path,oImages,getidlist,Read_player2,allzongmen,Read_json,Write_json} from "../../api";
export class use extends plugin {
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
            const playerExists = await existplayer(1, usr_qq, 'player');
            const [thing_name, num] = e.msg.replace(/(\/|#)?使用/, "").trim().split("*").map(code => code.trim());
            if (!playerExists || !thing_name || !num) return false;
            let [player, bag, daoju_list, thing] = await Promise.all([
                Read_player(1,true, usr_qq, "player"),
                Read_player(1,true, usr_qq, "bag"),
                _item(1, "道具列表"),
                _item(1, "道具列表").then(daoju_list => daoju_list.find(item => item.name === thing_name)),
            ]);
            let bag_thing = await Read_player(1,true, usr_qq, "bag").then(bag => bag[thing.type].find(item => item.name === thing_name))
            if (!thing || !thing.能否消耗) return e.reply(`此物品不能使用`);
            if (!bag_thing) return e.reply(`你没有这个物品`);
            if (bag_thing.数量 < num) return e.reply(`数量不足,还差${Number(num) - bag_thing.数量}`);
            let msg = [`使用成功`];
            if (thing_name.includes(`灵器经验石`)) {
                let shezhi = await Read_json(2);
                const list = shezhi.find(item => item.type == "道具类");
                const exp = list.thing[thing_name] * Number(num)
                if (!exp) return e.reply(`数值暂未设置`)
                player.本命灵器.exp += exp;
                msg.push(`灵器经验增加${exp},目前经验${player.本命灵器.exp}`);
            }
            if (msg.length === 1) return e.reply(`道具目前没有设置可使用的处理代码`);
            console.log(thing);
            console.log(thing_name);
            await Promise.all([
                Add_bag_thing(usr_qq, thing_name, -num, thing),
                Write_player(1,true, usr_qq, player, "player"),
                Write_player(1,true, usr_qq, bag, "bag")
            ]); 
            return e.reply(msg.join(''));
    }
    
    }