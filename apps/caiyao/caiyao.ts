import {APlugin ,AMessage,pic ,findIndexByName,Strand,getNonZeroKeys,startstatus,stopstatus,gettupo,getstring,checkZeroValue,checkAllZeroValues,
    checkNameExists,player_zhanli,Add_bag_thing, player_zhandou,determineWinner,_item, Read_json, getUserStatus, getString2, oImages} from '../../api'
import { create_player,existplayer,Read_player,Write_player,武者境界, 灵魂境界,体魄境界,user_id,finduid} from '../../model/gameapi';
export class caiyao extends APlugin  {
	constructor() {
		super({
			/** 功能名称 */
			name: 'caiyao',
			/** 功能描述 */
			dsc: '基础模块',
			event: 'message',
			/** 优先级，数字越小等级越高 */
			priority: 600,
			rule: [
				{
					reg: /^(#|\/)?开始采药$/,
					fnc: 'caiyao',
                },
			],
		});
	}
    async caiyao(e:AMessage){
        const now = Date.now();
        const usr_qq = e.user_id;
        if (!await existplayer(1,usr_qq)) return false;
        let results = await Read_player(1,usr_qq)
        let status = results.status;
        let player = results.player;
        const activeStatus = await getNonZeroKeys(status);
        if(activeStatus) return e.reply(`你在${activeStatus}中`)
        status.采药 = now;
        await Write_player(usr_qq,player,false,false,status)
        return e.reply(`开始采药`)
    }
}