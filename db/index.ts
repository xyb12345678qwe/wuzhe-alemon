export * from './mysql.js'
import path from 'path'
import fs from 'fs'
import { __PATH } from '../model/wuzhe.js'
import { DirPath } from '../config.js'

export async function Read_json(num: number, ...paths: string[]) {
  const jsonType = {
    '4': path.join(DirPath, 'public', 'data', 'item')
  }[num]
  const playerPath = path.join(jsonType, paths.join(''))
  try {
    const playerData = fs.readFileSync(playerPath, 'utf8')
    const player = JSON.parse(playerData)
    return player
  } catch (err) {
    console.log(err)
    return 'error'
  }
}
export { Sequelize, DataTypes, literal } from 'sequelize'
export { user_id } from './models/user_id.js'
export { user_player } from './models/user_player.js'
export { user_bag } from './models/user_bag.js'
export { user_equiment } from './models/user_equiment.js'
export { user_status } from './models/user_status.js'
export * from './models/user_zongmen.js'
export * from './information/transaction_record.js'
export * from './information/auction.js'
export * from './item/item.js'
// await generateUID(1)
