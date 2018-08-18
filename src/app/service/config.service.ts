import { Injectable } from '@angular/core';

@Injectable()
export class ConfigService {
  private CONFIG = {};

  constructor() {
  }

  /**
   * localStorageから設定情報を取得
   * 取得できなかった場合はデフォルト設定で動作
   */
  loadConfig() {
    const savedData = localStorage.getItem('ss-configs');
    if (savedData !== null) {
      try {
        this.CONFIG = JSON.parse(savedData);
      } catch ($e) {
        console.log($e);
      }
    } else {
      // default config setting.
      this.CONFIG = {
        editor_mode: '1',
        tag_setting: {
          tag1: {
            name: '種別',
            require: false,
          },
          tag2: {
            name: '内容',
            require: false,
          },
          tag3: {
            name: '課題キー',
            require: false,
          }
        }
      };
    }
  }
  /**
   * localStorageに設定情報を保存
   */
  saveConfig() {
    localStorage.setItem('ss-configs', JSON.stringify(this.CONFIG));
  }

  /**
   * get editor_mode config.
   * @param {boolean} $reload true設定でloadConfig()実行
   * @returns editor_modeの設定値
   */
  getEditorMode($reload = false) {
    if ($reload) {
      this.loadConfig();
    }
    return this.CONFIG['editor_mode'];
  }
  /**
   * set editor_mode config.
   * @param $editorMode '1' or '2'
   */
  setEditorMode($editorMode) {
    this.CONFIG['editor_mode'] = $editorMode;
  }

  /**
   * get tag_setting config.
   * @param {boolean} $reload true設定でloadConfig()実行
   * @returns tag_settingの設定値
   */
  getTagSetting($reload = false) {
    if ($reload) {
      this.loadConfig();
    }
    return this.CONFIG['tag_setting'];
  }
  /**
   * set tag_setting config.
   * @param $tagSetting tag_setting object.
   */
  setTagSetting($tagSetting) {
    this.CONFIG['tag_setting'] = $tagSetting;
  }
}
