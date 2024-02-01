import { APlugin ,AMessage,findIndexByName,Strand,getNonZeroKeys,startstatus,stopstatus,gettupo,getstring,checkZeroValue,checkAllZeroValues,
  checkNameExists,Add_bag_thing, player_zhandou,determineWinner,getB_qq,createPlayerObject, 
  oImages} from "../../api";
  import { create_player,existplayer,Read_player,Write_player,武者境界, 灵魂境界,体魄境界,user_id,finduid} from '../../model/gameapi';
export class dajie extends APlugin  {
	constructor() {
		super({
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
        }
			],
		});
	}
    async jie(e:AMessage):Promise<boolean> {
        const usr_qq = e.user_id;
        if (!await existplayer(1, usr_qq)) return false;
        const [user_id] = e.msg.replace(/(\/|#)?打劫/, "").trim().split("*").map(code => code.trim());
        let B_id:any = e.at_user;
        if (!B_id) {
          if (!user_id) return e.reply('请先@对方');
          else B_id = { id: user_id };
        }
        let B_player_results:any = await Read_player(1,B_id.id);
        if(!B_player_results) return false;
        let B_player = B_player_results.player;
        if(B_player.当前生命 < 50)return e.reply(`${B_id.name || B_id.id}先去治疗吧`);
        let results = await Read_player(1,usr_qq)
        let player = results.player;
        if (player.当前生命 < 50) return e.reply(`先去治疗吧`);
        const A_player = await createPlayerObject(player);
        const BB_player = await createPlayerObject(B_player);
        let msg = await player_zhandou(A_player, BB_player);
        let name = msg.winner;
        let temp = msg.result;
        if (name === player.name) {
          const money = Math.round(B_player.金钱 * 0.25);
          temp.push(`打劫成功,获得${money}`);
          player.金钱 += money;
          B_player.金钱 -= money;
        }
        if(msg.B_damage) B_player.当前生命 -= Number(msg.B_damage);
        if(msg.A_damage) player.当前生命 -= Number(msg.A_damage);
        await Write_player(usr_qq,player,false,false,false);
        await Write_player(String(B_id.id),player,false,false,false);
        let get_data = { temp };
        const img = await oImages('/resources/html/msg/msg.html',get_data)
        if(img) e.reply(img);
        return false;
      }
      
      async bidou(e:AMessage):Promise<boolean> {
        const usr_qq = e.user_id;
        if (!await existplayer(1, usr_qq)) return false;
        const [user_id] = e.msg.replace(/(\/|#)比斗/, "").trim().split("*").map(code => code.trim());
        let B_id:any = e.at_user;
        if (!B_id) {
          if (!user_id) return e.reply('请先@对方');
          else B_id = { id: user_id };
        }
        let B_player_results:any = await Read_player(1,B_id.id);
        if(!B_player_results) return false;
        let B_player = B_player_results.player;
        let results = await Read_player(1,usr_qq)
        let player = results.player;
        if (player.当前生命 < 50) return e.reply(`先去治疗吧`);
        const A_player = await createPlayerObject(player);
        const BB_player = await createPlayerObject(B_player);
        let msg = await player_zhandou(A_player, BB_player);
        let temp = msg.result;
        player.灵气 += 50;
        player.体魄力量 += 100;
        B_player.灵气 += 50;
        B_player.体魄力量 += 100;
        B_player.当前生命 -= Number(msg.A_damage) || 0;
        player.当前生命 -= Number(msg.B_damage) || 0;
        await Write_player(usr_qq,player,false,false,false);
        await Write_player(String(B_id),player,false,false,false);
        let get_data = { temp };
        const img = await oImages('/resources/html/msg/msg.html',get_data)
        if(img) e.reply(img);
        return false;
      }
      
     


}
 