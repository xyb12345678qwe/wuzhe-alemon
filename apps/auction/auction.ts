import {APlugin ,AMessage,findIndexByName,Strand,getNonZeroKeys,startstatus,stopstatus,gettupo,getstring,checkZeroValue,checkAllZeroValues,
    checkNameExists,Add_bag_thing, player_zhandou,determineWinner, Read_json, getUserStatus, getString2, oImages,getCacheData,equiment_type as type,filter_equiment,
    findThings,
    AEvent} from '../../api'
import {existplayer,Read_player,Write_player,武者境界, 灵魂境界,体魄境界,finduid,装备列表,transaction_record,findTransaction, updateTransaction,auction_record} from '../../model/gameapi';
import cron from 'node-cron'
let auction_thing:any = [];
cron.schedule("0 0 * * *",async function(){
    let auction:any = await auction_record.findOne({where:{id:1},raw:true});
    if(auction.当前拍卖物品){
        await Add_bag_thing(auction.当前拍卖物品.委托者,auction.当前拍卖物品.name,auction.当前拍卖物品.num,auction.当前拍卖物品);
        auction.当前拍卖物品 = null;
    }
    auction_thing = [];
});

export class auction extends APlugin  {
	constructor() {
		super({
			dsc: '基础模块',
			event: 'message',
			priority: 600,
			rule: [
                {
					reg: /^(#|\/)?委托物品.*$/,
					fnc: 'consignment_item',
                },
                {
					reg: /^(#|\/)?查看当前拍卖物品$/,
					fnc: 'check_consignment_item',
                },
                {
					reg: /^(#|\/)?出价$/,
					fnc: 'bid',
                },
			],
		});
	}
    async bid(e:AEvent){
      const usr_qq = e.user_id;
      if (!await existplayer(1,usr_qq)) return false;
      let [bid] = e.msg.replace(/(\/|#)?委托物品/, "").trim().split("*").map(code => code.trim());
      var currentTime = new Date();
      var currentHour = currentTime.getHours();
      var milliseconds= currentTime.getTime()
      if(currentHour > 21 || currentHour < 20)  return e.reply(`拍卖行未开启或已关闭，拍卖行时间为晚上8点到9点`);
      let auction:any = await auction_record.findOne({where:{id:1},raw:true});
      var randomNumber = Math.random();
      if(!auction.当前拍卖物品){
        if(auction.委托拍卖物品.length != 0){
            auction.当前拍卖物品 = auction.委托拍卖物品[0];
        }else{
            let thing = auction.拍卖物品.filter(item => auction_thing.includes(item.name));
            for(let item of thing){
                if(item.概率 < randomNumber){
                    auction.当前拍卖物品 = item;
                    break;
                };
            }
        }
        if(auction.当前拍卖物品)auction.当前拍卖物品.开启时间 = milliseconds;
        }else{
            if(milliseconds - auction.当前拍卖物品.开启时间 > 300000){
                auction_thing.push(auction.当前拍卖物品.name);
                if(auction.委托拍卖物品.length != 0){
                    if(auction.当前拍卖物品){
                        await Add_bag_thing(auction.当前拍卖物品.委托者,auction.当前拍卖物品.name,auction.当前拍卖物品.num,auction.当前拍卖物品);
                        e.reply(`${auction.当前拍卖物品.委托者}的拍卖物品，无人购买，已返回`);
                    }
                    auction.当前拍卖物品 = auction.委托拍卖物品[0];
                }else{
                    let thing = auction.拍卖物品.filter(item => auction_thing.includes(item.name));
                    for(let item of thing){
                        if(item.概率 < randomNumber){
                            auction.当前拍卖物品 = item;
                            break;
                        };
                    }
                }
                if(auction.当前拍卖物品)auction.当前拍卖物品.开启时间 = milliseconds;
            }
        }
        if(!auction.当前拍卖物品) return e.reply(`当前没有正在拍卖的物品`)
        const currentPrice = auction.当前拍卖物品.price * auction.当前拍卖物品.num;
        if (Number(bid) < currentPrice) return e.reply(`出价不能低于当前物品设置的价格`);
        const minimumPrice = currentPrice * 1.1;
        if (Number(bid) < minimumPrice) return e.reply(`出价不得低于这个物品${currentPrice * 0.1}`);
        let uid = await finduid(usr_qq);
        auction.当前拍卖物品.竞价者 = uid.uid;
        auction.当前拍卖物品.竞拍价 = Number(bid);
        await auction_record.upsert({id:1,...auction});
        setTimeout(async () => {
          let auction:any = await auction_record.findOne({where:{id:1}});
          if(auction.当前拍卖物品.竞价者 == uid.uid){
                let{ player} = await Read_player(1,auction.当前拍卖物品.竞价者);
                if(auction.当前拍卖物品.委托者){
                    let{ player} = await Read_player(1,auction.当前拍卖物品.委托者);
                    player.金钱 += auction.当前拍卖物品.竞拍价;
                    await Write_player(auction.当前拍卖物品.委托者,player);
                }
                player -= auction.当前拍卖物品.竞拍价;
                e.reply(`恭喜${uid.uid}竞得此拍品`);
                auction_thing.push(auction.当前拍卖物品.name);
                auction.当前拍卖物品 = null;
                await auction_record.upsert({id:1,...auction});
                await Write_player(auction.当前拍卖物品.竞价者,player)
                await Add_bag_thing(uid.uid,auction.当前拍卖物品.name,auction.当前拍卖物品.num,auction.当前拍卖物品);
          }
        }, 60000); //设定1分钟，1分钟后判断还是不是原来的竞价者
        e.reply(`开始竟价，1分钟内没人出价，这件拍品就是${uid.uid}的了`)
    }
    async consignment_item(e:AEvent){
      const usr_qq = e.user_id;
      if (!await existplayer(1,usr_qq)) return false;
      let [thing_name,thing_num,price] = e.msg.replace(/(\/|#)?委托物品/, "").trim().split("*").map(code => code.trim());
      let num:number = parseInt(thing_num);
      if(num < 0) return e.reply(`输入数量不能为负数`);
      let {player,bag} = await Read_player(1,usr_qq);
      if(player.金钱 < 10000) return e.reply(`金钱不足,还差${10000 - player.金钱}`);
      const thing = (await findThings(thing_name)).one_item;
      if(!thing) return e.reply(`没有找到这个物品`)
      const bag_thing = bag[thing.type].find(item => item.name == thing_name);
      if(!bag_thing) return e.reply(`你没有${thing_name}`);
      if(bag_thing.数量 < num) return e.reply(`数量不够还差${num- bag_thing.数量}`);
      let uid = await finduid(usr_qq);
      let auction:any = await auction_record.findOne({where:{id:1},raw:true});
      console.log(auction);
      let thing_have:any = auction.委托拍卖物品.find(item => item.name == thing_name && item.委托人 == uid.uid);
      console.log(thing_have);
      if(thing_have){
        thing_have.num += num;
      }else if(!thing_have){
        let x ={
             委托人:uid.uid,
        ...thing,
        num:num,
        price:price
        }
        console.log(x);
        
        auction.委托拍卖物品.push(x)
      }
      await auction_record.upsert({id:1,...auction});
      await Add_bag_thing(usr_qq,thing_name,-num,thing);
      return e.reply(`委托成功`)
    }
    async check_consignment_item(e:AEvent){
        const usr_qq = e.user_id;
        if (!await existplayer(1,usr_qq)) return false;
        var currentTime = new Date();
        var currentHour = currentTime.getHours();
        var milliseconds= currentTime.getTime()
        if(currentHour > 21 || currentHour < 20)  return e.reply(`拍卖行未开启或已关闭，拍卖行时间为晚上8点到9点`);
        let auction:any = await auction_record.findOne({where:{id:1},raw:true});
        var randomNumber = Math.random();
        if(!auction.当前拍卖物品){
            if(auction.委托拍卖物品.length != 0){
                auction.当前拍卖物品 = auction.委托拍卖物品[0];
            }else{

                let thing = auction.拍卖物品.filter(item => auction_thing.includes(item.name));
                for(let item of thing){
                    if(item.概率 < randomNumber){
                        auction.当前拍卖物品 = item;
                        break;
                    };
                }
            }
            if(auction.当前拍卖物品)auction.当前拍卖物品.开启时间 = milliseconds;
        }else{
            if(milliseconds - auction.当前拍卖物品.开启时间 > 300000){
                auction_thing.push(auction.当前拍卖物品.name);
                if(auction.委托拍卖物品.length != 0){
                    if(auction.当前拍卖物品){
                        await Add_bag_thing(auction.当前拍卖物品.委托者,auction.当前拍卖物品.name,auction.当前拍卖物品.num,auction.当前拍卖物品);
                        e.reply(`${auction.当前拍卖物品.委托者}的拍卖物品，无人购买，已返回`);
                    }
                    auction.当前拍卖物品 = auction.委托拍卖物品[0];
                }else{
                    let thing = auction.拍卖物品.filter(item => auction_thing.includes(item.name));
                    for(let item of thing){
                        if(item.概率 < randomNumber){
                            auction.当前拍卖物品 = item;
                            break;
                        };
                    }
                }
                if(auction.当前拍卖物品)auction.当前拍卖物品.开启时间 = milliseconds;
            }
        }
        if(auction.当前拍卖物品){
            e.reply(`
          当前正在拍卖的物品为${auction.当前拍卖物品.name},
          数量为${auction.当前拍卖物品.num},价格为${auction.当前拍卖物品.price},
          剩余时间为${(milliseconds - auction.当前拍卖物品.开启时间)/1000/60}分
        `)
        }else if(!auction.当前拍卖物品){
            e.reply(`当前没有正在拍卖的物品`)
        }
        await auction_record.upsert({id:1,...auction});
    }

}