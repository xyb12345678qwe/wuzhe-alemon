import { user_id, 体魄境界, 武者境界, 灵魂境界, 灵器列表, 道具列表, 妖兽地点, 功法列表, 丹方, 猎杀妖兽地点, 体质, 兑换码, 装备列表, 秘境列表, 秘境怪物列表 } from "./gameapi.js";

// 定义缓存管理类
export class CacheManager {
  // 静态实例,确保全局只有一个实例
  private static instance: CacheManager;

  // 缓存数组,分别存储不同表的数据
  private cache: { [tableName: string]: any[] } = {};

  // 标志是否正在刷新缓存
  private isRefreshing: boolean = false;

  // 缓存刷新的Promise对象
  private refreshPromise: Promise<void> | null = null;

  // 上次刷新缓存的时间戳
  private lastRefreshTime: { [tableName: string]: number } = {};

  // 缓存过期时间（毫秒）
  private cacheExpirationTime: number = 600000;

  // 私有构造函数,确保只能通过getInstance方法获取实例
  private constructor() {}

  // 获取实例的静态方法
  public static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager();
    }
    return CacheManager.instance;
  }

  // 从数据库中获取数据的异步方法
  private async fetchDataFromDatabase(tableName: string): Promise<any[]> {
    const table = eval(tableName);
    if (table) {
      return table.findAll({ raw: true });
    }
    return [];
  }

  // 刷新缓存的异步方法,可设置重试次数
  public async refreshCache(tableName: string, retryCount: number = 3): Promise<void> {
    if (this.isRefreshing || Date.now() - (this.lastRefreshTime[tableName] || 0) < this.cacheExpirationTime) {
      return this.refreshPromise as Promise<void>;
    }
  
    this.isRefreshing = true;
    try {
      const refreshedData: any[] = [];
      for (let i = 0; i < retryCount; i++) {
        const data = await this.fetchDataFromDatabase(tableName);
        refreshedData.push(data);
      }
      const mergedData = refreshedData[0]; // 只使用第一个数据源
      this.cache[tableName] = mergedData;
      this.lastRefreshTime[tableName] = Date.now();
      console.log(`${tableName}缓存刷新成功`);
    } catch (error) {
      console.error(`刷新${tableName}缓存时出错:`, error);
      throw new Error(`刷新${tableName}缓存失败`);
    } finally {
      this.isRefreshing = false;
    }
  }

  // 获取缓存的异步方法
  public async getCache(tableName: string): Promise<any[]> {
    // 如果缓存为空或已过期,则触发刷新
    if (!this.cache[tableName] || Date.now() - (this.lastRefreshTime[tableName] || 0) >= this.cacheExpirationTime) {
      await this.refreshCache(tableName);
    }

    // 返回缓存数据
    return this.cache[tableName];
  }

  /***在CacheManager类中添加刷新全部缓存的方法*/
  public async refreshAllCache(retryCount: number = 3): Promise<void> {
    const refreshTasks = Object.keys(this.cache).map((tableName) => this.refreshCache(tableName, retryCount));

    try {
      await Promise.all(refreshTasks);
      console.log("所有缓存刷新成功");
    } catch (error) {
      console.error("刷新缓存时出错:", error);
      throw new Error("刷新缓存失败");
    }
  }
}

// 导出实例,保证全局唯一
export const cacheManager = CacheManager.getInstance();

// 异步获取缓存数据的示例方法
export async function getCacheData(tableName: string): Promise<any[]> {
  let item;
  switch (tableName) {
    case "user_id":
      item = user_id;
      break;
    case "体魄境界":
      item = 体魄境界;
      break;
    case "武者境界":
      item = 武者境界;
      break;
    case "灵魂境界":
      item = 灵魂境界;
      break;
    case "灵器列表":
      item = 灵器列表;
      break;
    case "道具列表":
      item = 道具列表;
      break;
    case "妖兽地点":
      item = 妖兽地点;
      break;
    case "功法列表":
      item = 功法列表;
      break;
    case "丹方":
      item = 丹方;
      break;
    case "猎杀妖兽地点":
      item = 猎杀妖兽地点;
      break;
    case "体质":
      item = 体质;
      break;
    case "兑换码":
      item = 兑换码;
      break;
    case "装备列表":
      item = 装备列表;
      break;
    case "秘境列表":
      item = 秘境列表;
      break;
    case "秘境怪物列表":
      item = 秘境怪物列表;
      break;
  }

  const cachedData = await cacheManager.getCache(tableName);
  return cachedData;
}

// 异步刷新缓存的示例方法
export async function refreshCacheData(tableName: string): Promise<void> {
  await cacheManager.refreshCache(tableName);
}

// 异步获取UID缓存数据的示例方法
export async function getUIDCache(): Promise<any[]> {
  const cachedData = await cacheManager.getCache("user_id");
  return cachedData;
}

// 异步刷新UID缓存的示例方法
export async function refresh_uid_cache(): Promise<void> {
  await cacheManager.refreshCache("user_id");
}

// 异步刷新全部缓存的示例方法
export async function refresh_all_cache(): Promise<void> {
  await cacheManager.refreshAllCache();
}
await refresh_all_cache();