import yaml from 'js-yaml';
import {AMessage,AppName,DirPath,fs,app,createPicture,equiment_type as type, getCacheData} from '../api'
import path from 'path';
import { create_player,existplayer,Read_player,Write_player,武者境界, 灵魂境界,体魄境界,user_id,finduid, 道具列表, 功法列表, 装备列表} from './gameapi.js';
import { ALunchConfig,Puppeteer,createImage } from 'alemonjs';
import { join, basename } from "path";

/**
 * @param directory 文件
 * @param data 数据
 * @returns
 */
export async function oImages(directory: string, data: any = {}):Promise<string | false | Buffer> {
  // 创建截图工具
  const img = await createPicture({
    /**
     * 插件名
     */
    AppName,
    tplFile: `${DirPath}${directory}`,
    data,
    SOptions: { type: 'jpeg', quality: 100 },
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
  if(!obj.秘境) obj.秘境 = 0;
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
  let status =results.status;
  if (!status) return false;
  const x = await getNonZeroKeys(status);
  if(x)return e.reply(`你正在${x}中`);
  status[状态] = now;
  await Write_player(e.user_id,false,false,false,status);
  return e.reply(`开始${返回状态}`);
}
export async function stopstatus(e:AMessage,状态:string,结算物品:string,结束回答物品:string,结算概率:number){
  const now = Date.now();
  const results:any = await getUserStatus(e);
  let status =results.status
  if (!status) return false;
  let player = results.player;
  if(status[状态] === 0)return e.reply(`你没在${状态}`);
  const time = (now - status[状态])/1000/60;
  const money = Math.floor(time * (结算概率+player.修炼加成));
  player[结算物品] +=money;
  status[状态] = 0;
  await Write_player(e.user_id,player,false,false,status);
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
  const usr_qq = e.user_id;
  if (!await existplayer(1, usr_qq)) return false;
  const results: any = await Read_player(1,usr_qq);
  let { player } = results;
  let xx = await getCacheData(data境界名);
  const now_level_id = xx.findIndex(item => item.name == player[玩家境界]) + 1;
  console.log(now_level_id);
  if (now_level_id >= xx.length) return e.reply(`已达${data境界名}上限`);
  console.log(xx.length);
  const now = xx.find(item => item.name === player[玩家境界]);
  let x = xx[now_level_id];
  if (player[突破物品] < now[突破物品]) return e.reply(`${突破物品}不足`);
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
    e.reply(replyMessage);
  } else {
    player[玩家境界] = x.name;
    const attributes = ['攻击加成', '防御加成', '暴击加成', '爆伤加成', '生命加成'];
    attributes.forEach(attribute => {
      player[attribute] += x[attribute];
    });
    player.生命上限 += x.生命加成;
    e.reply(`突破成功,目前境界${x.name}`);
  }
   player[突破物品] -= now[突破物品];
    await Write_player(e.user_id, player, false, false, false);
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
        增益型技能栏1:"无",
        增益型技能栏2:"无",
        增益型技能栏3:"无",
        功法技能栏1: '无',
        功法技能栏2: '无',
        功法技能栏3: '无',
        功法技能栏4: '无',
        功法技能栏5: '无',
      };
    }
    player.技能栏.增益型技能栏1 = player.技能栏.增益型技能栏1 || "无";
    player.技能栏.增益型技能栏2=player.技能栏.增益型技能栏2 || "无";
    player.技能栏.增益型技能栏3=player.技能栏.增益型技能栏2 || "无";
    return player;
}
/**
 * 创建战斗存档
 * @param player 存档
 * @returns 
 */
export async function createPlayerObject(player:any):Promise<any> {
  return{
    name: player.name,
    暴击加成: player.暴击加成,
    爆伤加成: player.爆伤加成,
    攻击加成: player.攻击加成,
    闪避加成: player.闪避加成,
    防御加成: player.防御加成,
    灵器: player.本命灵器 || null,
    体质: player.体质 || null,
    当前生命: player.当前生命 || player.生命加成 ,
    生命加成:player.当前生命 || player.生命加成 ,
    灵气: player.灵气 || 1000, 
    技能栏: player.技能栏 || {
      增益型技能栏1:"无",
      增益型技能栏2:"无",
      增益型技能栏3:"无",
      功法技能栏1: '无',
      功法技能栏2: '无',
      功法技能栏3: '无',
      功法技能栏4: '无',
      功法技能栏5: '无',
    }
    
  };
} 


