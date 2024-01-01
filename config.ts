import {importPath } from 'alemonjs'

export const app = importPath(import.meta.url)
export const AppName = app.name;
export const DirPath= app.cwd();
