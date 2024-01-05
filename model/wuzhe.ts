import yaml from 'js-yaml';
import {AMessage,Show,puppeteer,AppName,DirPath,fs,app,createPicture} from '../api'
import path from 'path';
import {createHtml, screenshotByFile  } from 'alemonjs'
import { writeFileSync } from 'fs'
import art from 'art-template'
import { create_player,existplayer,Read_player,Write_player,武者境界, 灵魂境界,体魄境界,user_id,finduid, 道具列表, 功法列表} from './gameapi.js';
/**
 * @param directory 文件
 * @param data 数据
 * @returns
 */
export async function oImages(directory: string, data: any = {}):Promise<string | false | Buffer> {
  // const { template, AdressHtml } = createHtml(AppName, `${DirPath}${directory}`)
  // writeFileSync(AdressHtml, art.render(template, data))
  // return screenshotByFile(AdressHtml, {
  //   SOptions: { type: 'jpeg', quality: 90 },
  //   tab: 'body',
  //   timeout: 2000
  // })
  const img = await createPicture({
    /**
     * 插件名
     */
    AppName,
    tplFile: `${DirPath}${directory}`,
    data,
    SOptions: { type: 'jpeg', quality: 90 },
  }).catch((err) => {
    console.log(err);
    return false;
  });
  return img;
}


 export const data = path.join(DirPath, 'resources', 'data')
 export const __PATH = {
   help: path.join(data, 'help', 'help.yaml'), 
   list: path.join(data, 'item'), 
   shezhi: path.join(DirPath,"shezhi",'all_shezhi.json') 
 };

export const jsontype={
    "2":__PATH.shezhi,
    "3":data,
    "4":__PATH.list,
}
let yamltype ={
 "1":__PATH.help,
}

let item ={
    "1":__PATH.list
}
export async function Add_生命(usr_qq: string, num: number) {
  let results = await Read_player(1,usr_qq)
  let player = results.player;
  const maxLife = Math.max(player.生命上限, num);
  const newLife = Math.min(player.当前生命 + num, maxLife);
  if (newLife !== player.当前生命) {
    return newLife;
  }
}
  /**
 *
 * @param num [1:player.json 2:shezhi 3.data目录 4:item目录]
 * @param
 * @returns 
 */
  export async function Read_json(num:number, ...paths: string[]) {
    const jsonType = jsontype[num]
    let playerPath = await buildPath(jsonType, paths);
    try {
      const playerData = fs.readFileSync(playerPath, 'utf8');
      const player = JSON.parse(playerData);
      return player;
    } catch (err) {
      console.log(err);
      return 'error';
    }
    }
  export async function buildPath(jsonType: string, paths: string[]): Promise<string> {
      let playerPath = jsonType;
      if (paths.length > 0) {
        playerPath +=  paths.join('');
      }
      return path.join(playerPath);
    }
  
  
   /**
 *
 * @param num [1:player.json 2:shezhi 3.data目录]
 * @returns 
 */
   export async function Write_json(num:number,json:String,...paths) {
    const jsonType = jsontype[num]
    let playerPath = await buildPath(jsonType, paths);
    const newJson = JSON.stringify(json, null, '\t');
    try {
        await fs.promises.writeFile(playerPath, newJson, 'utf8');
        console.log('写入成功');
    } catch (err) {
        console.log('写入失败', err);
    }
  }


  // export async function allzongmen() {
  //   const files = fs.readdirSync(__PATH.zongmen).filter(file => file.endsWith('.json'));
  //   const users = files.map(file => file.replace(/-zongmen\.json$/, ''));
  //   return users;
  // }
/**
 *
 * @param num [1:曹魏 2:东吴 3:蜀汉]
 * @returns 
 */
