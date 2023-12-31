import { APlugin ,AMessage,findIndexByName,Strand,getNonZeroKeys,startstatus,stopstatus,gettupo,getstring,checkZeroValue,checkAllZeroValues,
    checkNameExists,player_zhanli,Add_bag_thing, player_zhandou,determineWinner,getB_qq,createPlayerObject,_item,oImages} from "../../api";
import { getlingqi,create_player,existplayer,Read_player,Write_player,武者境界, 灵魂境界,体魄境界,user_id,finduid,妖兽地点,功法列表, 道具列表, 丹方,猎杀妖兽地点} from '../../model/gameapi';
export class shengji extends APlugin  {
    constructor() {
        super({
            /** 功能名称 */
            name: 'shengji',
            /** 功能描述 */
            dsc: '基础模块',
            event: 'message',
            /** 优先级，数字越小等级越高 */
            priority: 600,
            rule: [
                {
                    reg: /^(#|\/)?升级灵器$/,
                    fnc: 'raise',
                },
            ],
            });
        }
        async raise(e:AMessage):Promise<boolean>{
            const usr_qq = e.user_id;
            const playerExists = await existplayer(1, usr_qq);
            if (!playerExists) return false;
            const results =  await Read_player(1, usr_qq);
            let player = results.player;
            const lingqi = player.本命灵器;
            const exp = lingqi.等级*1000;
            if(lingqi.exp < exp) return e.reply(`经验不足`) ;
            lingqi.exp -= exp;
            lingqi.等级 += 1;
            await Write_player(usr_qq, player,false,false,false);
            return e.reply(`升级生成，目前等级${lingqi.等级}`)
        }
    }