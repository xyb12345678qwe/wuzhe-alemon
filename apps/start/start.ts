import {plugin ,AMessage,Show,puppeteer,findIndexByName,Strand,_item,pic,Read_yaml,Write_json,oImages, Read_json} from '../../api'
import { getlingqi,create_player,existplayer,Read_player,Write_player,武者境界, 灵魂境界,体魄境界,user_id,finduid} from '../../model/gameapi';
let shezhi ={}
export class start extends plugin  {
	constructor() {
		super({
			/** 功能名称 */
			name: 'start',
			/** 功能描述 */
			dsc: '基础模块',
			event: 'message',
			/** 优先级，数字越小等级越高 */
			priority: 600,
			rule: [
        {
			    reg: /^(#|\/)?查看本平台id$/,
			    fnc: 'id',
		    },
         {
			    reg: /^(#|\/)?踏入武者$/,
			    fnc: 'start',
		    },
        {
			    reg: /^(#|\/)?备用踏入武者$/,
			    fnc: 'bt',
		    },
        {
			    reg: /^(#|\/)?改名.*$/,
			    fnc: 'gm',
		    },
        {
			    reg: /^(#|\/)?改姓.*$/,
			    fnc: 'gx',
		    },
        {
		    	reg: /^(#|\/)?觉醒灵器.*$/,
		    	fnc: 'j',
	    	},
        {
		    	reg: /^(#|\/)?个人信息.*$/,
	    		fnc: 'information',
	    	},
        {
          reg: /^(#|\/)?(武者帮助|帮助)$/,
          fnc: 'help',
        },
         {
          reg: /^(#|\/)?我的灵器$/,
          fnc: 'my',
        },
         {
          reg: /^(#|\/)?设置年龄.*$/,
          fnc: 'year',
        },
         {
          reg: /^(#|\/)?机器验证.*$/,
          fnc: 'yan',
        },
        {
          reg: /^(#|\/)?修改宣言.*$/,
          fnc: 'xuan',
        },
        {
			    reg: /^(#|\/)?连接uid.*$/,
			    fnc: 'lianid',
		    },
        {
			    reg: /^(#|\/)?断开uid$/,
			    fnc: 'duanid',
		    },
        {
			    reg: /^(#|\/)?添加uid可连接qq.*$/,
			    fnc: 'add',
		    },
			],
		});
	}
  async add(e: AMessage): Promise<boolean>{
    const usr_qq =e.user_id;
    if (!await existplayer(1, usr_qq)) return e.reply(`请先连接uid`);
    const name = e.msg.replace(/(\/|#)?添加uid可连接qq/, "").trim();
    const id:any = await finduid(usr_qq);
    const id2:any = await finduid(name);
    if(id2) return e.reply("对方已有绑定账号")
    if(!id.允许绑定账号.includes(usr_qq))id.允许绑定账号.push(usr_qq);
    return e.reply(`添加成功 `)
  } 
  async lianid(e: AMessage): Promise<boolean>{
    const usr_qq =e.user_id;
    if (await existplayer(1, usr_qq)) return false;
    const name = e.msg.replace(/(\/|#)?连接uid/, "").trim();
    const id: any = await user_id.findOne({ where: { uid: name }, raw: true });
    if(!id.允许绑定账号.includes(usr_qq)) return e.reply(`你无资格绑定此账号`)
    id.绑定账号.push(usr_qq)
    user_id.upsert({ uid: id.uid,...id});
    return e.reply(`连接成功  `)
  }
  async duanid(e: AMessage): Promise<boolean>{
    const usr_qq =e.user_id;
    if (!await existplayer(1, usr_qq)) return false;
    const id:any = await finduid(usr_qq);
    id.绑定账号 = id.绑定账号.filter(item => item !== usr_qq);
    user_id.upsert({ uid: id.uid,...id});
    return e.reply(`断开成功  `)
  }
  async id(e: AMessage): Promise<boolean>{
    return e.reply(e.user_id)
  }
  async start(e: AMessage): Promise<boolean>{
    const usr_qq =e.user_id;
    if (await existplayer(1, usr_qq)) return this.information(e);
    e.reply(`请输入你的性别`);
    this.setContext('1')
    return false;
  }
  async 1(e: AMessage): Promise<boolean>{
    const usr_qq =e.user_id;
    !/男|女/.test(this.e.msg) && e.reply('输入错误，自动选择男')
    shezhi[usr_qq] = this.e.msg || '男'
    this.finish('1')
    this.setContext('2')
    e.reply(`请输入你的名字`)
    return false;
  }
  async 2(e: AMessage){
    const usr_qq = e.user_id;
    console.log(shezhi[usr_qq]);
    await create_player(e,usr_qq,this.e.msg,shezhi[usr_qq])
    this.finish('2')
    e.reply(`创建存档成功`)
  }
  async xuan(e: AMessage): Promise<boolean>{
    const usr_qq = e.user_id;
    if (!await existplayer(1, usr_qq)) return false;
    const name = e.msg.replace(/(\/|#)?修改宣言/, "").trim();
    let result = await Read_player(1,usr_qq);
    let player = result.player;
    player.宣言 =name
    await Write_player(usr_qq,player,false,false,false)
    return e.reply(`修改成功`)
  }
  async year(e: AMessage): Promise<boolean>{
    const usr_qq = e.user_id;
    if (!await existplayer(1, usr_qq)) return false;
    let name = parseInt(e.msg.replace(/(\/|#)?设置年龄/, "").trim());
    let result = await Read_player(1,usr_qq);
    let player = result.player;
    let rand = Math.floor(Math.random() * 10000); // 生成一个四位数的随机验证码
    console.log(player.机器验证);
    if (player.机器验证.length !== 0) return e.reply(`请先填写验证码,验证码为${player.机器验证[0]}`);
    if (name <= 20) return e.reply(`不信请重新使用指令输入年龄`);
    player.机器验证.push(rand);
    player.机器验证.push(name)
    await Write_player(usr_qq,player,false,false,false)
    let replyMsg = "";
    if (name <= 40) replyMsg = `设置完毕, 我怀疑你是机器人, 请用指令输入验证码, 验证码为${rand}`;
    else if (name <= 100) replyMsg = `设置完毕, 老baby, 等等, 我怀疑你是机械老baby, 请用填写机器验证的指令填写验证, 验证码${rand}`;
    else if (name <= 5000) replyMsg = `设置完毕, 老登, 等等, 我怀疑你是机械老登, 请用填写机器验证的指令填写验证, 验证码${rand}`;
    else if (name <= 999999999) replyMsg = `设置完毕, 霸王龙, 等等, 我怀疑你是机械霸王龙, 请使用指令输入验证码${rand}`;
    else replyMsg = `请输入有效的年龄范围`;
    return e.reply(replyMsg);
}
  async yan(e: AMessage): Promise<boolean>{
    const usr_qq = e.user_id;
    if (!await existplayer(1, usr_qq)) return false;
    let name = parseInt(e.msg.replace(/(\/|#)机器验证/, "").trim());
    let result = await Read_player(1,usr_qq);
    let player = result.player;
    if(player.机器验证.length === 0) return e.reply(`没有验证码`);
    if(player.机器验证[0] !== name) return e.reply(`验证码错误`);
    player.机器验证 =[]
    player.年龄 = player.机器验证[1]
    await Write_player(usr_qq,player,false,false,false)
    return e.reply(`验证码通过`);
  }
  async help(e:AMessage){
    let helpData = await Read_yaml(1)
    const img = await oImages('/resources/html/help/help.html',{helpData})
    if(img) e.reply(img)
    return false;
  }
  async bt(e:AMessage): Promise<boolean>{
    return e.reply(`暂时废弃`)
 
  }
  async j(e:AMessage): Promise<boolean>{
    const usr_qq = e.user_id;
    if (!await existplayer(1, usr_qq)) return false;
    let result = await Read_player(1,usr_qq);
    let player = result.player;
    if(!player.本命灵器)player.本命灵器="无";
    if(player.本命灵器 !="无") return e.reply(`你已觉醒过了本名灵器`)
    e.reply(`开始觉醒灵器`)
    player.本命灵器 = await getlingqi(e)
    player.攻击加成+= player.本命灵器.攻击加成
    player.防御加成+= player.本命灵器.防御加成
    player.暴击加成+= player.本命灵器.暴击加成
    player.爆伤加成+= player.本命灵器.爆伤加成
    player.生命加成+= player.本命灵器.生命加成
    player.闪避加成+= player.本命灵器.闪避加成
    await Write_player(usr_qq,player,false,false,false)
    return false;
  }
  async gx(e: AMessage): Promise<boolean>{
    const usr_qq = e.user_id;
    if (!await existplayer(1, usr_qq)) return false;
    const name = e.msg.replace(/(\/|#)改姓/, "").trim();
    let result = await Read_player(1,usr_qq);
    let player = result.player;
    if(player.性别 === name) return e.reply(`你已经是这个姓了`)
    player.性别 =name
    await Write_player(usr_qq,player,false,false,false)
    return e.reply(`修改成功`)
  }
  async gm(e: AMessage): Promise<boolean>{
    const usr_qq = e.user_id;
    if (!await existplayer(1, usr_qq)) return false;
    const name = e.msg.replace(/(\/|#)改名/, "").trim();
    let result = await Read_player(1,usr_qq);
    let player = result.player;
    if(player.name === name) return e.reply(`名字不能和原来的相同`)
    player.name = name
    await Write_player(usr_qq,player,false,false,false)
    return e.reply(`修改成功`)
  }
  async information(e: AMessage): Promise<boolean>{
    const usr_qq: string = e.user_id;
    if (!await existplayer(1, usr_qq)) return false;
    let result = await Read_player(1,usr_qq);
    let player:any = result.player;
    console.log(player);
    
    let rank_wuzhe: string = player.武者境界;
    let expmax_wuzhe:any =await 武者境界.findAll({raw:true});
    expmax_wuzhe = expmax_wuzhe.find(item => item.name === rank_wuzhe)?.灵气;
    let rank_tipo: any = player.体魄境界;
    let expmax_tipo:any =await 体魄境界.findAll({raw:true});
    expmax_tipo = expmax_tipo.find(item => item.name === rank_tipo)?.体魄力量;
    let x:any =await 灵魂境界.findAll({raw:true});
    let rank_hun: any = player.灵魂境界;
    let expmax_hun = x.find(item => item.name === rank_hun)?.灵魂力量;

    let strand_hp: any = await Strand(player.当前生命, player.生命上限);
    let strand_wuzhe: any = await Strand(player.灵气, expmax_wuzhe);
    let strand_tipo: any = await Strand(player.体魄力量, expmax_tipo);
    let strand_hun: any = await Strand(player.灵魂力量, expmax_hun);

    let equipment: any = result.equipment;
    console.log(player);
    // console.log(mainWeapon.id);
    
    // console.log(mainWeapon);
    
    console.log(equipment);
    let get_data: {
    name: string;
    宣言: string;
    player:any,
    rank_wuzhe: string;
    expmax_wuzhe: number | undefined;
    strand_wuzhe: string;
    rank_tipo: string;
    expmax_tipo: number | undefined;
    strand_tipo: string;
    rank_hun: string;
    expmax_hun: number | undefined;
    strand_hun: string;
    strand_hp: string;
    equipment:any;
    } = {
    name: player.name,
    宣言: player.宣言,
    player: player,
    rank_wuzhe,
    expmax_wuzhe,
    strand_wuzhe,
    rank_tipo,
    expmax_tipo,
    strand_tipo,
    rank_hun,
    expmax_hun,
    strand_hun,
    strand_hp,
    equipment,
    };
  await Write_player(usr_qq,player,false,false,false);
  const img = await oImages('/resources/html/player/player.html',get_data)
  if(img) return e.reply(img)
  // await pic(e, get_data, `get_playerData`)
  return false;
  }

  async my(e: AMessage){
    const usr_qq = e.user_id;
    if (!await existplayer(1, usr_qq)) return;
    let result = await Read_player(1,usr_qq);
    let player = result.player;
    let lingqi = player.本命灵器
    let x = player.本命灵器.品级
    let 颜色;
    if(x === "低级灵器")颜色 ="#7CB342"
    if(x === "中级灵器")颜色 = "#039BE5"
    if(x === "高级灵器")颜色 ="#8E24AA"
    if(x === "帝器")颜色 ="#FFD700"
    const exp = lingqi.等级*1000;
    let get_data = {
     weaponData: player.本命灵器,
     player,
     lingqi,
     颜色,
     exp
    }
    const img = await oImages('/resources/html/lingqi/lingqi.html',get_data)
    if(img) return e.reply(img)
    // await pic(e, get_data, `get_lingqi`); //导入到html
    return;
  }   
}