import { APlugin ,AMessage,pic ,findIndexByName,Strand,getNonZeroKeys,startstatus,stopstatus,gettupo,getstring,checkZeroValue,checkAllZeroValues,
    checkNameExists,player_zhanli,Add_bag_thing, player_zhandou,determineWinner,getB_qq,createPlayerObject,_item,oImages,Read_json,Write_json} from "../../api";
import { create_player,existplayer,Read_player,Write_player,武者境界, 灵魂境界,体魄境界,user_id,finduid,妖兽地点,功法列表,丹方} from '../../model/gameapi';   
export class learn extends APlugin  {
    constructor() {
        super({
            /** 功能名称 */
            name: 'learn',
            /** 功能描述 */
            dsc: '基础模块',
            event: 'message',
            /** 优先级，数字越小等级越高 */
            priority: 600,
            rule: [
                {
                    reg: /^(#|\/)?拜师学艺$/,
                    fnc: 'visit',
                }
            ],
            });
        }
        // async learn(e:AMessage):Promise<boolean>{
        //     const usr_qq = e.user_id;
        //     const playerExists = await existplayer(1, usr_qq);
        //     const [thing_name] = e.msg.replace(/(\/|#)?学习功法/, "").trim().split("*").map(code => code.trim());
        //     if (!playerExists || !thing_name) return false;
        //     let [results, gongfa_list]:any = await Promise.all([
        //         Read_player(1,usr_qq),
        //         功法列表.findAll({raw:true}),
        //     ]);
        //     let gongfa = gongfa_list.find((item: { name: string; }) => item.name === thing_name);
        //     let player = results.player;
        //     let bag = results.bag;
        //     const bag_gongfa = bag.已学习功法.find((item: { name: string; }) => item.name == thing_name);
        //     const bag_gongfa_thing = bag.功法.find((item: { name: string; }) => item.name == thing_name);
        //     if(bag_gongfa) return e.reply(`已学习此功法`);
        //     if(!bag_gongfa_thing) return e.reply(`你没有这个功法`)
        //     gongfa.all_功效.forEach((element: string | number) => {
        //         player[element]=(player[element]||0)+gongfa.功效
        //     });
        //     await Promise.all([
        //         await Add_bag_thing(usr_qq,thing_name,-1,gongfa),
        //         await Write_player(usr_qq,player,bag,false,false)
        //     ]);
        //     return e.reply(`学习成功`);
        // }
        async visit(e:AMessage):Promise<boolean>{
            const usr_qq = e.user_id;
            const playerExists = await existplayer(1, usr_qq);
            if (!playerExists) return false;
            const [results,gongfa_list, peizhi]                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     :any= await Promise.all([
                Read_player(1,usr_qq),
                功法列表.findAll({raw:true}),
                Read_json(2)
            ]);
            let player = results.player;
            let bag = results.bag;
            if (player.金钱 < 100000) return e.reply(`金钱不够，还需要${100000 - player.金钱}`);
            const shifuType = "拜师学艺";
            const shifu = peizhi.find(item => item.type === shifuType);
            console.log(shifu);
            if (shifu) {
                const selectedShifu = shifu.people.find(mentor => mentor.概率 >= Math.random());
                console.log(selectedShifu);
                if (selectedShifu) {
                    player.金钱 -= 100000;
                    let msg = `恭喜拜到师傅${selectedShifu.name}`;
                    if (selectedShifu.name === "凌无凡") {
                        msg = `恭喜拜到师傅，此师傅是天命之子${selectedShifu.name}`;
                    }
                    const gongfaToLearn = selectedShifu.gongfa.find(gongfa => gongfa.概率 >= Math.random());
                    await Write_player(usr_qq,player,bag,false,false);
                    console.log(gongfaToLearn);
                    if (gongfaToLearn) {
                        msg += `，习得功法${gongfaToLearn.name}`;
                        console.log(msg);
                        let foundGongfa = gongfa_list;
                        foundGongfa = foundGongfa.find(item => item.name == gongfaToLearn.name);
                        await Write_player(usr_qq,player,bag,false,false);
                        await Add_bag_thing(usr_qq, gongfaToLearn.name, 1, foundGongfa);
                    } else {
                        msg += '，未习得任何功法';
                    }
                    return e.reply(msg);
                } else {
                    return e.reply("没有找到师傅");
                }
            } else {
                return e.reply("没有找到师傅...");
            }
    }
}