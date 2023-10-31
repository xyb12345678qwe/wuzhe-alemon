import { existplayer,Read_player,Write_player,Write_playerData,getlingqi,isNotNull,pic ,findIndexByName,Strand,getNonZeroKeys,startstatus,stopstatus,gettupo,getstring,checkZeroValue,checkAllZeroValues,
    checkNameExists,player_zhanli,Add_bag_thing, player_zhandou,determineWinner,getB_qq,createPlayerObject,_item} from "../../model/wuzhe.js";
import { Show,plugin,AMessage } from "../../app-config.js";
export class liandan extends plugin {
	constructor() {
		super({
			/** 功能名称 */
			name: 'liandan',
			/** 功能描述 */
			dsc: '基础模块',
			event: 'message',
			/** 优先级，数字越小等级越高 */
			priority: 600,
			rule: [
				{
					reg: /^(#|\/)炼丹.*$/,
					fnc: 'liandan',
                },
			],
		});
	}
    async liandan(e:AMessage):Promise<boolean>{
        const usr_qq = e.user_id;
        if (!await existplayer(1, usr_qq, 'player')) return false;
        const name = e.msg.replace(/(\/|#)炼丹/, "").trim();
        const [名字,num] = name.split("*").map(code => code.trim());
        let list = await _item(1,"丹方");
        list = list.find(item => item.name === 名字)
        if(!list)return false;
        if(!num) return false;
        let cailiao:string[] =[]
        for (let i = 0; i < list.材料.length; i++) {
            cailiao.push(list.材料[i].name)
        }
        return false;
    }


}