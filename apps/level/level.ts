import { existplayer,Read_player,Write_player,Write_playerData,getlingqi,isNotNull,pic ,findIndexByName,Strand,getNonZeroKeys,startstatus,stopstatus,gettupo} from "../../model/wuzhe.js";
import { plugin,AMessage } from "../../app-config.js";
export class level extends plugin {
	constructor() {
		super({
			/** 功能名称 */
			name: 'level',
			/** 功能描述 */
			dsc: '基础模块',
			event: 'message',
			/** 优先级，数字越小等级越高 */
			priority: 600,
			rule: [
				{
					reg: /^(#|\/)开始修炼$/,
					fnc: 'x',
                },
                {
					reg: /^(#|\/)结束修炼$/,
					fnc: 'stop1',
                },
                {
					reg: /^(#|\/)开始锻炼体魄$/,
					fnc: 'd',
                },
                {
					reg: /^(#|\/)结束锻炼体魄$/,
					fnc: 'stop2',
                },
                {
					reg: /^(#|\/)开始修炼灵魂$/,
					fnc: 'l',
                },
                {
					reg: /^(#|\/)结束修炼灵魂$/,
					fnc: 'stop3',
                },
                {
					reg: /^(#|\/)修为突破$/,
					fnc: 'po1',
                },
                {
					reg: /^(#|\/)体魄突破$/,
					fnc: 'po2',
                },
                {
					reg: /^(#|\/)灵魂突破$/,
					fnc: 'po3',
                }
			],
		});
	}
    async po3(e:AMessage):Promise<boolean>{
        await gettupo(e,"灵魂境界","灵魂境界","灵魂力量");
        return false;
    }
    async po2(e:AMessage):Promise<boolean>{
        await gettupo(e,"体魄境界","体魄境界","体魄力量");
        return false;
    }
    async po1(e:AMessage):Promise<boolean>{
        await gettupo(e,"武者境界","武者境界","灵气");
        return false;
    }
    async x(e:AMessage):Promise<boolean>{
        await startstatus(e,`修炼`,`修炼`);
        return false;
    }
    async stop1(e:AMessage):Promise<boolean>{
        await stopstatus(e,`修炼`,`灵气`,`灵气`,0.4);
        return false;
    }
    async d(e:AMessage):Promise<boolean>{
        await startstatus(e,`锻炼`,`锻炼体魄`);
        return false;
    }
    async stop2(e:AMessage):Promise<boolean>{
        await stopstatus(e,`锻炼`,`体魄力量`,`体魄力量`,0.4);
        return false;
    }
    async l(e:AMessage):Promise<boolean>{
        await startstatus(e,`修炼灵魂`,`修炼灵魂`);
        return false;
    }
    async stop3(e:AMessage):Promise<boolean>{
        await stopstatus(e,`修炼灵魂`,`灵魂力量`,`灵魂力量`,0.2);
        return false;
    }
}
