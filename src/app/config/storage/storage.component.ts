import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-storage',
  templateUrl: './storage.component.html',
  styleUrls: ['./storage.component.scss']
})
export class StorageComponent implements OnInit {
  storageScheduleList = {};
  scheduleListHideState = {};

  storagePlanList = {};
  planListHideState = {};

  storageOtherList = {};
  otherListHideState = {};

  hogehoge = {};

  constructor() {
    this.loadStorageAllData();

    this.hogehoge['test'] = true;
  }
  onClickHide() {
    delete this.hogehoge['test'];
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
    this.storageScheduleList = {
    };
    this.scheduleListHideState = {
      none_hide: false
    };

    this.storagePlanList = {
    };
    this.planListHideState = {
      none_hide: false
    };

    this.storageOtherList = {
    };
    this.otherListHideState = {
      none_hide: false
    };

    const keyCount = localStorage.length;
    for (let idx = 0; idx < keyCount; idx++) {
      const storageKey = localStorage.key(idx);
      const keyList = storageKey.split('-');
      switch (keyList[0]) {
        case 'ss_sc':
          const key = keyList[1].split('/');
          const monthKey = key[0]+'/'+key[1];
          if (!this.storageScheduleList[monthKey]) {
            this.storageScheduleList[monthKey] = {};
            this.scheduleListHideState[monthKey] = {};
          }
          this.storageScheduleList[monthKey][storageKey] = keyList[1];
          this.scheduleListHideState['none_hide'] = true;
          this.scheduleListHideState[monthKey]['hide'] = false;
          this.scheduleListHideState[monthKey][storageKey] = false;
          break;
        case 'ss_pl':
          this.storagePlanList[storageKey] = keyList[1];
          this.planListHideState['none_hide'] = true;
          this.planListHideState[storageKey] = false;
          break;
        default:
          this.storageOtherList[storageKey] = storageKey;
          this.otherListHideState['none_hide'] = true;
          break;
      }
    }
    console.log(this.storageScheduleList);
    console.log(this.scheduleListHideState);
    console.log(this.storagePlanList);
    console.log(this.planListHideState);
    console.log(this.storageOtherList);
    console.log(this.otherListHideState);
  }
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


  clearStorageScheduleItem($monthKey, $key, $msg) {
    if (!confirm($msg)) {
      return;
    }
    console.log($monthKey, $key);
    // localStorage.removeItem($key);
    delete this.storageScheduleList[$monthKey][$key];
    for (let idx in this.storageScheduleList[$monthKey]) {
      if (!!this.storageScheduleList[$monthKey][idx]) {
        return;
      }
    }
    console.log("month out.");
    this.scheduleListHideState[$monthKey]['hide'] = true;
    for (let idx in this.storageScheduleList) {
      if (!this.scheduleListHideState[idx]['hide']) {
        return;
      }
    }
    console.log("all out.");
    this.scheduleListHideState['none_hide'] = false;
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
    this.planListHideState['none_hide'] = false;
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
    this.otherListHideState['none_hide'] = false;
  }
}
