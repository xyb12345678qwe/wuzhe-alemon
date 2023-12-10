import { getAppPath, createHtml, screenshotByFile, plugin, APlugin } from 'alemonjs';
import path, { basename } from 'path';
import template from 'art-template';
import fs, { writeFileSync } from 'fs';
import lodash from 'lodash';
import chokidar from 'chokidar';
import yaml from 'js-yaml';
import axios from 'axios';
import { promisify } from 'util';
import { exec } from 'child_process';

const DirPath = getAppPath(import.meta.url);
const AppName = basename(DirPath);

class Base {
    e;
    userId;
    model;
    _path;
    constructor(e = {}) {
        this.e = e;
        this.userId = e?.user_id;
        this.model = AppName;
        this._path = process.cwd().replace(/\\/g, '/');
    }
    get prefix() {
        return `Yz:${AppName}:${this.model}:`;
    }
    constructPath(type) {
        return `${DirPath}/resources/${type}`;
    }
    get screenData() {
        return {
            saveId: this.userId,
            tplFile: this.constructPath(`html/${this.model}/${this.model}.html`),
            pluResPath: this.constructPath(''),
        };
    }
}

class Game extends Base {
    constructor(e) {
        super(e);
        this.model = 'show';
    }
    async getScreenData(model, myData) {
        this.model = model;
        return {
            ...this.screenData,
            saveId: model,
            ...myData,
        };
    }
    async get_playerData(myData) {
        return this.getScreenData('player', myData);
    }
    async get_lingqi(myData) {
        return this.getScreenData('lingqi', myData);
    }
    async get_lieyao(myData) {
        return this.getScreenData('lieyao', myData);
    }
    async get_msg(myData) {
        return this.getScreenData('msg', myData);
    }
    async get_jisha(myData) {
        return this.getScreenData('jisha', myData);
    }
    async get_wanjietang(myData) {
        return this.getScreenData('wanjietang', myData);
    }
    async get_bag(myData) {
        return this.getScreenData('bag', myData);
    }
}

// import {AMessage} from 'alemon'
const _path = process.cwd();


const createFolder = (folderPath) => {
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath);
    console.log(`文件夹 ${folderPath} 创建成功！`);
  } else {
    console.log();
  }
};

const folderPath = './data';
createFolder(folderPath);
let puppeteer = {};
class Puppeteer {
  constructor () {
    this.browser = false;
    this.lock = false;
    this.shoting = [];
    /** 截图数达到时重启浏览器 避免生成速度越来越慢 */
    this.restartNum = 100;
    /** 截图次数 */
    this.renderNum = 0;
    this.config = {
    
      args: [
        '--disable-gpu',
        '--disable-dev-shm-usage',
        '--disable-setuid-sandbox',
        '--no-first-run',
        '--no-sandbox',
        '--no-zygote',
        '--single-process'
      ]
    };

   

    this.html = {};
    this.watcher = {};
	
    this.createDir('./data/html');
  }

  async initPupp () {
    if (!lodash.isEmpty(puppeteer)) return puppeteer
    puppeteer = (await import('puppeteer')).default;

    return puppeteer
  }

  createDir (dir) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
  }

  /**
   * 初始化chromium
   */
  async browserInit () {
    await this.initPupp();
    if (this.browser) return this.browser
    if (this.lock) return false
    this.lock = true;

    console.log('puppeteer Chromium 启动中...');

    /** 初始化puppeteer */
    this.browser = await puppeteer.launch(this.config).catch((err) => {
      console.log(err.toString());
      if (String(err).includes('correct Chromium')) {
        console.log('没有正确安装Chromium，可以尝试执行安装命令：node ./node_modules/puppeteer/install.js');
      }
    });

    this.lock = false;

    if (!this.browser) {
      console.log('puppeteer Chromium 启动失败');
      return false
    }

    console.log('puppeteer Chromium 启动成功');

    /** 监听Chromium实例是否断开 */
    this.browser.on('disconnected', (e) => {
      console.log('Chromium实例关闭或崩溃！');
      this.browser = false;
    });

    return this.browser
  }

  /**
   * `chromium` 截图
   * @param data 模板参数
   * @param data.tplFile 模板路径，必传
   * @param data.saveId  生成html名称，为空name代替
   * @param data.imgType  screenshot参数，生成图片类型：jpeg，png
   * @param data.quality  screenshot参数，图片质量 0-100，jpeg是可传，默认90
   * @param data.omitBackground  screenshot参数，隐藏默认的白色背景，背景透明。默认不透明
   * @param data.path   screenshot参数，截图保存路径。截图图片类型将从文件扩展名推断出来。如果是相对路径，则从当前路径解析。如果没有指定路径，图片将不会保存到硬盘。
   * @return oicq img
   */
  async screenshot (name, data = {}) {
    if (!await this.browserInit()) {
      return false
    }

    let savePath = this.dealTpl(name, data);
    if (!savePath) return false

    let buff = '';
    let start = Date.now();

    this.shoting.push(name);

    try {
      const page = await this.browser.newPage();
      await page.goto(`file://${_path}${lodash.trim(savePath, '.')}`, data.pageGotoParams || {});
      let body = await page.$('#container') || await page.$('body');

      let randData = {
        // encoding: 'base64',
        type: data.imgType || 'jpeg',
        omitBackground: data.omitBackground || false,
        quality: data.quality || 90,
        path: data.path || ''
      };

      if (data.imgType == 'png') delete randData.quality;

      buff = await body.screenshot(randData);

      page.close().catch((err) => console.log(err));
    } catch (error) {
      console.log(`图片生成失败:${name}:${error}`);
      /** 关闭浏览器 */
      if (this.browser) {
        await this.browser.close().catch((err) => console.log(err));
      }
      this.browser = false;
      buff = '';
      return false
    }

    this.shoting.pop();

    if (!buff) {
      console.log(`图片生成为空:${name}`);
      return false
    }

    this.renderNum++;

    /** 计算图片大小 */
    let kb = (buff.length / 1024).toFixed(2) + 'kb';

    console.log(`[图片生成][${name}][${this.renderNum}次] ${kb} ${console.log(`${Date.now() - start}ms`)}`);

    this.restart();

    return buff
  }

  /** 模板 */
  dealTpl (name, data) {
    let { tplFile, saveId = name } = data;
    let savePath = `./data/html/${name}/${saveId}.html`;

    /** 读取html模板 */
    if (!this.html[tplFile]) {
      this.createDir(`./data/html/${name}`);

      try {
        this.html[tplFile] = fs.readFileSync(tplFile, 'utf8');
      } catch (error) {
        console.log(`加载html错误：${tplFile}`);
        return false
      }

      this.watch(tplFile);
    }

    data.resPath = `${_path}/resources/`;

    /** 替换模板 */
    let tmpHtml = template.render(this.html[tplFile], data);

    /** 保存模板 */
    fs.writeFileSync(savePath, tmpHtml);

    console.log(`[图片生成][使用模板] ${savePath}`);

    return savePath
  }

  /** 监听配置文件 */
  watch (tplFile) {
    if (this.watcher[tplFile]) return

    const watcher = chokidar.watch(tplFile);
    watcher.on('change', path => {
      delete this.html[tplFile];
      console.log(`[修改html模板] ${tplFile}`);
    });

    this.watcher[tplFile] = watcher;
  }

  /** 重启 */
  restart () {
    /** 截图超过重启数时，自动关闭重启浏览器，避免生成速度越来越慢 */
    if (this.renderNum % this.restartNum == 0) {
      if (this.shoting.length <= 0) {
        setTimeout(async () => {
          if (this.browser) {
            await this.browser.close().catch((err) => console.log(err));
          }
          this.browser = false;
          console.log('puppeteer 关闭重启...');
        }, 100);
      }
    }
  }
}

var puppeteer$1 = new Puppeteer();

