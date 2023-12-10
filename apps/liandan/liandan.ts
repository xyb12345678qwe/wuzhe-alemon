import { Show,plugin,AMessage,existplayer,Read_player,Write_player,Write_playerData,getlingqi,isNotNull,pic ,findIndexByName,Strand,getNonZeroKeys,startstatus,stopstatus,gettupo,getstring,checkZeroValue,checkAllZeroValues,
    checkNameExists,player_zhanli,Add_bag_thing, player_zhandou,determineWinner,getB_qq,createPlayerObject,_item, Read_json } from "../../api";
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
					reg: /^(#|\/)?炼丹.*$/,
					fnc: 'liandan',
                },
                {
					reg: /^(#|\/)?查看全部丹方$/,
					fnc: 'check',
                },
                {
					reg: /^(#|\/)?查看丹方.*$/,
					fnc: 'check2',
                },
			],
		});
	}
    async liandan(e:AMessage):Promise<boolean>{
        if (!await existplayer(1, e.user_id, 'player')) return false;
        const [danName, num] = e.msg.replace(/(\/|#)炼丹/, "").trim().split("*").map(code => code.trim());
        const danList = (await Read_json(4, "/丹方.json")).find(item => item.name === danName);
        const itemList = await Read_json(4, "/道具列表.json");
        if (!danList || !num) return false;
        const userBag = await Read_player(1, true, e.user_id, "bag");
        const requiredMaterials = danList.材料.map(({ name, 数量 }) => ({ name, 数量: 数量 * Number(num) }));
        const errorMessages:string[] = [];
        function checkMaterialAvailability(material) {
            const { name, 数量 } = material;
            const itemType = (itemList.find(item => item.name === name) || {}).type;
            const bagItem = userBag[itemType]?.find(item => item.name === name);
            if (!bagItem || bagItem.数量 < 数量) return errorMessages.push(`缺少${name}`);
                return true;
        }
        if (!requiredMaterials.every(checkMaterialAvailability))  return e.reply(`炼丹失败, ${errorMessages.join(", ")}`);
        for (const material of requiredMaterials) {
            const itemType = itemList.find(item => item.name === material.name);
            await Add_bag_thing(e.user_id, material.name, -material.数量, itemType);
        }
        const danType = itemList.find(item => item.name === danName);
        await Add_bag_thing(e.user_id, danName, Number(num), danType);
        e.reply(`炼丹成功, 获得${danName}*${num}`);
        return false;
    }
    async check(e:AMessage):Promise<boolean>{
        const danList = await Read_json(4, "/丹方.json");
        const msg = danList.map(danfang => danfang.name);
        return e.reply(msg.join(''));
    }
    async check2(e:AMessage):Promise<boolean>{
        const danList = await Read_json(4, "/丹方.json");
        const [danName]= e.msg.replace(/(\/|#)查看丹方/, "").trim().split("*").map(code => code.trim());
        const danfang = danList.find(item => item.name == danName);
        if(!danfang) return e.reply(`没有这个丹方`)
        let msg = `${danName}丹方信息`
        danfang.材料.forEach(cailiao => {
            msg +=`\n${cailiao.name} * ${cailiao.数量}`
        })
        return e.reply(msg)
    }

}