//判断json文件有没有
  export async function exist_json(num:number) {
    const existPlayer = fs.existsSync(`${jsontype[num]}`);
    return existPlayer;
  }
  /**
 *
 * @param num [1:help]
 * @returns 
 */
  export async function Read_yaml(num:number){
    try {
      const fileContents = fs.readFileSync(yamltype[num], 'utf8');
      const data = yaml.load(fileContents);
      return data;
      // 现在你可以使用 data 变量访问 YAML 文件中的数据
    } catch (error) {
      console.log(error);
    }
  }
  export async function Write_yaml(num:number,wyaml:any){
    try {
      // 将修改后的数据转换为 YAML 格式
      const yamlData = yaml.dump(wyaml);
      // 写入 YAML 文件
      fs.writeFileSync(yamltype[num], yamlData, 'utf8');
      console.log('YAML 文件写入成功！');
    } catch (error) {
      console.log(error);
    }
  }

  
  export async function pic(e: AMessage, get_data: any, show: string): Promise<void> {
    const data1 = await new Show(e)[show](get_data);
    const img = await puppeteer.screenshot('pic', { ...data1 });
    if (img !== false) {
      e.reply(img);
    } else {
      // 处理截图失败的情况
      console.log('截图失败');
    }
  }
  
  /**
   * 
   * @param {*} name name数据
   * @param {*} arr 数组
   * @returns 
   */
  export async function findIndexByName(name:string, arr:any) {
    const index = arr.findIndex(item => item.name === name);
    if (index !== -1) return index;
    else return '没有找到';
  }
  //返回的值是在数组中的位置，不用减1
/**
 * @description: 进度条渲染
 * @param {Number} now 当前值
 * @param {Number} max 最大值
 * @return {Object} 包含样式和百分比的对象
 */
export async function Strand(now: number, max: number) {
  let num: number;
  if (now <= 0) {
    num = Math.floor((now / max) * 100);
  } else if (now >= max) {
    num = 100;
  } else {
    num = Math.floor(Math.abs((now / max) * 100));
  }
    return {
      style: `style=width:${num}%`,
      num: now < 0 ? -num : num,
    };
  }
export async function getNonZeroKeys(obj:any) {
  for (let key in obj) {
    if(key == "uid" ||key == "id" ) continue
    if (obj[key] != 0) return key;
    console.log(`Key: ${key}, Value: ${obj[key]}`);
  }
  return false;
} 
export async function startstatus(e:AMessage,状态:string,返回状态:string){
  const now = Date.now();
  const results:any = await getUserStatus(e);
  let status =results.status
  console.log(status);
  if (!status) return false;
  const x = await getNonZeroKeys(status);
  if(x)return e.reply(`你正在${x}中`);
  status[状态] = now;
  await Write_player(e.user_id,false,false,false,status)
  return e.reply(`开始${返回状态}`);
}
export async function stopstatus(e:AMessage,状态:string,结算物品:string,结束回答物品:string,结算概率:number){
  const now = Date.now();
  const results:any = await getUserStatus(e);
  let status =results.status
  if (!status) return false;
  let player = results.player;
  if(status[状态] === 0)return e.reply(`你没在${状态}`)
  const time = (now - status[状态])/1000/60
  const money = Math.floor(time * 结算概率);
  player[结算物品] +=money;
  status[状态] = 0;
  await Write_player(e.user_id,player,false,false,status)
  return e.reply(`结束成功，获得${money}${结束回答物品}`);
}
export async function getUserStatus(e:AMessage) {
  const usr_qq = e.user_id;
  if (!await existplayer(1, usr_qq)) return false;
  return await Read_player(1,usr_qq);
}

export async function msToTime(duration: number): Promise<string> {
    const seconds = Math.floor((duration / 1000) % 60);
    const minutes = Math.floor((duration / (1000 * 60)) % 60);
    const hours = Math.floor((duration / (1000 * 60 * 60)) % 24);
  
    const paddedHours = (hours < 10) ? "0" + hours : hours.toString();
    const paddedMinutes = (minutes < 10) ? "0" + minutes : minutes.toString();
    const paddedSeconds = (seconds < 10) ? "0" + seconds : seconds.toString();
  
    return `${paddedHours}时${paddedMinutes}分${paddedSeconds}秒`;
  }