function oImages(directory, data = {}) {
    const { template: template$1, AdressHtml } = createHtml(AppName, `${DirPath}${directory}`);
    writeFileSync(AdressHtml, template.render(template$1, data));
    return screenshotByFile(AdressHtml, {
        SOptions: { type: 'jpeg', quality: 90 },
        tab: 'body',
        timeout: 2000
    });
}
const data = path.join(DirPath, 'resources', 'data');
const __PATH = {
    zongmen: path.join(data, 'zongmen'),
    player: path.join(data, 'player'),
    help: path.join(data, 'help', 'help.yaml'),
    list: path.join(data, 'item'),
    playerjson: path.join(data, 'player.json'),
    shezhi: path.join(DirPath, "shezhi", 'all_shezhi.json')
};
let yamltype = {
    "1": __PATH.help,
};
let type = {
    "1": __PATH.player,
    "2": __PATH.zongmen,
};
let jsontype = {
    "1": __PATH.playerjson,
    "2": __PATH.shezhi
};
let item = {
    "1": __PATH.list
};
async function Add_生命(usr_qq, num) {
    const player = await Read_player(1, usr_qq, "player");
    player.当前生命 += num;
    player.当前生命 = player.当前生命 > player.生命上限 ? player.生命上限 : player.当前生命;
    await Write_player(1, usr_qq, player, "player");
}
async function existplayer(num, usr_qq, string) {
    if (num === 1) {
        const json = await Read_json_path(`/resources/data/player.json`);
        return json.some(item => item.绑定账号.includes(usr_qq));
    }
    else if (num === 2) {
        let player = await Read_player(1, usr_qq, "player");
        if (!player.宗门)
            return false;
        else
            return true;
    }
}
async function Read_player(num, usr_qq, string) {
    let list = await getidlist(usr_qq);
    let playerPath;
    if (num === 1) {
        playerPath = `${type[num]}/${list.id}/${list.id}-${string}.json`;
    }
    else if (num === 2) {
        let player = await Read_player(1, usr_qq, "player");
        playerPath = `${type[num]}/${player.宗门.宗主}-${string}.json`;
    }
    const dir = path.join(playerPath);
    try {
        const playerData = await fs.promises.readFile(dir, 'utf8');
        const player = JSON.parse(playerData);
        return player;
    }
    catch (err) {
        console.log(err);
        return err.message;
    }
}
async function getidlist(usr_qq) {
    const json = await Read_json_path(`/resources/data/player.json`);
    return json.find(item => item.绑定账号.includes(usr_qq));
}
async function Read_json(num) {
    const playerPath = `${jsontype[num]}`;
    const dir = path.join(playerPath);
    try {
        const playerData = fs.readFileSync(dir, 'utf8');
        const player = JSON.parse(playerData);
        return player;
    }
    catch (err) {
        console.log(err);
        return 'error';
    }
}
const writeFileAsync = promisify(fs.writeFile);
const mkdirAsync = promisify(fs.mkdir);
async function Write_player(num, usr_qq, player, string) {
    const json = await Read_json_path(`/resources/data/player.json`);
    const list = json.find(item => item.绑定账号.includes(usr_qq));
    let dir;
    let dir2 = "无";
    if (num === 2) {
        let player = await Read_player(1, usr_qq, "player");
        dir = path.join(type[num], `${player.宗门.宗主}-${string}.json`);
    }
    else {
        dir = path.join(type[num], list.id, `${list.id}-${string}.json`);
        dir2 = path.join(type[num], list.id);
    }
    if (dir2 === "无")
        dir2 = type[num];
    const newJson = JSON.stringify(player, null, '\t');
    try {
        if (!fs.existsSync(dir2)) {
            await mkdirAsync(dir2, { recursive: true });
        }
        await writeFileAsync(dir, newJson, 'utf8');
        console.log('写入成功');
    }
    catch (err) {
        console.log('写入失败', err);
    }
}
async function Write_list(list, string) {
    const dir = `${__PATH.list}/${string}.json`;
    const newJson = JSON.stringify(list, null, '\t');
    try {
        fs.writeFileSync(dir, newJson, 'utf8');
        console.log('写入成功');
    }
    catch (err) {
        console.log('写入失败', err);
    }
}
async function Write_json(num, json) {
    const dir = path.join(jsontype[num]);
    const newJson = JSON.stringify(json, null, '\t');
    try {
        fs.writeFileSync(dir, newJson, 'utf8');
        console.log('写入成功');
    }
    catch (err) {
        console.log('写入失败', err);
    }
}
async function allzongmen() {
    const files = fs.readdirSync(__PATH.zongmen).filter(file => file.endsWith('.json'));
    const users = files.map(file => file.replace(/-zongmen\.json$/, ''));
    return users;
}
async function Read_yaml(num) {
    try {
        const fileContents = fs.readFileSync(yamltype[num], 'utf8');
        const data = yaml.load(fileContents);
        return data;
    }
    catch (error) {
        console.log(error);
    }
}
async function Write_playerData(usr_qq, new_player, new_bag, new_equipment, new_status, new_list, new_list_string) {
    const tasks = [];
    if (new_player !== '无')
        tasks.push(Write_player(1, usr_qq, new_player, 'player'));
    if (new_bag !== '无')
        tasks.push(Write_player(1, usr_qq, new_bag, 'bag'));
    if (new_equipment !== '无')
        tasks.push(Write_player(1, usr_qq, new_equipment, 'equipment'));
    if (new_status !== '无')
        tasks.push(Write_player(1, usr_qq, new_status, 'status'));
    if (new_list !== '无')
        tasks.push(Write_list(new_list, new_list_string));
    await Promise.all(tasks);
}
function getItemsByGrade(data) {
    const grades = ["低级灵器", "中级灵器", "高级灵器", "帝器"];
    return grades.reduce((result, grade) => {
        result[grade] = data.filter(item => item.品级 === grade);
        return result;
    }, {});
}
const 权重 = {
    "低级灵器": 50,
    "中级灵器": 30,
    "高级灵器": 15,
    "帝器": 2
};
async function getRandomItem(灵器分类) {
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
async function getlingqi(e) {
    const 灵器列表 = await _item(1, '灵器列表');
    const 灵器分类 = await getItemsByGrade(灵器列表);
    const randomItem = getRandomItem(灵器分类);
    console.log(randomItem);
    const obj = await Promise.resolve(randomItem);
    console.log(obj);
    e.reply(`觉醒成功,觉醒出${obj.name},品级为${obj.品级}`);
    return obj;
}
async function pic(e, get_data, show) {
    const data1 = await new Game(e)[show](get_data);
    const img = await puppeteer$1.screenshot('pic', { ...data1 });
    if (img !== false) {
        e.reply(img);
    }
    else {
        console.log('截图失败');
    }
}
async function findIndexByName(name, arr) {
    const index = arr.findIndex(item => item.name === name);
    if (index !== -1)
        return index;
    else
        return '没有找到';
}
async function Strand(now, max) {
    let num = Math.min(parseFloat(((now / max) * 1200).toFixed(0)), 100);
    return {
        style: `style=width:${num}%`,
        num: num,
    };
}
async function getNonZeroKeys(obj) {
    for (let key in obj) {
        if (obj[key] !== 0) {
            return key;
        }
        console.log(`Key: ${key}, Value: ${obj[key]}`);
    }
    return false;
}
async function startstatus(e, 状态, 返回状态) {
    const now = Date.now();
    let status = await getUserStatus(e, "status");
    if (!status)
        return false;
    const x = await getNonZeroKeys(status);
    if (x !== false)
        return e.reply(`你正在${x}中`);
    status[状态] = now;
    await Write_player(1, e.user_id, status, 'status');
    return e.reply(`开始${返回状态}`);
}
async function stopstatus(e, 状态, 结算物品, 结束回答物品, 结算概率) {
    const now = Date.now();
    let status = await getUserStatus(e, "status");
    if (!status)
        return false;
    let player = await Read_player(1, e.user_id, `player`);
    if (status[状态] === 0)
        return e.reply(`你没在${状态}`);
    const time = (now - status[状态]) / 1000 / 60;
    const money = Math.floor(time * 结算概率);
    player[结算物品] += money;
    status[状态] = 0;
    await Write_playerData(e.user_id, player, "无", "无", status, "无", "无");
    return e.reply(`结束成功，获得${money}${结束回答物品}`);
}
async function getUserStatus(e, string) {
    const usr_qq = e.user_id;
    if (!await existplayer(1, usr_qq))
        return false;
    return await Read_player(1, usr_qq, string);
}
async function msToTime(duration) {
    const seconds = Math.floor((duration / 1000) % 60);
    const minutes = Math.floor((duration / (1000 * 60)) % 60);
    const hours = Math.floor((duration / (1000 * 60 * 60)) % 24);
    const paddedHours = (hours < 10) ? "0" + hours : hours.toString();
    const paddedMinutes = (minutes < 10) ? "0" + minutes : minutes.toString();
    const paddedSeconds = (seconds < 10) ? "0" + seconds : seconds.toString();
    return `${paddedHours}时${paddedMinutes}分${paddedSeconds}秒`;
}
async function gettupo(e, 玩家境界, data境界名, 突破物品) {
    let player = await getUserStatus(e, "player");
    const now_level_id = await findIndexByName(player[玩家境界], await _item(1, data境界名)) + 1;
    let xx = await _item(1, data境界名);
    const now = xx.find(item => item.name = player[玩家境界]);
    let x = xx[now_level_id];
    if (player[突破物品] < now[突破物品])
        return e.reply(`${突破物品}不足`);
    let rand = Math.random();
    let prob = 1 - now_level_id / 60;
    if (rand > prob) {
        const bad_rand = Math.random();
        if (bad_rand > 0.7)
            return e.reply(`你突破中突然又想到等会要去买台遥遥领先玩，突破失败`);
        if (bad_rand > 0.5)
            return e.reply(`旁边的山突然塌了，你被余波扰乱心智，突破失败`);
        if (bad_rand > 0.4)
            return e.reply(`突然有人喊道，有两个女人在大街上打架还撕扯上衣服，你想去看看，突破失败`);
        if (bad_rand > 0.6)
            return e.reply(`突然有道雷劈到了你身上，突破失败`);
        if (bad_rand > 0.3)
            return e.reply(`你的脑海中突然想起了一道声音:遥遥领先,遥遥领先,遥遥领先,遥遥领先,遥遥领先,遥遥领先,遥遥领先,遥遥领先,遥遥领先,遥遥领先,还是遥遥领先,你突破失败`);
        else
            return e.reply(`突破失败`);
    }
    else {
        player[突破物品] -= now[突破物品];
        player[玩家境界] = x.name;
        player.攻击加成 += x.攻击加成;
        player.防御加成 += x.防御加成;
        player.暴击加成 += x.暴击加成;
        player.爆伤加成 += x.爆伤加成;
        player.生命加成 += x.生命加成;
        player.闪避加成 += x.闪避加成;
        await Write_player(1, e.user_id, player, "player");
        return e.reply(`突破成功,目前境界${x.name}`);
    }
}
async function getstring(string, 包含的字符串) {
    if (string.includes(包含的字符串))
        return true;
    else
        return false;
}
const checkNameExists = async (name, obj) => {
    const names = Object.keys(obj);
    return names.includes(name);
};
async function player_zhandou(attacker, defender) {
    let msg = [];
    let huihe = 1;
    let A_damage = 0;
    let B_damage = 0;
    while (attacker.当前生命 > 0 && defender.当前生命 > 0) {
        if (huihe === 50) {
            let winner = Math.random() < 0.5 ? attacker : defender;
            msg.push(`达到9999回合，随机选择${winner.name}失败`);
            break;
        }
        msg.push(`第${huihe}回合开始`);
        try {
            let shanghaiA = await calculateDamage(attacker, defender);
            defender.当前生命 -= shanghaiA;
            A_damage += shanghaiA;
            msg.push(`${attacker.name}对${defender.name}造成了${shanghaiA}点伤害`);
            if (defender.当前生命 <= 0) {
                msg.push(`${defender.name}战败了`);
                break;
            }
            let shanghaiB = await calculateDamage(defender, attacker);
            attacker.当前生命 -= shanghaiB;
            B_damage += shanghaiB;
            msg.push(`${defender.name}对${attacker.name}造成了${shanghaiB}点伤害`);
            if (attacker.当前生命 <= 0) {
                msg.push(`${attacker.name}了`);
                break;
            }
        }
        catch (error) {
            msg.push('伤害计算出现错误：' + error.message);
            break;
        }
        msg.push(`第${huihe}回合结束`);
        huihe++;
    }
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
    if (Math.random() <= attacker.暴击加成) {
        shanghai *= attacker.爆伤加成;
    }
    if (Math.random() <= defender.闪避加成) {
        shanghai = 0;
    }
    console.log(shanghai);
    return shanghai;
}
async function Add_bag_thing(usr_qq, thing_name, 数量, thing) {
    let bag = await Read_player(1, usr_qq, "bag");
    if (thing === "无") {
        let x = await _item(1, '道具列表');
        thing = x.find(item => item.name === thing_name);
    }
    let bag_thing = bag[thing.type].find(item => item.name === thing_name);
    if (!bag_thing) {
        bag[thing.type].push({
            ...thing,
            数量: 数量
        });
        console.log('新增加成功');
    }
    else {
        bag_thing.数量 += 数量;
        if (bag_thing.数量 == 0)
            bag_thing = '';
        console.log('增加成功');
    }
    await Write_player(1, usr_qq, bag, "bag");
}
async function determineWinner(msg, A_player_name, B_player_name) {
    let winner = null;
    let A_defeated = false;
    let B_defeated = false;
    for (let i = msg.length - 1; i >= 0; i--) {
        if (msg[i].includes(A_player_name))
            A_defeated = true;
        else if (msg[i].includes(B_player_name))
            B_defeated = true;
        if (A_defeated && B_defeated)
            break;
    }
    if (A_defeated && !B_defeated)
        winner = B_player_name;
    else if (!A_defeated && B_defeated)
        winner = A_player_name;
    return winner;
}
async function getB_qq(e, string) {
    const at = e.at_user;
    if (!at)
        return 0;
    console.log(at.id);
    if (!at)
        return false;
    if (!await existplayer(1, at.id))
        return 1;
    if (string == "id")
        return at.id;
    return await Read_player(1, at.id, string);
}
async function createPlayerObject(player) {
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
async function getCurrentTime(startTime, elapsedTime) {
    const start = new Date(startTime);
    const elapsed = parseInt(elapsedTime.toString(), 10);
    const current = new Date(start.getTime() + elapsed);
    return start.getTime() >= current.getTime();
}
async function getAllSubdirectories() {
    try {
        const subdirectories = fs.readdirSync(__PATH.player)
            .filter(item => fs.statSync(__PATH.player + '/' + item).isDirectory());
        return subdirectories;
    }
    catch (error) {
        console.error('读取文件夹列表时发生错误: ' + error);
        return [];
    }
}
async function _item(num, path1) {
    const playerPath = `${item[num]}/${path1}.json`;
    try {
        const data = await fs.readFileSync(playerPath, 'utf-8');
        const parsedData = JSON.parse(data);
        return parsedData;
    }
    catch (err) {
        console.error(err);
        throw err;
    }
}
async function extractAttributesWithPropertyOne(dataArray) {
    const result = [];
    for (const item of dataArray) {
        if (item.hasOwnProperty('万界堂') && item['万界堂'] === 1) {
            result.push(item);
        }
    }
    return result;
}
async function Read_player2(num, usr_qq, string) {
    let playerPath;
    if (num === 2) {
        playerPath = `${type[num]}/${usr_qq}-${string}.json`;
    }
    else if (num === 1) {
        playerPath = `${type[num]}/${usr_qq}/${usr_qq}-${string}.json`;
    }
    const dir = path.join(playerPath);
    try {
        const playerData = fs.readFileSync(dir, 'utf8');
        const player = JSON.parse(playerData);
        return player;
    }
    catch (err) {
        console.log(err);
        return 'error';
    }
}
async function generateUID(e) {
    const users = await getAllSubdirectories();
    let counter = 0;
    new Date().getTime();
    let uid;
    while (true) {
        uid = generateRandomUID(11);
        let isDuplicate = false;
        for (const user of users) {
            const player = await Read_player2(1, user, "player");
            if (player.id === uid) {
                isDuplicate = true;
                break;
            }
        }
        if (!isDuplicate) {
            break;
        }
        if (counter === 9999999)
            console.log("无法生成唯一的UID");
        counter++;
    }
    return uid;
}
function generateRandomUID(length) {
    let uid = "";
    for (let i = 0; i < length; i++) {
        uid += Math.floor(Math.random() * 10);
    }
    return uid;
}
async function Write_json_path(path1, json) {
    const dir = path.join(DirPath, path1);
    const newJson = JSON.stringify(json, null, '\t');
    try {
        fs.writeFileSync(dir, newJson, 'utf8');
        console.log('写入成功');
    }
    catch (err) {
        console.log('写入失败', err);
    }
}
async function Read_json_path(path1) {
    const dir = path.join(DirPath, path1);
    try {
        const playerData = fs.readFileSync(dir, 'utf8');
        const player = JSON.parse(playerData);
        return player;
    }
    catch (err) {
        console.log(err);
        return 'error';
    }
}

const apiUrl = 'http://tj.mzswebs.top';
const apiUrl2 = `http://yiyan-api.mzswebs.top/yiyan.php`;
async function fetchData(apiUrl) {
    try {
        const response = await axios.get(apiUrl);
        const data = response.data;
        return data;
    }
    catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
}

class dajie extends plugin {
    constructor() {
        super({
            name: 'dajie',
            dsc: '基础模块',
            event: 'message',
            priority: 600,
            rule: [
                {
                    reg: /^(#|\/)打劫.*$/,
                    fnc: 'jie',
                },
                {
                    reg: /^(#|\/)比斗.*$/,
                    fnc: 'bidou',
                },
                {
                    reg: /^(#|\/)at.*$/,
                    fnc: 'at',
                },
            ],
        });
    }
    async jie(e) {
        const usr_qq = e.user_id;
        console.log(usr_qq);
        if (!await existplayer(1, usr_qq))
            return false;
        let B_player = await getB_qq(e, "player");
        if (!B_player)
            return false;
        let player = await Read_player(1, usr_qq, "player");
        if (player.当前生命 < 50)
            return e.reply(`先去治疗吧`);
        const A_player = await createPlayerObject(player);
        const BB_player = await createPlayerObject(B_player);
        let msg = await player_zhandou(A_player, BB_player);
        let name = await determineWinner(msg.result, player.name, B_player.name);
        let temp = msg.result;
        console.log(temp);
        if (name === player.name) {
            const money = player.金钱 * 0.9;
            temp.push(`打劫成功,获得${money}`);
            player.金钱 += money;
            B_player.金钱 -= money;
        }
        player.当前生命 -= msg.A_damage;
        B_player.当前生命 -= msg.B_damage;
        await Write_player(1, usr_qq, player, "player");
        await Write_player(1, B_player.id, B_player, "player");
        let get_data = { temp };
        await pic(e, get_data, `get_msg`);
        return false;
    }
    async at(e) {
        const at = e.at_user;
        console.log(at);
        if (!at)
            return false;
        e.reply(at.id);
        return false;
    }
    async bidou(e) {
        const usr_qq = e.user_id;
        if (!await existplayer(1, usr_qq))
            return false;
        let B_player = await getB_qq(e, "player");
        if (!B_player)
            return false;
        let player = await Read_player(1, usr_qq, "player");
        if (player.当前生命 < 50)
            return e.reply(`先去治疗吧`);
        const A_player = await createPlayerObject(player);
        const BB_player = await createPlayerObject(B_player);
        let msg = await player_zhandou(A_player, BB_player);
        await determineWinner(msg.result, player.name, B_player.name);
        let temp = msg.result;
        console.log(temp);
        player.灵气 += 50;
        player.体魄力量 += 100;
        B_player.灵气 += 50;
        B_player.体魄力量 += 100;
        B_player.当前生命 -= msg.B_damage;
        player.当前生命 -= msg.A_damage;
        await Write_player(1, usr_qq, player, "player");
        await Write_player(1, B_player.id, B_player, "player");
        let get_data = { temp };
        await pic(e, get_data, `get_msg`);
        return false;
    }
}

class jisha extends plugin {
    constructor() {
        super({
            name: 'jisha',
            dsc: '基础模块',
            event: 'message',
            priority: 600,
            rule: [
                {
                    reg: /^(#|\/)妖兽地点$/,
                    fnc: 'x',
                },
                {
                    reg: /^(#|\/)探索.*$/,
                    fnc: 'xx',
                },
                {
                    reg: /^(#|\/)击杀.*$/,
                    fnc: 'xxx',
                },
            ],
        });
    }
    async x(e) {
        let item = await _item(1, `妖兽地点`);
        let get_data = { item };
        await pic(e, get_data, `get_jisha`);
        return false;
    }
    async xx(e) {
        const now = Date.now();
        const usr_qq = e.user_id;
        if (!await existplayer(1, usr_qq))
            return false;
        const name = e.msg.replace(/(\/|#)探索/, "").trim();
        const x = await _item(1, `妖兽地点`);
        let item = x.find((team) => team.name === name);
        if (!item)
            return false;
        let msg = [];
        for (let i = 0; i < item.妖兽.length; i++) {
            if (item.time === 0 || await getCurrentTime(item.time, 60 * 24)) {
                const randomValue = Math.floor(Math.random() * 1001);
                console.log(randomValue);
                item.妖兽[i].数量 = randomValue;
            }
            msg.push(`${item.妖兽[i].name}: ${item.妖兽[i].数量}只`);
        }
        item.time = now;
        await Write_list(x, "妖兽地点");
        return e.reply(msg.join('\n'));
    }
    async xxx(e) {
        const usr_qq = e.user_id;
        if (!await existplayer(1, usr_qq))
            return false;
        const name = e.msg.replace(/(\/|#)击杀/, "").trim();
        const [adress, boss, num] = name.split("*").map(code => code.trim());
        const x = await _item(1, '妖兽地点');
        const item = x.find((team) => team.name === adress);
        console.log(item);
        if (!item)
            return false;
        let xx = await _item(1, '妖兽列表');
        xx = xx.find((item) => item.name === boss);
        console.log(xx);
        if (!xx)
            return false;
        let xxx = item.妖兽.find((team) => team.name === boss);
        console.log(xxx);
        if (xxx.数量 < parseInt(num))
            return e.reply(`数量不足`);
        if (!xxx)
            return false;
        let player = await Read_player(1, usr_qq, "player");
        if (player.当前生命 < 50)
            return e.reply(`先去治疗吧`);
        const A_player = {
            name: player.name,
            暴击加成: player.暴击加成,
            爆伤加成: player.爆伤加成,
            攻击加成: player.攻击加成,
            闪避加成: player.闪避加成,
            防御加成: player.防御加成,
            当前生命: player.当前生命,
        };
        const B_player = {
            name: xx.name,
            暴击加成: xx.暴击加成,
            爆伤加成: xx.爆伤加成,
            攻击加成: xx.攻击加成,
            闪避加成: xx.闪避加成,
            防御加成: xx.防御加成,
            当前生命: xx.生命加成,
        };
        const AA_player = { ...player, 当前生命: player.当前生命 };
        const BB_player = { ...xx, 当前生命: xx.生命加成 };
        console.log(AA_player);
        console.log(BB_player);
        const msg = await player_zhandou(A_player, B_player);
        const temp = msg.result;
        const sheng_name = await determineWinner(temp, player.name, B_player.name);
        if (sheng_name === player.name) {
            player.灵气 += xx.掉落修为;
            player.体魄力量 += xx.掉落体魄力量;
            player.钱财 += xx.掉落钱财;
            temp.push(`恭喜你打赢了${xx.name}，获得灵气${xx.掉落修为}，获得体魄力量${xx.掉落体魄力量}，获得钱财${xx.掉落钱财}`);
        }
        player.当前生命 -= msg.A_damage;
        xxx -= parseInt(num);
        await Write_playerData(usr_qq, player, "无", "无", "无", x, "妖兽地点");
        const get_data = { temp };
        await pic(e, get_data, `get_msg`);
        return e.reply(`失败`);
    }
}

class admin extends plugin {
    constructor() {
        super({
            name: '管理|更新插件',
            dsc: '管理和更新代码',
            event: 'message',
            priority: 400,
            rule: [
                {
                    reg: /^(#|\/)?武者更新$/,
                    fnc: 'checkout'
                }
            ]
        });
    }
    async checkout(e) {
        if (!e.isMaster)
            return false;
        exec('git  pull', { cwd: `${DirPath}/` }, function (error, stdout, stderr) {
            if (/(Already up[ -]to[ -]date|已经是最新的)/.test(stdout))
                return e.reply('目前已经是最新版武者文游了~');
            if (error)
                return e.reply('武者文游更新失败！\nError code: ' + error.code + '\n' + error.stack + '\n 请稍后重试。');
            e.reply('更新成功,请[#重启]');
        });
        return false;
    }
}

class tongbu extends plugin {
    constructor() {
        super({
            name: 'tongbu',
            dsc: '基础模块',
            event: 'message',
            priority: 600,
            rule: [
                {
                    reg: /^(#|\/)?武者同步$/,
                    fnc: 'tongbu',
                },
            ],
        });
    }
    async tongbu(e) {
        if (!e.isMaster)
            return false;
        let usr_qq = await getAllSubdirectories();
        await Promise.all(usr_qq.map(async (directory) => {
            let player = await Read_player(1, directory, "player");
            let ziduan = ["性别"];
            ziduan.forEach((k) => {
                if (!player[k])
                    player[k] = "无";
            });
            await Write_player(1, directory, player, "player");
        }));
        return false;
    }
}

class chanenl_id extends plugin {
    constructor() {
        super({
            name: 'chanenl_id',
            dsc: '基础模块',
            event: 'message',
            priority: 600,
            rule: [
                {
                    reg: /^(#|\/)?绑定进出子频道id$/,
                    fnc: 'chanenl_id',
                },
            ],
        });
    }
    async chanenl_id(e) {
        if (!e.isMaster)
            return false;
        const id = e.channel_id;
        let shezhi = await Read_json(2);
        let chanenl_id = shezhi.find(item => item.type == "chanenl_id");
        chanenl_id.num = id;
        await Write_json(2, shezhi);
        return e.reply(`绑定成功`);
    }
}

class level extends plugin {
    constructor() {
        super({
            name: 'level',
            dsc: '基础模块',
            event: 'message',
            priority: 600,
            rule: [
                {
                    reg: /^(#|\/)开始修炼$/,
                    fnc: 'x',
                },
                {
                    reg: /^(#|\/)结束修炼$/,
                    fnc: 'stop1',
                },
                {
                    reg: /^(#|\/)开始锻炼体魄$/,
                    fnc: 'd',
                },
                {
                    reg: /^(#|\/)结束锻炼体魄$/,
                    fnc: 'stop2',
                },
                {
                    reg: /^(#|\/)开始修炼灵魂$/,
                    fnc: 'l',
                },
                {
                    reg: /^(#|\/)结束修炼灵魂$/,
                    fnc: 'stop3',
                },
                {
                    reg: /^(#|\/)修为突破$/,
                    fnc: 'po1',
                },
                {
                    reg: /^(#|\/)体魄突破$/,
                    fnc: 'po2',
                },
                {
                    reg: /^(#|\/)灵魂突破$/,
                    fnc: 'po3',
                }
            ],
        });
    }
    async po3(e) {
        await gettupo(e, "灵魂境界", "灵魂境界", "灵魂力量");
        return false;
    }
    async po2(e) {
        await gettupo(e, "体魄境界", "体魄境界", "体魄力量");
        return false;
    }
    async po1(e) {
        await gettupo(e, "武者境界", "武者境界", "灵气");
        return false;
    }
    async x(e) {
        await startstatus(e, `修炼`, `修炼`);
        return false;
    }
    async stop1(e) {
        await stopstatus(e, `修炼`, `灵气`, `灵气`, 0.4);
        return false;
    }
    async d(e) {
        await startstatus(e, `锻炼`, `锻炼体魄`);
        return false;
    }
    async stop2(e) {
        await stopstatus(e, `锻炼`, `体魄力量`, `体魄力量`, 0.4);
        return false;
    }
    async l(e) {
        await startstatus(e, `修炼灵魂`, `修炼灵魂`);
        return false;
    }
    async stop3(e) {
        await stopstatus(e, `修炼灵魂`, `灵魂力量`, `灵魂力量`, 0.2);
        return false;
    }
}

class shengji extends plugin {
    constructor() {
        super({
            name: 'shengji',
            dsc: '基础模块',
            event: 'message',
            priority: 600,
            rule: [
                {
                    reg: /^(#|\/)?升级灵器$/,
                    fnc: 'raise',
                },
            ],
        });
    }
    async raise(e) {
        const usr_qq = e.user_id;
        const playerExists = await existplayer(1, usr_qq);
        if (!playerExists)
            return false;
        let player = await Read_player(1, usr_qq, "player");
        const lingqi = player.本命灵器;
        const exp = lingqi.等级 * 1000;
        if (lingqi.exp < exp)
            return e.reply(`经验不足`);
        lingqi.exp -= exp;
        lingqi.等级 += 1;
        await Write_player(1, usr_qq, player, "player");
        return e.reply(`升级生成，目前等级${lingqi.等级}`);
    }
}

class liandan extends plugin {
    constructor() {
        super({
            name: 'liandan',
            dsc: '基础模块',
            event: 'message',
            priority: 600,
            rule: [
                {
                    reg: /^(#|\/)?炼丹.*$/,
                    fnc: 'liandan',
                },
            ],
        });
    }
    async liandan(e) {
        if (!await existplayer(1, e.user_id))
            return false;
        const [danName, num] = e.msg.replace(/(\/|#)炼丹/, "").trim().split("*").map(code => code.trim());
        const danList = (await _item(1, "丹方")).find(item => item.name === danName);
        const itemList = await _item(1, "道具列表");
        if (!danList || !num)
            return false;
        const userBag = await Read_player(1, e.user_id, "bag");
        const errorMessages = [];
        const requiredMaterials = danList.材料.map(({ name, 数量 }) => ({ name, 数量: 数量 * Number(num) }));
        function processMaterial(material) {
            const { name, 数量 } = material;
            const itemType = (itemList.find(item => item.name === name) || {}).type;
            const bagItem = userBag[itemType]?.find(item => item.name === name);
            if (!bagItem || bagItem.数量 < 数量)
                return errorMessages.push(`炼丹失败，缺少${name}`);
            return true;
        }
        if (!requiredMaterials.every(processMaterial))
            return e.reply(`炼丹失败, ${errorMessages.join(", ")}`);
        requiredMaterials.forEach(async (material) => {
            (itemList.find(item => item.name === material.name) || {}).type;
            await Add_bag_thing(e.user_id, material.name, -material.数量, material);
        });
        await Add_bag_thing(e.user_id, danName, Number(num), danList);
        e.reply(`炼丹成功, 获得${danName}*${num}`);
        return false;
    }
}

let shezhi = {};
class start extends plugin {
    constructor() {
        super({
            name: 'start',
            dsc: '基础模块',
            event: 'message',
            priority: 600,
            rule: [
                {
                    reg: /^(#|\/)?解除账号绑定id.*$/,
                    fnc: 'jianid',
                },
                {
                    reg: /^(#|\/)?添加账号绑定id.*$/,
                    fnc: 'addid',
                },
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
                    reg: /^(#|\/)?武者帮助$/,
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
                    reg: /^(#|\/)?自废命脉.*$/,
                    fnc: 'fei',
                },
                {
                    reg: /^(#|\/)?解除账号绑定$/,
                    fnc: 'jiechuzhanghao',
                },
            ],
        });
    }
    async jiechuzhanghao(e) {
        const usr_qq = e.user_id;
        if (!await existplayer(1, usr_qq))
            return false;
        const json = await Read_json_path(`/resources/data/player.json`);
        let list = json.find(item => item.绑定账号.includes(usr_qq));
        list.绑定账号[usr_qq] = '';
        await Write_json_path(`/resources/data/player.json`, json);
        return true;
    }
    async fei(e) {
        const usr_qq = e.user_id;
        if (!await existplayer(1, usr_qq))
            return false;
        const json = await Read_json_path(`/resources/data/player.json`);
        let list = json.find(item => item.绑定账号.includes(usr_qq));
        if (!list.主账号.includes(usr_qq))
            e.reply(`无权干涉`);
        list = '';
        await Write_json_path(`/resources/data/player.json`, json);
        return true;
    }
    async jianid(e) {
        const usr_qq = e.user_id;
        console.log(!await existplayer(1, usr_qq));
        if (!await existplayer(1, usr_qq))
            return false;
        const name = e.msg.replace(/(\/|#)解除账号绑定id/, "").trim();
        const json = await Read_json_path(`/resources/data/player.json`);
        const list = json.find(item => item.绑定账号.includes(usr_qq));
        if (!list.主账号.includes(usr_qq))
            e.reply(`无权干涉`);
        if (!list.绑定账号.includes(name))
            return e.reply(`无此id`);
        list.绑定账号[name] = '';
        await Write_json_path(`/resources/data/player.json`, json);
        e.reply(`解除成功`);
        return true;
    }
    async addid(e) {
        const usr_qq = e.user_id;
        if (!await existplayer(1, usr_qq))
            return false;
        const name = e.msg.replace(/(\/|#)添加账号绑定id/, "").trim();
        const json = await Read_json_path(`/resources/data/player.json`);
        const list = json.find(item => item.绑定账号.includes(usr_qq));
        if (!list.主账号.includes(usr_qq))
            e.reply(`无权干涉`);
        if (list.绑定账号.includes(name))
            return e.reply(`已有此id`);
        if (json.find(item => item.绑定账号.includes(name)))
            return e.reply(`对方已有账号`);
        list.绑定账号.push(name);
        await Write_json_path(`/resources/data/player.json`, json);
        e.reply(`添加成功`);
        return true;
    }
    async id(e) {
        return e.reply(e.user_id);
    }
    async start(e) {
        const usr_qq = e.user_id;
        if (await existplayer(1, usr_qq))
            return this.information(e);
        e.reply(`请输入你的性别`);
        this.setContext('1');
        return false;
    }
    async 1(e) {
        const usr_qq = e.user_id;
        if (this.e.msg == "男")
            shezhi[usr_qq] = "男";
        else if (this.e.msg == "女")
            shezhi[usr_qq] = "女";
        else {
            e.reply(`性别错误自动选择男`);
            shezhi[usr_qq] = { 性别: "男" };
        }
        this.finish('1');
        this.setContext('2');
        e.reply(`请输入你的名字`);
        return false;
    }
    async 2(e) {
        const usr_qq = e.user_id;
        let new_player = {
            id: await generateUID(),
            name: this.e.msg,
            性别: shezhi[usr_qq].性别,
            宣言: "无",
            年龄: 0,
            语言包: "无",
            武者境界: "F阶低级武者",
            体魄境界: "体魄一重天",
            灵魂境界: "灵魂境界一重天",
            灵气: 0,
            体魄力量: 0,
            灵魂力量: 0,
            攻击加成: 100,
            防御加成: 100,
            暴击加成: 0.01,
            爆伤加成: 0.01,
            生命加成: 100,
            闪避加成: 0,
            当前生命: 1000,
            生命上限: 1000,
            金钱: 1000,
            本命灵器: "无",
            机器验证: []
        };
        let new_bag = {
            道具: [],
            功法: []
        };
        let new_equiment = {
            武器: "无",
            胸甲: "无",
            腿甲: "无",
            法宝: "无",
        };
        let new_status = {
            打工: 0,
            "修炼": 0,
            "锻炼": 0,
            "修炼灵魂": 0,
            "猎杀妖兽": 0,
            "猎妖": 0
        };
        e.reply(`开始觉醒灵器`);
        new_player.本命灵器 = await getlingqi(e);
        if (new_player.本命灵器) {
            new_player.攻击加成 += new_player.本命灵器.攻击加成;
            new_player.防御加成 += new_player.本命灵器.防御加成;
            new_player.暴击加成 += new_player.本命灵器.暴击加成;
            new_player.爆伤加成 += new_player.本命灵器.爆伤加成;
            new_player.生命加成 += new_player.本命灵器.生命加成;
            new_player.闪避加成 += new_player.本命灵器.闪避加成;
        }
        const json = await Read_json_path(`/resources/data/player.json`);
        let list = {
            id: new_player.id,
            绑定账号: [usr_qq],
            主账号: [usr_qq],
        };
        json.push(list);
        await Write_json_path(`/resources/data/player.json`, json);
        await Write_playerData(usr_qq, new_player, new_bag, new_equiment, new_status, "无", "无");
        this.finish('2');
        return false;
    }
    async xuan(e) {
        const usr_qq = e.user_id;
        if (!await existplayer(1, usr_qq))
            return false;
        const name = e.msg.replace(/(\/|#)修改宣言/, "").trim();
        let player = await Read_player(1, usr_qq, "player");
        player.宣言 = name;
        await Write_player(1, usr_qq, player, "player");
        return e.reply(`修改成功`);
    }
    async year(e) {
        const usr_qq = e.user_id;
        if (!await existplayer(1, usr_qq))
            return false;
        let name = parseInt(e.msg.replace(/(\/|#)设置年龄/, "").trim());
        let player = await Read_player(1, usr_qq, "player");
        let rand = Math.floor(Math.random() * 10000);
        console.log(player.机器验证);
        if (player.机器验证.length !== 0)
            return e.reply(`请先填写验证码,验证码为${player.机器验证[0]}`);
        if (name <= 20)
            return e.reply(`不信请重新使用指令输入年龄`);
        player.机器验证.push(rand);
        player.机器验证.push(name);
        await Write_player(1, usr_qq, player, "player");
        let replyMsg = "";
        if (name <= 40)
            replyMsg = `设置完毕, 我怀疑你是机器人, 请用指令输入验证码, 验证码为${rand}`;
        else if (name <= 100)
            replyMsg = `设置完毕, 老baby, 等等, 我怀疑你是机械老baby, 请用填写机器验证的指令填写验证, 验证码${rand}`;
        else if (name <= 5000)
            replyMsg = `设置完毕, 老登, 等等, 我怀疑你是机械老登, 请用填写机器验证的指令填写验证, 验证码${rand}`;
        else if (name <= 999999999)
            replyMsg = `设置完毕, 霸王龙, 等等, 我怀疑你是机械霸王龙, 请使用指令输入验证码${rand}`;
        else
            replyMsg = `请输入有效的年龄范围`;
        return e.reply(replyMsg);
    }
    async yan(e) {
        const usr_qq = e.user_id;
        if (!await existplayer(1, usr_qq))
            return false;
        let name = parseInt(e.msg.replace(/(\/|#)机器验证/, "").trim());
        let player = await Read_player(1, usr_qq, "player");
        if (player.机器验证.length === 0)
            return e.reply(`没有验证码`);
        if (player.机器验证[0] !== name)
            return e.reply(`验证码错误`);
        player.机器验证 = [];
        player.年龄 = player.机器验证[1];
        await Write_player(1, usr_qq, player, "player");
        return e.reply(`验证码通过`);
    }
    async help(e) {
        let helpData = await Read_yaml(1);
        const img = await oImages('/resources/html/help/help.html', { helpData });
        if (img)
            e.reply(img);
        return false;
    }
    async bt(e) {
        const usr_qq = e.user_id;
        if (await existplayer(1, usr_qq)) {
            return this.information(e);
        }
        let new_player = {
            id: "usr_qq",
            name: "无名氏",
            性别: "无",
            宣言: "无",
            年龄: 0,
            语言包: "无",
            武者境界: "F阶低级武者",
            体魄境界: "体魄一重天",
            灵魂境界: "灵魂境界一重天",
            灵气: 0,
            体魄力量: 0,
            灵魂力量: 0,
            攻击加成: 100,
            防御加成: 100,
            暴击加成: 0.01,
            爆伤加成: 0.01,
            生命加成: 100,
            闪避加成: 0,
            当前生命: 1000,
            生命上限: 1000,
            金钱: 1000,
            本命灵器: "无",
            机器验证: []
        };
        let new_bag = {
            道具: [],
            功法: []
        };
        let new_equiment = {
            武器: "无",
            胸甲: "无",
            腿甲: "无",
            法宝: "无",
        };
        let new_status = {
            打工: 0,
            "修炼": 0,
            "锻炼": 0,
            "修炼灵魂": 0,
            "猎杀妖兽": 0,
            "猎妖": 0
        };
        new_player.id = usr_qq;
        await Write_playerData(usr_qq, new_player, new_bag, new_equiment, new_status, "无", "无");
        return e.reply(`创建成功，请使用别的指令完善存档`);
    }
    async j(e) {
        const usr_qq = e.user_id;
        if (!await existplayer(1, usr_qq))
            return false;
        let player = await Read_player(1, usr_qq, "player");
        if (!player.本命灵器)
            player.本命灵器 = "无";
        if (player.本命灵器 != "无")
            return e.reply(`你已觉醒过了本名灵器`);
        e.reply(`开始觉醒灵器`);
        player.本命灵器 = await getlingqi(e);
        player.攻击加成 += player.本命灵器.攻击加成;
        player.防御加成 += player.本命灵器.防御加成;
        player.暴击加成 += player.本命灵器.暴击加成;
        player.爆伤加成 += player.本命灵器.爆伤加成;
        player.生命加成 += player.本命灵器.生命加成;
        player.闪避加成 += player.本命灵器.闪避加成;
        await Write_player(1, usr_qq, player, "player");
        return false;
    }
    async gx(e) {
        const usr_qq = e.user_id;
        if (!await existplayer(1, usr_qq))
            return false;
        const name = e.msg.replace(/(\/|#)改姓/, "").trim();
        let player = await Read_player(1, usr_qq, "player");
        if (player.性别 === name)
            return e.reply(`你已经是这个姓了`);
        player.性别 = name;
        await Write_player(1, usr_qq, player, "player");
        return e.reply(`修改成功`);
    }
    async gm(e) {
        const usr_qq = e.user_id;
        if (!await existplayer(1, usr_qq))
            return false;
        const name = e.msg.replace(/(\/|#)改名/, "").trim();
        let player = await Read_player(1, usr_qq, "player");
        if (player.name === name)
            return e.reply(`名字不能和原来的相同`);
        player.name = name;
        await Write_player(1, usr_qq, player, "player");
        return e.reply(`修改成功`);
    }
    async information(e) {
        const usr_qq = e.user_id;
        if (!(await existplayer(1, usr_qq)))
            return false;
        let player = await Read_player(1, usr_qq, "player");
        let rank_wuzhe = player.武者境界;
        let expmax_wuzhe = await _item(1, "武者境界");
        expmax_wuzhe = expmax_wuzhe.find(item => item.name === rank_wuzhe)?.灵气;
        let rank_tipo = player.体魄境界;
        let expmax_tipo = await _item(1, '体魄境界');
        expmax_tipo = expmax_tipo.find(item => item.name === rank_tipo)?.体魄力量;
        let x = await _item(1, '灵魂境界');
        let rank_hun = player.灵魂境界;
        let expmax_hun = x.find(item => item.name === rank_hun)?.灵魂力量;
        let strand_hp = await Strand(player.当前生命, player.生命上限);
        let strand_wuzhe = await Strand(player.灵气, expmax_wuzhe);
        let strand_tipo = await Strand(player.体魄力量, expmax_tipo);
        let strand_hun = await Strand(player.灵魂力量, expmax_hun);
        let equipment = await Read_player(1, usr_qq, "equipment");
        let get_data = {
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
        await pic(e, get_data, `get_playerData`);
        return false;
    }
    async my(e) {
        const usr_qq = e.user_id;
        if (!await existplayer(1, usr_qq))
            return;
        let player = await Read_player(1, usr_qq, "player");
        let lingqi = player.本命灵器;
        let x = player.本命灵器.品级;
        let 颜色;
        if (x === "低级灵器")
            颜色 = "#7CB342";
        if (x === "中级灵器")
            颜色 = "#039BE5";
        if (x === "高级灵器")
            颜色 = "#8E24AA";
        if (x === "帝器")
            颜色 = "#FFD700";
        let get_data = {
            weaponData: player.本命灵器,
            player,
            lingqi,
            颜色
        };
        await pic(e, get_data, `get_lingqi`);
        return;
    }
}

class liesha extends plugin {
    constructor() {
        super({
            name: 'liesha',
            dsc: '基础模块',
            event: 'message',
            priority: 600,
            rule: [
                {
                    reg: /^(#|\/)猎妖信息$/,
                    fnc: 'x',
                },
                {
                    reg: /^(#|\/)前往猎妖.*$/,
                    fnc: 'qw',
                },
                {
                    reg: /^(#|\/)结算.*$/,
                    fnc: 'xx',
                },
                {
                    reg: /^(#|\/)可结算信息.*$/,
                    fnc: 'xxx',
                },
            ],
        });
    }
    async xxx(e) {
        return e.reply(`1.猎妖`);
    }
    async x(e) {
        let x = await _item(1, '猎杀妖兽地点');
        let get_data = { x };
        await pic(e, get_data, `get_lieyao`);
        return false;
    }
    async qw(e) {
        const usr_qq = e.user_id;
        if (!await existplayer(1, usr_qq))
            return false;
        const name = e.msg.replace(/(\/|#)前往猎妖/, "").trim();
        let status = await Read_player(1, usr_qq, "status");
        let player = await Read_player(1, usr_qq, "player");
        const xxx = await getNonZeroKeys(status);
        if (xxx !== false)
            return e.reply(`你正在${xxx}中`);
        let x = await _item(1, '猎杀妖兽地点');
        x = x.find(item => item.name === name);
        if (!x)
            return e.reply(`没有这个妖兽`);
        if (await getstring(player.武者境界, "F阶"))
            return e.reply(`才f阶就来猎杀妖兽？`);
        if (player.当前血量 < 50)
            return e.reply(`残了，残了，大残！快去治疗`);
        const now = Date.now();
        status.猎妖 = now;
        player.猎妖目标 = name;
        await Write_playerData(usr_qq, player, "无", "无", status, "无", "无");
        return e.reply(`开始猎杀妖兽,5分钟后归来`);
    }
    async xx(e) {
        const usr_qq = e.user_id;
        if (!await existplayer(1, usr_qq))
            return false;
        let status = await Read_player(1, usr_qq, "status");
        let player = await Read_player(1, usr_qq, "player");
        const name = e.msg.replace(/(\/|#)结算/, "").trim();
        if (!await checkNameExists(name, status))
            return e.reply(`没有这个状态`);
        if (status[name] === 0)
            return e.reply(`你不在这个状态`);
        const now = Date.now();
        const time = now - status[name];
        if (player.猎妖目标 === "无") {
            e.reply(`出现错误,存档力的猎妖目标为无，自动设置为金钱豹`);
            player.猎妖目标 = "金钱豹";
        }
        let B_player = await _item(1, '猎杀妖兽地点');
        B_player = B_player.find(item => item.name === player.猎妖目标);
        if (name === "猎妖") {
            if (time < 5 * 60 * 1000)
                return e.reply(`时间未到`);
            const A_player = {
                name: player.name,
                暴击加成: player.暴击加成,
                爆伤加成: player.爆伤加成,
                攻击加成: player.攻击加成,
                闪避加成: player.闪避加成,
                防御加成: player.防御加成,
                当前生命: player.当前生命,
            };
            const BB_player = {
                name: B_player.name,
                暴击加成: B_player.暴击加成,
                爆伤加成: B_player.爆伤加成,
                攻击加成: B_player.攻击加成,
                闪避加成: B_player.闪避加成,
                防御加成: B_player.防御加成,
                当前生命: B_player.生命加成,
            };
            let msg = await player_zhandou(A_player, BB_player);
            let name = await determineWinner(msg.result, player.name, B_player.name);
            console.log(msg.result);
            let replyMsg;
            if (name === player.name) {
                const randomIndex = Math.floor(Math.random() * B_player.掉落物.length);
                const x = B_player.掉落物[randomIndex];
                await Add_bag_thing(usr_qq, x, 1, "无");
                player.当前生命 -= msg.A_damage;
                replyMsg = `恭喜你打赢了${B_player.name}，获得${x}*1`;
            }
            else {
                player.当前生命 -= msg.A_damage;
                replyMsg = `恭喜你没打赢了${B_player.name}，获得空气*1`;
            }
            status.猎妖 = 0;
            player.猎妖目标 = "无";
            await Write_playerData(usr_qq, player, "无", "无", status, "无", "无");
            return e.reply(replyMsg);
        }
        return false;
    }
}

class show extends plugin {
    constructor() {
        super({
            name: 'show',
            dsc: '基础模块',
            event: 'message',
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
            ],
        });
    }
    async bag(e) {
        const usr_qq = e.user_id;
        if (!await existplayer(1, usr_qq))
            return false;
        let player = await Read_player(1, usr_qq, "player");
        let strand_hp = await Strand(player.当前生命, player.生命上限);
        let bag = await Read_player(1, usr_qq, "bag");
        let temp = {
            name: player.name,
            宣言: player.宣言,
            player: player,
            strand_hp,
            bag
        };
        const img = await oImages('/resources/html/bag/bag.html', temp);
        if (img)
            e.reply(img);
        return true;
    }
    async buy(e) {
        const usr_qq = e.user_id;
        const name = e.msg.replace(/(\/|#)购买/, "").trim();
        let [adress, thing_name, num] = name.split("*").map(code => code.trim());
        if (adress !== "万界堂")
            return e.reply('没有这个商店');
        let xx = await _item(1, "道具列表");
        let x = await extractAttributesWithPropertyOne(xx);
        const thing = x.find(item => item.name === thing_name);
        if (!thing)
            return e.reply(`没有这个物品`);
        const money = thing.售价 * Number(num);
        let player = await Read_player(1, usr_qq, "player");
        if (player.金钱 < money)
            return e.reply(`金钱不够`);
        player.金钱 - money;
        e.reply(`购买成功`);
        await Add_bag_thing(usr_qq, thing_name, Number(num), thing);
        await Write_player(1, usr_qq, player, "player");
        return true;
    }
    async wanjietang(e) {
        let xx = await _item(1, "道具列表");
        let x = await extractAttributesWithPropertyOne(xx);
        let temp = { x };
        const img = await oImages('/resources/html/wanjietang/wanjietang.html', temp);
        if (img)
            e.reply(img);
        return false;
    }
}

class IsRecall extends APlugin {
    constructor() {
        super({
            dsc: '撤回消息',
            eventType: 'DELETE',
            rule: [
                {
                    fnc: 'onrecall',
                    dsc: '撤回消息',
                    doc: '有人撤回就会触发'
                }
            ]
        });
    }
    async onrecall(e) {
        console.info(e.eventType, '触发撤回消息');
        return true;
    }
}

class TestPeople extends APlugin {
    constructor() {
        super({
            dsc: '成员加入',
            event: 'GUILD_MEMBERS',
            eventType: 'CREATE',
            rule: [
                {
                    fnc: 'peopleAdd',
                    dsc: '成员加入',
                    doc: '成员加入'
                }
            ]
        });
    }
    async peopleAdd(e) {
        console.log(e);
        let shezhi = await Read_json(2);
        let chanenl_id_list = shezhi.find(item => item.type == "chanenl_id");
        console.log(chanenl_id_list);
        if (chanenl_id_list.num == "无")
            return false;
        const MessageChannel = e.Message({ channel_id: chanenl_id_list.num });
        MessageChannel.reply(`${e.segment.at(e.user_id)}加入频道`);
        MessageChannel.reply(`${e.user_id}加入频道`);
        console.log(e.event, '成员加入');
        return true;
    }
}
class PeopleDelete extends APlugin {
    constructor() {
        super({
            dsc: '成员更新',
            event: 'GUILD_MEMBERS',
            eventType: 'UPDATE',
            rule: [
                {
                    fnc: 'peopleDelete',
                    dsc: '成员更新',
                    doc: '成员更新'
                }
            ]
        });
    }
    async peopleDelete(e) {
        console.log(e.event, '成员更新');
        return true;
    }
}
class PeopleUpdata extends APlugin {
    constructor() {
        super({
            dsc: '成员退出',
            event: 'GUILD_MEMBERS',
            eventType: 'DELETE',
            rule: [
                {
                    fnc: 'peopleUpdata',
                    dsc: '成员退出',
                    doc: '成员退出'
                }
            ]
        });
    }
    async peopleUpdata(e) {
        console.log(e.event, '成员退出');
        let shezhi = await Read_json(2);
        let chanenl_id_list = shezhi.find(item => item.type == "chanenl_id");
        if (chanenl_id_list == "无")
            return false;
        const MessageChannel = e.Message({ channel_id: chanenl_id_list.num });
        MessageChannel.reply(`${e.user_id}退出频道`);
        return true;
    }
}

class wuzhe_tongji extends plugin {
    constructor() {
        super({
            rule: [
                {
                    reg: /^(#|\/)武者统计$/,
                    fnc: 'tongji',
                },
                {
                    reg: /^(#|\/)刷新统计$/,
                    fnc: 'adduser',
                }
            ]
        });
    }
    async tongji(e) {
        await axios.get(`${apiUrl}/userList`).then(response => {
            const obj = response.data;
            if (obj.code == 200) {
                const list = {};
                obj.data.forEach((el) => {
                    if (el.plugin.includes(AppName)) {
                        list[el.bot] = list[el.bot] ? list[el.bot] + 1 : 1;
                    }
                });
                const botsname = Object.keys(list);
                let a = '';
                botsname.forEach((el) => {
                    a += `\n${el}：${list[el]}人`;
                });
                e.reply(`用户列表(机器人：数量)：${a}`);
            }
        });
        return false;
    }
    async adduser(e) {
        const botname = JSON.parse(fs.readFileSync(`./package.json`, 'utf-8'));
        const data = JSON.stringify({
            userid: e.user_id,
            nickname: e.user_name,
            plugin: AppName,
            bot: botname.name
        });
        const config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: `${apiUrl}/adduser`,
            headers: {
                'Content-Type': 'application/json'
            },
            data: data
        };
        axios.request(config).catch(error => {
            console.log(error);
        });
    }
}

class work extends plugin {
    constructor() {
        super({
            name: 'work',
            dsc: '基础模块',
            event: 'message',
            priority: 600,
            rule: [
                {
                    reg: /^(#|\/)当前状态$/,
                    fnc: 'dq',
                },
                {
                    reg: /^(#|\/)开始打工$/,
                    fnc: 'd',
                },
                {
                    reg: /^(#|\/)结束打工$/,
                    fnc: 'stop',
                },
                {
                    reg: /^(#|\/)开始猎杀妖兽$/,
                    fnc: 'sha',
                },
                {
                    reg: /^(#|\/)结束猎杀妖兽$/,
                    fnc: 'stop2',
                }
            ],
        });
    }
    async sha(e) {
        let player = await getUserStatus(e, "player");
        if (await getstring(player.武者境界, "F阶"))
            return e.reply(`才f阶就来猎杀妖兽？`);
        await startstatus(e, "猎杀妖兽", "猎杀妖兽");
        return false;
    }
    async stop2(e) {
        let player = await getUserStatus(e, "player");
        const now = Date.now();
        let status = await getUserStatus(e, "status");
        if (status.猎杀妖兽 === 0)
            return e.reply(`你没在猎杀妖兽`);
        const time = (now - status.猎杀妖兽) / 1000 / 60;
        let x;
        if (await getstring(player.武者境界, "E阶"))
            x = 0.9;
        if (await getstring(player.武者境界, "D阶"))
            x = 1.15;
        if (await getstring(player.武者境界, "C阶"))
            x = 1.35;
        if (await getstring(player.武者境界, "B阶"))
            x = 1.65;
        if (await getstring(player.武者境界, "A阶"))
            x = 1.9;
        const money = Math.floor(time * x);
        const xiuwei = Math.floor(time * 0.3);
        const tipo = Math.floor(time * 0.35);
        player.体魄力量 = tipo;
        player.灵气 += xiuwei;
        player.金钱 += money;
        status.猎杀妖兽 = 0;
        await Write_playerData(e.user_id, player, "无", "无", status, "无", "无");
        return e.reply(`结束成功，获得金钱${money}元,修为${xiuwei}体魄力量${tipo}`);
    }
    async dq(e) {
        const now = Date.now();
        let status = await getUserStatus(e, "status");
        const x = await getNonZeroKeys(status);
        if (x !== false)
            return e.reply(`正在${x}中,已过${await msToTime(now - status[x])}`);
        return e.reply(`空闲中`);
    }
    async d(e) {
        await startstatus(e, `打工`, `打工`);
        return false;
    }
    async stop(e) {
        await stopstatus(e, `打工`, `金钱`, `元`, 10);
        return false;
    }
}

class use extends plugin {
    constructor() {
        super({
            name: 'use',
            dsc: '基础模块',
            event: 'message',
            priority: 600,
            rule: [
                {
                    reg: /^(#|\/)?使用.*$/,
                    fnc: 'use',
                }
            ],
        });
    }
    async use(e) {
        const usr_qq = e.user_id;
        const playerExists = await existplayer(1, usr_qq);
        const [thing_name, num] = e.msg.replace(/(\/|#)?使用/, "").trim().split("*").map(code => code.trim());
        if (!playerExists || !thing_name || !num)
            return false;
        let [player, bag, daoju_list, thing] = await Promise.all([
            Read_player(1, usr_qq, "player"),
            Read_player(1, usr_qq, "bag"),
            _item(1, "道具列表"),
            _item(1, "道具列表").then(daoju_list => daoju_list.find(item => item.name === thing_name)),
        ]);
        let bag_thing = await Read_player(1, usr_qq, "bag").then(bag => bag[thing.type].find(item => item.name === thing_name));
        if (!thing || !thing.能否消耗)
            return e.reply(`此物品不能使用`);
        if (!bag_thing)
            return e.reply(`你没有这个物品`);
        if (bag_thing.数量 < num)
            return e.reply(`数量不足,还差${Number(num) - bag_thing.数量}`);
        let msg = [`使用成功`];
        if (thing_name.includes(`灵器经验石`)) {
            let shezhi = await Read_json(2);
            const list = shezhi.find(item => item.type == "道具类");
            const exp = list.thing[thing_name] * Number(num);
            if (!exp)
                return e.reply(`数值暂未设置`);
            player.本命灵器.exp += exp;
            msg.push(`灵器经验增加${exp},目前经验${player.本命灵器.exp}`);
        }
        if (msg.length === 1)
            return e.reply(`道具目前没有设置可使用的处理代码`);
        console.log(thing);
        console.log(thing_name);
        await Promise.all([
            Add_bag_thing(usr_qq, thing_name, -num, thing),
            Write_player(1, usr_qq, player, "player"),
            Write_player(1, usr_qq, bag, "bag")
        ]);
        return e.reply(msg.join(''));
    }
}

class zongmen extends plugin {
    constructor() {
        super({
            name: 'zongmen',
            dsc: '基础模块',
            event: 'message',
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
    async shi(e) {
        const usr_qq = e.user_id;
        const playerExists = await existplayer(1, usr_qq);
        const zongmenExists = await existplayer(2, usr_qq);
        if (!zongmenExists)
            return e.reply(`没有宗门`);
        if (!playerExists)
            return false;
        let player = await Read_player(1, usr_qq, "player");
        let zong = await Read_player2(2, player.宗门.宗主, "zongmen");
        let shi = zong.宗门阵法石 || {
            "阵法石1": "无",
            "阵法石2": "无",
            "阵法石3": "无",
            "阵法石4": "无",
            "阵法石5": "无",
            "阵法石6": "无"
        };
        await Write_player(2, usr_qq, zong, "zongmen");
        const replyMessage = Object.keys(shi).map(key => `${key}:${shi[key]}`).join('');
        return e.reply(replyMessage);
    }
    async juan(e) {
        const usr_qq = e.user_id;
        const playerExists = await existplayer(1, usr_qq);
        if (!await existplayer(2, usr_qq))
            return e.reply(`没有宗门`);
        let name = e.msg.replace(/(\/|#)?捐供钱库/, "").trim();
        let parsedNumber = Number(name);
        if (!playerExists || !name)
            return false;
        let player = await Read_player(1, usr_qq, "player");
        let zong = await Read_player2(2, player.宗门.宗主, "zongmen");
        if (parsedNumber > player.金钱)
            return e.reply(`金钱不够`);
        zong.钱库 += parsedNumber;
        const gongxian = parsedNumber / 10000;
        player.宗门.奉献值 = player.宗门.奉献值 ? player.宗门.奉献值 + gongxian : gongxian;
        await Promise.all([
            Write_player(1, usr_qq, player, "player"),
            Write_player(2, usr_qq, zong, "zongmen")
        ]);
        return e.reply(`捐供成功,目前钱库有${zong.钱库},获得贡献${gongxian}`);
    }
    async lingqu(e) {
        const usr_qq = e.user_id;
        const currentTimeMillis = new Date().getTime();
        const playerExists = await existplayer(1, usr_qq);
        if (!await existplayer(2, usr_qq))
            return e.reply(`没有宗门`);
        if (!playerExists)
            return false;
        let player = await Read_player(1, usr_qq, "player");
        let zong = await Read_player2(2, player.宗门.宗主, "zongmen");
        if (player.宗门.俸禄_time && (currentTimeMillis - player.宗门.俸禄_time) / (1000 * 60 * 60) < 24)
            return e.reply(`24小时可领取一次`);
        let money;
        if (player.宗门.身份 == '宗主' || player.宗门.身份 == '副宗主')
            return e.reply(`？？?都是${player.宗门.身份}领啥俸禄`);
        switch (player.宗门.身份) {
            case '成员':
                money = 10000;
            case '长老':
                money = 20000;
        }
        if (zong.钱库 < money)
            return e.reply(`钱库没有足够的钱`);
        player.金钱 += money;
        zong.钱库 -= money;
        player.宗门.俸禄_time = currentTimeMillis;
        await Promise.all([
            Write_player(1, usr_qq, player, "player"),
            Write_player(2, usr_qq, zong, "zongmen")
        ]);
        return e.reply(`领取成功，获得${money}元`);
    }
    async give(e) {
        const usr_qq = e.user_id;
        const playerExists = await existplayer(1, usr_qq);
        if (!await existplayer(2, usr_qq))
            return e.reply(`没有宗门`);
        const name = e.msg.replace(/(\/|#)?给予身份/, "").trim();
        if (!playerExists || !name)
            return false;
        let player = await Read_player(1, usr_qq, "player");
        let B_usr_qq = await getB_qq(e, "id");
        if (B_usr_qq == 0)
            return e.reply('欸，你要给予谁身份');
        if (B_usr_qq == 1)
            return e.reply(`对方无存档`);
        let B_player = await Read_player(1, B_usr_qq, "player");
        if (player.宗门.身份 !== "宗主")
            return e.reply(`不是宗主无法给予身份`);
        if (name == "宗主")
            return e.reply(`没死，无法传位`);
        if (B_player.宗门.宗主 !== player.宗门.宗主)
            return e.reply(`？？？纳尼,你要给谁传位,咱宗有这个人吗`);
        if (name !== "成员" && name !== "长老" && name !== '副宗主')
            return e.reply(`没有这个身份`);
        let zong = await Read_player2(2, player.宗门.宗主, "zongmen");
        const shenfen = B_player.宗门.身份;
        zong[shenfen] = zong[shenfen].filter(item => item !== usr_qq);
        zong[name].push(B_usr_qq);
        player.宗门.身份 = name;
        await Promise.all([
            Write_player(1, usr_qq, player, "player"),
            Write_player(2, usr_qq, zong, "zongmen")
        ]);
        return e.reply(`给予成功`);
    }
    async tuichu(e) {
        const usr_qq = e.user_id;
        const playerExists = await existplayer(1, usr_qq);
        if (!await existplayer(2, usr_qq))
            return e.reply(`没有宗门`);
        const name = e.msg.replace(/(\/|#)?加入宗门/, "").trim();
        if (!playerExists || !name)
            return false;
        let player = await Read_player(1, usr_qq, "player");
        if (player.宗门.身份 == "宗主")
            return e.reply(`宗主无法退出宗门`);
        let zong = await Read_player2(2, player.宗门.宗主, "zongmen");
        const shenfen = player.宗门.身份;
        zong[shenfen] = zong[shenfen].filter(item => item !== usr_qq);
        player.宗门 = '';
        await Promise.all([
            Write_player(1, usr_qq, player, "player"),
            Write_player(2, usr_qq, zong, "zongmen")
        ]);
        return e.reply(`退出成功`);
    }
    async join(e) {
        const usr_qq = e.user_id;
        const playerExists = await existplayer(1, usr_qq);
        if (await existplayer(2, usr_qq))
            return e.reply(`已有宗门`);
        const name = e.msg.replace(/(\/|#)?加入宗门/, "").trim();
        if (!playerExists || !name)
            return false;
        let list = await allzongmen();
        let json = await Promise.all(list.map(async (user) => {
            const zongmen = await Read_player2(2, user, 'zongmen');
            return {
                name: zongmen.name,
                mainqq: zongmen.宗主
            };
        }));
        const zongmen = json.find(item => item.name === name);
        if (!zongmen)
            return e.reply(`没有这个宗门`);
        let zong = await Read_player2(2, zongmen.mainqq, "zongmen");
        const idlist = await getidlist(usr_qq);
        zong.成员.push(idlist.id);
        let player = await Read_player(1, usr_qq, "player");
        player.宗门 = {
            宗主: zongmen.mainqq,
            身份: "成员",
            奉献值: 0,
            俸禄_time: 0,
        };
        await Promise.all([
            Write_player(1, usr_qq, player, "player"),
            Write_player(2, usr_qq, zong, "zongmen")
        ]);
        return e.reply(`加入成功`);
    }
    async zongpai(e) {
        const usr_qq = e.user_id;
        if (!await existplayer(1, usr_qq))
            return false;
        if (await existplayer(2, usr_qq))
            return this.myzongmen(e);
        let player = await Read_player(1, usr_qq, "player");
        if (!player.武者境界.includes(`B阶`))
            return e.reply(`没到B阶武者，不能开设宗门`);
        this.setContext("1");
        return e.reply(`清输入宗门名字`);
    }
    async 1(e) {
        const usr_qq = e.user_id;
        let player = await Read_player(1, usr_qq, "player");
        const list = await getidlist(usr_qq);
        player.宗门 = {
            宗主: list.id,
            身份: "宗主",
            奉献值: 0,
            俸禄_time: 0,
        };
        await Write_player(1, usr_qq, player, "player");
        const zongmen = await Read_json_path(`/resources/data/default/zongmen/zongmen-default.json`);
        zongmen.name = this.e.msg;
        zongmen.宗主 = list.id;
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth() + 1;
        const currentDay = currentDate.getDate();
        const dateString = `${currentYear}-${currentMonth}-${currentDay}`;
        zongmen.建立时间 = dateString;
        await Write_player(2, usr_qq, zongmen, "zongmen");
        this.finish("1");
        return e.reply(`宗门创建成功`);
    }
    async myzongmen(e) {
        const usr_qq = e.user_id;
        const playerExists = await existplayer(1, usr_qq);
        const zongmenExists = await existplayer(2, usr_qq);
        if (!playerExists || !zongmenExists)
            return false;
        const [player, zongmen] = await Promise.all([
            Read_player(1, usr_qq, 'player'),
            Read_player(2, usr_qq, 'zongmen')
        ]);
        const zongzhu = await Read_player2(1, player?.宗门?.宗主, 'player');
        const people = zongmen?.长老?.length + zongmen?.副宗主?.length + zongmen?.成员?.length + 1;
        const strand_hp = await Strand(player?.当前生命, player?.生命上限);
        const jingjie = zongmen.加入最高境界 + "-" + zongmen.加入最低境界 + '(最高境界-最低境界)';
        let temp = {
            player: player,
            zongmen,
            zongzhu,
            people,
            strand_hp,
            jingjie
        };
        const img = await oImages('/resources/html/zongmen/zongmen.html', temp);
        if (img)
            e.reply(img);
        return true;
    }
    async zongmenlist(e) {
        const usr_qq = e.user_id;
        const playerExists = await existplayer(1, usr_qq);
        if (!playerExists)
            return false;
        let list = await allzongmen();
        let json = [];
        for (const user of list) {
            const zongmen = await Read_player2(2, user, 'zongmen');
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
        if (img)
            e.reply(img);
        return true;
    }
}

const playerdata = {};
class 测试 extends plugin {
    constructor() {
        super({
            name: '测试',
            dsc: '基础模块',
            event: 'message',
            priority: 600,
            rule: [
                {
                    reg: /^(#|\/)?一言api$/,
                    fnc: 'yiyan',
                },
            ],
        });
    }
    async dingshiqi(e) {
        const usr_qq = e.user_id;
        const name = e.msg.replace(/(\/|#)定时器/, "").trim();
        playerdata[usr_qq] = e;
        const jishi = setTimeout(async () => {
            console.log(usr_qq);
            console.log(playerdata[usr_qq]);
            playerdata[usr_qq].reply(`计时完成`);
            e.reply(`${playerdata[usr_qq].segment.at(usr_qq)}计时完成`);
            clearTimeout(jishi);
            delete playerdata[usr_qq];
        }, Number(name) * 1000);
        e.reply(`${e}`);
        playerdata[usr_qq].reply(`开始计时${name}`);
        e.reply(`开始计时${name}`);
    }
    async yiyan(e) {
        await fetchData(apiUrl2)
            .then((data) => {
            console.log(data);
            e.reply(data);
        });
    }
}

class zhiliao extends plugin {
    constructor() {
        super({
            name: 'zhiliao',
            dsc: '基础模块',
            event: 'message',
            priority: 600,
            rule: [
                {
                    reg: /^(#|\/)治疗伤势$/,
                    fnc: 'x',
                },
            ],
        });
    }
    async x(e) {
        const usr_qq = e.user_id;
        if (!await existplayer(1, usr_qq))
            return false;
        let player = await Read_player(1, usr_qq, "player");
        if (player.当前生命 === player.生命上限)
            return e.reply(`目前生命不需要治疗`);
        if (player.金钱 <= 100000)
            return e.reply(`目前只有${player.金钱},还差${100000 - player.金钱}`);
        await Add_生命(usr_qq, 999999999999);
        player.金钱 -= 100000;
        await Write_player(1, usr_qq, player, "player");
        return e.reply(`治疗成功`);
    }
}

export { IsRecall, PeopleDelete, PeopleUpdata, TestPeople, admin, chanenl_id, dajie, jisha, level, liandan, liesha, shengji, show, start, tongbu, use, work, wuzhe_tongji, zhiliao, zongmen, 测试 };
