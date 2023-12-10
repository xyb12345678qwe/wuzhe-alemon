import { createApps} from 'alemonjs'
import { AppName,DirPath} from './config'
import chalk from 'chalk';
import { __PATH,Write_json,Read_json} from './model/wuzhe';
import fs from 'fs'
import path from 'path';
import * as apps from './apps.js'
const app = createApps(import.meta.url)
app.component(apps)
app.mount()
console.log(chalk.cyan('------------------------------------'));
console.log(`~\t${chalk.yellow('武者文游')}\t~`);
console.log(`~\t${chalk.yellow('作者：名字')}\t~`);
console.log(chalk.cyan('------------------------------------'));

const playerJsonPath = path.join(DirPath, '/resources/data/player.json');
if(!fs.existsSync(playerJsonPath)){
  await Write_json(3,await Read_json(3,`/player-default.json`),'/player.json')
  console.log(`写入player.json文件`);
}
 