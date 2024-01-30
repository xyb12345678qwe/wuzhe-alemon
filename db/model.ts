import { Model } from "sequelize";
import { AMessage,getUIDCache,refresh_uid_cache } from "../api";
import { Sequelize, user_bag, user_equiment, user_id,user_player, user_status,Op, 灵器列表,sequelize, literal,user_zongmen, 体质, transaction_record} from "./index";
/**
 * 
 * @param num [1:判断存档 2:判断宗门]
 * @param usr_qq 
 * @returns 
 */
export async function existplayer(num,usr_qq) {
    const id:any = await finduid(usr_qq)
    if(num == 1)if(!id) return false;
    if(num == 2){
      const results =await Read_player(1,usr_qq);
      let player = results.player;
      return player.宗门
    }
    else return true;
}
export async function create_player(e,usr_qq: string,name: string,性别: string){
  try {
    const lingqi:any = await getLingqi(e);
    const uid = await generateUID();
  
    const createUserPromise = user_id.create({ uid: uid, 绑定账号: [usr_qq], 允许绑定账号: [usr_qq] });
    const createPlayerPromise = user_player.create({ uid: uid, name: name, 性别: 性别, 本命灵器: lingqi });
    const [createUser, createPlayer]:any = await Promise.all([createUserPromise, createPlayerPromise]);
  
    createPlayer.攻击加成 += Number(lingqi.攻击加成);
    createPlayer.防御加成 += Number(lingqi.防御加成);
    createPlayer.暴击加成 += Number(lingqi.暴击加成);
    createPlayer.爆伤加成 += Number(lingqi.爆伤加成);
    createPlayer.生命加成 += Number(lingqi.生命加成);
    createPlayer.闪避加成 += Number(lingqi.闪避加成);
  
    await Promise.all([createUser, createPlayer, user_equiment.create({ uid: uid }), user_bag.create({ uid: uid }), user_status.create({ uid: uid })]);
    await refresh_uid_cache();
    console.log('创建存档成功');
  } catch (error) {
    console.error('创建存档失败:', error);
    throw error;
  }
}
export async function create_zongmen(usr_qq:string,name:string,time:string) {
  try {
    let id:any = await finduid(usr_qq);
    user_zongmen.create({宗主:id.uid,name:name,建立时间:time})
    console.log('宗门创建存档成功');
  }catch (error) {
    console.error('宗门创建存档失败:', error);
    throw error;
}
}
export async function Read_player(num: number, usr_qq: string) {
  try {
    const id = await finduid(usr_qq);
    let result: any = {};
    if (num === 2) {
      result.zongmen = await user_zongmen.findOne({ where: { 宗主: id.uid }, raw: true });
    } else if (num === 1) {
      const promises: any[] = [];
      promises.push(user_player.findOne({ where: { uid: id.uid }, raw: true }));
      promises.push(user_bag.findOne({ where: { uid: id.uid }, raw: true }));
      promises.push(user_equiment.findOne({ where: { uid: id.uid }, raw: true }));
      promises.push(user_status.findOne({ where: { uid: id.uid }, raw: true }));
      const [player, bag, equipment, status] = await Promise.all(promises);
      result.id = id;
      result.player = player;
      result.bag = bag;
      result.equiment = equipment;
      result.status = status;
    }
    return result;
  } catch (error) {
    // 处理错误
    console.error('出现问题:', error);
    throw error;
  }
}
export async function finduid(usr_qq: string) {
  let cache = await getUIDCache();
  if (cache.length > 0) {
    const cacheMap = new Map(cache.map(item => [item.uid, item]));
    const cachedItemByAccount = Array.from(cacheMap.values()).find(item =>
      item.绑定账号.includes(usr_qq)
    );
    if (cachedItemByAccount) return cachedItemByAccount;
    const cachedItemById = cacheMap.get(usr_qq);
    if (cachedItemById) return cachedItemById;
  }
  let result: any = await user_id.findOne({
    where: {
      [Op.or]: [
        literal(`JSON_CONTAINS(绑定账号, '"${usr_qq}"')`),
        { uid: usr_qq }
      ]
    },
    raw: true,
  });
  return result;
}

export async function Write_player(usr_qq: string, playerData: any | false, bagData?: any | false, equipmentData?: any | false, statusData?: any | false, zongmen?: any | false) {
  try {
    const id: any = await finduid(usr_qq);
    if (id) {
      const promises: Promise<any>[] = [];
      const upsertData: { uid: string } = { uid: id.uid };
      if (playerData) Object.assign(upsertData, playerData);
      promises.push(user_player.upsert(upsertData));
      if (bagData) {
        const bagUpsertData: { uid: string } = { uid: id.uid };
        Object.assign(bagUpsertData, bagData);
        promises.push(user_bag.upsert(bagUpsertData));
      }
      if (equipmentData) {
        const equipmentUpsertData: { uid: string } = { uid: id.uid };
        Object.assign(equipmentUpsertData, equipmentData);
        promises.push(user_equiment.upsert(equipmentUpsertData));
      }
      if (statusData) {
        const statusUpsertData: { uid: string } = { uid: id.uid };
        Object.assign(statusUpsertData, statusData);
        promises.push(user_status.upsert(statusUpsertData));
      }
      if (zongmen) {
        const zongmenUpsertData: { uid: string } = { uid: id.uid, ...zongmen };
        promises.push(user_zongmen.upsert(zongmenUpsertData));
      }
      await Promise.all(promises);
    }
  } catch (error) {
    console.error('写入出现问题:', error);
    throw error;
  }
}
export async function all_zongmen() {
  const zongmen:any = await user_zongmen.findAll({ attributes: ['宗主'], raw: true });
  return zongmen.map(zong => zong.宗主);
 }