export async function gettupo(e:AMessage,玩家境界:string,data境界名:string,突破物品:string){
  const results:any = await getUserStatus(e);
  let player =results.player
  let xx;
  switch (data境界名) {
    case '武者境界':
      xx = await 武者境界.findAll({ raw: true });
      break;
    case '体魄境界':
      xx = await 体魄境界.findAll({ raw: true });
      break;
    case '灵魂境界':
      xx = await 灵魂境界.findAll({ raw: true });
      break;
  }
  const now_level_id = await findIndexByName(player[玩家境界],xx) +1;
  if(now_level_id > xx.length) return e.reply(`已达${data境界名}上限`)
  const now = xx.find(item => item.name = player[玩家境界]);
  let x = xx[now_level_id];
  if(player[突破物品] < now[突破物品]) return e.reply(`${突破物品}不足`);
  let rand = Math.random();
  let prob = 1 - now_level_id / 60;
  if (rand > prob) {
    const messages = [
      "你突破中突然又想到等会要去买台遥遥领先玩，突破失败",
      "旁边的山突然塌了，你被余波扰乱心智，突破失败",
      "突然有人喊道，有两个女人在大街上打架还撕扯上衣服，你想去看看，突破失败",
      "突然有道雷劈到了你身上，突破失败",
      "你的脑海中突然想起了一道声音:遥遥领先,遥遥领先...你突破失败",
      "突破失败"
    ];
  
    let replyMessage = "突破失败";
    const bad_rand = Math.random();
  
    if (bad_rand > 0.7) replyMessage = messages[0];
    else if (bad_rand > 0.5) replyMessage = messages[1];
    else if (bad_rand > 0.4) replyMessage = messages[2];
    else if (bad_rand > 0.6) replyMessage = messages[3];
    else if (bad_rand > 0.3) replyMessage = messages[4];
  
    return e.reply(replyMessage);
  } else {
    player[突破物品] -= now[突破物品];
    player[玩家境界] = x.name;
    const attributes = ['攻击加成', '防御加成', '暴击加成', '爆伤加成', '生命加成', '闪避加成'];
    attributes.forEach(attribute => {
      player[attribute] += x[attribute];
    });
    player.生命上限 += x.生命加成
    await Write_player(e.user_id, player, false, false, false);
    return e.reply(`突破成功,目前境界${x.name}`);
  }
}
export async function getstring(string:string,...包含的字符串:string[]){
  包含的字符串.forEach(name =>{
    if (string.includes(name)) {
      return true;
    }
  })
  return false;
}
export async function getString2(string: string, ...包含的字符串: string[]): Promise<string> {
  const foundString: string | undefined = 包含的字符串.find(name => string.includes(name));
  return foundString || "";
}
//判断数组中为0的值的名字是否有这个值
export async function checkZeroValue(obj:any, name:string) {
  const value = obj[name] || 0;
  return value === 0;
}
//判断所有值是否为0
export async function checkAllZeroValues(obj:any) { 
  const values = Object.values(obj); 
  return values.every(value => value === 0);
}
//判断数组中是否含有这个值
export const checkNameExists = async (name:string, obj:any) => {
  const names = Object.keys(obj);
  return names.includes(name);
};
export function 技能栏(player:any){
  if (!player || !player.技能栏) {
      player = player || {}; // 如果player不存在，则创建一个空对象
      player.技能栏 = {
        功法技能栏1: '无',
        功法技能栏2: '无',
        功法技能栏3: '无',
        功法技能栏4: '无',
        功法技能栏5: '无',
      };
    }
}
async function 随机选择技能(技能栏) {
  console.log(技能栏);
  // 从技能栏中过滤出名字中含有"功法技能栏"且对应值不为'无'的技能名
  const 技能名数组 = Object.entries(技能栏)
    .filter(([key, value]) => key.includes('功法技能栏') && value !== '无')
    .map(([key, value]) => value);
  console.log(技能名数组);
  if (技能名数组.length === 0) {
    // 如果没有符合条件的技能，可以添加适当的处理逻辑
    console.log('没有符合条件的技能');
    return;
  }

  // 从过滤后的技能名数组中随机选择一个值
  const 随机索引 = Math.floor(Math.random() * 技能名数组.length);
  const 随机技能名 = 技能名数组[随机索引];
  console.log('随机选择的技能:', 随机技能名);
  console.log(随机技能名);
  
  return 随机技能名;
  
}

