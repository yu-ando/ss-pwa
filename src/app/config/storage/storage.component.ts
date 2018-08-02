import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-storage',
  templateUrl: './storage.component.html',
  styleUrls: ['./storage.component.scss']
})
export class StorageComponent implements OnInit {
  storageScheduleList = {};
  storagePlanList = {};
  storageOtherList = {};
  listHideState = {};

  storageSizeDisplay = '';

  constructor() {
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

    let storageSize = '';
    const keyCount = localStorage.length;
    for (let idx = 0; idx < keyCount; idx++) {
      const storageKey = localStorage.key(idx);
      storageSize += localStorage.getItem(storageKey);
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
    this.storageSizeDisplay = storageSize ? 3 + ((storageSize.length*16)/(8*1024)) + ' KB' : 'Empty (0 KB)';
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
    localStorage.removeItem($key);
    delete this.storageOtherList[$key];
    for (let idx in this.storageOtherList) {
      if (!!this.storageOtherList[idx]) {
        return;
      }
    }
    this.listHideState['ot_none_hide'] = false;
  }
}
