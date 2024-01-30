export * from './mysql.js'
import path from 'path'
import fs from 'fs'
import {__PATH,data} from '../model/wuzhe.js'
import { DirPath } from '../config.js'

export async function Read_json(num:number, ...paths: string[]) {
const data = path.join(DirPath, 'resources', 'data')
 const __PATH = {
   zongmen: path.join(data, 'zongmen'), 
   player: path.join(data, 'player'), 
   help: path.join(data, 'help', 'help.yaml'), 
   list: path.join(data, 'item'), 
   playerjson: path.join(data, 'player.json'),
   shezhi: path.join(DirPath,"shezhi",'all_shezhi.json') 
 };
    const jsontype={
        "1":__PATH.playerjson,
        "2":__PATH.shezhi,
        "3":data,
        "4":__PATH.list,
    }
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
export { Sequelize, DataTypes, literal} from 'sequelize'
export {user_id} from './models/user_id.js'
export {user_player}from './models/user_player.js'
export {user_bag} from './models/user_bag.js'
export {user_equiment} from './models/user_equiment.js'
export {user_status} from './models/user_status.js'
export * from './models/user_zongmen.js'
export * from './information/transaction_record.js'
export * from './information/auction.js'
export * from './item/item.js'
// await generateUID(1)
