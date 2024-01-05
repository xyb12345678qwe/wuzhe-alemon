import {APlugin ,AMessage ,findIndexByName,Strand,getNonZeroKeys,startstatus,stopstatus,gettupo,getstring,checkZeroValue,checkAllZeroValues,
    checkNameExists,player_zhanli,Add_bag_thing, player_zhandou,determineWinner,getB_qq,createPlayerObject,getCurrentTime, Add_生命 } from '../../api'
import { create_player,existplayer,Read_player,Write_player,武者境界, 灵魂境界,体魄境界,user_id,finduid,妖兽地点,功法列表, 道具列表, 丹方,猎杀妖兽地点} from '../../model/gameapi';
export class zhiliao extends APlugin  {
	constructor() {
		super({
			/** 功能名称 */
			name: 'zhiliao',
			/** 功能描述 */
			dsc: '基础模块',
			event: 'message',
			/** 优先级，数字越小等级越高 */
			priority: 600,
			rule: [
				{
					reg: /^(#|\/)治疗伤势$/,
					fnc: 'x',
                },
			],
		});
	}
    async x(e:AMessage):Promise<boolean>{
        const usr_qq = e.user_id;
        if (!await existplayer(1, usr_qq)) return false;
		const results = await Read_player(1,usr_qq);
        let player = results.player;
        if(player.当前生命 === player.生命上限)return e.reply(`目前生命不需要治疗`);
        if(player.金钱 <= 100000)return e.reply(`目前只有${player.金钱},还差${100000 - player.金钱}`);
		// await Add_生命(usr_qq,999999999999);
		player.当前生命 = player.生命上限;
        player.金钱 -= 100000;
        await Write_player(usr_qq,player,false,false,false);
        return e.reply(`治疗成功`);
    }

}