/**
 * 获取存档数
 * @returns 
 */
export async function getPlayerCount() {
    try {
      const count = await user_player.count();
      return count;
    } catch (error) {
      console.error('获取存档数出现问题:', error);
      throw error;
    }
}
/**
 * 随机获取9位数uid
 * @returns 
 */
export async function generateUID(){
    const num = await getPlayerCount()
    return 100000000 + num
}

interface Item {
  id: number;
  name: string;
  品级?: string;
  type?: string;
  攻击加成?: number;
  修炼加成?: number;
  防御加成: number;
  生命加成: number;
  暴击加成: number;
  爆伤加成: number;
  闪避加成: number;
  等级: number;
  exp: number;
}

interface WeightedItems {
  [grade: string]: number;
}

class CustomError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CustomError';
  }
}

async function readItemList(itemType: '灵器列表' | '体质'): Promise<Item[]> {
  try {
    const items = await (itemType === '灵器列表' ? 灵器列表.findAll({ raw: true }) : 体质.findAll({ raw: true })) as unknown as Item[];
    return items || [];
  } catch (error) {
    console.error(`Error in readItemList:`, error);
    return [];
  }
}

function filterItemsByGrade(items: Item[], grades: string[]): Item[] {
  const filteredItems = items.filter((item) => {
    const isGradeMatch = grades.includes(item.品级 || '') || grades.includes(item.type || '');
    return isGradeMatch;
  });

  return filteredItems;
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = array.slice();
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function getRandomItem(items: Item[], weights: WeightedItems): Item | null {
  const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);
  const randomValue = Math.random() * totalWeight;
  let currentWeight = 0;
  const flattenedItems = shuffleArray(items).map((item) => ({ ...item }));

  for (const [grade, weight] of Object.entries(weights)) {
    currentWeight += weight;
    if (randomValue <= currentWeight) {
      const gradeItems = flattenedItems.filter((item) => item.品级 == grade || item.type == grade);
      if (gradeItems.length > 0) {
        return gradeItems[Math.floor(Math.random() * gradeItems.length)];
      } else {
        console.error(`未找到等级为${grade}的物品`);
        return null;
      }
    }
  }

  return flattenedItems.length > 0 ? flattenedItems[flattenedItems.length - 1] : null;
}

function displayAwakenedMessage(e: AMessage, item: Item, itemType: '灵器列表' | '体质'): void {
  const grade = item.品级 || item.type;
  if (grade) {
    e.reply(`觉醒成功，觉醒出${item.name}，品级为${grade}`);
  } else {
    console.error(`未找到有效的品级信息`);
  }
}

export async function getLingqi(e: AMessage): Promise<Item | null> {
  return getAwakenedItem(e, 
    '灵器列表', 
    ['低级灵器', '中级灵器', '高级灵器', '帝器'],
     权重);
}

export async function getTizhi(e: AMessage): Promise<Item | null> {
  return getAwakenedItem(
    e,
    '体质',
    ['低级体质', '中级体质', '高级体质', '天级体质', '圣级体质', '神级体质'],
    权重2
  );
}

async function getAwakenedItem(
  e: AMessage,
  itemType: '灵器列表' | '体质',
  grades: string[],
  weights: WeightedItems
): Promise<Item | null> {
  try {
    const itemList = await readItemList(itemType);
    const itemCategories = filterItemsByGrade(itemList, grades);
    const randomItem = getRandomItem(itemCategories, weights);
    if (randomItem) {
      displayAwakenedMessage(e, randomItem, itemType);
      return randomItem;
    } else {
      throw new CustomError(`获取随机${itemType}失败`);
    }
  } catch (error) {
    console.error(`函数出错：${error instanceof CustomError ? error.message : error}`);
    return null;
  }
}
const 权重: Record<string, number> = {
  低级灵器: 50,
  中级灵器: 30,
  高级灵器: 15,
  帝器: 10,
  };
  
  const 权重2: Record<string, number> = {
  低级体质: 50,
  中级体质: 45,
  高级体质: 40,
  天级体质: 30,
  圣级体质: 10,
  神级体质: 5,
  };
export async function findTransaction(uid_1, uid_2):Promise<any>{ 
  let transaction:any = await transaction_record.findAll({raw:true});
  let transaction1 = transaction.find(item => item.交易对象 == uid_2 && item.开启交易者 == uid_1 && item.结束状态 == "未结束"
  ||item.交易对象 == uid_1 && item.开启交易者 == uid_2 && item.结束状态 == "未结束" );
  return transaction1;
//   const transaction1 = await transaction_record.findOne({
//     where: {
//       "开启交易者": Number(uid_1),
//       "交易对象": Number(uid_2),
//       "结束状态": "未结束"
//     },
//     raw:true
//   });
//  if(transaction1) return transaction1;
//   const transaction2 = await transaction_record.findOne({
//     where: {
//       "开启交易者": uid_2,
//       "交易对象": uid_1,
//       "结束状态": "未结束"
//     },
//     raw:true
//   });
//   return transaction2
}
export async function updateTransaction(updatedData): Promise<any> {
  try {
    // const transactions:any = await transaction_record.findAll({ raw: true });
    // const transactionToUpdate = transactions.find(item => (item.交易对象 == uid_2 && item.开启交易者 == uid_1 && item.结束状态 == "未结束") || (item.交易对象 == uid_1 && item.开启交易者 == uid_2 && item.结束状态 == "未结束"));

      const updatedTransaction = await transaction_record.update(updatedData, {
        where: {
          id: updatedData.id
        }
      });
      return updatedTransaction;
    }catch (error) {
    console.error("更新交易记录时发生错误:", error);
    throw error;
  }
}