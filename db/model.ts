import { AMessage } from "../api";
import { Sequelize, user_bag, user_equiment, user_id,user_player, user_status,Op, 灵器列表,sequelize, literal,user_zongmen} from "./index";
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
        const lingqi:any = await getlingqi(e);
        const uid = await generateUID()
        await Promise.all([
            user_id.create({uid:uid, 绑定账号:[usr_qq],允许绑定账号:[usr_qq]}),
            user_player.create({uid:uid,                                                                                                                                                                                                    
                name:name,
                性别:性别,
                本命灵器:lingqi
            }),
            user_equiment.create({uid:uid}),
            user_bag.create({uid:uid}),
            user_status.create({uid:uid})
        ])
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
/**
 * 
 * @param num [1:判断存档 2:判断宗门]
 * @param usr_qq 
 * @returns 
 */
export async function Read_player(num,usr_qq: string) {
    // user_id.belongsTo(user_player, { foreignKey: 'uid', targetKey: 'uid' });
    // user_id.belongsTo(user_bag, { foreignKey: 'uid', targetKey: 'uid' });
    // user_id.belongsTo(user_equiment, { foreignKey: 'uid', targetKey: 'uid' });
    // user_id.belongsTo(user_status, { foreignKey: 'uid', targetKey: 'uid' });
    try {
        let id:any = await finduid(usr_qq);
        let result: any = {};
        if(num==2) {
          result.zongmen = await user_zongmen.findOne({ where: { 宗主: id.uid }, raw: true });
        }
        if(num == 1){
          console.log(id.uid);
          let [player ,bag, equipment, status]:any = await Promise.all([
            user_player.findOne({ where: { uid: id.uid },raw:true }),
            user_bag.findOne({ where: { uid: id.uid },raw:true }),
            user_equiment.findOne({ where: { uid: id.uid },raw:true }),
            user_status.findOne({ where: { uid: id.uid },raw:true })
        ]);
            result.id = id;
            result.player = player;
            result.bag = bag;
            result.equipment = equipment;
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

export async function Write_player(usr_qq: string, playerData: any | false, bagData: any | false, equipmentData: any | false, statusData: any | false,zongmen?:any|false) {
    try {
      let id:any = await finduid(usr_qq);
      if (id) {
        const promises:any = [];
        if (playerData) promises.push(user_player.upsert({ uid: id.uid, ...playerData }));
        if (bagData) promises.push(user_bag.upsert({ uid: id.uid, ...bagData }));
        if (equipmentData) promises.push(user_equiment.upsert({ uid: id.uid, ...equipmentData }));
        if (statusData) promises.push(user_status.upsert({ uid: id.uid, ...statusData }));
        if(zongmen)promises.push(user_zongmen.upsert({ "宗主": id.uid, ...zongmen }));
        // 等待所有写入操作完成
        await Promise.all(promises);
        console.log("写入成功");
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

interface Lingqi {
    id: number;
    name: string;
    品级: string;
    攻击加成: number;
    防御加成: number;
    生命加成: number;
    暴击加成: number;
    爆伤加成: number;
    闪避加成: number;
    等级: number;
    exp: number;
  }
  
  export async function Read_item(name: string): Promise<Lingqi[]> {
    let tableAttributes;
    if (name === "灵器列表") tableAttributes = await 灵器列表.findAll({ raw: true });
    return tableAttributes || [];
  }
  
  const 权重: Record<string, number> = {
    低级灵器: 50,
    中级灵器: 30,
    高级灵器: 15,
    帝器: 2,
  };
  
  export function getItemsByGrade(data: Lingqi[]): Lingqi[] {
    const grades: string[] = ["低级灵器", "中级灵器", "高级灵器", "帝器"];
    const result: Map<string, Lingqi[]> = new Map();
  
    grades.forEach((grade) => {
      result.set(grade, data.filter((item) => item.品级 === grade));
    });
  
    // Convert the Map values to an array of objects
    return Array.from(result.values()).flat();
  }
  
  export function getRandomItem(灵器分类: Map<string, Lingqi[]>, 权重: Record<string, number>): Lingqi | null {
    const totalWeight = Object.values(权重).reduce((a, b) => a + b, 0);
    const randomWeight = Math.random() * totalWeight;
    let currentWeight = 0;
  
    const flattenedItems = Array.from(灵器分类.values()).flat();
  
    for (const [grade, weight] of Object.entries(权重)) {
      currentWeight += weight;
      if (randomWeight <= currentWeight) {
        const items = flattenedItems.filter((item) => item.品级 === grade);
        if (items.length > 0) {
          return items[Math.floor(Math.random() * items.length)];
        }
      }
    }
  
    return null;
  }
  
  /**
   * 觉醒灵器
   * @param e
   * @returns
   */
  export async function getlingqi(e: AMessage): Promise<Lingqi | null> {
    const 灵器_list = await Read_item('灵器列表');
    const 灵器分类 = getItemsByGrade(灵器_list);
    const randomItem:any = getRandomItem(new Map(灵器分类.map((item) => [item.品级, [item]])), 权重);
  
    if (randomItem) {
      e.reply(`觉醒成功，觉醒出${randomItem.name}，品级为${randomItem.品级}`);
      return randomItem;
    } else {
      console.error("未能获取随机灵器");
      return null;
    }
  }