async function 随机选择技能(技能栏) {
  console.log(技能栏);

  const 有效技能名数组 = Object.entries(技能栏)
    .filter(([key, value]) => (key.includes('增益型技能栏') || key.includes('功法技能栏')) && value !== '无')
    .map(([key, value]) => value);
  if (有效技能名数组.length === 0) {
    console.log('没有可用技能');
    return;
  }
  // 从有效技能名数组中随机选择一个值
  const 随机索引 = Math.floor(Math.random() * 有效技能名数组.length);
  const 随机技能名 = 有效技能名数组[随机索引];
  console.log('随机选择的技能:', 随机技能名);

  return 随机技能名;
}


//战斗系统
export async function player_zhandou(attacker:any, defender:any) {
  console.log(attacker);
  console.log(defender);
  let winner;
  let msg:string[] = [];
  let huihe = 1;
  let A_damage:number = 0;
  let B_damage:number = 0;
  let setting = await Read_json(2);
  let skill = setting.find(item => item.type == "功法类");
  // 战斗循环
  const gongfa_list = await getCacheData('功法列表')
  
  while (attacker.当前生命 > 0 && defender.当前生命 > 0) {
    if (huihe === 100) {
      let winner = Math.random() < 0.5 ? attacker : defender; // 随机选择攻击者或防守者作为失败者
      msg.push(`达到100回合，随机选择${winner.name}失败`);
      break;
    }
    if(huihe%5 == 0){
      attacker.灵气 += attacker.灵气*1.3
      msg.push(`${attacker.name}回复了${attacker.灵气*0.3}点灵气`)
      defender.灵气 += defender.灵气*1.3
      msg.push(`${defender.name}回复了${defender.灵气*0.3}点灵气`)
    }
      try {
        let {player: buffedAttacker, msg: buffedMsg} = await getBuffedplayer(attacker, msg);
        attacker = buffedAttacker;
        msg = buffedMsg;
        let {player: buffedDefender, msg: buffedMsg2} = await getBuffedplayer(defender, msg);
        defender = buffedDefender;
        msg = buffedMsg2;
        let A_技能_name = await 随机选择技能(attacker.技能栏);
        let B_技能_name = await 随机选择技能(defender.技能栏);
        
        if(A_技能_name){
            let A_技能:any = gongfa_list.find(item => item.name == A_技能_name);
            console.log(skill.技能栏功法.includes(A_技能_name));
          if(skill.技能栏功法.includes(A_技能_name)){
            console.log(A_技能.灵气 );
            console.log(attacker.灵气);
            
            if(A_技能.灵气 <= attacker.灵气){ 
              let 技能伤害 = await skill_damage(attacker,A_技能)
              msg.push(`${attacker.name}${A_技能.zhandou}造成${技能伤害}伤害`)
              defender.当前生命 -= 技能伤害;
              A_damage += 技能伤害;
              attacker.灵气 -= A_技能.灵气
              console.log(`A_技能:${技能伤害}`);
              console.log(`A:${A_damage}`);
           }
          }else if(skill.增益型功法.includes(A_技能_name)){
            if(A_技能.灵气 < attacker.灵气){ 
             attacker = await getBuffedSkills(A_技能.name,attacker);
             attacker.灵气 -= A_技能.灵气
            }
          }
        }
        if (defender.当前生命 <= 0) {
          msg.push(`${defender.name}战败了`);
          winner = attacker.name;
          break;
      }
        if(B_技能_name){
          let B_技能:any =gongfa_list.find(item => item.name == B_技能_name);
          if(skill.技能栏功法.includes(B_技能_name)){
            if(B_技能.灵气 < defender.灵气){ 
            let 技能伤害 = await skill_damage(defender,B_技能)
            msg.push(`${defender.name}${B_技能.zhandou}造成${技能伤害}伤害`)
            attacker.当前生命 -= 技能伤害;
            B_damage += 技能伤害;
            defender.灵气 -= B_技能.灵气;
            console.log(`B_技能:${技能伤害}`);
            console.log(`B:${B_damage}`);
            }
          }else if(skill.增益型功法.includes(B_技能_name)){
            if(B_技能.灵气 < attacker.灵气){ 
             attacker = await getBuffedSkills(B_技能.name,attacker);
             defender.灵气 -= B_技能.灵气;
            }
          }
        }
        if (attacker.当前生命 <= 0) {
          msg.push(`${attacker.name}失败了`);
          winner = defender.name;
          break;
      }
        // 计算攻击者对防守者造成的伤害
        let shanghaiA = await calculateDamage(attacker, defender);
        defender.当前生命 -= shanghaiA;
        A_damage += shanghaiA;
        msg.push(`${attacker.name}对${defender.name}造成了${shanghaiA}点伤害`);
        console.log(shanghaiA);
        console.log(`A:${A_damage}`);
        // 判断防守者是否被击败
        if (defender.当前生命 <= 0) {
            msg.push(`${defender.name}战败了`);
            winner = attacker.name;
            break;
        }
          // 计算防守者对攻击者造成的伤害
        let shanghaiB = await calculateDamage(defender, attacker);
        attacker.当前生命 -= shanghaiB;
        B_damage += shanghaiB;
        msg.push(`${defender.name}对${attacker.name}造成了${shanghaiB}点伤害`);
        console.log(shanghaiB);
        console.log(`B:${B_damage}`);
        // 判断攻击者是否被击败
        if (attacker.当前生命 <= 0) {
            msg.push(`${attacker.name}失败了`);
            winner = defender.name;
            break;
        }
      } catch (error) {
          // 处理伤害计算出现的错误
          console.log(error.message);

          msg.push('伤害计算出现错误：' + error.message);
          break;
      }
      huihe++;
  }
  if(!A_damage) A_damage = 0;
  if(!B_damage) B_damage=0;
  // 输出日志和返回结果
  console.log(msg);
  console.log(`总共进行了${huihe - 1}回合`);
  console.log(`${attacker.name}造成了${A_damage}点伤害`);
  console.log(`${defender.name}造成了${B_damage}点伤害`);
  
  return {
      result: msg,
      A_damage: A_damage,
      B_damage: B_damage,
      winner
  };
}
/**
 * 
 * @param player 玩家存档
 * @param skill 功法数组
 */
