import yaml from 'js-yaml';
import {plugin,AMessage,Show,puppeteer,AppName,DirPath,fs} from '../api'
import path, { dirname } from 'path';
import { getAppPath,createHtml, screenshotByFile  } from 'alemonjs'
import { promisify } from 'util';
import { writeFileSync } from 'fs'
import art from 'art-template'
import { pipeline, Readable } from 'stream';
/**
 * @param directory 文件
 * @param data 数据
 * @returns
 */
export function oImages(directory: string, data: any = {}) {
  const { template, AdressHtml } = createHtml(AppName, `${DirPath}${directory}`)
  writeFileSync(AdressHtml, art.render(template, data))
  return screenshotByFile(AdressHtml, {
    SOptions: { type: 'jpeg', quality: 90 },
    tab: 'body',
    timeout: 2000
  })
}

 export const data = path.join(DirPath, 'resources', 'data')
 export const __PATH = {
   zongmen: path.join(data, 'zongmen'), 
   player: path.join(data, 'player'), 
   help: path.join(data, 'help', 'help.yaml'), 
   list: path.join(data, 'item'), 
   playerjson: path.join(data, 'player.json'),
   shezhi: path.join(DirPath,"shezhi",'all_shezhi.json') 
 };
// console.log(__PATH.player);
let yamltype ={
 "1":__PATH.help,
}
let type ={
    //玩家文件
      "1":__PATH.player,
      "2":__PATH.zongmen,
}
let jsontype={
     "1":__PATH.playerjson,
     "2":__PATH.shezhi,
     "3":data,
     "4":__PATH.list,
}
let item ={
    "1":__PATH.list
}
export async function Add_生命(usr_qq: string, num: number) {
    const player = await Read_player(1,true,usr_qq, "player");
    player.当前生命 += num;
    player.当前生命 = player.当前生命 > player.生命上限 ? player.生命上限 : player.当前生命;
    await Write_player(1,true, usr_qq, player, "player");
}
/**
 *
 * @param num [1:player 2:zongmen]
 * @param string [player,equipment,bag,status]
 * @returns 
 */

export async function existplayer(num: number, usr_qq: string, string: string) {
  if (num === 1) {
    const json = await Read_json(3,`/player.json`);
    return json.some(item => item.绑定账号.includes(usr_qq));
  } else if (num === 2) {
    const player = await Read_player(1, true, usr_qq, "player");
    return !!player.宗门;
  }
}
  /**
 *
 * @param num 路径编号
 * @param id 是否开启id查找
 * @param usr_qq id或者usr_qq
 * @param string 文件后缀
 * @returns 
 */
