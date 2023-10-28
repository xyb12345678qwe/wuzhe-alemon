import { existplayer,Read_player,Write_player,Write_playerData,getlingqi ,findIndexByName,Strand,_item,pic,Read_yaml,extractAttributesWithPropertyOne} from "../../model/wuzhe";
import {plugin,AMessage,Show,puppeteer,Help} from '../../app-config'
export class show extends plugin {
	constructor() {
		super({
			/** 功能名称 */
			name: 'show',
			/** 功能描述 */
			dsc: '基础模块',
			event: 'message',
			/** 优先级，数字越小等级越高 */
			priority: 600,
			rule: [
            {
			    reg: /^(#|\/)万界堂$/,
			    fnc: 'wanjietang',
		    },
       
			],
		});
	}
    async wanjietang(e:AMessage):Promise<boolean>{
        let xx = await _item(1,"道具列表")
        let x = await extractAttributesWithPropertyOne(xx)
        let temp = {x}
        await pic(e,temp,'get_wanjietang')
        return false;
    }
}