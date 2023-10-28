import base from './base.js';
import {plugin,AMessage,Show,puppeteer,DirPath} from '../app-config'
export default class Game extends base {
  constructor(e:AMessage) {
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

  async get_playerData(myData:any) {
    return this.getScreenData('player', myData);
  }
  async get_lingqi(myData:any) {
    return this.getScreenData('lingqi', myData);
  }
  async get_lieyao(myData:any) {
    return this.getScreenData('lieyao', myData);
  }
  async get_msg(myData:any) {
    return this.getScreenData('msg', myData);
  }
  async get_jisha(myData:any) {
    return this.getScreenData('jisha', myData);
  }
  async get_wanjietang(myData:any) {
    return this.getScreenData('wanjietang', myData);
  }

}