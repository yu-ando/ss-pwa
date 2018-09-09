import { Component, OnInit } from '@angular/core';
import { SimpleModalComponent } from 'ngx-simple-modal';
import { ScheduleService } from "../../service/schedule.service";
import { MAT_MOMENT_DATE_FORMATS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';

export interface HistoryModel {
  message: string;
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
export class HistoryModalComponent extends SimpleModalComponent<HistoryModel, boolean> implements HistoryModel, OnInit {
  analyzeConditions: any;
  message: string;

  selectDate: any = '';
  viewDate: string = '';

  historyList: any;

  constructor(private adapter: DateAdapter<any>, private scheduleService: ScheduleService) {
    super();
    console.log('modal constructor!!');
  }
  ngOnInit() {
    console.log('ngOnInit!!');
    console.log(this.analyzeConditions);
  }

  /**
   * 昨日の日報を表示
   */
  showYesterday() {
    const target = new Date();
    target.setDate(target.getDate() - 1);
    this.setViewDate(target.getFullYear(), (target.getMonth() + 1), target.getDate());
    this.displayHistoryData();
  }

  /**
   * 先週の日報を表示
   */
  showLastWeek() {
    const target = new Date();
    target.setDate(target.getDate() - 7);
    this.setViewDate(target.getFullYear(), (target.getMonth() + 1), target.getDate());
    this.displayHistoryData();
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
    this.displayHistoryData();
  }

  /**
   * 指定日の前日を表示
   * 指定日の選択も変更する
   */
  showTargetBefore() {
    const target = new Date(this.viewDate);
    target.setDate(target.getDate() - 1);
    this.setViewDate(target.getFullYear(), (target.getMonth() + 1), target.getDate());
    this.displayHistoryData();
  }

  /**
   * 指定日の翌日を表示
   * 指定日の選択も変更する
   */
  showTargetAfter() {
    const target = new Date(this.viewDate);
    target.setDate(target.getDate() + 1);
    this.setViewDate(target.getFullYear(), (target.getMonth() + 1), target.getDate());
    this.displayHistoryData();
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
  displayHistoryData() {
    const schedule = this.scheduleService.loadSchedule(this.viewDate);
    console.log(schedule);

    this.historyList = schedule;
  }

  confirm() {
    // on click on confirm button we set dialog result as true,
    // ten we can get dialog result from caller code
    this.result = true;
    this.close();
  }
  cancel() {
    this.result = false;
    this.close();
  }
}
