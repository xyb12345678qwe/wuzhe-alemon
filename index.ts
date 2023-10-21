import { createApps, getAppName, getAppProCoinfg } from 'alemonjs'
import { buildTools } from 'alemon-rollup'
import { AppName } from './app-config'
import chalk from 'chalk';
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




