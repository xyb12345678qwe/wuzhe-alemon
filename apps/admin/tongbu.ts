import { Show,plugin,AMessage,base } from "../../api";
import { existplayer,Read_player,Write_player,Write_playerData,getlingqi,isNotNull,pic ,findIndexByName,Strand,getNonZeroKeys,startstatus,stopstatus,gettupo,getstring,checkZeroValue,checkAllZeroValues,
    checkNameExists,player_zhanli,Add_bag_thing, player_zhandou,determineWinner,getB_qq,createPlayerObject,getAllSubdirectories} from "../../model/wuzhe.js";

export class tongbu extends plugin {
	constructor() {
		super({
			/** 功能名称 */
			name: 'tongbu',
			/** 功能描述 */
			dsc: '基础模块',
			event: 'message',
			/** 优先级，数字越小等级越高 */
			priority: 600,
			rule: [
				{
					reg: /^(#|\/)?武者同步$/,
					fnc: 'tongbu',
                },
			],
		});
	}
    async tongbu(e:AMessage):Promise<boolean>{
        if (!e.isMaster) return false
        let usr_qq = await getAllSubdirectories();
        let results = await Promise.all(usr_qq.map(async (directory) => {
        let player = await Read_player(1,true, directory, "player");
        let ziduan = ["性别"];
        ziduan.forEach((k) => {
            if (!player[k]) player[k] = "无";
        })
        await Write_player(1,true,directory,player,"player")
    }))
    return false;
}
}