export async function Read_player(num:number,id:boolean,usr_qq:string,fileType:string){
  let playerPath: string;
   let list: any;
   const json = id ? await Read_json(3,`/player.json`) : null;
   list = id ? json.find((item: any) => item.绑定账号.includes(usr_qq)) : null;
   const prefix = id ? type[num] + '/' + (id ? list.id : usr_qq) + '/' + (id ? list.id : usr_qq) : type[num] + '/' + usr_qq + '/' + usr_qq;
   playerPath = `${prefix}-${fileType}.json`;
   try {
     const playerData = await fs.promises.readFile(path.join(playerPath), 'utf8');
     return JSON.parse(playerData);
   } catch (err) {
     console.error(err);
     throw new Error('Failed to read player data');
   }
 }
  export async function getidlist(usr_qq: string){
    const json = await Read_json(3,`/player.json`);
    return json.find(item => item.绑定账号.includes(usr_qq));
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
 * @param num [1:player 2:zongmen]
 * @param id 是否要开启id查找
 * @param string [player,equipment,bag,status]
 * @returns 
 */
  
export async function Write_player(num: number, id: boolean, usr_qq: string, player: any, suffix: string) {
    let list: any= await getidlist(usr_qq);
    let dirBase = '';
    let fileName = '';
    if (num === 1 && id) {
      dirBase = path.join(type[num], list.id);
      fileName = `${list.id}-${suffix}.json`;
    } else if (num === 1 && !id) {
      dirBase = path.join(type[num], usr_qq);
      fileName = `${usr_qq}-${suffix}.json`;
    } else if (num === 2) {
      const playerData = await Read_player(1, false, id ? list.id : usr_qq, "player");
      dirBase = path.join(type[num], id ? playerData.宗门.宗主 : usr_qq);
      fileName = `${id ? playerData.宗门.宗主 : usr_qq}-${suffix}.json`;
    }
    const dir = path.join(dirBase, fileName);
    console.log(dir);
    if (!fs.existsSync(dirBase)) fs.mkdirSync(dirBase, { recursive: true });
    const newJson = JSON.stringify(player, null, '\t');
    const writeStream = fs.createWriteStream(dir, { encoding: 'utf8' });
    const pipelineAsync = promisify(pipeline);
    try {
      await pipelineAsync([Readable.from([newJson]), writeStream]);
      console.log('写入成功');
    } catch (err) {
      console.log('写入失败', err);
    }
  }
export async function Write_list(list:String,string:String){
  const dir = `${__PATH.list}/${string}.json`
  const newJson = JSON.stringify(list, null, '\t');
  try {
  fs.writeFileSync(dir, newJson, 'utf8');
  console.log('写入成功');
  } catch (err) {
        console.log('写入失败', err);
  }
    
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
  //判断属性存在是否
  export async function isNotNull(obj:any) {
    return obj != null;
  }
  //获取所有玩家的qq号(前提是玩家文件名是他们的qq号)
  export async function alluser() {
    const files = fs.readdirSync(__PATH.player).filter(file => file.endsWith('.json'));
    const users = files.map(file => file.substring(0, file.lastIndexOf('.')));
    return users;
  }
  export async function allzongmen() {
    const files = fs.readdirSync(__PATH.zongmen).filter(file => file.endsWith('.json'));
    const users = files.map(file => file.replace(/-zongmen\.json$/, ''));
    return users;
  }
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
   * @param {*} usr_qq 
   * @param {*} new_player 
   * @param {*} new_bag 
   * @param {*} new_equipment 
   * @param {*} new_status 
   * @param {*} new_list
   * @param boolen 是否开启id查找
   * @param 不写则填无
   */
  export async function Write_playerData(
    usr_qq: string,
    new_player: any,
    new_bag: any,
    new_equipment: any,
    new_status: any,
    new_list: string,
    new_list_string: any,
    boolen:boolean
  ) {
    const tasks: Promise<any>[] = [];
    if (new_player !== '无') tasks.push(Write_player(1,boolen, usr_qq, new_player, 'player'));
    if (new_bag !== '无') tasks.push(Write_player(1,boolen, usr_qq, new_bag, 'bag'));
    if (new_equipment !== '无') tasks.push(Write_player(1, boolen,usr_qq, new_equipment, 'equipment'));
    if (new_status !== '无') tasks.push(Write_player(1, boolen,usr_qq, new_status, 'status'));
    if (new_list !== '无') tasks.push(Write_list(new_list, new_list_string));
    await Promise.all(tasks);
  }
  export function getItemsByGrade(data: any): Record<string, any> {
    const grades: string[] = ["低级灵器", "中级灵器", "高级灵器", "帝器"];
    return grades.reduce((result, grade) => {
      result[grade] = data.filter(item => item.品级 === grade);
      return result;
    }, {} as Record<string, any[]>);
  }
  const 权重 = {
    "低级灵器": 50,
    "中级灵器": 30,
    "高级灵器": 15,
    "帝器": 2
  };
  /**
   * 
   * @param {*} usr_qq 
   * @param {*} player
   * @param {*} bag 
   * @param {*} equipment 
   * @param {*} status 
   * @param {*} list
   * @param id 是否开启id查找
   * @param 
   */
  export async function Read_playerData(usr_qq: string, player: boolean, bag: boolean, equipment: boolean, status: boolean, id: boolean, ...list: string[]) {
    const tasks: Promise<any>[] = [];
    if (player) tasks.push(Read_player(1, id, usr_qq, 'player').then(result => ({ player: result })));
    if (bag) tasks.push(Read_player(1, id, usr_qq, 'bag').then(result => ({ bag: result })));
    if (equipment) tasks.push(Read_player(1, id, usr_qq, 'equipment').then(result => ({ equipment: result })));
    if (status) tasks.push(Read_player(1, id, usr_qq, 'status').then(result => ({ status: result })));
    if (list) {
      list.forEach(name => {
        tasks.push(Read_json(4, name).then(result => ({ [name]: result })));
      });
    }
    const resultsArray = await Promise.all(tasks);
    const results = Object.assign({}, ...resultsArray);
    return results;
  }
  export async function getRandomItem(灵器分类:any) {
    const totalWeight = Object.values(权重).reduce((a, b) => a + b, 0);
    const randomWeight = Math.random() * totalWeight;
    let currentWeight = 0;
  
    for (const [grade, weight] of Object.entries(权重)) {
      currentWeight += weight;
      if (randomWeight <= currentWeight) {
        const items = 灵器分类[grade];
        return items[Math.floor(Math.random() * items.length)];
      }
    }
  }
  export async function getlingqi(e:AMessage){
    const 灵器列表 = await Read_json(3,'/item/灵器列表.json');
    const 灵器分类 = await getItemsByGrade(灵器列表);
    const randomItem = getRandomItem(灵器分类);
    const obj = await Promise.resolve(randomItem)
    console.log(obj);
    e.reply(`觉醒成功,觉醒出${obj.name},品级为${obj.品级}`);
    return obj
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
    let num: number = Math.min(parseFloat(((now / max) * 1200).toFixed(0)), 100);
    return {
      style: `style=width:${num}%`,
      num: num,
    };
  }
export async function getNonZeroKeys(obj:any) {
  for (let key in obj) {
    if (obj[key] != 0) return key;
    console.log(`Key: ${key}, Value: ${obj[key]}`);
  }
  return false;
} 
export async function startstatus(e:AMessage,状态:string,返回状态:string){
  const now = Date.now();
  let status = await getUserStatus(e,"status");
  if (!status) return false;
  const x = await getNonZeroKeys(status);
  if(x!== false)return e.reply(`你正在${x}中`);
  status[状态] = now;
  await Write_player(1,true,e.user_id,status,'status');
  return e.reply(`开始${返回状态}`);
}
export async function stopstatus(e:AMessage,状态:string,结算物品:string,结束回答物品:string,结算概率:number){
  const now = Date.now();
  let status = await getUserStatus(e,"status");
  if (!status) return false;
  let player = await Read_player(1,true,e.user_id,`player`)
  if(status[状态] === 0)return e.reply(`你没在${状态}`)
  const time = (now - status[状态])/1000/60
  const money = Math.floor(time * 结算概率);
  player[结算物品] +=money;
  status[状态] = 0;
  await Write_playerData(e.user_id,player,"无","无",status,"无","无",true)
  return e.reply(`结束成功，获得${money}${结束回答物品}`);
}
export async function getUserStatus(e:AMessage,string:string) {
  const usr_qq = e.user_id;
  if (!await existplayer(1, usr_qq, 'player')) return false;
  return await Read_player(1,true, usr_qq, string);
}

// export async function startstatus(e, 状态, 返回状态) {
//   const status = await getUserStatus(e);
//   if (!status) return false;
//   const x = await getNonZeroKeys(status);
//   if (x !== false) return e.reply(`你正在${x}中`);
//   status[状态] = now;
//   await Write_player(1, e.user_id, status, 'status');
//   return e.reply(`开始${返回状态}`);
// }

// export async function stopstatus(e, 状态, 结算物品, 结束回答物品, 结算概率) {
//   const status = await getUserStatus(e);
//   if (!status) return;
//   let player = await Read_player(1, e.user_id, `player`);
//   if (status[状态] === 0) return e.reply(`你没在${状态}`);
//   const time = (now - status[状态]) / 1000 / 60;
//   const money = Math.floor(time * 结算概率);
//   player[结算物品] += money;
//   status[状态] = 0;
//   await Write_playerData(e.user_id, player, "无", "无", status);
//   return e.reply(`结束成功，获得${money}${结束回答物品}`);
// }
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
  let player = await getUserStatus(e,"player")
  const now_level_id = await findIndexByName(player[玩家境界],await _item(1,data境界名)) +1;
  let xx = await _item(1,data境界名)
  const now = xx.find(item => item.name = player[玩家境界]);
  let x = xx[now_level_id];
  if(player[突破物品] < now[突破物品]) return e.reply(`${突破物品}不足`);
  let rand = Math.random();
  let prob = 1 - now_level_id / 60;
  if(rand > prob){
      const bad_rand = Math.random();
      if(bad_rand>0.7)return e.reply(`你突破中突然又想到等会要去买台遥遥领先玩，突破失败`)
      if(bad_rand > 0.5)return e.reply(`旁边的山突然塌了，你被余波扰乱心智，突破失败`);
      if(bad_rand >0.4)return e.reply(`突然有人喊道，有两个女人在大街上打架还撕扯上衣服，你想去看看，突破失败`);
      if(bad_rand>0.6)return e.reply(`突然有道雷劈到了你身上，突破失败`);
      if(bad_rand>0.3)return e.reply(`你的脑海中突然想起了一道声音:遥遥领先,遥遥领先,遥遥领先,遥遥领先,遥遥领先,遥遥领先,遥遥领先,遥遥领先,遥遥领先,遥遥领先,还是遥遥领先,你突破失败`);
      else return e.reply(`突破失败`);
  }else{
      player[突破物品] -= now[突破物品];
      player[玩家境界] = x.name
      player.攻击加成 += x.攻击加成
      player.防御加成+= x.防御加成
      player.暴击加成+= x.暴击加成
      player.爆伤加成+= x.爆伤加成
      player.生命加成+= x.生命加成
      player.闪避加成+= x.闪避加成
      player.生命上限+=x.生命加成
      await Write_player(1,true,e.user_id,player,"player")
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
    if (huihe === 50) {
      // 达到9999回合时，进行随机选择失败者
      let winner = Math.random() < 0.5 ? attacker : defender; // 随机选择攻击者或防守者作为失败者
      msg.push(`达到9999回合，随机选择${winner.name}失败`);
      // 结束战斗
      break;
    }
      try {
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
              msg.push(`${attacker.name}了`);
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
async function calculateDamage(attacker, defender) {
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
  let bag = await Read_player(1,true, usr_qq, "bag");
  let thing_type = thing.type;
  if(!bag.已学习功法) bag.已学习功法 = [];
  if(thing === "无"){
     let x;
     if(thing.type == "道具") x = await Read_json(3,'/item/道具列表.json');
     if(thing.type == "功法") x = await Read_json(3,'/item/功法列表.json')
     thing =x.find(item => item.name === thing_name);
  }
  let bag_thing;
  if(thing_type == "功法") {
    thing_type = 数量 < 0 ? '功法' : '已学习功法'
    bag_thing = bag[thing_type].find(item => item.name === thing_name);
  }else bag_thing = bag[thing_type].find(item => item.name === thing_name);
  if (!bag_thing){
     bag[thing_type].push({
      ...thing,
      数量: 数量
    });
    console.log('新增加成功');
  } else {
   bag_thing.数量 += 数量;
   if(bag_thing.数量 == 0)  bag[thing_type] = bag[thing_type].filter(item => item.name !== bag_thing.name);
   console.log('增加成功');
  }
  await Write_player(1,true, usr_qq, bag, "bag");
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
  if (!await existplayer(1, at.id, 'player')) return 1;
  if(string == "id")return at.id;
  return await Read_player(1,true,at.id,string);
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
//获取所有玩家文件夹名
export async function getAllSubdirectories() {
  try {
    const subdirectories = fs.readdirSync(__PATH.player) // 读取目录下的所有文件和文件夹
      .filter(item => fs.statSync(__PATH.player + '/' + item).isDirectory()); // 过滤出文件夹
    return subdirectories;
  } catch (error) {
    console.error('读取文件夹列表时发生错误: ' + error);
    return [];
  }
}
//读取列表
export async function _item(num:number, path1: string) {
    const playerPath = `${item[num]}/${path1}.json` ;
    try {
    const data = await fs.readFileSync(playerPath, 'utf-8');
    const parsedData = JSON.parse(data);
    return parsedData;
    } catch (err) {
    console.error(err);
    throw err;
    }
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
export async function Read_player2(num,usr_qq,string){
  let playerPath
  if(num === 2){
    playerPath = `${type[num]}/${usr_qq}-${string}.json`;
  }else if(num === 1){
    playerPath = `${type[num]}/${usr_qq}/${usr_qq}-${string}.json`;
  }
  const dir = path.join(playerPath);
  try {
    const playerData = fs.readFileSync(dir, 'utf8');
    const player = JSON.parse(playerData);
    return player;                
  } catch (err) {
    console.log(err);
    return 'error';
  }
}
export async function generateUID(e: AMessage): Promise<string> {
  const users = await getAllSubdirectories();
  let counter = 0;
  const timestamp: number = new Date().getTime();
  let uid: string;
  while (true) {
    uid = generateRandomUID(11);
    let isDuplicate = false;
    for (const user of users) {
      const player = await Read_player(1,false,user, "player");
      if (player.id === uid) {
        isDuplicate = true;
        break;
      }
    }
    if (!isDuplicate) {
      break;
    }
    // 避免死循环,如果已经遍历了所有用户仍无法生成唯一的UID,则抛出错误
    if (counter === 9999999) console.log("无法生成唯一的UID");
    counter++;
  }
  return uid;
}

export function generateRandomUID(length: number){
  let uid = "";
  for (let i = 0; i < length; i++) {
    uid += Math.floor(Math.random() * 10);
  }
  return uid;
}
export async function Write_json_path(path1:string,json:String) {
  const dir = path.join(DirPath,path1);
  const newJson = JSON.stringify(json, null, '\t');
  try {
      fs.writeFileSync(dir, newJson, 'utf8');
      console.log('写入成功');
  } catch (err) {
      console.log('写入失败', err);
  }
}
export async function Read_json_path(path1:string) {
  const dir = path.join(DirPath,path1);
  try {
    const playerData = fs.readFileSync(dir, 'utf8');
    const player = JSON.parse(playerData);
    return player;
  } catch (err) {
    console.log(err);
    return 'error';
  }
}