//战力计算
export async function player_zhanli(player:any){
  const attackBonus = player["攻击加成"];
  const defenseBonus = player["防御加成"];
  const healthBonus = player["当前血量"];
  const power = 100 + attackBonus * 1.5 + defenseBonus * 1.2 + healthBonus * 0.8;
  return power;
}
//战斗系统
export async function player_zhandou(attacker:any, defender:any) {
  let msg:string[] = [];
  let huihe = 1;
  let A_damage = 0;
  let B_damage = 0;
  // 战斗循环
  while (attacker.当前生命 > 0 && defender.当前生命 > 0) {
    if (huihe === 100) {
      let winner = Math.random() < 0.5 ? attacker : defender; // 随机选择攻击者或防守者作为失败者
      msg.push(`达到100回合，随机选择${winner.name}失败`);
      break;
    }
      try {
        let A_技能_name = await 随机选择技能(attacker.技能栏);
        let B_技能_name = await 随机选择技能(defender.技能栏);
        let A_技能:any = await 功法列表.findOne({where:{name:A_技能_name},raw:true});
        let B_技能:any = await 功法列表.findOne({where:{name:B_技能_name},raw:true});
        msg.push(`${attacker.name}${A_技能.zhandou}造成${A_技能.功效.攻击加成}伤害`)
        defender.当前生命 -= A_技能.功效.攻击加成;
        A_damage += A_技能.攻击加成;
        msg.push(`${defender.name}${B_技能.zhandou}造成${B_技能.功效.攻击加成}伤害`)
        B_damage += B_技能.功效.攻击加成
        // 计算攻击者对防守者造成的伤害
        let shanghaiA = await calculateDamage(attacker, defender);
        defender.当前生命 -= shanghaiA;
        A_damage += shanghaiA;
        msg.push(`${attacker.name}对${defender.name}造成了${shanghaiA}点伤害`);
        // 判断防守者是否被击败
        if (defender.当前生命 <= 0) {
            msg.push(`${defender.name}战败了`);
            break;
        }
          // 计算防守者对攻击者造成的伤害
        let shanghaiB = await calculateDamage(defender, attacker);
        attacker.当前生命 -= shanghaiB;
        B_damage += shanghaiB;
        msg.push(`${defender.name}对${attacker.name}造成了${shanghaiB}点伤害`);
        // 判断攻击者是否被击败
        if (attacker.当前生命 <= 0) {
            msg.push(`${attacker.name}[${attacker.uid}]了`);
            break;
        }
      } catch (error) {
          // 处理伤害计算出现的错误
          msg.push('伤害计算出现错误：' + error.message);
          break;
      }
      huihe++;
  }
  // 输出日志和返回结果
  console.log(msg);
  console.log(`总共进行了${huihe - 1}回合`);
  console.log(`${attacker.name}造成了${A_damage}点伤害`);
  console.log(`${defender.name}造成了${B_damage}点伤害`);
  return {
      result: msg,
      A_damage: A_damage,
      B_damage: B_damage
  };
}
async function calculateDamage(attacker:any, defender:any) {
  let shanghai = attacker.攻击加成 - defender.防御加成;
  if (shanghai < 0) {
    shanghai = 0;
  }
  // 考虑暴击
  if (Math.random() <= attacker.暴击加成) {
    shanghai *= attacker.爆伤加成;
  }
  // 考虑闪避
  if (Math.random() <= defender.闪避加成) {
    shanghai = 0;
  }
  console.log(shanghai);
  return shanghai;
}
//判断有没有造成暴击伤害
export async function panbaoji(攻击力:number,对方防御力:number,计算过后函数baoji的值:number){
  let shanghai =攻击力- 对方防御力;
  if(计算过后函数baoji的值>shanghai) return '暴击伤害'
  return ''
}
//判断造不造成暴击伤害
export async function baoji(暴击率:number,暴击伤害:number,攻击力:number,对方防御力:number){
  let rand =Math.random();
  let msg =[]
  if(rand <= 暴击率){
    let shanghai =攻击力*暴击伤害 - 对方防御力;
    return shanghai;
  }else{
    let shanghai =攻击力 - 对方防御力;
    return shanghai;
  }
}
export async function Add_bag_thing(usr_qq:string, thing_name:string,数量:number,thing:any) {
  let results = await Read_player(1, usr_qq);
  let bag = results.bag
  let thing_type = thing.type;
  if (thing === "无") {
    let x;
    const typeMap = {
      道具: async () => (x = await 道具列表.findAll({ raw: true })),
      功法: async () => (x = await 功法列表.findAll({ raw: true })),
      已学习功法: async () => (x = await 功法列表.findAll({ raw: true })),
      default: () => (x = []),
    };
    typeMap[thing.type]();
    thing = x.find(item => item.name === thing_name);
  }
  let bag_thing = bag[thing_type].find(item => item.name === thing_name);
  const boolean1 = thing_type == "已学习功法"
  if(boolean1) 数量 = -数量 //转为正数
  console.log(数量);
  if (!bag_thing){                            
     bag[thing_type].push({
      ...thing,
      数量: 数量
    });
    console.log('新增加成功');
  }else{
    let x = await updateItemQuantity(bag[thing_type], thing_name, 数量);
    if(x) bag[thing_type] = x;
  }
   if(boolean1){
    let x = await updateItemQuantity(bag.功法, thing_name, -数量);
    if(x) bag.功法 = x;
   }
  console.log('增加成功');
  await Write_player(usr_qq,false,bag,false,false);
}
export function updateItemQuantity(itemList: any, itemName: string, quantity: number) {
  const x = itemList.find(item => item.name == itemName);
  x.数量 += quantity;
  if(x.数量<=0){
    return itemList.filter(item => item.name != itemName);
  }
  return false;  
}                                                                                                                                                                                                                                                                       
//选出胜利者
export async function determineWinner(msg: string[], A_player_name: string, B_player_name: string): Promise<string | null> {
  const winner: string | null = (() => {
    const lastMsg = msg[msg.length - 1];
    const A_defeated = lastMsg.includes(A_player_name);
    const B_defeated = lastMsg.includes(B_player_name);
    if (A_defeated && !B_defeated) return B_player_name;
    else if (!A_defeated && B_defeated) return A_player_name;
    else return null;
  })();
  return winner;
  }
