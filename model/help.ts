import base from './base.js';
import { Read_yaml } from './wuzhe.js';
import {plugin,AMessage,Show,puppeteer} from '../app-config'
export default class Help extends base {
  constructor(e:AMessage) {
    super(e);
    this.model = 'help';
  }

  static async get(e:AMessage) {
    let html = new Help(e);
    return await html.getData();
  }

  async getData() {
    let helpData = await Read_yaml(1)
    return {
      ...this.screenData,
      saveId: 'help',
      helpData,
    };
  }

  
  }

