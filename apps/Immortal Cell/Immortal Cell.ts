import {APlugin ,AMessage,findIndexByName,Strand,getNonZeroKeys,startstatus,stopstatus,gettupo,getstring,checkZeroValue,checkAllZeroValues,
    checkNameExists,Add_bag_thing, player_zhandou,determineWinner, Read_json, getUserStatus, getString2, oImages,getCacheData,equiment_type as type,filter_equiment,
    findThings,
    AEvent} from '../../api'
import {existplayer,Read_player,Write_player,武者境界, 灵魂境界,体魄境界,finduid,装备列表,transaction_record,findTransaction, updateTransaction,auction_record} from '../../model/gameapi';

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
        if(player.不朽细胞 > 1000) return e.reply(`你已到达满级`);
        if(player.不朽细胞 + num > 1000) return e.reply(`不朽细胞数 + 你要升级的数大于了1000`);
        let 数值:number = 100000;
        player.体魄力量 -= 1000000*num;
        player.不朽细胞 +=  num;
        if(player.不朽细胞 == 1000){
            player.体质.name = "不朽体质";
            player.体质.type = "无上体质"
            数值 = 150000
        }
        let type = ["攻击加成","防御加成","生命加成"]
        type.forEach(item =>{
            player[item] += 数值 * num;
        })
        player.生命上限 += 数值 *num;
        player.当前生命 = player.生命上限;
        e.reply(`成功塑造${num}个不朽细胞`);
        await Write_player(usr_qq,player);
    }


}