import { existplayer,Read_player,Write_player,Write_playerData,getlingqi,isNotNull,pic ,findIndexByName,Strand,getNonZeroKeys,startstatus,stopstatus,gettupo,getstring,checkZeroValue,checkAllZeroValues,
    checkNameExists,player_zhanli,Add_bag_thing, player_zhandou,determineWinner,_item} from "../../model/wuzhe.js";
import {plugin,AMessage } from '../../app-config.js'
export class liesha extends plugin {
	constructor() {
		super({
			/** 功能名称 */
			name: 'liesha',
			/** 功能描述 */
			dsc: '基础模块',
			event: 'message',
			/** 优先级，数字越小等级越高 */
			priority: 600,
			rule: [
				{
					reg: /^(#|\/)猎妖信息$/,
					fnc: 'x',
                },
                {
					reg: /^(#|\/)前往猎妖.*$/,
					fnc: 'qw',
                },
                {
					reg: /^(#|\/)结算.*$/,
					fnc: 'xx',
                },
                {
					reg: /^(#|\/)可结算信息.*$/,
					fnc: 'xxx',
                },
			],
		});
	}
    async xxx(e:AMessage):Promise<boolean>{
        return e.reply(`1.猎妖`)
    }
    async x(e:AMessage):Promise<boolean>{
        let x = await _item(1,'猎杀妖兽地点')
        let get_data={x}
        await pic(e,get_data,`get_lieyao`)
        return false;
    }
    async qw(e:AMessage):Promise<boolean>{
        const usr_qq = e.user_id;
        if (!await existplayer(1, usr_qq, 'player')) return false;
        const name = e.msg.replace(/(\/|#)前往猎妖/, "").trim();
        let status = await Read_player(1,usr_qq,"status");
        let player = await Read_player(1,usr_qq,"player");
        const xxx = await getNonZeroKeys(status);
        if(xxx!== false)return e.reply(`你正在${xxx}中`);
        let x = await _item(1,'猎杀妖兽地点')
        x =x.find(item => item.name === name);
        if(!x)return e.reply(`没有这个妖兽`);
        if(await getstring(player.武者境界,"F阶")) return e.reply(`才f阶就来猎杀妖兽？`);
        if(player.当前血量 < 50) return e.reply(`残了，残了，大残！快去治疗`)
        const now = Date.now();
        status.猎妖 = now;
        player.猎妖目标 = name;
        await Write_playerData(usr_qq,player,"无","无",status,"无","无")
        return e.reply(`开始猎杀妖兽,5分钟后归来`);
    }
    async xx(e:AMessage):Promise<boolean>{
        const usr_qq = e.user_id;
        if (!await existplayer(1, usr_qq, 'player')) return false;
        let status = await Read_player(1,usr_qq,"status");
        let player = await Read_player(1,usr_qq,"player");
        const name = e.msg.replace(/(\/|#)结算/, "").trim();
        if(!await checkNameExists(name,status)) return e.reply(`没有这个状态`);
        if(status[name] === 0) return e.reply(`你不在这个状态`);
        const now = Date.now();
        const time = now - status[name];
        if(player.猎妖目标 === "无") {e.reply(`出现错误,存档力的猎妖目标为无，自动设置为金钱豹`); player.猎妖目标 ="金钱豹" }
        let B_player = await _item(1,'猎杀妖兽地点')
        B_player =B_player.find(item => item.name === player.猎妖目标);
        if(name === "猎妖"){
            if(time < 5*60*1000) return e.reply(`时间未到`);
            const A_player={
                name: player.name,
                暴击加成: player.暴击加成,
                爆伤加成: player.爆伤加成,
                攻击加成:player.攻击加成,
                闪避加成:player.闪避加成,
                防御加成:player.防御加成,
                当前生命:player.当前生命,
            }
            const BB_player ={
                name: B_player.name,
                暴击加成: B_player.暴击加成,
                爆伤加成: B_player.爆伤加成,
                攻击加成:B_player.攻击加成,
                闪避加成:B_player.闪避加成,
                防御加成:B_player.防御加成,
                当前生命:B_player.生命加成,
            }
            let msg = await player_zhandou(A_player,BB_player);
            let name =await determineWinner(msg.result,player.name,B_player.name)
            console.log(msg.result);
            let replyMsg;
            if (name === player.name) {
                const randomIndex = Math.floor(Math.random() * B_player.掉落物.length);
                const x = B_player.掉落物[randomIndex];
                await Add_bag_thing(usr_qq, x, 1);
                player.当前生命 -= msg.A_damage;
                replyMsg = `恭喜你打赢了${B_player.name}，获得${x}*1`;
              } else {
                player.当前生命 -= msg.A_damage;
                replyMsg = `恭喜你没打赢了${B_player.name}，获得空气*1`;
              }
              status.猎妖 = 0;
              player.猎妖目标 = "无";
              await Write_playerData(usr_qq, player, "无", "无", status,"无","无");
              return e.reply(replyMsg)
        }
        return false;
    }
}   