export async function skill_damage(player:any,skill:any):Promise<number> {
  const all_critical_hit = parseInt((player.暴击加成 + skill.功效.暴击加成).toFixed(2)); //计算总暴击，保留2位小数
  const all_critical_damage = parseInt((player.爆伤加成+skill.功效.爆伤加成).toFixed(2));//计算总暴伤，保留2位小数
  let attack_damage = Math.round(player.攻击加成 + skill.功效.攻击加成);
  let rand =Math.random();
  if(rand < all_critical_hit) attack_damage *= (1 + all_critical_damage);
  return Math.round(attack_damage);
}
/**
 * 
 * @param player 玩家存档
 * @param msg 语言
 */
export async function getBuffedplayer(player:any,msg:any):Promise<any> {
  if(player.体质 && player.灵器){
    if(player.体质.name == "不朽体质" && player.灵器.name == "不朽灵器"){
      let message = `检查到${player.name}同时拥有不朽体质和不朽灵器,触发特殊加成【不朽】,生命力,战斗力，防御获得大幅度加成`
      player.攻击加成 += 10000;
      player.防御加成 += 10000;
      player.当前生命 += 10000;
      msg.push(message)
    }
  }
  return {
    player:player,
    msg:msg
  }
}
/**
 * 
 * @param 功法名
 */
