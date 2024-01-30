import {APlugin ,AMessage,findIndexByName,Strand,getNonZeroKeys,startstatus,stopstatus,gettupo,getstring,checkZeroValue,checkAllZeroValues,
    checkNameExists,Add_bag_thing, player_zhandou,determineWinner, Read_json, getUserStatus, getString2, oImages,getCacheData,equiment_type as type,filter_equiment,
    findThings,
    AEvent} from '../../api'
import {existplayer,Read_player,Write_player,武者境界, 灵魂境界,体魄境界,finduid,装备列表,transaction_record,findTransaction, updateTransaction,auction_record} from '../../model/gameapi';

export class mysterious_realm extends APlugin  {
	constructor() {
		super({
			dsc: '基础模块',
			event: 'message',
			priority: 600,
			rule: [
                {
					reg: /^(#|\/)?查看秘境.*$/,
					fnc: 'check_mysterious_realm',
                },
				{
					reg: /^(#|\/)?探索秘境.*$/,
					fnc: 'exploring_mysterious_realm',
                }
			],
		});
	}
	async check_mysterious_realm(e:AEvent){
		let [page] = e.msg.replace(/(\/|#)?查看秘境/, "").trim().split("*").map(code => code.trim());
		let pages = parseInt(page);
		if (pages <= 0) return e.reply(`页数不能小于等于0`);
		if(!pages) pages = 1;
		let 秘境 = await getCacheData('秘境列表');
		let all_pages = Math.ceil(秘境.length / 10);
		if (all_pages < Number(pages)) return e.reply(`没有这一页`);
		const startIndex = 10 * (Number(pages) - 1);
		const endIndex = startIndex + 10;
		const pageData:any = 秘境.slice(startIndex, endIndex); // 获取当前页的数据
		let msg:any[] = [`****秘境****`];
		pageData.forEach(item =>{
			msg.push(`\n秘境名:${item.name}【金钱:${item.price}】`)
		})
		msg.push(`\n${pages}/${all_pages}`);
		e.reply(msg);
	}
	async exploring_mysterious_realm(e:AEvent){
		const usr_qq = e.user_id;
        if (!await existplayer(1, usr_qq)) return false;
        let {player,status} = await Read_player(1,usr_qq);
        const [thing_name] = e.msg.replace(/(\/|#)?探索秘境/, "").trim().split("*").map(code => code.trim());
		let 秘境列表 = await getCacheData('秘境列表');
		let 秘境 = 秘境列表.find(item => item.name == thing_name);
		if(!秘境) return e.reply(`没有这个秘境`);
		const activeStatus = await getNonZeroKeys(status);
        if(activeStatus) return e.reply(`你在${activeStatus}中`);
		const now = Date.now();
		status.秘境  = now;
		if(!player.秘境目标) player.秘境目标 = {};
		player.秘境目标.目标 = thing_name; 
		e.reply(`正在探索${thing_name},5分钟后归来`);
		await Write_player(usr_qq,player,false,false,status);
	}



}