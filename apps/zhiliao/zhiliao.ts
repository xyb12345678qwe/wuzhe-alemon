import {APlugin ,AMessage,AEvent ,findIndexByName,Strand,getNonZeroKeys,startstatus,stopstatus,gettupo,getstring,checkZeroValue,checkAllZeroValues,
    checkNameExists,Add_bag_thing, player_zhandou,determineWinner,getB_qq,createPlayerObject,getCurrentTime, Add_生命 } from '../../api'
import { create_player,existplayer,Read_player,Write_player,武者境界, 灵魂境界,体魄境界,user_id,finduid,妖兽地点,功法列表, 道具列表, 丹方,猎杀妖兽地点} from '../../model/gameapi';
export class zhiliao extends APlugin  {
	constructor() {
		super({
			dsc: '基础模块',
			event: 'message',
			/** 优先级，数字越小等级越高 */
			priority: 600,
			rule: [
				{
					reg: /^(#|\/)治疗伤势$/,
					fnc: 'x',
                },
				{
					reg: /^(#|\/)血量纠正$/,
					fnc: 'correct',
                },
			],
		});
	}
	async correct(e:AEvent){
		const usr_qq = e.user_id;
        if (!await existplayer(1, usr_qq)) return false;
		const results = await Read_player(1,usr_qq);
        let player = results.player;
		player.当前生命 = 0;
		await Write_player(usr_qq,player,false,false,false);
		e.reply(`纠正成功`);
	}
    async x(e:AEvent):Promise<boolean>{
        const usr_qq = e.user_id;
        if (!await existplayer(1, usr_qq)) return false;
		const results = await Read_player(1,usr_qq);
        let player = results.player;
        if(player.当前生命 === player.生命上限)return e.reply(`目前生命不需要治疗`);
        // if(player.金钱 <= 100000)return e.reply(`目前只有${player.金钱},还差${100000 - player.金钱}`);
		let money:number;
		if(player.生命上限 < 5000) money = 2000;
		else if(player.生命上限 < 18000) money = 10000;
		else if(player.生命上限 < 28000) money = 20000;
		else if(player.生命上限 < 48000) money = 30000;
		else if(player.生命上限 < 48000) money = 40000;
		else if(player.生命上限 < 58000) money = 50000;
		else if(player.生命上限 < 68000) money = 60000;
		else if(player.生命上限 < 78000) money = 70000;
		else if(player.生命上限 < 88000) money = 80000;
		else if(player.生命上限 < 98000) money = 90000;
		else if(player.生命上限 < 100000) money = 100000;
		else money = 200000;
		if(player.金钱 <= money)return e.reply(`目前只有${player.金钱},还差${money - player.金钱}`);
		player.当前生命 = player.生命上限;
        player.金钱 -= money;
        await Write_player(usr_qq,player,false,false,false);
        return e.reply(`治疗成功`);
    }

}