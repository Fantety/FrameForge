// 设置存储服务类，负责管理和持久化用户设置
class SettingsStorageService {
  constructor() {
    // 为每个组件定义不同的存储键
    this.storageKeys = {
      imageGeneration: 'frameforge_image_generation_settings',
      animationGeneration: 'frameforge_animation_generation_settings',
      chiptuneGeneration: 'frameforge_chiptune_generation_settings'
    };
  }

  // 保存图像生成设置
  saveImageGenerationSettings(settings) {
    try {
      localStorage.setItem(
        this.storageKeys.imageGeneration,
        JSON.stringify(settings)
      );
      // 触发设置更新事件
      window.dispatchEvent(new Event('settingsUpdated'));
    } catch (error) {
      console.error('保存图像生成设置失败:', error);
    }
  }

  // 获取图像生成设置
  getImageGenerationSettings() {
    try {
      const settings = localStorage.getItem(this.storageKeys.imageGeneration);
      return settings ? JSON.parse(settings) : null;
    } catch (error) {
      console.error('获取图像生成设置失败:', error);
      return null;
    }
  }

  // 保存动画生成设置
  saveAnimationGenerationSettings(settings) {
    try {
      localStorage.setItem(
        this.storageKeys.animationGeneration,
        JSON.stringify(settings)
      );
      // 触发设置更新事件
      window.dispatchEvent(new Event('settingsUpdated'));
    } catch (error) {
      console.error('保存动画生成设置失败:', error);
    }
  }

  // 获取动画生成设置
  getAnimationGenerationSettings() {
    try {
      const settings = localStorage.getItem(this.storageKeys.animationGeneration);
      return settings ? JSON.parse(settings) : null;
    } catch (error) {
      console.error('获取动画生成设置失败:', error);
      return null;
    }
  }

  // 保存音乐生成设置
  saveChiptuneGenerationSettings(settings) {
    try {
      localStorage.setItem(
        this.storageKeys.chiptuneGeneration,
        JSON.stringify(settings)
      );
      // 触发设置更新事件
      window.dispatchEvent(new Event('settingsUpdated'));
    } catch (error) {
      console.error('保存音乐生成设置失败:', error);
    }
  }

  // 获取音乐生成设置
  getChiptuneGenerationSettings() {
    try {
      const settings = localStorage.getItem(this.storageKeys.chiptuneGeneration);
      return settings ? JSON.parse(settings) : null;
    } catch (error) {
      console.error('获取音乐生成设置失败:', error);
      return null;
    }
  }

  // 清除所有设置
  clearAllSettings() {
    try {
      Object.values(this.storageKeys).forEach(key => {
        localStorage.removeItem(key);
      });
      // 触发设置更新事件
      window.dispatchEvent(new Event('settingsUpdated'));
    } catch (error) {
      console.error('清除所有设置失败:', error);
    }
  }
}

// 创建单例实例
export const settingsStorageService = new SettingsStorageService();

export default SettingsStorageService;