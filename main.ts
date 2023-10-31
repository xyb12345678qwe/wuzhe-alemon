import { createApps, getAppName, getAppProCoinfg } from 'alemonjs'
import { buildTools } from 'alemon-rollup'
import { AppName} from './app-config'
import chalk from 'chalk';
import { getAppPath } from 'alemonjs'
export const DirPath= getAppPath(import.meta.url)
import { __PATH,Write_json_path,Read_json_path} from './model/wuzhe';
import fs from 'fs'
import path from 'path';

const hello = await buildTools(
  AppName,
  getAppProCoinfg('dir')
)
const apps = createApps(import.meta.url)
apps.component(hello)
apps.mount()
console.log(chalk.cyan('------------------------------------'));
console.log(`~\t${chalk.yellow('武者文游')}\t~`);
console.log(`~\t${chalk.yellow('作者：名字')}\t~`);
console.log(chalk.cyan('------------------------------------'));
const moduleDir = path.dirname(new URL(import.meta.url).pathname);

const playerJsonPath = path.join(moduleDir, '/resources/data/player.json');
console.log(fs.existsSync(playerJsonPath));
if(!fs.existsSync(playerJsonPath)){
  await Write_json_path('../resources/data/player.json',await Read_json_path(`../resources/data/player-default.json`))
  console.log(`写入player.json文件`);
}
 