import {APlugin ,AMessage,findIndexByName,Strand,getNonZeroKeys,startstatus,stopstatus,gettupo,getstring,checkZeroValue,checkAllZeroValues,
    checkNameExists,Add_bag_thing, player_zhandou,determineWinner, Read_json, getUserStatus, getString2, oImages,getCacheData,equiment_type as type,filter_equiment,
    findThings} from '../../api'
import {existplayer,Read_player,Write_player,武者境界, 灵魂境界,体魄境界,user_id,finduid,装备列表,transaction_record,user_player, sequelize, user_bag} from '../../model/gameapi';

export class GM extends APlugin  {
	constructor() {
		super({
			dsc: '基础模块',
			event: 'message',
			priority: 600,
			rule: [
                {
					reg: /^(#|\/)?发.*$/,
					fnc: 'give',
                },
                {
					reg: /^(#|\/)?全体发.*$/,
					fnc: 'all_give',
                },
			],
		});
	}
    async give(e:AMessage){
        let user:any = e.at_user;
        const [thing_name, num,user_id] = e.msg.replace(/(\/|#)发/, "").trim().split("*").map(code => code.trim());
        if (!user) {
            if (!user_id) return e.reply('请先@对方');
            else user = { id: user_id };
        }
        if (!await existplayer(1,user?.id)) return e.reply(`${user?.name}没有存档`);
        let {player} = await Read_player(1,user?.id);
        if(!thing_name||!num) return e.reply(`有个数值未填`);
        if(thing_name == "灵气"){
            player.灵气 += num;
        }else if(thing_name == "体魄力量"){
            player.体魄力量 += num;
        }else if(thing_name == "灵魂力量"){
            player.灵魂力量 += num;
        }else if(thing_name == "金钱"){
          player.金钱 += Number(num);
        }else{
            let thing = (await findThings(thing_name)).one_item;
            if(!thing) return e.reply(`没有找到${thing_name}这个东西`);
            await Add_bag_thing(user.id,thing_name,Number(num),thing);
        }
        e.reply(`添加${thing_name}*${num}成功`);
        await Write_player(user.id,player)
        return;
    }
    async all_give(e:AMessage){
        const transaction = await sequelize.transaction();
        // 查询所有用户
        
        const [thing_name, num] = e.msg.replace(/(\/|#)?全体发/, "").trim().split("*").map(code => code.trim());
        if (!thing_name || !num) return e.reply(`有个数值未填`);
        if(thing_name == "灵气" || thing_name == "体魄力量" || thing_name == "灵魂力量" || thing_name == "金钱"){
          const users:any[] = await user_player.findAll({ raw:true,transaction });
         users.forEach(async user=> {
          user.灵气 = parseInt(user.灵气);
          user.灵魂力量 = parseInt(user.灵魂力量);
          if(thing_name == "灵气"){
            user.灵气 += Number(num);
          }else if(thing_name == "体魄力量"){
            user.体魄力量 += Number(num);
          }else if(thing_name == "灵魂力量"){
            user.灵魂力量 += Number(num);
          }else if(thing_name == "金钱"){
            user.金钱 += Number(num);
          }
        })
         await user_player.bulkCreate(users, { updateOnDuplicate: Object.keys(user_player.getAttributes()), transaction });
      }else{
        let thing = await (await findThings(thing_name)).one_item;
        if(!thing) return e.reply(`没有找到${thing_name}这个东西`);
        const users:any[] = await user_bag.findAll({ raw:true,transaction });
        users.forEach(async user=> {
          let bag_thing =user[thing.type].find(item => item.name == thing.name);
          if(bag_thing) bag_thing.数量 +=  Number(num);
          else user[thing.type].push({...thing,数量:Number(num)});
        });
        await user_bag.bulkCreate(users, { updateOnDuplicate: Object.keys(user_bag.getAttributes()), transaction });
      }
        e.reply(`全体发送成功`)
       
        await transaction.commit();
        return;
    }




}