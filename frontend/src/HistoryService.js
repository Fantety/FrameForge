// 历史记录服务类，负责管理和持久化历史数据
class HistoryService {
  constructor() {
    this.historyKey = 'frameforge_history';
    this.maxHistoryItems = 50; // 最多存储50条历史记录
  }

  // 获取所有历史记录
  getAllHistory() {
    try {
      const history = localStorage.getItem(this.historyKey);
      return history ? JSON.parse(history) : [];
    } catch (error) {
      console.error('获取历史记录失败:', error);
      return [];
    }
  }

  // 添加一条历史记录
  addHistoryItem(item) {
    try {
      const history = this.getAllHistory();
      const newItem = {
        ...item,
        id: Date.now(), // 使用时间戳作为唯一ID
        timestamp: new Date().toISOString()
      };
      
      // 确保不超过最大存储量
      if (history.length >= this.maxHistoryItems) {
        history.pop(); // 移除最早的记录
      }
      
      // 添加新记录到数组开头
      history.unshift(newItem);
      
      // 保存到localStorage
      localStorage.setItem(this.historyKey, JSON.stringify(history));
      
      // 触发自定义事件，通知UI更新
      window.dispatchEvent(new Event('historyUpdated'));
    } catch (error) {
      console.error('保存历史记录失败:', error);
    }
  }

  // 清除所有历史记录
  clearHistory() {
    try {
      localStorage.removeItem(this.historyKey);
      window.dispatchEvent(new Event('historyUpdated'));
    } catch (error) {
      console.error('清除历史记录失败:', error);
    }
  }

  // 根据类型获取历史记录
  getHistoryByType(type) {
    const history = this.getAllHistory();
    return history.filter(item => item.type === type);
  }
}

// 创建单例实例
export const historyService = new HistoryService();

export default HistoryService;