import { APlugin ,AMessage,pic ,findIndexByName,Strand,getNonZeroKeys,startstatus,stopstatus,gettupo,getstring,checkZeroValue,checkAllZeroValues,
    checkNameExists,player_zhanli,Add_bag_thing, player_zhandou,determineWinner,getB_qq,createPlayerObject,oImages,Read_json,Write_json} from "../../api";
import { create_player,existplayer,Read_player,Write_player,武者境界, 灵魂境界,体魄境界,user_id,finduid} from '../../model/gameapi';
export class chanenl_id extends APlugin  {
    constructor() {
        super({
            /** 功能名称 */
            name: 'chanenl_id',
            /** 功能描述 */
            dsc: '基础模块',
            event: 'message',
            /** 优先级，数字越小等级越高 */
            priority: 600,
            rule: [
                {
                    reg: /^(#|\/)?绑定进出子频道id$/,
                    fnc: 'chanenl_id',
                },
            ],
            });
        }
        async chanenl_id(e:AMessage):Promise<boolean>{
            if(!e.isMaster)return false;
            const id = e.channel_id;
            let shezhi = await Read_json(2);
            let chanenl_id = shezhi.find(item => item.type == "chanenl_id");
            chanenl_id.num = id;
            await Write_json(2,shezhi)
            return e.reply(`绑定成功`);
        }
    }