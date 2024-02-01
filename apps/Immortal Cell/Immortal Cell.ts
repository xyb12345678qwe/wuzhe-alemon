import {APlugin ,AMessage,findIndexByName,Strand,getNonZeroKeys,startstatus,stopstatus,gettupo,getstring,checkZeroValue,checkAllZeroValues,
    checkNameExists,Add_bag_thing, player_zhandou,determineWinner, Read_json, getUserStatus, getString2, oImages,getCacheData,equiment_type as type,filter_equiment,
    findThings,
    AEvent} from '../../api'
import {existplayer,Read_player,Write_player,武者境界, 灵魂境界,体魄境界,finduid,装备列表,transaction_record,findTransaction, updateTransaction,auction_record, all_zongmen} from '../../model/gameapi';

export class Immortal_Cells extends APlugin  {
	constructor() {
		super({
			dsc: '基础模块',
			event: 'message',
			priority: 600,
			rule: [
                {
					reg: /^(#|\/)?塑造不朽细胞.*$/,
					fnc: 'Shaping_Immortal_Cells',
                }, 
                {
					reg: /^(#|\/)?灌注灵器灵气.*$/,
					fnc: 'Shaping_Immortal_lingqi',
                }
			],
		});
	}
    async Shaping_Immortal_Cells(e:AEvent){
        const usr_qq = e.user_id;
        if (!await existplayer(1, usr_qq)) return false;
        let {player} = await Read_player(1,usr_qq);
        const [thing_num] = e.msg.replace(/(\/|#)?塑造不朽细胞/, "").trim().split("*").map(code => code.trim());
        let num = parseInt(thing_num);
        if(!num || num <=0) num = 1;
        if(player.体魄力量 < 1000000) return e.reply(`体魄力量不够,还需要${1000000 - player.体魄力量 }`);
        if(player.不朽细胞 == 1000) return e.reply(`你已到达满级`);
        if(player.不朽细胞 + num > 1000) return e.reply(`不朽细胞数 + 你要升级的数大于了1000`);
        let 数值:number = 100000;
        player.体魄力量 -= 1000000*num;
        player.不朽细胞 +=  num;
        e.reply(`成功塑造${num}个不朽细胞`);
        if(player.不朽细胞 == 1000){
            player.体质.name = "不朽体质";
            player.体质.type = "无上体质"
            数值 = 150000
            e.reply(`达到1000个不朽细胞，不朽体质觉醒`)
        }
        let type = ["攻击加成","防御加成","生命加成"]
        type.forEach(item =>{
            player[item] += 数值 * num;
        })
        player.生命上限 += 数值 *num;
        player.当前生命 = player.生命上限;
        await Write_player(usr_qq,player);
    }
    async Shaping_Immortal_lingqi(e:AEvent){
        const usr_qq = e.user_id;
        if (!await existplayer(1, usr_qq)) return false;
        const [thing_num] = e.msg.replace(/(\/|#)?灌注灵器灵气/, "").trim().split("*").map(code => code.trim());
        let num = parseInt(thing_num);
        if(!num || num <=0) num = 1;
        let {player} = await Read_player(1,usr_qq);
        let all_money = 1000000 *1000;
        let 数值 = 100000000;
        if(player.灵气 < num) return e.reply(`灵气不够,目前只有${player.灵气}`);
        if(player.不朽灵器 == all_money) return e.reply(`你已到达满级`);
        if(player.不朽灵器 + num > all_money) return e.reply(`灌注灵器的灵气 + 你要灌注灵器灵气数大于了${all_money}`);
        player.灵气 -= num;
        player.不朽灵器 +=  num;
        e.reply(`灌注成功`);
        if(player.不朽灵器 == all_money){
            player.本命灵器.name = "不朽灵器";
            player.本命灵器.品级 = "无上帝器"
            let type = ["攻击加成","防御加成","生命加成"]
            type.forEach(item =>{
                player[item] += 数值 * num;
            })
            player.生命上限 += 数值 *num;
            player.当前生命 = player.生命上限;
            e.reply(`灌注到达一定程度，不朽灵器觉醒`)
        }
        await Write_player(usr_qq,player);
    }

}