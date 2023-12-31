import {APlugin ,AMessage ,findIndexByName,Strand,getNonZeroKeys,startstatus,stopstatus,gettupo,getstring,checkZeroValue,checkAllZeroValues,
    checkNameExists,player_zhanli,Add_bag_thing, player_zhandou,determineWinner,_item, Read_json, getUserStatus, getString2, oImages} from '../../api'
import { getlingqi,create_player,existplayer,Read_player,Write_player,武者境界, 灵魂境界,体魄境界,user_id,finduid,妖兽地点,功法列表, 道具列表, 丹方,猎杀妖兽地点} from '../../model/gameapi';  
export class liesha extends APlugin  {
	constructor() {
		super({
			/** 功能名称 */
			name: 'liesha',
			/** 功能描述 */
			dsc: '基础模块',
			event: 'message',
			/** 优先级，数字越小等级越高 */
			priority: 600,
			rule: [
				{
					reg: /^(#|\/)?猎妖信息$/,
					fnc: 'x',
                },
                {
					reg: /^(#|\/)?前往猎妖.*$/,
					fnc: 'qw',
                },
                {
					reg: /^(#|\/)?状态结算$/,
					fnc: 'xx',
                },
			],
		});
	}
    async x(e:AMessage):Promise<boolean>{
        let x:any = await 猎杀妖兽地点.findAll({raw:true})
        console.log(x);
        let get_data={x}
        const img = await oImages(`/resources/html/lieyao/lieyao.html`,get_data)
        if(img) e.reply(img)
        // await pic(e,get_data,`get_lieyao`)
        return false;
    }
    async qw(e:AMessage):Promise<boolean>{
        const usr_qq = e.user_id;
        if (!await existplayer(1, usr_qq)) return false;
        let results = await Read_player(1,usr_qq)
        const name = e.msg.replace(/(\/|#)前往猎妖/, "").trim();
        let status = results.status;
        let player = results.player;
        const xxx = await getNonZeroKeys(status);
        if(xxx)return e.reply(`你正在${xxx}中`);
        let x:any = await 猎杀妖兽地点.findAll({raw:true})
        x =x.find(item => item.name === name);
        if(!x)return e.reply(`没有这个妖兽`);
        if(await getstring(player.武者境界,"F阶")) return e.reply(`才f阶就来猎杀妖兽？`);
        if(player.当前血量 < 50) return e.reply(`残了，残了，大残！快去治疗`)
        const now = Date.now();
        status.猎妖 = now;
        player.猎妖目标 = name;
        await Write_player(usr_qq,player,false,false,status)
        return e.reply(`开始猎杀妖兽,5分钟后归来`);
    }
    async xx(e:AMessage):Promise<boolean>{
        const usr_qq = e.user_id;
        if (!await existplayer(1, usr_qq)) return false;
        let results = await Read_player(1,usr_qq)
        let status = results.status
        let player = results.player
        const activeStatus = await getNonZeroKeys(status);
        console.log(activeStatus);
        if (!activeStatus) return e.reply(`没有状态`);
        const now = Date.now();
        const time = now - status[activeStatus];
        const isHunting1 = activeStatus === "猎妖";
        if (isHunting1 && player.猎妖目标 === "无") {
        e.reply(`出现错误，存档力的猎妖目标为无，自动设置为金钱豹`);
        player.猎妖目标 = "金钱豹";
        }
        let huntingLocation:any = await 猎杀妖兽地点.findAll({raw:true})
        let daojulist:any = await 道具列表.findAll({raw:true})
        let shezhi = await Read_json(2)
        if(player.猎妖目标 && player.猎妖目标 !== "无")huntingLocation = huntingLocation.find(item => item.name == player.猎妖目标);
        if (isHunting1) {
            if (time < 5 * 60 * 1000) return e.reply(`时间未到`);
                const A_player = {
                    name: player.name,
                    暴击加成: player.暴击加成,
                    爆伤加成: player.爆伤加成,
                    攻击加成: player.攻击加成,
                    闪避加成: player.闪避加成,
                    防御加成: player.防御加成,
                    当前生命: player.当前生命,
                };
                const B_player = {
                    name: huntingLocation.name,
                    暴击加成: huntingLocation.暴击加成,
                    爆伤加成: huntingLocation.爆伤加成,
                    攻击加成: huntingLocation.攻击加成,
                    闪避加成: huntingLocation.闪避加成,
                    防御加成: huntingLocation.防御加成,
                    当前生命: huntingLocation.生命加成,
                };
                let msg = await player_zhandou(A_player, B_player);
                let name = await determineWinner(msg.result, player.name, huntingLocation.name);
                console.log(msg.result);
                let replyMsg;
                if (name === player.name) {
                    let dropItem = null;
                    const random = Math.random();
                    const dropItems = huntingLocation.掉落物;
                    const dropItemsLength = dropItems.length;
                    const cumulativeProbabilities:any = [];

                    let cumulativeProbability = 0;
                    for (let i = 0; i < dropItemsLength; i++) {
                    cumulativeProbability += dropItems[i].概率;
                    cumulativeProbabilities.push(cumulativeProbability);
                    }

                    const targetProbability = random * cumulativeProbability;
                    let low = 0;
                    let high = dropItemsLength - 1;

                    while (low <= high) {
                    const mid = Math.floor((low + high) / 2);
                    if (targetProbability <= cumulativeProbabilities[mid]) {
                        dropItem = dropItems[mid].name;
                        break;
                    } else {
                        low = mid + 1;
                    }
                    }

                    if (!dropItem) {
                    const randomIndex = Math.floor(random * dropItemsLength);
                    dropItem = dropItems[randomIndex].name;
                    }

                    if (dropItem) {
                    await Add_bag_thing(usr_qq, dropItem, 1, "无");
                    player.当前生命 -= msg.A_damage;
                    replyMsg = `恭喜你打赢了${huntingLocation.name}，获得${dropItem}*1`;
                    }
                } else {
                    player.当前生命 -= msg.A_damage;
                    replyMsg = `恭喜你没打赢了${huntingLocation.name}，获得空气*1`;
                }
                status.猎妖 = 0;
                player.猎妖目标 = "无";
                await Write_player(usr_qq,player,false,false,status);
                return e.reply(replyMsg);
        }else if(activeStatus == '打工'){
            return await stopstatus(e,`打工`,`金钱`,`元`,10)
        }else if(activeStatus == '猎杀妖兽'){
            const time = (now - status.猎杀妖兽) / 60000; // 将时间转换为分钟
                let x;
                const rank= await getString2(player.武者境界, "E阶", "D阶", "C阶", "B阶", "A阶");
                console.log(rank);
                
                switch (rank) {
                    case "E阶": x = 0.9; break;
                    case "D阶": x = 1.15; break;
                    case "C阶": x = 1.35; break;
                    case "B阶": x = 1.65; break;
                    case "A阶": x = 1.9; break;
                    default: x = 1; break; // 如果没有匹配的境界，默认为1
                }
                const money = Math.floor(time * x);
                const xiuwei = Math.floor(time * 0.3);
                const tipo = Math.floor(time * 0.35);
                player.体魄力量 = tipo;
                player.灵气 += xiuwei;
                player.金钱 += money;
                e.reply(`结束成功，获得金钱${money}元,修为${xiuwei}体魄力量${tipo}`);
        }else if(activeStatus == '修炼'){
            return await stopstatus(e,`修炼`,`灵气`,`灵气`,0.4);
        }else if(activeStatus == '锻炼'){
            return await stopstatus(e,`锻炼`,`体魄力量`,`体魄力量`,0.4);
        }else if(activeStatus == '修炼灵魂'){
            return await stopstatus(e,`修炼灵魂`,`灵魂力量`,`灵魂力量`,0.2);
        }else if(activeStatus == "采药"){
            const timeInMinutes = (now - status.采药) / 60000;
            if (timeInMinutes < 30) {
            if (Math.random() < 0.5) {
                return e.reply(`没用采到药材`);
            }
            }
            const caiyao = shezhi.find((item) => item.type === "采药");
            const cishu = Math.max(Math.ceil(timeInMinutes / 30), 1);
            const obtainedItems = new Map();

            const randomNumber = (itemName) => {
            if (itemName === "低级强灵草") {
                return Math.floor(Math.random() * 10) + 5;
            } else {
                return Math.floor(Math.random() * 5);
            }
            };
            const addItemsToBag = (items) => {
            const promiseArr = items.map(([itemName, quantity]) => {
                const daoju = daojulist.find((d) => d.name === itemName);
                return Add_bag_thing(usr_qq, itemName, quantity, daoju);
            });
            return Promise.all(promiseArr);
            };

            for (let i = 0; i < cishu; i++) {
            const randomNum = Math.random();
            const thing = caiyao.thing.find((t) => t.概率 <= randomNum);
            const itemName = thing.name;
            const itemQuantity = randomNumber(itemName);
            if (obtainedItems.has(itemName)) {
                obtainedItems.set(itemName, obtainedItems.get(itemName) + itemQuantity);
            } else {
                obtainedItems.set(itemName, itemQuantity);
            }
            }
            const itemsToAdd = Array.from(obtainedItems);
            addItemsToBag(itemsToAdd)
            .then(() => {
                let msg = '';
                obtainedItems.forEach((quantity, item) => {
                msg += `
            获得${item}${quantity}`;
                });
                e.reply(msg);
            })
            .catch((err) => {
                console.error(err);
                e.reply('采集药材出现错误,请稍后重试');
            });
        }
        status[activeStatus] = 0;
        await Write_player(e.user_id, player, false,false, status);
        return true;
        }
    }


