import {plugin,AMessage,base,existplayer,Read_player,Write_player,Write_playerData,getlingqi,isNotNull,pic ,findIndexByName,Strand,getNonZeroKeys,startstatus,stopstatus,gettupo,getstring,checkZeroValue,checkAllZeroValues,
    checkNameExists,player_zhanli,Add_bag_thing, player_zhandou,determineWinner,getB_qq,createPlayerObject,Write_list,getCurrentTime, Add_生命 } from '../../api'
export class zhiliao extends plugin {
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
        if (!await existplayer(1, usr_qq, 'player')) return false;
        let player = await Read_player(1,true,usr_qq,"player");
        if(player.当前生命 === player.生命上限)return e.reply(`目前生命不需要治疗`);
        if(player.金钱 <= 100000)return e.reply(`目前只有${player.金钱},还差${100000 - player.金钱}`);
        await Add_生命(usr_qq,999999999999);
        player.金钱 -= 100000;
        await Write_player(1,true,usr_qq,player,"player");
        return e.reply(`治疗成功`);
    }

}