import { Component, OnInit } from '@angular/core';
import { SimpleModalComponent } from 'ngx-simple-modal';
import { ScheduleService } from "../../service/schedule.service";
import { ConfigService } from "../../service/config.service";
import { MAT_MOMENT_DATE_FORMATS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';

export interface HistoryModel {
  scheduleDate: string;
}

@Component({
  selector: 'app-history-modal',
  templateUrl: './history-modal.component.html',
  styleUrls: ['./history-modal.component.scss'],
  providers: [
    {provide: MAT_DATE_LOCALE, useValue: 'ja-JP'},
    {provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE]},
    {provide: MAT_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS},
  ]
})
export class HistoryModalComponent extends SimpleModalComponent<HistoryModel, any> implements HistoryModel, OnInit {
  scheduleDate: string;

  selectDate: any = '';
  viewDate: string = '';

  categorySetting: any;
  tagSetting: any;
  historyList: any;
  copySelectionList: any = [];
  allCheckFlg: boolean = false;

  constructor(private adapter: DateAdapter<any>, private scheduleService: ScheduleService, private configService: ConfigService) {
    super();
  }
  ngOnInit() {
    this.tagSetting = this.configService.getTagSetting(true);
    this.categorySetting = this.configService.getCategorySetting();
    this.viewDate = this.scheduleDate;
  }

  /**
   * 昨日の日報を表示
   */
  showYesterday() {
    const target = new Date(this.scheduleDate);
    target.setDate(target.getDate() - 1);
    this.setViewDate(target.getFullYear(), (target.getMonth() + 1), target.getDate());
    this.loadHistoryData();
  }

  /**
   * 先週の日報を表示
   */
  showLastWeek() {
    const target = new Date(this.scheduleDate);
    target.setDate(target.getDate() - 7);
    this.setViewDate(target.getFullYear(), (target.getMonth() + 1), target.getDate());
    this.loadHistoryData();
  }

  /**
   * 指定日の日報を表示
   */
  showTargetDate() {
    const selectedDate = this.selectDate._d;
    if (!selectedDate) {
      alert('日付を選択または、YYYY/MM/DD形式で入力してください。');
      return;
    }
    const target = new Date(selectedDate);
    this.setViewDate(target.getFullYear(), (target.getMonth() + 1), target.getDate());
    this.loadHistoryData();
  }

  /**
   * 指定日の前日を表示
   * 指定日の選択も変更する
   */
  showTargetBefore() {
    const target = new Date(this.viewDate);
    target.setDate(target.getDate() - 1);
    this.setViewDate(target.getFullYear(), (target.getMonth() + 1), target.getDate());
    this.loadHistoryData();
  }

  /**
   * 指定日の翌日を表示
   * 指定日の選択も変更する
   */
  showTargetAfter() {
    const target = new Date(this.viewDate);
    target.setDate(target.getDate() + 1);
    this.setViewDate(target.getFullYear(), (target.getMonth() + 1), target.getDate());
    this.loadHistoryData();
  }

  /**
   * ゼロ埋めした文字列でviewDateを設定する
   */
  setViewDate($year, $month, $date) {
    this.viewDate = this.scheduleService.zeroFill($year, 4) +
      '/' + this.scheduleService.zeroFill($month, 2) +
      '/' + this.scheduleService.zeroFill($date, 2);
  }

  /**
   * 指定日(this.viewDate)のデータを表示する
   */
  loadHistoryData() {
    const schedule = this.scheduleService.loadSchedule(this.viewDate);

    //TODO:一旦全部そのまま突っ込むが、ここでフィルタリング処理をする
    console.log(schedule);
    this.historyList = schedule;

    this.copySelectionList = [];
    for (const idx in this.historyList) {
      const item = this.historyList[idx];
      this.copySelectionList[item.id] = {check: false, history: idx};
    }
  }

  /**
   * 全コピーチェックの一括切り替え
   */
  toggleAllCheck() {
    let changeCheck = false;
    if (!this.allCheckFlg) {
      changeCheck = true;
    }
    for (const idx in this.copySelectionList) {
      this.copySelectionList[idx]['check'] = changeCheck;
    }
  }

  /**
   * 単一レコードのコピーチェック切り替え
   * @param $id 対象ID
   */
  copyCheck($id) {
    if (!this.copySelectionList[$id]['check']) {
      this.copySelectionList[$id]['check'] = true;
    } else {
      this.copySelectionList[$id]['check'] = false;
      this.allCheckFlg = false;
    }
  }

  /**
   * 選択項目のコピー確認とコピー対象連携
   */
  confirm() {
    this.result = []
    for (const idx in this.copySelectionList) {
      if (this.copySelectionList[idx]['check']) {
        this.result.push(this.historyList[this.copySelectionList[idx]['history']]);
      }
    }
    if (this.result.length < 1) {
      alert('コピーする履歴が選択されていません。\n履歴ウィンドウを閉じる場合は"閉じる"ボタンを押してください。');
      return;
    }
    this.close();
  }

  /**
   * 処理キャンセル、モーダルクローズ
   */
  cancel() {
    this.result = [];
    this.close();
  }
}
