import {APlugin ,AMessage,pic ,findIndexByName,Strand,getNonZeroKeys,startstatus,stopstatus,gettupo,getstring,checkZeroValue,checkAllZeroValues,
    checkNameExists,player_zhanli,Add_bag_thing, player_zhandou,determineWinner,_item, Read_json, getUserStatus, getString2, oImages, 技能栏} from '../../api'
import { getlingqi,create_player,existplayer,Read_player,Write_player,武者境界, 灵魂境界,体魄境界,user_id,finduid} from '../../model/gameapi';
export class jineng extends APlugin  {
	constructor() {
		super({
			/** 功能名称 */
			name: 'jineng',
			/** 功能描述 */
			dsc: '基础模块',
			event: 'message',
			/** 优先级，数字越小等级越高 */
			priority: 600,
			rule: [
				{
					reg: /^(#|\/)?配置技能栏.*$/,
					fnc: 'peizhi',
                },
                {
					reg: /^(#|\/)?查看技能栏.*$/,
					fnc: 'check',
                },
			],
		});
	}
    async peizhi(e:AMessage){
        const usr_qq = e.user_id;
        if (!await existplayer(1, usr_qq)) return false;
        let results = await Read_player(1,usr_qq)
        let player = results.player;
        let bag = results.bag;
        await 技能栏(player)
        const [thing_name,gongfa_name] = e.msg.replace(/(\/|#)?配置技能栏/, "").trim().split("*").map(code => code.trim());
        console.log(thing_name);
        if(!player.技能栏[thing_name]) return e.reply(`没有此技能栏`);
        const bag_thing = bag.已学习功法.find(item => item.name == gongfa_name);
        if(!bag_thing) return e.reply(`你尚未学习此功法`);
        player.技能栏[thing_name] = gongfa_name;
        e.reply(`配置成功,${thing_name}配置为${gongfa_name}`);
        await Write_player(usr_qq,player,false,false,false);
        return;
    }
    async check(e:AMessage){
        const usr_qq = e.user_id;
        if (!await existplayer(1, usr_qq)) return false;
        const results = await Read_player(1,usr_qq);
        let player = results.player;
        await 技能栏(player);
        console.log(player.技能栏);
        let replyMessage = '';
            for (const [key, value] of Object.entries(player.技能栏)) {
            replyMessage += `${key}: ${value}
            `;
            }
        await Write_player(usr_qq,player,false,false,false);
        return e.reply(replyMessage);  
    }
}
