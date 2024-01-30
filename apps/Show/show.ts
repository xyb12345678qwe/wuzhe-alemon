import {APlugin ,AMessage,AEvent,findIndexByName,Strand,Read_yaml,extractAttributesWithPropertyOne, Add_bag_thing,oImages, Read_json,wanjietang_thing, getCacheData} from '../../api'
import { create_player,existplayer,Read_player,Write_player,武者境界, 灵魂境界,体魄境界,user_id,finduid,妖兽地点,功法列表, 道具列表, 丹方,猎杀妖兽地点, user_player} from '../../model/gameapi';
export class show extends APlugin{
	constructor() {
		super({
			/** 功能描述 */
			dsc: '基础模块',
			event: 'message',
			/** 优先级，数字越小等级越高 */
			priority: 600,
			rule: [
            {
			    reg: /^(#|\/)?万界堂$/,
			    fnc: 'wanjietang',
		    },
			{
			    reg: /^(#|\/)?购买.*$/,
			    fnc: 'buy',
		    },
			{
			    reg: /^(#|\/)?我的背包$/,
			    fnc: 'bag',
		    },
			{
			    reg: /^(#|\/)?境界排行榜.*$/,
			    fnc: 'jingjiepaihangbang',
		    },
			],
		});
	}
	async bag(e:AEvent):Promise<boolean>{
		const usr_qq = e.user_id;
		if (!await existplayer(1, usr_qq)) return false;
		const results = await Read_player(1,usr_qq);
		let player = results.player
		let strand_hp= await Strand(player.当前生命, player.生命上限);
		let bag = results.bag
		// interface temp_{
		// 	name:string
		// }
		let temp={
			name: player.name,
			宣言: player.宣言,
			player: player,
			strand_hp,
			bag
		};
		const img = await oImages('/resources/html/bag/bag.html',temp)
		if(img) e.reply(img)
		return true;
	}
	async buy(e:AEvent):Promise<boolean>{
		const usr_qq = e.user_id;
		const name: string = e.msg.replace(/(\/|#)?购买/, "").trim();
		let [adress, thing_name, num] = name.split("*").map(code => code.trim());
		if(!adress || !thing_name || !num) return e.reply(`缺失参数`);
		if(adress !== "万界堂") return e.reply('没有这个商店');
		const x = await wanjietang_thing()
		const thing = x.find(item =>item.name === thing_name)
		if(!thing)return e.reply(`没有这个物品`);
		const money = thing.价格 * Number(num);
		console.log(money);
		const results = await Read_player(1,usr_qq);
		let player = results.player
		if(player.金钱 < money)return e.reply(`金钱不够`)
		player.金钱 -= money;
		e.reply(`购买成功`)
		await Add_bag_thing(usr_qq,thing_name,Number(num),thing)
		await Write_player(usr_qq,player,false,false,false)
		return true;
	}
    async wanjietang(e:AEvent):Promise<boolean>{
        const combinedArray = await wanjietang_thing()
        let temp = {x:combinedArray}
		const img = await oImages('/resources/html/wanjietang/wanjietang.html',temp)
		if(img) e.reply(img)
        return false;
    }
	async jingjiepaihangbang(e:AEvent){
		let [page] = e.msg.replace(/(\/|#)?境界排行榜/, "").trim().split("*").map(code => code.trim());
		let pages = parseInt(page)
		if (Number(pages) <= 0) return e.reply(`页数不能小于等于0`);
		if (!pages) pages = 1; // 如果没有输入页数，则默认设为1
		const users: any[] = await user_player.findAll({ raw: true });
		const 武者境界 = await getCacheData(`武者境界`);
		let paihang: any[] = [];
		const indexMap: { [key: string]: number } = {};
		武者境界.forEach((item, index) => {
		indexMap[item.name] = index;
		});
		users.forEach((user) => {
		paihang.push({
			uid: user.uid,
			name: user.name,
			武者境界: user.武者境界,
			index: indexMap[user.武者境界],
			名次: 0, // 初始化名次为0
		});
		});
		paihang.sort((a, b) => b.index - a.index);
		let i = 0;
		let currentRank = 0;
		paihang.forEach((user) => {
		if (user.index !== currentRank) {
			currentRank = user.index;
			i++;
		}
		user.名次 = i; // 设置名次属性
		user.color = i <= 2 ? "#ffcc00" : "#fff";
		
		});
		let all_pages = Math.ceil(paihang.length / 10);
		if (all_pages < Number(pages)) return e.reply(`没有这一页`);
		const startIndex = 10 * (Number(pages) - 1);
		const endIndex = startIndex + 10;
		const pageData = paihang.slice(startIndex, endIndex); // 获取当前页的数据
		paihang = pageData;
		const img = await oImages('/resources/html/paihangbang/paihangbang.html',{paihang,all_pages,pages});
		if(img) return e.reply(img)
	}
}
