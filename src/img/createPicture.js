import { readFileSync, writeFileSync, watch, mkdirSync } from "fs";
import { join, basename } from "path";
import template from "art-template";
import lodash from "lodash";
import puppeteer from "puppeteer";
/**
 * 截图次数
 */
let pic = 0;
/**
 * 重启控制
 */
const RestartControl = 30;
/**
 * 实例
 */
let browser;
/**
 * 实例控制
 */
let isBrowser = false;
/**
 * 实例配置
 */
let LaunchCfg;
let browserPool = []; // 新增浏览器实例池

/**
 * 配置浏览器参数
 * @param val
 */
export function setLanchConfig(val) {
  LaunchCfg = val;
}
async function ensureBrowser() {
    if (!isBrowser) {
      if (!(await startChrom())) return false;
    }
    return true;
  }
/**
 * 截图并返回buffer
 * @param htmlPath 绝对路径
 * @param tab 截图元素位
 * @param type 图片类型
 * @param quality 清晰度
 * @param timeout 响应检查
 * @returns
 */
export async function screenshot(htmlPath, Options) {
const { SOptions, tab = "body", timeout = 120000 } = Options;
  /**
   * 检测是否开启
   */
  if (!(await ensureBrowser())) return false;
  if (pic <= RestartControl) {
    /**
     * 记录次数
     */
    pic++;
  } else {
    /**
     * 重置次数
     */
    pic = 0;
    console.info("[puppeteer] close");
    isBrowser = false;
    browser.close().catch((err) => console.error(err));
    console.info("[puppeteer] reopen");
    if (!(await startChrom())) return false;
    pic++;
  }
  /**
   * 开始截图
   */
  return await startPage(htmlPath, SOptions, tab, timeout).catch((err) => {
    console.error(err);
    return false;
  });
}
/**
 * 开始截图
 * @param htmlPath  绝对路径
 * @param SOptions  { type 图片类型 , quality 清晰度   }
 * @param tab  截图元素位
 * @param timeout  响应检查
 * @returns
 */
export async function startPage(htmlPath, SOptions, tab, timeout) {
    try {
      if (!(await ensureBrowser())) return false;
      console.info("[puppeteer] start");
  
      // 从连接池中获取浏览器实例
      const browserInstance = browserPool.pop() || browser;
  
      const page = await browserInstance.newPage();
      await page.goto(`file://${htmlPath}`, { timeout });
      const body = await page.$(tab);
      console.info("[puppeteer] success");
  
      const img = await body.screenshot(SOptions).catch((err) => {
        console.error(err);
        return false;
      });
  
      // 将浏览器实例放回连接池
      browserPool.push(browserInstance);
  
      if (global?.segment) return global?.segment?.image(img);
      return img;
    } catch (err) {
      console.error(err);
      return false;
    }
  }
/**
 * 启动浏览器
 * @returns
 */
export async function startChrom() {
  try {
    const launchOptions = { ...LaunchCfg, headless: "new" };
    browser = await puppeteer.launch(launchOptions);
    isBrowser = true;
    console.info("[puppeteer] open success");
    return true;
  } catch (err) {
    console.error(err);
    isBrowser = false;
    console.error("[puppeteer] open fail");
    return false;
  }
}

/**
 * 模板缓存
 */
const html = {};
/**
 * 监听器
 */
const watcher = {};
/**
 * 地址缓存
 */
const CacheData = {};
/**
 * 缓存监听
 * @param tplFile 模板地址
 * @returns
 */
function watchCT(tplFile) {
  /**
   * 监听存在,直接返回
   */
  if (watcher[tplFile]) return;
  /**
   * 监听不存在,增加监听
   */
  watcher[tplFile] = watch(tplFile)
    .on("change", () => {
      /**
       * 模板改变,删除模板
       */
      delete html[tplFile];
      console.info("[HTML][UPDATE]", tplFile);
    })
    .on("close", () => {
      /**
       * 监听器被移除,删除监听器
       */
      delete watcher[tplFile];
    });
}
/**
 *
 * @param Options
 * @returns
 */
export async function createPicture(Options) {
  const {
    AppName,
    tplFile,
    data,
    tab,
    timeout,
    SOptions
  } = Options;
//   SOptions = { type: "jpeg", quality: 90 },
  /**
   * 插件路径
   */
  const basePath = join(process.cwd(), "plugins", AppName);
  /**
   * 写入地址
   */
  const AddressHtml = join(process.cwd(), "data", AppName, basename(tplFile));
  /**
   * 确保写入目录存在
   */
  mkdirSync(join(process.cwd(), "data", AppName), { recursive: true });
  /**
   * 判断初始模板是否改变
   */
  let T = false;
  if (!html[tplFile]) {
    /**
     * 如果模板不存在,则读取模板
     */
    try {
      html[tplFile] = readFileSync(tplFile, "utf8");
    } catch (err) {
      console.error("[HTML][ERROR]", tplFile, err);
      return false;
    }
    /**
     * 读取后监听文件
     */
    watchCT(tplFile);
    T = true;
  }
  /**
   * 模板对象不同需要更新数据
   */
  if (!lodash.isEqual(CacheData[tplFile], data)) {
    CacheData[tplFile] = data;
    T = true;
  }
  /**
   * 模板更改和数据更改都会生成生成html
   */
  if (T) {
    const reg =
      /url\(['"](@[^'"]+)['"]\)|href=['"](@[^'"]+)['"]|src=['"](@[^'"]+)['"]/g;
    const absolutePathTemplate = html[tplFile].replace(
      reg,
      (match, urlPath, hrefPath, srcPath) => {
        const relativePath = urlPath ?? hrefPath ?? srcPath;
        /**
         * 去掉路径开头的 @ 符号
         * 转义\/
         */
        const absolutePath = join(basePath, relativePath.substr(1)).replace(
          /\\/g,
          "/"
        );
        if (urlPath) return `url('${absolutePath}')`;
        if (hrefPath) return `href='${absolutePath}'`;
        if (srcPath) return `src='${absolutePath}'`;
      }
    );
    /**
     * 写入对生成地址写入模板
     */
    writeFileSync(
      AddressHtml,
      template.render(absolutePathTemplate, CacheData[tplFile])
    );
    /**
     * 打印反馈生成后的地址
     */
    console.info("[HTML][CREATE]", AddressHtml);
  }
  /**
   * 对生成后的地址截图
   */
  const img = await screenshot(AddressHtml, {
    SOptions,
    tab,
    timeout,
  }).catch((err) => {
    console.error(err);
    return false;
  });
  return img;
}
