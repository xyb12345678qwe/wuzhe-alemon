import {APlugin ,AMessage ,findIndexByName,Strand,getNonZeroKeys,startstatus,stopstatus,gettupo,getstring,checkZeroValue,checkAllZeroValues,
    checkNameExists,Add_bag_thing, player_zhandou,determineWinner,Read_json, getUserStatus, getString2, oImages} from '../../api'
import { getTizhi,create_player,existplayer,Read_player,Write_player,武者境界, 灵魂境界,体魄境界,user_id,finduid,体质} from '../../model/gameapi';
export class tizhi extends APlugin  {
	constructor() {
		super({
			dsc: '基础模块',
			event: 'message',
			/** 优先级，数字越小等级越高 */
			priority: 600,
			rule: [
				{
					reg: /^(#|\/)?进入体质觉醒池$/,
					fnc: 'enter',
                },
				{
					reg: /^(#|\/)?强化体质$/,
					fnc: '强化',
                },
			],
		});
	}
    async enter(e:AMessage){
        const usr_qq = e.user_id;
        if (!await existplayer(1,usr_qq)) return false;
        let results = await Read_player(1,usr_qq)
        let player = results.player;
        if(!player.体质) player.体质 ="无"
		if(player.体质 != "无") return e.reply(`已觉醒过体质`)
        if(player.金钱 < 100000) return e.reply(`连十万元都没有，还好意思来觉醒体质，哪来的回哪去`)
        e.reply(`开始觉醒体质`);
        let tizhi = await getTizhi(e);
		player.金钱 -= 100000;
        player.体质 = tizhi;
		player.修炼加成 += tizhi?.修炼加成;
		player.暴击加成 += tizhi?.暴击加成;
		player.爆伤加成 += tizhi?.爆伤加成;
		player.防御加成 += tizhi?.防御加成;
		player.生命加成 += tizhi?.生命加成;
		player.生命上限 += tizhi?.生命加成;
        await Write_player(usr_qq,player,false,false,false);
        return;
    }
	async 强化(e:AMessage){
		const usr_qq = e.user_id;
        if (!await existplayer(1,usr_qq)) return false;
        let results = await Read_player(1,usr_qq)
        let player = results.player;
		if(player.体质.name == "不朽体质") return e.reply(`此体质无法升级`)
		if(player.体质.等级 == 20) return e.reply(`已到达最高等级`)
		const exp = player.体质.等级*1000;
		const exp_tizhi = {
			低级体质: 2,
			中级体质: 3,
			高级体质: 5,
			天级体质: 8,
			圣级体质: 11,
			神级体质: 15
		}
		if(player.体质.exp < exp) return e.reply(`经验不足,还差${exp - player.体质.exp}`);
		player.体质.等级 += 1;
		player.修炼加成 += 0.02 * player.体质.等级 *exp_tizhi[player.体质.type]
		player.暴击加成 += 0.01 * player.体质.等级 *exp_tizhi[player.体质.type]
		player.爆伤加成 += 0.02 * player.体质.等级 *exp_tizhi[player.体质.type]
		player.防御加成 += 75 * player.体质.等级 *exp_tizhi[player.体质.type]
		player.生命加成 += 100 * player.体质.等级 *exp_tizhi[player.体质.type]
		player.生命上限 += 100 * player.体质.等级 *exp_tizhi[player.体质.type]
		await Write_player(usr_qq,player,false, false, false);
		return e.reply(`强化完成，目前等级${player.体质.等级}`)
	}
}