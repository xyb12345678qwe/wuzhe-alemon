
  import { existplayer,Read_player,Write_player,Write_playerData,getlingqi ,findIndexByName,Strand,_item,pic,Read_yaml,generateUID,Read_json_path,Write_json_path ,Write_json,getidlist} from "../../model/wuzhe";
import {plugin,AMessage,Show,puppeteer,Help} from '../../app-config'
import md5 from 'md5';
import { get } from "http";
interface HelpData {
  md5: string;
  img: Buffer | undefined |string |false ;
}

const helpData:HelpData = {
  md5: '',
  img: undefined
};

let 性别 = "x";
let 名字 = "1"
export class start extends plugin {
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
			    reg: /^(#|\/)解除账号绑定id.*$/,
			    fnc: 'jianid',
		    },
         {
			    reg: /^(#|\/)添加账号绑定id.*$/,
			    fnc: 'addid',
		    },
        {
			    reg: /^(#|\/)查看本平台id$/,
			    fnc: 'id',
		    },
         {
			    reg: /^(#|\/)踏入武者$/,
			    fnc: 'start',
		    },
        {
			    reg: /^(#|\/)备用踏入武者$/,
			    fnc: 'bt',
		    },
        {
			    reg: /^(#|\/)改名.*$/,
			    fnc: 'gm',
		    },
        {
			    reg: /^(#|\/)改姓.*$/,
			    fnc: 'gx',
		    },
        {
		    	reg: /^(#|\/)觉醒灵器.*$/,
		    	fnc: 'j',
	    	},
        {
		    	reg: /^(#|\/)个人信息.*$/,
	    		fnc: 'information',
	    	},
        {
          reg: /^(#|\/)武者帮助$/,
          fnc: 'help',
        },
         {
          reg: /^(#|\/)我的灵器$/,
          fnc: 'my',
        },
         {
          reg: /^(#|\/)设置年龄.*$/,
          fnc: 'year',
        },
         {
          reg: /^(#|\/)机器验证.*$/,
          fnc: 'yan',
        },
        {
          reg: /^(#|\/)修改宣言.*$/,
          fnc: 'xuan',
        },
			],
		});
	}
  async jianid(e: AMessage): Promise<boolean>{
    const usr_qq =e.user_id;
    if (!await existplayer(1, usr_qq, 'player')) return false;
    const name = e.msg.replace(/(\/|#)解除账号绑定id/, "").trim();
    const json = await Read_json_path(`/resources/data/player.json`);
    const list = json.find(item => item.绑定账号.includes(usr_qq));
    if(!list.绑定账号.includes(name))return e.reply(`无此id`)
    list.绑定账号[name] =''
    await Write_json_path(`/resources/data/player.json`,json)
    return true
  }
  async addid(e: AMessage): Promise<boolean>{
    const usr_qq =e.user_id;
    if (!await existplayer(1, usr_qq, 'player')) return false;
    const name = e.msg.replace(/(\/|#)添加账号绑定id/, "").trim();
    const json = await Read_json_path(`/resources/data/player.json`);
    const list = json.find(item => item.绑定账号.includes(usr_qq));
    if(list.绑定账号.includes(usr_qq))return e.reply(`已有此id`)
    if(json.find(item => item.绑定账号.includes(name))) return e.reply(`对方已有账号`)
    list.绑定账号.push(name)
    await Write_json_path(`/resources/data/player.json`,json)
    return true
  }
  async id(e: AMessage): Promise<boolean>{
    return e.reply(e.user_id)
  }
  async start(e: AMessage): Promise<boolean>{
    const usr_qq =e.user_id;
    if (await existplayer(1, usr_qq, 'player')) return this.information(e);
    e.reply(`请输入你的性别`);
    this.setContext('1')
    return false;
  }
  async 1(e: AMessage): Promise<boolean>{
    if(this.e.msg =="男") 性别 ="男"
    else if(this.e.msg =="女")性别 ="女"
    else {
      e.reply(`性别错误自动选择男`)
      性别 ="男"
    } 
    this.finish('1')
    this.setContext('2')
    e.reply(`请输入你的名字`)
    return false;
  }
  async 2(e: AMessage): Promise<boolean>{
    const usr_qq = e.user_id;
    
    let new_player:any={
      id:await generateUID(e),
      name:名字,
      性别:"无",
      宣言:"无",
      年龄:0,
      语言包:"无",
      武者境界: "F阶低级武者",
	    体魄境界: "体魄一重天",
	    灵魂境界: "灵魂境界一重天",
      灵气:0,
      体魄力量:0,
      灵魂力量:0,
      攻击加成:100,
      防御加成:100,
      暴击加成:0.01,
      爆伤加成:0.01,
      生命加成:100,
      闪避加成:0,
      当前生命:1000,
      生命上限:1000,
      金钱:1000,
      本命灵器:"无",
      机器验证:[]

    }
    let new_bag:any={
      道具:[],
      功法:[]
    }
    let new_equiment:any={
      武器:"无",
      胸甲:"无",
      腿甲:"无",
      法宝:"无",
    }
    let new_status:any={
      打工:0,
      "修炼": 0,
	    "锻炼": 0,
	    "修炼灵魂": 0,
      "猎杀妖兽":0,
      "猎妖":0
    }
    
    e.reply(`开始觉醒灵器`)
    new_player.本命灵器= await getlingqi(e)
    if(new_player.本命灵器){
    new_player.攻击加成+= new_player.本命灵器.攻击加成
    new_player.防御加成+= new_player.本命灵器.防御加成
    new_player.暴击加成+= new_player.本命灵器.暴击加成
    new_player.爆伤加成+= new_player.本命灵器.爆伤加成
    new_player.生命加成+= new_player.本命灵器.生命加成
    new_player.闪避加成+= new_player.本命灵器.闪避加成
    }
    const json = await Read_json_path(`/resources/data/player.json`);
    let list ={
      id:new_player.id,
      绑定账号:[usr_qq],
    }
    console.log(list);
    console.log(json);
    json.push(list)
    await Write_json_path(`/resources/data/player.json`,json)
    await Write_playerData(usr_qq,new_player,new_bag,new_equiment,new_status,"无","无");
    this.finish('2')
    return false;
  }
  async xuan(e: AMessage): Promise<boolean>{
    const usr_qq = e.user_id;
    if (!await existplayer(1, usr_qq, 'player')) return false;
    const name = e.msg.replace(/(\/|#)修改宣言/, "").trim();
    let player= await Read_player(1,usr_qq,"player")
    player.宣言 =name
    await Write_player(1,usr_qq,player,"player")
    return e.reply(`修改成功`)
  }
  async year(e: AMessage): Promise<boolean>{
    const usr_qq = e.user_id;
    if (!await existplayer(1, usr_qq, 'player')) return false;
    let name = parseInt(e.msg.replace(/(\/|#)设置年龄/, "").trim());
    let player = await Read_player(1, usr_qq, "player");
    let rand = Math.floor(Math.random() * 10000); // 生成一个四位数的随机验证码
    console.log(player.机器验证);
    if (player.机器验证.length !== 0) return e.reply(`请先填写验证码,验证码为${player.机器验证[0]}`);
    if (name <= 20) return e.reply(`不信请重新使用指令输入年龄`);
    player.机器验证.push(rand);
    player.机器验证.push(name)
    await Write_player(1, usr_qq, player, "player");
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
    if (!await existplayer(1, usr_qq, 'player')) return false;
    let name = parseInt(e.msg.replace(/(\/|#)机器验证/, "").trim());
    let player = await Read_player(1, usr_qq, "player");
    if(player.机器验证.length === 0) return e.reply(`没有验证码`);
    if(player.机器验证[0] !== name) return e.reply(`验证码错误`);
    player.机器验证 =[]
    player.年龄 = player.机器验证[1]
    await Write_player(1, usr_qq, player, "player");
    return e.reply(`验证码通过`);
  }
  async help(e:AMessage){
    let data = await Help.get(e);
    if (!data) return;
    let img= await cache(data);
    if(img) e.reply(img);
    return false;
  }
  async bt(e:AMessage): Promise<boolean>{
    const usr_qq = e.user_id;
    if (await existplayer(1, usr_qq, 'player')) {return this.information(e)}
    let new_player={
      id:"usr_qq",
      name:"无名氏",
      性别:"无",
      宣言:"无",
      年龄:0,
      语言包:"无",
      武者境界: "F阶低级武者",
	    体魄境界: "体魄一重天",
	    灵魂境界: "灵魂境界一重天",
      灵气:0,
      体魄力量:0,
      灵魂力量:0,
      攻击加成:100,
      防御加成:100,
      暴击加成:0.01,
      爆伤加成:0.01,
      生命加成:100,
      闪避加成:0,
      当前生命:1000,
      生命上限:1000,
      金钱:1000,
      本命灵器:"无",
      机器验证:[]

    }
    let new_bag={
      道具:[],
      功法:[]
    }
    let new_equiment={
      武器:"无",
      胸甲:"无",
      腿甲:"无",
      法宝:"无",
    }
    let new_status={
      打工:0,
      "修炼": 0,
	    "锻炼": 0,
	    "修炼灵魂": 0,
      "猎杀妖兽":0,
      "猎妖":0
    }
    new_player.id = usr_qq;
    await Write_playerData(usr_qq,new_player,new_bag,new_equiment,new_status,"无","无");
    return e.reply(`创建成功，请使用别的指令完善存档`);
  }
  async j(e:AMessage): Promise<boolean>{
    const usr_qq = e.user_id;
    if (!await existplayer(1, usr_qq, 'player')) return false;
    let player= await Read_player(1,usr_qq,"player")
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
    await Write_player(1,usr_qq,player,"player")
    return false;
  }
  async gx(e: AMessage): Promise<boolean>{
    const usr_qq = e.user_id;
    if (!await existplayer(1, usr_qq, 'player')) return false;
    const name = e.msg.replace(/(\/|#)改姓/, "").trim();
    let player= await Read_player(1,usr_qq,"player")
    if(player.性别 === name) return e.reply(`你已经是这个姓了`)
    player.性别 =name
    await Write_player(1,usr_qq,player,"player")
    return e.reply(`修改成功`)
  }
  async gm(e: AMessage): Promise<boolean>{
    const usr_qq = e.user_id;
    if (!await existplayer(1, usr_qq, 'player')) return false;
    const name = e.msg.replace(/(\/|#)改名/, "").trim();
    let player= await Read_player(1,usr_qq,"player")
    if(player.name === name) return e.reply(`名字不能和原来的相同`)
    player.name = name
    await Write_player(1,usr_qq,player,"player")
    return e.reply(`修改成功`)
  }
  async information(e: AMessage): Promise<boolean>{
    const usr_qq: string = e.user_id;
    if (!(await existplayer(1, usr_qq, 'player'))) return false;

    let player:any = await Read_player(1, usr_qq, "player");
    let rank_wuzhe: string = player.武者境界;

    let expmax_wuzhe = await _item(1,"武者境界");
    expmax_wuzhe = expmax_wuzhe.find(item => item.name === rank_wuzhe)?.灵气;
    let rank_tipo: any = player.体魄境界;
    let expmax_tipo= await _item(1,'体魄境界')
    expmax_tipo = expmax_tipo.find(item => item.name === rank_tipo)?.体魄力量;
    let x =await _item(1,'灵魂境界')
    let rank_hun: any = player.灵魂境界;
    let expmax_hun = x.find(item => item.name === rank_hun)?.灵魂力量;

    let strand_hp: any = await Strand(player.当前生命, player.生命上限);
    let strand_wuzhe: any = await Strand(player.灵气, expmax_wuzhe);
    let strand_tipo: any = await Strand(player.体魄力量, expmax_tipo);
    let strand_hun: any = await Strand(player.灵魂力量, expmax_hun);

    let equipment: any = await Read_player(1, usr_qq, "equipment")

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

  await pic(e, get_data, `get_playerData`)
  return false;
  }

  async my(e: AMessage){
    const usr_qq = e.user_id;
    if (!await existplayer(1, usr_qq, 'player')) return;
    let player = await Read_player(1, usr_qq, "player")
    let lingqi = player.本命灵器
    let x = player.本命灵器.品级
    let 颜色;
    if(x === "低级灵器")颜色 ="#7CB342"
    if(x === "中级灵器")颜色 = "#039BE5"
    if(x === "高级灵器")颜色 ="#8E24AA"
    if(x === "帝器")颜色 ="#FFD700"
    let get_data = {
     weaponData: player.本命灵器,
     player,
     lingqi,
     颜色
     }
        await pic(e, get_data, `get_lingqi`); //导入到html
        return;
  }   
}
export async function cache(data:any) {
  let tmp = md5(JSON.stringify(data));
  if (helpData.md5 === tmp) return helpData.img;
  helpData.img = await puppeteer.screenshot('help', data);
  helpData.md5 = tmp;
  return helpData.img;
}