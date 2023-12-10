import { plugin,AMessage,existplayer,Read_player,Write_player,Write_playerData,getlingqi,isNotNull,pic ,findIndexByName,Strand,getNonZeroKeys,startstatus,stopstatus,gettupo,getstring,checkZeroValue,checkAllZeroValues,
    checkNameExists,player_zhanli,Add_bag_thing, player_zhandou,determineWinner,getB_qq,createPlayerObject,_item,Read_json_path,oImages,getidlist,Read_player2,allzongmen } from "../../api";
export class shengji extends plugin {
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
            const playerExists = await existplayer(1, usr_qq, 'player');
            if (!playerExists) return false;
            let player = await Read_player(1,true, usr_qq, "player");
            const lingqi = player.本命灵器;
            const exp = lingqi.等级*1000;
            if(lingqi.exp < exp) return e.reply(`经验不足`) ;
            lingqi.exp -= exp;
            lingqi.等级 += 1;
            await Write_player(1,true, usr_qq, player, "player");
            return e.reply(`升级生成，目前等级${lingqi.等级}`)
        }
    }