export async function getBuffedSkills(skill_name:string,player:any):Promise<any> {
  if(skill_name == "金钟罩"){
    player.防御加成 += 300;
  }
  return player;
}
async function calculateDamage(attacker:any, defender:any):Promise<number> {
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
  return Math.round(shanghai);
}
export async function Add_bag_thing(usr_qq: string, thing_name: string, 数量: number, thing: any) {
  let { bag } = await Read_player(1, usr_qq);
  数量 = parseInt(String(数量))
  if (thing === "无" || !thing.type) thing = (await findThings(thing_name)).one_item;
  let thing_type = thing.type;

  const boolean1 = thing_type == "已学习功法";
  let updatedBag = { ...bag };

  if (!updatedBag[thing_type]) {
    updatedBag[thing_type] = [];
  }

  let itemIndex = updatedBag[thing_type].findIndex(item => item.name === thing_name);

  if (itemIndex !== -1) {
    updatedBag[thing_type][itemIndex].数量 += Number(数量);
    if (updatedBag[thing_type][itemIndex].数量 <= 0) {
      updatedBag[thing_type].splice(itemIndex, 1);
    }
  } else {
    updatedBag[thing_type].push({ ...thing, 数量: Number(数量) });
  }

  if (boolean1) {
    if (!updatedBag.功法) {
      updatedBag.功法 = [];
    }

    let itemIndex = updatedBag.功法.findIndex(item => item.name === thing_name);
    if (itemIndex !== -1) {
      updatedBag.功法[itemIndex].数量 -= Number(数量);
      if (updatedBag.功法[itemIndex].数量 <= 0) {
        updatedBag.功法.splice(itemIndex, 1);
      }
    }
  }

  await Write_player(usr_qq, false, updatedBag, false, false);
}

// 使用Promise.all()优化
export async function Add_bag_things(usr_qq: string, things: { name: string, 数量: number, thing: any }[]) {
  const promises = things.map(async item => {
    await Add_bag_thing(usr_qq, item.name, item.数量, item.thing);
  });
  await Promise.all(promises);
}                                                                                                                                                                                                                                                      
//选出胜利者
export async function determineWinner(msg: any, A_player_name: string, B_player_name: string): Promise<string | null> {
  const lastMsg = msg[msg.length - 1];
  const A_defeated = lastMsg.includes(A_player_name);
  const B_defeated = lastMsg.includes(B_player_name);
  if (A_defeated && !B_defeated) return B_player_name;
  else if (!A_defeated && B_defeated) return A_player_name;
  else {
      return null;
  }
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
  const props = await findInList(name, 道具列表);
  if (props.one_item) return props;
  const skills = await findInList(name, 功法列表);
  if(skills.one_item)return skills;
  let equiment = await findInList(name,装备列表);
  return equiment;
}

async function findInList(name, list) {
  const items = await list.findAll({ raw: true });
  const oneItem = items.find(item => item.name === name);
  return {
    all_item: items,
    one_item: oneItem,
  };
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
export async function filter_equiment(x: any, equiment: any) {
  let equiment_zhanli = 0;
  let highestThing = x[0];
  if (x.length > 1) {
    if (equiment[highestThing.class]) {
      equiment_zhanli = calculateZhanli(equiment[highestThing.class]);
    }
    let highestZhanli = calculateZhanli(highestThing);
    for (let i = 1; i < x.length; i++) {
      const currentThing = x[i];
      const currentZhanli = calculateZhanli(currentThing);
      if (currentZhanli > highestZhanli) {
        highestThing = currentThing;
        highestZhanli = currentZhanli;
      }
    }
    console.log(`${highestThing}`);
    if (highestZhanli < equiment_zhanli) {
      return equiment[highestThing.class];
    }
    return highestThing;
  } else if (x.length == 1) {
    const currentThing = x[0];
    let currentZhanli = calculateZhanli(currentThing);
    console.log(currentZhanli);
    if (equiment[highestThing.class]) equiment_zhanli = calculateZhanli(equiment[highestThing.class]);
    if (currentZhanli > equiment_zhanli) return currentThing;
    console.log(`length:1`);
    return equiment[highestThing.class] || currentThing;
  } else {
    return null;
  }
}

function calculateZhanli(item: any) {
  return Object.values(item).reduce((total: number, prop: any) => total + prop, 0) as number;
}