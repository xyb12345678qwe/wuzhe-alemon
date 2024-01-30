import {importPath } from 'alemonjs'
export const equiment_type = ["攻击加成","防御加成","暴击加成","爆伤加成","生命加成","闪避加成"]
export const app = importPath(import.meta.url)
export const AppName = app.name;
export const DirPath=  app.cwd();
console.log(DirPath);

