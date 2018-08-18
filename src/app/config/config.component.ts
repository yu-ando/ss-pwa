import { Component, OnInit } from '@angular/core';
import {ConfigService} from "../service/config.service";

@Component({
  selector: 'app-config',
  templateUrl: './config.component.html',
  styleUrls: ['./config.component.scss']
})
export class ConfigComponent implements OnInit {
  private cos: ConfigService;

  configEditorMode = '';
  tagSetting = {};
  changeState = false;

  constructor(private cs: ConfigService) {
    this.cos = cs;
  }

  ngOnInit() {
    // config load.
    this.cos.loadConfig();

    // apply data.
    this.configEditorMode = this.cos.getEditorMode();
    this.tagSetting = this.cos.getTagSetting();
  }

  /**
   * 変更状態管理
   */
  changeConfig() {
    this.changeState = true;
  }

  /**
   * 設定保存
   */
  saveConfig() {
    if (!this.changeState) {
      return;
    }
    this.cos.setEditorMode(this.configEditorMode);
    this.cos.setTagSetting(this.tagSetting);
    this.cos.saveConfig();
    this.changeState = false;
    alert('設定を保存しました。');
  }
}
