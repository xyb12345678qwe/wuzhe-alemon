import { Show,plugin,AMessage, existplayer,Read_player,Write_player,Write_playerData,getlingqi,isNotNull,pic ,findIndexByName,Strand,getNonZeroKeys,startstatus,stopstatus,gettupo,getstring,checkZeroValue,checkAllZeroValues,
  checkNameExists,player_zhanli,Add_bag_thing, player_zhandou,determineWinner,getB_qq,createPlayerObject } from "../../api";
export class dajie extends plugin {
	constructor() {
		super({
			/** 功能名称 */
			name: 'dajie',
			/** 功能描述 */
			dsc: '基础模块',
			event: 'message',
			/** 优先级，数字越小等级越高 */
			priority: 600,
			rule: [
				{
					reg: /^(#|\/)打劫.*$/,
					fnc: 'jie',
        },
        {
					reg: /^(#|\/)比斗.*$/,
					fnc: 'bidou',
        },
        {
					reg: /^(#|\/)at.*$/,
					fnc: 'at',
        },
			],
		});
	}
    async jie(e:AMessage):Promise<boolean> {
        const usr_qq = e.user_id;
        console.log(usr_qq);
        if (!await existplayer(1, usr_qq, 'player')) return false;
      
        let B_player = await getB_qq(e, "player");
        if (!B_player) return false;
      
        let player = await Read_player(1,true, usr_qq, "player");
        if (player.当前生命 < 50) return e.reply(`先去治疗吧`);
      
        const A_player = await createPlayerObject(player);
        const BB_player = await createPlayerObject(B_player);
      
        let msg = await player_zhandou(A_player, BB_player);
        let name = await determineWinner(msg.result, player.name, B_player.name);
      
        let temp = msg.result;
        console.log(temp);
      
        if (name === player.name) {
          const money = player.金钱 * 0.9;
          temp.push(`打劫成功,获得${money}`);
          player.金钱 += money;
          B_player.金钱 -= money;
        }
      
        player.当前生命 -= msg.A_damage;
        B_player.当前生命 -= msg.B_damage;
      
        await Write_player(1,true, usr_qq, player, "player");
        await Write_player(1,true, B_player.id, B_player, "player");
      
        let get_data = { temp };
        await pic(e, get_data, `get_msg`);
        return false;
      }
      async at(e:AMessage):Promise<boolean>{
        const at = e.at_user
        console.log(at);
        if(!at) return false;
        e.reply(at.id)
        return false;
      }
      async bidou(e:AMessage):Promise<boolean> {
        const usr_qq = e.user_id;
        if (!await existplayer(1, usr_qq, 'player')) return false;
        let B_player = await getB_qq(e, "player");
        if (!B_player) return false;
        let player = await Read_player(1,true, usr_qq, "player");
        if (player.当前生命 < 50) return e.reply(`先去治疗吧`);
        const A_player = await createPlayerObject(player);
        const BB_player = await createPlayerObject(B_player);
        let msg = await player_zhandou(A_player, BB_player);
        let name = await determineWinner(msg.result, player.name, B_player.name);
        let temp = msg.result;
        console.log(temp);
        player.灵气 += 50;
        player.体魄力量 += 100;
        B_player.灵气 += 50;
        B_player.体魄力量 += 100;
        B_player.当前生命 -= msg.B_damage;
        player.当前生命 -= msg.A_damage;
      
        await Write_player(1,true, usr_qq, player, "player");
        await Write_player(1,true, B_player.id, B_player, "player");
        let get_data = { temp };
        await pic(e, get_data, `get_msg`);
        return false;
      }
      
     


}
 