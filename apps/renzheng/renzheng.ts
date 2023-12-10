import { Show,plugin,AMessage,existplayer,Read_player,Write_player,Write_playerData,getlingqi,isNotNull,pic ,findIndexByName,Strand,getNonZeroKeys,startstatus,stopstatus,gettupo,getstring,checkZeroValue,checkAllZeroValues,
    checkNameExists,player_zhanli,Add_bag_thing, player_zhandou,determineWinner,getB_qq,createPlayerObject,_item, Read_json } from "../../api";
export class renzheng extends plugin {
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
          if (!await existplayer(1, usr_qq, 'player')) return false;
          let player = await Read_player(1,true, usr_qq, "player");
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
          await Write_player(1,true,usr_qq,player,"player");
          return true;
    }
}
export const config = {
        attackBonus: 200,
        defenseBonus: 200,
        criticalBonus: 0.1,
        damageBonus: 0.09,
        healthBonus: 100,
        dodgeBonus: 0.01,
        currentHealth: 1000
};
export const createCertificationRobot = (num) => ({
        name: num +'_认证机器人',
        攻击加成: config.attackBonus * num,
        防御加成: config.defenseBonus * num,
        暴击加成: config.criticalBonus * num,
        爆伤加成: config.damageBonus * num,
        生命加成: config.healthBonus * num,
        闪避加成: config.dodgeBonus * num,
        当前生命: config.currentHealth * num,
});
export const handleBattle = async (player, robot) => {
        const msg = await player_zhandou(player, robot);
        console.log(player.name);
        const name = await determineWinner(msg.result, player.name, robot.name);
        return { name, damage: msg.A_damage };
};