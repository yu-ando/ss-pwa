import { Component, OnInit } from '@angular/core';
declare var $;

@Component({
  selector: 'app-storage',
  templateUrl: './storage.component.html',
  styleUrls: ['./storage.component.scss']
})
export class StorageComponent implements OnInit {
  storageList = {};

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
    this.storageList = {
      sc: {},
      pl: {},
      others: {}
    };
    const keyCount = localStorage.length;
    for (let idx = 0; idx < keyCount; idx++) {
      const storageKey = localStorage.key(idx);
      const keyList = storageKey.split('-');
      const storageData = localStorage.getItem(storageKey);
      switch (keyList[0]) {
        case 'ss_sc':
          const key = keyList[1].split('/');
          const monthKey = key[0]+'年'+key[1]+'月';
          if (!this.storageList['sc'][monthKey]) {
            this.storageList['sc'][monthKey] = {};
          }
          this.storageList['sc'][monthKey][keyList[1]] = storageData;
          break;
        case 'ss_pl':
          this.storageList['pl'][keyList[1]] = storageData;
          break;
        default:
          this.storageList['others'][keyList[1]] = storageData;
          break;
      }
    }
    console.log(this.storageList);
  }
  /**
   * objectのkeyを配列で返却する
   * @param $obj 対象オブジェクト
   * @returns {string[]} キー配列
   */
  objectkeys($obj) {
    return Object.keys($obj);
  }

  clearStorageKey($key, $msg) {
    if (!confirm($msg)) {
      return;
    }
    console.log($key);
    // localStorage.removeItem($key);
    $(this).hide();
  }
  clearStorageMonthlySchedule($target, $msg) {
    if (!confirm($msg)) {
      return;
    }
    console.log($target);
    for (let key in $target) {
      // localStorage.removeItem(key);
    }
    $(this).hide();
  }
}
