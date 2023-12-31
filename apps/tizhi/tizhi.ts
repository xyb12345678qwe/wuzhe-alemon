import {APlugin ,AMessage,isNotNull,pic ,findIndexByName,Strand,getNonZeroKeys,startstatus,stopstatus,gettupo,getstring,checkZeroValue,checkAllZeroValues,
    checkNameExists,player_zhanli,Add_bag_thing, player_zhandou,determineWinner,_item, Read_json, getUserStatus, getString2, oImages} from '../../api'
import { getlingqi,create_player,existplayer,Read_player,Write_player,武者境界, 灵魂境界,体魄境界,user_id,finduid,体质,gettizhi} from '../../model/gameapi';
export class tizhi extends APlugin  {
	constructor() {
		super({
			/** 功能名称 */
			name: 'tizhi',
			/** 功能描述 */
			dsc: '基础模块',
			event: 'message',
			/** 优先级，数字越小等级越高 */
			priority: 600,
			rule: [
				{
					reg: /^(#|\/)?进入体质觉醒池$/,
					fnc: 'enter',
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
        if(player.金钱 < 100000) return e.reply(`连十万元都没有，还好意思来觉醒体质，哪来的回哪去`)
        e.reply(`开始觉醒体质`);
        let tizhi = await gettizhi(e);
        player.体质 = tizhi;
        await Write_player(usr_qq,player,false,false,false)
        return;
    }
}