export async function getB_qq(e:AMessage,string:string){
  const at = e.at_user
  if(!at)return 0;
  console.log(at.id);
  if (!at) return false;
  if (!await existplayer(1, at.id)) return false;
  if(string == "id")return at.id;
  return await Read_player(1,at.id)
}
// 辅助函数
export async function createPlayerObject(player:any) {
  return {
    name: player.name,
    暴击加成: player.暴击加成,
    爆伤加成: player.爆伤加成,
    攻击加成: player.攻击加成,
    闪避加成: player.闪避加成,
    防御加成: player.防御加成,
    当前生命: player.当前生命,
    技能栏: player.技能栏
  };
}
/**
 * 
 * @param {*} startTime  开始的时间
 * @param {*} elapsedTime 到结束所需的时间(分)
 * @returns 
 */
export async function getCurrentTime(startTime: number, elapsedTime: number): Promise<boolean> {
  const start = new Date(startTime);
  const elapsed = parseInt(elapsedTime.toString(), 10);
  const current = new Date(start.getTime() + elapsed);
  return start.getTime() >= current.getTime();
}

//提取数组属性万界堂是否为1
export async function extractAttributesWithPropertyOne(dataArray:any) {
  const result:string[] = [];
  for (const item of dataArray) {
    if (item.hasOwnProperty('万界堂') && item['万界堂'] === 1) {
      result.push(item);
    }
  }
  return result;
}

export async function wanjietang_thing(){
	const [items, skills]:any = await Promise.all([
		道具列表.findAll({raw:true}),
		功法列表.findAll({raw:true})
	]);
	const [x, xx] = await Promise.all([
		await extractAttributesWithPropertyOne(items),
		await extractAttributesWithPropertyOne(skills)
	]);
	const combinedArray:any[] = x.concat(xx);
	return combinedArray
}
export async function findThings(name) {
  const itemInProps = await findInList(name, 道具列表);
  if (itemInProps.one_item) return itemInProps;
  const itemInSkills = await findInList(name, 功法列表);
  if(itemInSkills.one_item)return itemInSkills;
  return false;
}

async function findInList(name, list) {
  const items = await list.findAll({ raw: true });
  return {
      all_item:items,
      one_item: items.find(item => item.name === name),
  }
}
export const config = {
  attackBonus: 200,
  defenseBonus: 200,
  criticalBonus: 0.1,
  damageBonus: 0.09,
  healthBonus: 100,
  dodgeBonus: 0.01,
  currentHealth: 1000
};
export const createCertificationRobot = (num) => ({
  name: num +'_认证机器人',
  攻击加成: config.attackBonus * num,
  防御加成: config.defenseBonus * num,
  暴击加成: config.criticalBonus * num,
  爆伤加成: config.damageBonus * num,
  生命加成: config.healthBonus * num,
  闪避加成: config.dodgeBonus * num,
  当前生命: config.currentHealth * num,
});
export const handleBattle = async (player, robot) => {
  const msg = await player_zhandou(player, robot);
  console.log(player.name);
  const name = await determineWinner(msg.result, player.name, robot.name);
  return { name, damage: msg.A_damage };
};
