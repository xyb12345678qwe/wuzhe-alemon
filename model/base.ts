import { AppName,DirPath } from '../api';

class Base {
  e: any;
  userId?: string;
  model: string;
  _path: string;

  constructor(e: { user_id?: string } = {}) {
    this.e = e;
    this.userId = e?.user_id;
    this.model = AppName;
    this._path = process.cwd().replace(/\\/g, '/');
  }

  get prefix(): string {
    return `Yz:${AppName}:${this.model}:`;
  }

  /**
   * 构造路径
   * @param type 路径类型
   */
  constructPath(type: string): string {
    return `${DirPath}/resources/${type}`;
  }

  /**
   * 截图默认数据
   * @param saveId html保存id
   * @param tplFile 模板html路径
   * @param pluResPath 插件资源路径
   */
  get screenData(): {
    saveId: string | undefined;
    tplFile: string;
    pluResPath: string;
  } {
    return {
      saveId: this.userId,
      tplFile: this.constructPath(`html/${this.model}/${this.model}.html`),
      pluResPath: this.constructPath(''),
    };
  }
}

export default Base;