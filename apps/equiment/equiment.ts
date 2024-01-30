import {APlugin ,AMessage,findIndexByName,Strand,getNonZeroKeys,startstatus,stopstatus,gettupo,getstring,checkZeroValue,checkAllZeroValues,
    checkNameExists,Add_bag_thing, player_zhandou,determineWinner, Read_json, getUserStatus, getString2, oImages,getCacheData,equiment_type as type,filter_equiment} from '../../api'
import { create_player,existplayer,Read_player,Write_player,武者境界, 灵魂境界,体魄境界,user_id,finduid,装备列表} from '../../model/gameapi';

export class equiment extends APlugin  {
	constructor() {
		super({
			dsc: '基础模块',
			event: 'message',
			priority: 600,
			rule: [
                {
					reg: /^(#|\/)?一键装备$/,
					fnc: 'all_equiment',
                },
				{
					reg: /^(#|\/)?装备.*$/,
					fnc: 'equiment',
                },
                {
					reg: /^(#|\/)?卸下.*$/,
					fnc: 'xiexia',
                },
                {
					reg: /^(#|\/)?我的装备$/,
					fnc: 'myequiment',
                }
			],
		});
	}
    async myequiment(e:AMessage){
        const usr_qq = e.user_id;
        if (!await existplayer(1,usr_qq)) return false;
        let {equiment} = await Read_player(1,usr_qq);
        const img = await oImages('/resources/html/equiment/equimen.html',{equiment});
        if(img) return e.reply(img)
    }
    async all_equiment(e:AMessage){
        const usr_qq = e.user_id;
        if (!await existplayer(1,usr_qq)) return false;
        let {equiment,player,bag} = await Read_player(1,usr_qq);
        const filterAndEquip = async (itemClass) => {
            let items = bag.道具.filter(item => item.class == itemClass);
            if (items.length > 0) {
                let equippedItem = await filter_equiment(items, equiment);
                console.log(equippedItem);
                if (equippedItem) {
                    let equippedClass = equiment[equippedItem.class];
                    if (equippedClass) {
                        type.forEach(item => {
                            player[item] -= equippedClass[item];
                        });
                        player.生命上限 -= equippedItem.生命加成;
                        await Add_bag_thing(usr_qq, equippedClass.name, 1, equippedClass);
                    }
                }
                type.forEach(item => {
                    player[item] += equippedItem[item];
                });
                player.生命上限 += equippedItem.生命加成;
                await Add_bag_thing(usr_qq, equippedItem.name, -1, equippedItem);
                equiment[itemClass] = equippedItem;
            }
            await Write_player(usr_qq,player,false,equiment,false);
        };
        await Write_player(usr_qq,player,false,equiment,false);
        await filterAndEquip("胸甲");
        await filterAndEquip("腿甲");
        await filterAndEquip("鞋子");
        await filterAndEquip("法宝");
        return e.reply(`装备一键全部装备完成`)
    }
    
    async equiment(e:AMessage){
        const usr_qq = e.user_id;
        if (!await existplayer(1,usr_qq)) return false;
        let {equiment,player,bag} = await Read_player(1,usr_qq)
        const name = e.msg.replace(/(\/|#)装备/, "").trim();
        let equiment_thing:any = (await getCacheData("装备列表")).find(item => item.name == name);
        if(!equiment_thing)equiment_thing = await 装备列表.findOne({raw:true,where:{name:name}});
        if(!equiment_thing) return e.reply(`没有这个装备${name}`);
        if(!bag.道具.find(item => item.name == name)) return e.reply(`背包中没有这个装备`);
        let equiment_type = equiment[equiment_thing.class];
        // const type = ["攻击加成","防御加成","暴击加成","爆伤加成","生命加成","闪避加成"]
        if(equiment_type){
            type.forEach(item => {
                player[item] -= equiment_type[item];
            })
            await Add_bag_thing(usr_qq,equiment_type.name,1,equiment_type)
        }
        type.forEach(item => {
            player[item] -= equiment_thing[item];
        })
        player.生命上限 += equiment_thing.生命加成;
        equiment[equiment_thing.class] = equiment_thing;
        await Add_bag_thing(usr_qq,name,-1,equiment_thing);
        await Write_player(usr_qq,player,false,equiment,false,false);
        return e.reply(`装备${name}成功`)
    }
    async xiexia(e:AMessage){
        const usr_qq = e.user_id;
        if (!await existplayer(1,usr_qq)) return false;
        let {equiment,player} = await Read_player(1,usr_qq);
        const name = e.msg.replace(/(\/|#)卸下/, "").trim();
        let equiment_thing:any = (await getCacheData("装备列表")).find(item => item.name == name);
        if(!equiment_thing)equiment_thing = await 装备列表.findOne({raw:true,where:{name:name}});
        if(!equiment_thing) return e.reply(`没有这个装备${name}`);
        let equiment_type = equiment[equiment_thing.class];
        if(!equiment_type) return e.reply(`你没有这个装备${name}`);
        equiment_type = { ...equiment[equiment_thing.class] }; // 创建equiment_type的副本
        if (!equiment_type) return e.reply(`你没有这个装备${name}`);
        const equiment_type_name = equiment_type.name; // 保存equiment_type的值
        type.forEach(item => {
        player[item] -= equiment_type[item];
        });
        player.生命上限 -= equiment_type.生命加成;
        equiment[equiment_thing.class] = null; // 修改equiment对象
        await Add_bag_thing(usr_qq,equiment_type_name,1,equiment_thing);
        await Write_player(usr_qq,player,false,equiment,false,false);
        return e.reply(`卸下装备${name}成功`)
    }
}