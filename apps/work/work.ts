import {APlugin ,AMessage,findIndexByName,Strand,getNonZeroKeys,startstatus,stopstatus,msToTime, getUserStatus,getstring } from '../../api'
import { create_player,existplayer,Read_player,Write_player,武者境界, 灵魂境界,体魄境界,user_id,finduid,妖兽地点,功法列表, 道具列表, 丹方,猎杀妖兽地点} from '../../model/gameapi';
export class work extends APlugin  {
	constructor() {
		super({
			/** 功能描述 */
			dsc: '基础模块',
			event: 'message',
			/** 优先级，数字越小等级越高 */
			priority: 600,
			rule: [
                {
					reg: /^(#|\/)当前状态$/,
					fnc: 'dq',
                },
				{
					reg: /^(#|\/)开始打工$/,
					fnc: 'd',
                },
                {
					reg: /^(#|\/)结束打工$/,
					fnc: 'stop',
                },
                {
					reg: /^(#|\/)开始猎杀妖兽$/,
					fnc: 'sha',
                },
                {
					reg: /^(#|\/)结束猎杀妖兽$/,
					fnc: 'stop2',
                }
			],
		});
	}
    async sha(e:AMessage):Promise<boolean>{
        const results = await getUserStatus(e)
        if(!results) return false;
        let player = results.player
        if(await getstring(player.武者境界,"F阶")) return e.reply(`才f阶就来猎杀妖兽？`);
        await startstatus(e,"猎杀妖兽","猎杀妖兽")
        return false;
    }
    async stop2(e:AMessage):Promise<boolean>{
        // let player = await getUserStatus(e,"player")
        // const now = Date.now();
        // let status = await getUserStatus(e,"status");
        // if(status.猎杀妖兽=== 0)return e.reply(`你没在猎杀妖兽`)
        // const time = (now - status.猎杀妖兽)/1000/60
        // let x;
        // if(await getstring(player.武者境界,"E阶")) x=0.9;
        // if(await getstring(player.武者境界,"D阶")) x =1.15;
        // if(await getstring(player.武者境界,"C阶")) x =1.35;
        // if(await getstring(player.武者境界,"B阶")) x =1.65;
        // if(await getstring(player.武者境界,"A阶")) x =1.9;
        // const money = Math.floor(time * x);
        // const xiuwei = Math.floor(time * 0.3);
        // const tipo = Math.floor(time * 0.35);
        // player.体魄力量 = tipo;
        // player.灵气 +=xiuwei;
        // player.金钱 +=money;
        // status.猎杀妖兽 = 0;
        // await Write_playerData(e.user_id,player,"无","无",status,"无","无",true)
        // return e.reply(`结束成功，获得金钱${money}元,修为${xiuwei}体魄力量${tipo}`);
        return e.reply(`此功能已废弃，请使用结束状态`)
    }
    async dq(e:AMessage):Promise<boolean>{
        const now = Date.now();
        const results = await getUserStatus(e)
        if(!results) return false;
        let status = results.status;
        const x= await getNonZeroKeys(status)
        if(x !==false) return e.reply(`正在${x}中,已过${await msToTime(now - status[x])}`)
        return e.reply(`空闲中`) 
    }
    async d(e:AMessage):Promise<boolean>{
        await startstatus(e,`打工`,`打工`);
        return false;
    }
   async stop(e:AMessage):Promise<boolean>{
     return e.reply(`此功能已废弃，请使用结束状态`)
   }
}
        