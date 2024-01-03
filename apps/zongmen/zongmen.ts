import {APlugin ,AMessage,findIndexByName,Strand,getNonZeroKeys,startstatus,stopstatus,gettupo,getstring,checkZeroValue,checkAllZeroValues,
    checkNameExists,player_zhanli,Add_bag_thing, player_zhandou,determineWinner,getB_qq,createPlayerObject,_item,oImages } from "../../api";
import { create_player,existplayer,Read_player,Write_player,武者境界, 灵魂境界,体魄境界,user_id,finduid,妖兽地点,功法列表, 道具列表, 丹方,猎杀妖兽地点, create_zongmen,all_zongmen} from '../../model/gameapi';
export class zongmen extends APlugin  {
    constructor() {
        super({
            /** 功能名称 */
            name: 'zongmen',
            /** 功能描述 */
            dsc: '基础模块',
            event: 'message',
            /** 优先级，数字越小等级越高 */
            priority: 600,
            rule: [
                {
                    reg: /^(#|\/)?开设宗派$/,
                    fnc: 'zongpai',
                },
                {
                    reg: /^(#|\/)?我的宗门$/,
                    fnc: 'myzongmen',
                },
                {
                    reg: /^(#|\/)?宗门列表$/,
                    fnc: 'zongmenlist',
                },
                {
                    reg: /^(#|\/)?加入宗门.*$/,
                    fnc: 'join',
                },
                {
                    reg: /^(#|\/)?退出宗门$/,
                    fnc: 'tuichu',
                },
                {
                    reg: /^(#|\/)?给予身份.*$/,
                    fnc: 'give',
                },
                {
                    reg: /^(#|\/)?领取俸禄$/,
                    fnc: 'lingqu',
                },
                {
                    reg: /^(#|\/)?捐供钱库.*$/,
                    fnc: 'juan',
                },
                {
                    reg: /^(#|\/)?宗门阵法石$/,
                    fnc: 'shi',
                },
            ],
            });
        }
    async shi(e:AMessage):Promise<boolean>{
        const usr_qq = e.user_id;
        const playerExists = await existplayer(1, usr_qq);
        const zongmenExists = await existplayer(2, usr_qq);
        if (!zongmenExists)  return e.reply(`没有宗门`);
        if (!playerExists) return false;
        let results =await Read_player(1,usr_qq);
        let player = results.player
        let results2 =await Read_player(2,player.宗门.宗主);
        let zong = results2.zongmen;
        zong.宗门阵法石= zong.宗门阵法石 || {
        "阵法石1": "无",
        "阵法石2": "无",
        "阵法石3": "无",
        "阵法石4": "无",
        "阵法石5": "无",
        "阵法石6": "无"
        };
        await Write_player(player.宗门.宗主, false, false,false,false,zong)
        const replyMessage = Object.keys(zong.宗门阵法石).map(key => `${key}:${zong.宗门阵法石[key]}`).join('\r');
        return e.reply(replyMessage);
    }
    async juan(e:AMessage):Promise<boolean>{
        const usr_qq = e.user_id;
        const playerExists = await existplayer(1, usr_qq);
        if (!await existplayer(2, usr_qq)) return e.reply(`没有宗门`);
        let name = e.msg.replace(/(\/|#)?捐供钱库/, "").trim();
        let parsedNumber = Number(name);
        if (!playerExists || !name) return false;
        let results =await Read_player(1,usr_qq);
        let player = results.player
        let results2 =await Read_player(2,player.宗门.宗主);
        let zong = results2.zongmen;
        if(parsedNumber > player.金钱) return e.reply(`金钱不够`)
        zong.钱库 += parsedNumber;
        const gongxian = parsedNumber/10000;
        player.宗门.奉献值 = player.宗门.奉献值 ? player.宗门.奉献值 + gongxian : gongxian;
        await Promise.all([
            Write_player(usr_qq, player, false,false,false),
            Write_player(player.宗门.宗主, false, false,false,false,zong),
        ]);
        return e.reply(`捐供成功,目前钱库有${zong.钱库},获得贡献${gongxian}`);
    }
    async lingqu(e:AMessage):Promise<boolean>{
        const usr_qq = e.user_id;
        const currentTimeMillis = new Date().getTime();
        const playerExists = await existplayer(1, usr_qq);
        if (!await existplayer(2, usr_qq)) return e.reply(`没有宗门`);
        if (!playerExists ) return false;
        let results =await Read_player(1,usr_qq);
        let player = results.player
        let results2 =await Read_player(2,player.宗门.宗主);
        let zong = results2.zongmen;
        if (player.宗门.俸禄_time && (currentTimeMillis - player.宗门.俸禄_time) / (1000 * 60 * 60) < 24) return e.reply(`24小时可领取一次`)
        let money;
        if(player.宗门.身份 == '宗主' ||player.宗门.身份 == '副宗主') return e.reply(`？？?都是${player.宗门.身份}领啥俸禄`);
        switch (player.宗门.身份) {
            case '成员':
                money = 10000;
            case '长老':
                money  = 20000;
        }
        if(zong.钱库 < money) return e.reply(`钱库没有足够的钱`)
        player.金钱 += money;
        zong.钱库 -= money;
        player.宗门.俸禄_time =  currentTimeMillis;
        await Promise.all([
            Write_player(usr_qq, player, false,false,false),
            Write_player(player.宗门.宗主, false, false,false,false,zong),
        ]);
        return e.reply(`领取成功，获得${money}元`);
    }
    async give(e:AMessage):Promise<boolean>{
        const usr_qq = e.user_id;
        const playerExists = await existplayer(1, usr_qq);
        if (!await existplayer(2, usr_qq)) return e.reply(`没有宗门`);
        const name = e.msg.replace(/(\/|#)?给予身份/, "").trim();
        if (!playerExists || !name) return false;
        let results =await Read_player(1,usr_qq);
        let player = results.player
        let B_usr_qq = await getB_qq(e, "id");
        if (B_usr_qq == 0) return e.reply('欸，你要给予谁身份');
        if (B_usr_qq == 1) return e.reply(`对方无存档`);
        let B_results = await Read_player(1,B_usr_qq);
        let B_player = B_results.player;
        if (player.宗门.身份 !== "宗主") return e.reply(`不是宗主无法给予身份`);
        if (name == "宗主") return e.reply(`没死，无法传位`);
        if (B_player.宗门.宗主 !== player.宗门.宗主) return e.reply(`？？？纳尼,你要给谁传位,咱宗有这个人吗`);
        if (name !== "成员" && name !== "长老" && name !== '副宗主') return e.reply(`没有这个身份`);
        let results2 =await Read_player(2,player.宗门.宗主);
        let zong = results2.zongmen;
        const shenfen = B_player.宗门.身份;
        zong[shenfen] = zong[shenfen].filter(item => item !== usr_qq);
        zong[name].push(B_usr_qq);
        player.宗门.身份 = name;
        await Promise.all([
            Write_player(usr_qq, player, false,false,false),
            Write_player(player.宗门.宗主, false, false,false,false,zong),
        ]);
        return e.reply(`给予成功`);
    }
    async tuichu(e:AMessage):Promise<boolean>{
        const usr_qq = e.user_id;
        const playerExists = await existplayer(1, usr_qq);
        if (!await existplayer(2, usr_qq)) return e.reply(`没有宗门`);
        const name = e.msg.replace(/(\/|#)?加入宗门/, "").trim();
        if (!playerExists || !name) return false;
        let results =await Read_player(1,usr_qq);
        let player = results.player
        if(player.宗门.身份 == "宗主") return e.reply(`宗主无法退出宗门`)
        let results2 =await Read_player(2,player.宗门.宗主);
        let zong = results2.zongmen;
        const shenfen = player.宗门.身份;
        zong[shenfen] = zong[shenfen].filter(item => item !== usr_qq);
        player.宗门 = '';
        await Promise.all([
            Write_player(usr_qq, player, false,false,false),
            Write_player(player.宗门.宗主, false, false,false,false,zong),
        ]);
        return e.reply(`退出成功`);
    }
    async join(e:AMessage):Promise<boolean>{
        const usr_qq = e.user_id;
        const playerExists = await existplayer(1, usr_qq);
        if (await existplayer(2, usr_qq)) return e.reply(`已有宗门`);
        const name = e.msg.replace(/(\/|#)?加入宗门/, "").trim();
        if (!playerExists || !name) return false;
        let list = await all_zongmen();
        let json = await Promise.all(list.map(async (user) => {
            const results = await Read_player(2, user);
            const zongmen = results
            return {
                name: zongmen.name,
                mainqq: zongmen.宗主
            };
        }));
        const zongmen = json.find(item => item.name === name);
        if (!zongmen) return e.reply(`没有这个宗门`);
        let results2 =await Read_player(2,zongmen.mainqq);
        let zong = results2.zongmen;
        const idlist = await finduid(usr_qq)
        zong.成员.push(idlist.id);
        let results =await Read_player(1,usr_qq);
        let player = results.player
        player.宗门 = {
            宗主: zongmen.mainqq,
            身份: "成员",
            奉献值:0,
            俸禄_time:0,
        };
        await Promise.all([
            Write_player(usr_qq, player, false,false,false),
            Write_player(player.宗门.宗主, false, false,false,false,zong),
        ]);
        return e.reply(`加入成功`);
    }
    async zongpai(e:AMessage):Promise<boolean>{
        const usr_qq = e.user_id
        if (!await existplayer(1, usr_qq)) return false;
        if(await existplayer(2, usr_qq)) return this.myzongmen(e);
        let results =await Read_player(1,usr_qq);
        let player = results.player
        if(!player.武者境界.includes(`B阶`))return e.reply(`没到B阶武者，不能开设宗门`);
        this.setContext("1")
        return e.reply(`清输入宗门名字`);
    }
    async 1(e:AMessage):Promise<boolean>{
        const usr_qq = e.user_id
        let results =await Read_player(1,usr_qq);
        let player = results.player
        const list = await finduid(usr_qq)
        player.宗门 = {
            宗主:list.uid,
            身份:"宗主",
            奉献值:0,
            俸禄_time:0,
        }
        await Write_player(usr_qq, player, false,false,false);
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth() + 1;
        const currentDay = currentDate.getDate();
        const dateString = `${currentYear}-${currentMonth}-${currentDay}`;
        await create_zongmen(list.uid,this.e.msg,dateString)
        this.finish("1")
        return e.reply(`宗门创建成功`);
    }
    async myzongmen(e:AMessage):Promise<boolean>{
        const usr_qq = e.user_id;
        const playerExists = await existplayer(1, usr_qq);
        const zongmenExists = await existplayer(2, usr_qq);
        if (!playerExists || !zongmenExists) return false;
        const results= await Read_player(1,usr_qq)
        let player = results.player;
        const results2 = await Read_player(2,player.宗门.宗主)
        let zongmen = results2.zongmen;
        const results3= await Read_player(1,player.宗门.宗主)
        const zongzhu = results3.player;
        const people = zongmen?.长老?.length + zongmen?.副宗主?.length + zongmen?.成员?.length + 1;
        const strand_hp = await Strand(player?.当前生命, player?.生命上限);
        const jingjie = zongmen.加入最高境界+ "-" + zongmen.加入最低境界 + '(最高境界-最低境界)'
        let temp:any={
			player: player,
            zongmen,
            zongzhu,
            people,
            strand_hp,
            jingjie
		};
		const img = await oImages('/resources/html/zongmen/zongmen.html',temp)
		if(img) e.reply(img)
        return true;
    }
    async zongmenlist(e:AMessage):Promise<boolean>{
        const usr_qq = e.user_id;
        const playerExists = await existplayer(1, usr_qq);
        if (!playerExists) return false;
        let list = await all_zongmen();
        let json:any = [];
        for (const user of list) {
            const results2 = await Read_player(2,user)
            let zongmen = results2.zongmen;
            console.log(zongmen);
            const people = zongmen?.长老?.length + zongmen?.副宗主?.length + zongmen?.成员?.length + 1;
            zongmen.人数 = people;
            json.push(zongmen);
        }
        console.log(json);

        let temp = {
        json: json
        };
        const img = await oImages('/resources/html/zongmenlist/zongmenlist.html', temp);
        if (img) e.reply(img);
        return true;
    }
}


