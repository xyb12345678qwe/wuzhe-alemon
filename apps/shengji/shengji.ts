import { APlugin ,AMessage,findIndexByName,Strand,getNonZeroKeys,startstatus,stopstatus,gettupo,getstring,checkZeroValue,checkAllZeroValues,
    checkNameExists,Add_bag_thing, player_zhandou,determineWinner,getB_qq,createPlayerObject,oImages} from "../../api";
import { create_player,existplayer,Read_player,Write_player,武者境界, 灵魂境界,体魄境界,user_id,finduid,妖兽地点,功法列表, 道具列表, 丹方,猎杀妖兽地点} from '../../model/gameapi';
export class shengji extends APlugin  {
    constructor() {
        super({
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
            if(lingqi.exp < exp) return e.reply(`经验不足,还差${exp - lingqi.exp}`) ;
            if(lingqi.等级 == 20) return e.reply(`已到达满级`)
            lingqi.exp -= exp;
            lingqi.等级 += 1;
            const exp_lingqi = {
                低级灵器: 2,
                中级灵器: 3,
                高级灵器: 5,
                帝兵:8
            }
            lingqi.攻击加成 += 75 * lingqi.等级 * exp_lingqi[lingqi.品级];
            lingqi.防御加成 += 65 * lingqi.等级 * exp_lingqi[lingqi.品级];
            lingqi.生命加成 += 70 * lingqi.等级 * exp_lingqi[lingqi.品级];
            lingqi.暴击加成 += 0.002 * lingqi.等级 * exp_lingqi[lingqi.品级];
            lingqi.爆伤加成 += 0.001 * lingqi.等级 * exp_lingqi[lingqi.品级];
            lingqi.闪避加成 += 0.0003 * lingqi.等级 * exp_lingqi[lingqi.品级];
            await Write_player(usr_qq, player,false,false,false);
            return e.reply(`升级成功，目前等级${lingqi.等级}`)
        }
    }