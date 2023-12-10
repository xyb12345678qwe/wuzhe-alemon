import {plugin,AMessage ,existplayer,Read_player,Write_player,Write_playerData,getlingqi,isNotNull,pic ,findIndexByName,Strand,getNonZeroKeys,startstatus,stopstatus,gettupo,getstring,checkZeroValue,checkAllZeroValues,
    checkNameExists,player_zhanli,Add_bag_thing, player_zhandou,determineWinner,_item, Read_json, getUserStatus, Read_playerData, getstring2, oImages} from '../../api'
export class caiyao extends plugin {
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
        if (!await existplayer(1, usr_qq, 'player')) return false;
        let results = await Read_playerData(usr_qq,true,false,false,true,true)
        let status = results.status;
        let player = results.player;
        const activeStatus = await getNonZeroKeys(status);
        if(activeStatus) return e.reply(`你在${activeStatus}中`)
        status.采药 = now;
        await Write_playerData(usr_qq,player,"无","无",status,"无","无",true)
        return e.reply(`开始采药`)
    }
}