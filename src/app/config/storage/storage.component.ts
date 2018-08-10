import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ScheduleService } from "../../service/schedule.service";

@Component({
  selector: 'app-storage',
  templateUrl: './storage.component.html',
  styleUrls: ['./storage.component.scss']
})
export class StorageComponent implements OnInit {
  private scs: ScheduleService;

  storageScheduleList = {};
  storagePlanList = {};
  storageOtherList = {};
  listHideState = {};

  storageSize: number = 0;
  importDataArea: string = '';

  constructor(private sc: ScheduleService, private router: Router) {
    this.scs = sc;
    this.loadStorageAllData();
  }

  ngOnInit() {
  }

  /**
   * load localStorage all data.
   * keys # 'ss_' prefix key only.
   *   sc: schedule_data_list
   *   pl: plan_data_list
   *   others: unmatch other data.
   */
  loadStorageAllData() {
    this.storageScheduleList = {};
    this.storagePlanList = {};
    this.storageOtherList = {};
    this.listHideState = {
      'sc_none_hide': false,
      'pl_none_hide': false,
      'ot_none_hide': false,
    };

    const keyCount = localStorage.length;
    for (let idx = 0; idx < keyCount; idx++) {
      const storageKey = localStorage.key(idx);
      const storageData = localStorage.getItem(storageKey);
      this.storageSize += storageData ? ((this.getStringBytes(storageKey) + this.getStringBytes(storageData))) : 0;

      const keyList = storageKey.split('-');
      switch (keyList[0]) {
        case 'ss_sc':
          const key = keyList[1].split('/');
          const monthKey = key[0]+'/'+key[1];
          if (!this.storageScheduleList[monthKey]) {
            this.storageScheduleList[monthKey] = {};
            this.listHideState[monthKey] = {'show': true};
          }
          this.storageScheduleList[monthKey][storageKey] = keyList[1];
          this.listHideState['sc_none_hide'] = true;
          break;
        case 'ss_pl':
          this.storagePlanList[storageKey] = keyList[1];
          this.listHideState['pl_none_hide'] = true;
          break;
        default:
          this.storageOtherList[storageKey] = storageKey;
          this.listHideState['ot_none_hide'] = true;
          break;
      }
    }
  }

  getStringBytes ($str) {
    return(encodeURIComponent($str).replace(/%../g,"x").length);
  }
  displayStorageSize() {
    if (this.storageSize === 0) {
      return 'Empty(0 byte)';
    }
    return (this.storageSize / 1024).toFixed(2) + ' KByte';
  }

  /**
   * monthKeyを表示用の文字列に変換する
   * @param $monthKey 'yyyy/mm'形式の文字列
   * @returns {string} 'yyyy年mm月'形式の文字列
   */
  convertMonthKeyToDisplayStr($monthKey) {
    return $monthKey.replace('/', '年') + '月';
  }
  /**
   * objectのkeyを配列で返却する
   * @param $obj 対象オブジェクト
   * @returns {string[]} キー配列
   */
  objectkeys($obj) {
    return Object.keys($obj);
  }

  /**
   * 月のscheduleItemを全て削除
   * @param $monthKey scheduleMonthKey
   * @param $msg confirmMessage
   */
  clearStorageMonthlyScheduleItems($monthKey, $msg) {
    if (!confirm($msg)) {
      return;
    }
    for (let key in this.storageScheduleList[$monthKey]) {
      const storageData = localStorage.getItem(key);
      this.storageSize -= storageData ? ((this.getStringBytes(key) + this.getStringBytes(storageData))) : 0;
      localStorage.removeItem(key);
      delete this.storageScheduleList[$monthKey][key];
    }
    this.listHideState[$monthKey]['show'] = false;
    for (let idx in this.storageScheduleList) {
      if (this.listHideState[idx]['show']) {
        return;
      }
    }
    this.listHideState['sc_none_hide'] = false;
  }

  /**
   * scheduleItemの削除処理
   * @param $monthKey scheduleMonthKey
   * @param $key localStorageKey
   * @param $msg confirmMessage
   */
  clearStorageScheduleItem($monthKey, $key, $msg) {
    if (!confirm($msg)) {
      return;
    }
    const storageData = localStorage.getItem($key);
    this.storageSize -= storageData ? ((this.getStringBytes($key) + this.getStringBytes(storageData))) : 0;
    localStorage.removeItem($key);
    delete this.storageScheduleList[$monthKey][$key];
    for (let idx in this.storageScheduleList[$monthKey]) {
      if (!!this.storageScheduleList[$monthKey][idx]) {
        return;
      }
    }
    this.listHideState[$monthKey]['show'] = false;
    for (let idx in this.storageScheduleList) {
      if (this.listHideState[idx]['show']) {
        return;
      }
    }
    this.listHideState['sc_none_hide'] = false;
  }

  /**
   * planItemの削除処理
   * @param $key localStorageKey
   * @param $msg confirmMessage
   */
  clearStoragePlanItem($key, $msg) {
    if (!confirm($msg)) {
      return;
    }
    const storageData = localStorage.getItem($key);
    this.storageSize -= storageData ? ((this.getStringBytes($key) + this.getStringBytes(storageData))) : 0;
    localStorage.removeItem($key);
    delete this.storagePlanList[$key];
    for (let idx in this.storagePlanList) {
      if (!!this.storagePlanList[idx]) {
        return;
      }
    }
    this.listHideState['pl_none_hide'] = false;
  }

  /**
   * otherItemの削除処理
   * @param $key localStorageKey
   * @param $msg confirmMessage
   */
  clearStorageOtherItem($key, $msg) {
    if (!confirm($msg)) {
      return;
    }
    const storageData = localStorage.getItem($key);
    this.storageSize -= storageData ? ((this.getStringBytes($key) + this.getStringBytes(storageData))) : 0;
    localStorage.removeItem($key);
    delete this.storageOtherList[$key];
    for (let idx in this.storageOtherList) {
      if (!!this.storageOtherList[idx]) {
        return;
      }
    }
    this.listHideState['ot_none_hide'] = false;
  }

  /**
   * 現時点のlocalStorageバックアップファイルをダウンロードする
   */
  downloadBackupFile() {
    const storageDataList = [];
    const keyCount = localStorage.length;
    for (let idx = 0; idx < keyCount; idx++) {
      const storageKey = localStorage.key(idx);
      const storageValue = localStorage.getItem(storageKey);
      storageDataList.push({
        key: storageKey,
        value: storageValue
      });
    }
    var blob = new Blob([JSON.stringify(storageDataList)], {type: "text/plain"});
    var dllink = window.document.createElement('a');
    const today = new Date();
    dllink.download = 'ss_backup_'+today.getFullYear()+this.scs.zeroFill(today.getMonth()+1, 2)+this.scs.zeroFill(today.getDate(), 2)+'.json';
    dllink.href = URL.createObjectURL(blob);
    dllink.target = '_blank';
    dllink.click();
    console.log(dllink);
  }

  /**
   * localStorageを上書き更新
   */
  importStorageData() {
console.log("import logic!!");
console.log(this.importDataArea);
    // 入力データチェック

    // 確認dialog
    if (!confirm('ストレージデータインポートを行いますか？\n※注意※\n現在の登録データはインポートするデータで上書きされ、完全に削除されます。問題がある場合は[キャンセル]をクリックして処理を中断してください。')) {
      return;
    }

    // import実行
    // localStorage.clear();


    // データ再ロード
    this.loadStorageAllData();
  }
}
