import {APlugin ,AMessage,findIndexByName,Strand,getNonZeroKeys,startstatus,stopstatus,gettupo,getstring,checkZeroValue,checkAllZeroValues,
    checkNameExists,Add_bag_thing, player_zhandou,determineWinner, Read_json, getUserStatus, getString2, oImages,getCacheData,equiment_type as type,filter_equiment,
    findThings} from '../../api'
import {existplayer,Read_player,Write_player,武者境界, 灵魂境界,体魄境界,finduid,装备列表,transaction_record,findTransaction, updateTransaction} from '../../model/gameapi';

export class transaction extends APlugin  {
	constructor() {
		super({
			dsc: '基础模块',
			event: 'message',
			priority: 600,
			rule: [
                {
					reg: /^(#|\/)?开启交易.*$/,
					fnc: 'start_transaction',
                },
                {
					reg: /^(#|\/)?同意交易.*$/,
					fnc: 'agree_transaction',
                },
                {
					reg: /^(#|\/)?取消同意交易.*$/,
					fnc: 'revoke_consent_transaction',
                },
                {
					reg: /^(#|\/)?添加交易物品.*$/,
					fnc: 'add_consent_transaction',
                },
            {
					reg: /^(#|\/)?结算交易.*$/,
					fnc: 'settlement_consent_transaction',
          },
  
         {
      reg: /^(#|\/)?查看交易.*$/,
      fnc: 'check_transaction',
         }
			],
		});
	}
    async check_transaction(e:AMessage){
      const usr_qq = e.user_id;
      if (!await existplayer(1,usr_qq)) return false;
      const [user_id] = e.msg.replace(/(\/|#)查看交易?/, "").trim().split("*").map(code => code.trim());

      let at:any = e.at_user;
      if (!at) {
        if (!user_id) return e.reply('请先@对方');
        else at = { id: user_id };
      }
      if(at.id == e.user_id) return e.reply(`？？？你要和谁交易???`);
      const uid_1 = await finduid(usr_qq);
      const uid_2 = await finduid(at.id);
      let jiaoyi = await findTransaction(uid_1.uid,uid_2.uid);
      if (!jiaoyi) return e.reply(`和${at.name || at.id}没有交易存在`);
      let thing:any[] =[`格式:名字*数量*交易物品`];
      let thing2:any[] =[`格式:名字*数量*交易物品`];
      jiaoyi.开启交易者交易物品.forEach(item => {
        if(item.thing_name){
          thing.push(`\n${item.name}*${item.num}*${item.price}*${item.thing_name}`);
        }else{
          thing.push(`\n${item.name}*${item.num}*${item.price}`);
        }
      })
      jiaoyi.交易对象交易物品.forEach(item => {
        if(item.thing_name){
          thing2.push(`\n${item.name}*${item.num}*${item.price}*${item.thing_name}`);
        }else{
          thing2.push(`\n${item.name}*${item.num}*${item.price}`);
        }
      })
      e.reply(` 
          开启交易者: ${jiaoyi.开启交易者},\n
          交易对象: ${jiaoyi.交易对象},\n
          开启交易者是否同意: ${jiaoyi.开启交易者是否同意},\n
          交易对象是否同意: ${jiaoyi.交易对象是否同意},\n
          开启交易者交易物品: ${thing},\n
          交易对象交易物品: ${thing2},\n
          开启时间: ${jiaoyi.开启时间},\n
          结束时间: ${jiaoyi.结束时间},\n
      `)
    }
    async settlement_consent_transaction(e:AMessage){
        const usr_qq = e.user_id;
        if (!await existplayer(1,usr_qq)) return false;
        let {player,bag} = await Read_player(1,usr_qq);
        const [user_id] = e.msg.replace(/(\/|#)?结算交易/, "").trim().split("*").map(code => code.trim());
        let at:any = e.at_user;
        if (!at) {
          if (!user_id) return e.reply('请先@对方');
          else at = { id: user_id };
        }
        if(at.id == e.user_id) return e.reply(`？？？你要和谁交易???`);
        if (!await existplayer(1,at.id)) return e.reply(`${at.name ||at.id}没有账号绑定`);
        let {bag:B_bag,player:B_player} = await Read_player(1,at.id);
        let jiaoyi =  await findTransaction(player.uid,B_player.uid);
        if (!jiaoyi) return e.reply(`和${at.name || at.id}没有交易存在`);
        let msg:any = []

        if (jiaoyi.开启交易者是否同意 === "否" || jiaoyi.交易对象是否同意 === "否") {
            const notAgreedUser = jiaoyi.开启交易者是否同意 === "否" ? player.uid : B_player.uid;
            msg.push(`${notAgreedUser === player.uid ? '你' : at.name || at.id}尚未同意本场交易`);
        }else if (jiaoyi.交易对象是否同意 === "是" && jiaoyi.开启交易者是否同意 === "是") {
            const thing_list = jiaoyi.交易对象交易物品.filter(item => !item.thing_name); 
            const thing_list2 = jiaoyi.开启交易者交易物品.filter(item => !item.thing_name);  
            const all_price: number = Math.round(thing_list.reduce((sum, element) => sum + parseInt(element.price, 10) * parseInt(element.num, 10), 0));
            const all_price2: number = Math.round(thing_list2.reduce((sum, element) => sum + parseInt(element.price, 10)* parseInt(element.num, 10), 0));      
            console.log(all_price);
            console.log(all_price2);
            player.金钱 = Math.round(player.金钱);
            B_player.金钱 = Math.round(B_player.金钱);                                                 
            jiaoyi.交易总金额 = all_price + all_price2;
            if (jiaoyi.交易对象 === player.uid) {
              if(player.金钱 < Number(all_price2))return e.reply(`${player.uid}金钱或金钱不够交易,还差${Number(all_price2)-player.金钱 }`);
              if(B_player.金钱 < Number(all_price))return e.reply(`${B_player.uid}金钱或金钱不够交易,还差${Number(all_price)-B_player.金钱 }`);
              player.金钱 -= Number(all_price2)
              B_player.金钱 += Number(all_price2)
              B_player.金钱 -= Number(all_price)
              player.金钱 += Number(all_price)
              for (const element of jiaoyi.交易对象交易物品) {
                if (element.thing_name) {
                  const thing = (await findThings(element.thing_name)).one_item;
                  const giverBagThing = B_bag[thing.type].find(item => item.name === element.thing_name);
                  const BagThing = bag[thing.type].find(item => item.name === element.thing_name);
                  if (!giverBagThing) return e.reply(`${e.user_name}没有${thing.name}`);
                  if(!BagThing) return e.reply(`${at.name || at.id}没有${thing.name}`);
                  await Add_bag_thing(at.id, element.name, element.num, element);
                  await Add_bag_thing(usr_qq, element.name, -element.num, element);
                  await Add_bag_thing(usr_qq, element.thing_name, element.price, thing);
                  await Add_bag_thing(at.id, element.thing_name, -element.price, thing);
                }else if(element.price && !element.thing_name){
                  await Add_bag_thing(at.id, element.name, -element.num, element);
                  await Add_bag_thing(usr_qq, element.name, element.num, element);
                }
              }
              for (const element of jiaoyi.开启交易者交易物品) {
                if (element.thing_name) {
                  const thing = (await findThings(element.thing_name)).one_item;
                  const giverBagThing = bag[thing.type].find(item => item.name === element.thing_name);
                  const BagThing = B_bag[thing.type].find(item => item.name === element.thing_name);
                  if (!giverBagThing) return e.reply(`${at.name || at.id}没有${thing.name}`);
                  if(!BagThing) return e.reply(`${e.user_name}没有${thing.name}`);
                  await Add_bag_thing(at.id, element.name, -element.num, element);
                  await Add_bag_thing(usr_qq, element.name, element.num, element);
                  await Add_bag_thing(usr_qq, element.thing_name, -element.price, thing);
                  await Add_bag_thing(at.id, element.thing_name, element.price, thing);
                }else if(element.price && !element.thing_name){
                  await Add_bag_thing(at.id, element.name, element.num, element);
                  await Add_bag_thing(usr_qq, element.name, -element.num, element);
                }
              } 
            }else if (jiaoyi.开启交易者 === player.uid) {
              if(player.金钱 < Number(all_price2))return e.reply(`${player.uid}金钱或金钱不够交易,还差${Number(all_price)-player.金钱 }`);
              if(B_player.金钱 < Number(all_price))return e.reply(`${B_player.uid}金钱或金钱不够交易,还差${Number(all_price2)-B_player.金钱 }`);
              player.金钱 += Number(all_price2)
              B_player.金钱 -= Number(all_price2)
              B_player.金钱 += Number(all_price)
              player.金钱-= Number(all_price)
              for (const element of jiaoyi.交易对象交易物品) {
                if (element.thing_name) {
                  const thing = (await findThings(element.thing_name)).one_item;
                  const giverBagThing = bag[thing.type].find(item => item.name === element.thing_name);
                  const BagThing = B_bag[thing.type].find(item => item.name === element.thing_name);
                  if (!giverBagThing) return e.reply(`${e.user_name}没有${thing.name}`);
                  if(!BagThing) return e.reply(`${at.name || at.id}没有${thing.name}`);
                  await Add_bag_thing(at.id, element.name, -element.num, element);
                  await Add_bag_thing(usr_qq, element.name, element.num, element);
                  await Add_bag_thing(usr_qq, element.thing_name, -element.price, thing);
                  await Add_bag_thing(at.id, element.thing_name, element.price, thing);
                }else if(element.price && !element.thing_name){
                  await Add_bag_thing(at.id, element.name, -element.num, element);
                  await Add_bag_thing(usr_qq, element.name, element.num, element);
                }
              }
              }
              for (const element of jiaoyi.开启交易者交易物品) {
                if (element.thing_name) {
                  const thing = (await findThings(element.thing_name)).one_item;
                  const giverBagThing = B_bag[thing.type].find(item => item.name === element.thing_name);
                  const BagThing = bag[thing.type].find(item => item.name === element.thing_name);
                  if (!giverBagThing) return e.reply(`${at.name || at.id}没有${thing.name}`);
                  if(!BagThing) return e.reply(`${e.user_name}没有${thing.name}`);
                  await Add_bag_thing(at.id, element.name, element.num, element);
                  await Add_bag_thing(usr_qq, element.name, -element.num, element);
                  await Add_bag_thing(usr_qq, element.thing_name, element.price, thing);
                  await Add_bag_thing(at.id, element.thing_name, -element.price, thing);
                }else if(element.price && !element.thing_name){
                  await Add_bag_thing(at.id, element.name, element.num, element);
                  await Add_bag_thing(usr_qq, element.name, -element.num, element);
                }
              }
            }
          
        if(msg.length != 0)return e.reply(msg);
        const currentDate = new Date();
        const formattedDateTime = `${currentDate.getFullYear()}年${currentDate.getMonth() + 1}月${currentDate.getDate()}日${currentDate.getHours()}时${currentDate.getMinutes()}分${currentDate.getSeconds()}秒`;
        console.log(`当前时间: ${formattedDateTime}`);
        jiaoyi.结束时间 = formattedDateTime;
        jiaoyi.结束状态 = "已结束"
        await updateTransaction(jiaoyi);
        await Write_player(usr_qq,player,false,false,false);
        await Write_player(at.id,B_player,false,false,false);
        return e.reply(`你结算了与${at.name||at.id}的交易，本场交易结束`);
    }
    async add_consent_transaction(e:AMessage){
        const usr_qq = e.user_id;
        let [user_id,thing_name, num,price,thing_name2] = e.msg.replace(/(\/|#)?添加交易物品/, "").trim().split("*").map(code => code.trim());
        if (!await existplayer(1,usr_qq) || !thing_name || !num || !price) return false;
        let {bag,player} = await Read_player(1,usr_qq);
        let at:any = e.at_user;
        if (!at) {
          if (!user_id) return e.reply('请先@对方');
          else at = { id: user_id };
        }
        if(Number(num) < 0) return e.reply(`你要不要看看你自己设置的数量是多少`)
        if(at.id == e.user_id) return e.reply(`？？？你要和谁交易???`);
        if (!await existplayer(1,at.id)) return e.reply(`${at.name||at.id}没有账号绑定`);
        let{bag:B_bag,player:B_player} = await Read_player(1,at.id);
        let jiaoyi = await findTransaction(player.uid,B_player.uid);
        if (!jiaoyi) return e.reply(`和${at.name||at.id}没有交易存在`);
        let thing = await (await findThings(thing_name)).one_item;
        
        const transactionType = jiaoyi.交易对象 === player.uid ? '交易对象交易物品' : '开启交易者交易物品';
        const transactionData = {
            ...thing,
            num:num,
            price: price
        };
        if (thing_name2) {
           let thing2 = await (await findThings(thing_name2)).one_item;
           let bag_thing = B_bag[thing2.type].find(item => item.name);
           let bag_thing2 = bag[thing2.type].find(item => item.name);
           if(!bag_thing) return e.reply(`对方没有这个物品`);
           if(!bag_thing2) return e.reply(`你没有这个物品`)
           if(bag_thing.数量 < price) return e.reply(`对方这个物品还差${Number(price) - bag_thing.数量}`)
           if(!thing) return e.reply(`没有${thing_name2}这个物品`)
          transactionData.thing_name = thing_name2;
        }
        jiaoyi[transactionType].push(transactionData);
        await updateTransaction(jiaoyi);
        e.reply(`你添加了${thing_name}*${num}的交易`);
        return;
    }
    async revoke_consent_transaction(e:AMessage){
        const usr_qq = e.user_id;
        if (!await existplayer(1,usr_qq)) return false;
        const [user_id] = e.msg.replace(/(\/|#)?取消同意交易/, "").trim().split("*").map(code => code.trim());
        let at:any = e.at_user;
        if (!at) {
          if (!user_id) return e.reply('请先@对方');
          else at = { id: user_id };
        }
        if(at.id == e.user_id) return e.reply(`？？？你要和谁交易???`);
        if (!await existplayer(1,at.id)) return e.reply(`${at.name||at.id}没有账号绑定`);
        const uid_1 = await finduid(usr_qq);
        const uid_2 = await finduid(at.id);
        let existingTransaction = await findTransaction(uid_1.uid,uid_2.uid);
        if(!existingTransaction) return e.reply(`和${at.name || at.id}没有交易存在`)
        if (existingTransaction.交易对象 === uid_1.uid) {
          existingTransaction.交易对象是否同意 = "否";
        } else if (existingTransaction.开启交易者 === uid_1.uid) {
          existingTransaction.开启交易者是否同意 = "否";
        }
        await updateTransaction(existingTransaction);
        return e.reply(`你暂时取消同意了与${at.name || at.id}的交易`);
    }
    async agree_transaction(e:AMessage){
        const usr_qq = e.user_id;
        if (!await existplayer(1,usr_qq)) return false;
        const [user_id] = e.msg.replace(/(\/|#)?同意交易/, "").trim().split("*").map(code => code.trim());
        let at:any = e.at_user;
        if (!at) {
          if (!user_id) return e.reply('请先@对方');
          else at = { id: user_id };
        }
        if(at.id == e.user_id) return e.reply(`？？？你要和谁交易???`);
        if (!await existplayer(1,at.id)) return e.reply(`${at.name|| at.id}没有账号绑定`);
        const uid_1 = await finduid(usr_qq);
        const uid_2 = await finduid(at.id);
        let existingTransaction = await findTransaction(uid_1.uid,uid_2.uid)
        if (!existingTransaction) return e.reply(`和${at.name || at.id}没有交易存在`);
        if (existingTransaction.交易对象 === uid_1.uid) {
          existingTransaction.交易对象是否同意 = "是";
        } else if (existingTransaction.开启交易者 === uid_1.uid) {
          existingTransaction.开启交易者是否同意 = "是";
        }
        await updateTransaction(existingTransaction);
        return e.reply(`你同意了与${at.name||at.id}的交易`);
    }
    async start_transaction(e:AMessage){
        const usr_qq = e.user_id;
        if (!await existplayer(1,usr_qq)) return false;
        const [user_id] = e.msg.replace(/(\/|#)?开启交易/, "").trim().split("*").map(code => code.trim());
        let at:any = e.at_user;
        if (!at) {
          if (!user_id) return e.reply('请先@对方');
          else at = { id: user_id };
        }
        if(at.id == e.user_id) return e.reply(`？？？你要和谁交易???`);
        if (!await existplayer(1,at.id)) return e.reply(`${at.name ||at.id}没有账号绑定`);
        const uid_1 = await finduid(usr_qq);
        const uid_2:any = await finduid(String(at.id));
        const existingTransaction = await findTransaction(uid_1.uid,uid_2.uid)
        if (existingTransaction) return e.reply(`你和${at.name ||at.id}有一场正在进行的交易`);
        const currentDate = new Date();
        const formattedDateTime = `${currentDate.getFullYear()}年${currentDate.getMonth() + 1}月${currentDate.getDate()}日${currentDate.getHours()}时${currentDate.getMinutes()}分${currentDate.getSeconds()}秒`;
        const transaction = {
            开启交易者: uid_1.uid,
            交易对象: uid_2.uid,
            开启时间: formattedDateTime,
        };
        await transaction_record.create({...transaction})
        return e.reply(`与${at.name || at.id}的交易开启成功`)
    }

}