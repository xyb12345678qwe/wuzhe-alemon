import { Show,APlugin ,AMessage ,findIndexByName,Strand,getNonZeroKeys,startstatus,stopstatus,gettupo,getstring,checkZeroValue,checkAllZeroValues,
    checkNameExists,player_zhanli,Add_bag_thing, player_zhandou,determineWinner,getB_qq,createPlayerObject, Read_json,createCertificationRobot, handleBattle } from "../../api";
import { create_player,existplayer,Read_player,Write_player,武者境界, 灵魂境界,体魄境界,user_id,finduid,妖兽地点,功法列表, 道具列表, 丹方,猎杀妖兽地点} from '../../model/gameapi';
export class renzheng extends APlugin  {
	constructor() {
		super({
			/** 功能名称 */
			name: 'renzheng',
			/** 功能描述 */
			dsc: '基础模块',
			event: 'message',
			/** 优先级，数字越小等级越高 */
			priority: 600,
			rule: [
				{
					reg: /^(#|\/)?开启武者认证$/,
					fnc: 'renzheng',
                },
			],
		});
	}
    async renzheng(e:AMessage):Promise<boolean>{
          const usr_qq = e.user_id;
          if (!await existplayer(1, usr_qq)) return false;
          const results = await Read_player(1,usr_qq);
          let player = results.player;
          if (player.当前生命 < 50) return e.reply(`先去治疗吧`);
          if(!player.武者认证)player.武者认证 = "无";
          let num = player.武者认证 != "无" ? player.武者认证.replace("级武者认证", "") : 1;
          let robot = createCertificationRobot(num);
          let result = await handleBattle(player, robot);
          console.log(result.name);
          if (result.name == player.name) e.reply(`打败${robot.name},获得${num}级武者认证`);
          if(!result.name) e.reply(`打败${robot.name},获得${num}级武者认证`);
          if(result.name == robot.name) e.reply(`没有打败${robot.name}`)
          player.武者认证 = num + "级武者认证";
          player.当前生命 -= result.damage;
          await Write_player(usr_qq,player,false,false,false);
          return true;
    }
}
