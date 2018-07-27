import { Component, OnInit } from '@angular/core';
import {AngularGridInstance, Column, Editors, FieldType, Formatter, Formatters, GridOption} from 'angular-slickgrid';
import {TranslateService} from "@ngx-translate/core";
import {ActivatedRoute, Router} from "@angular/router";
import {ScheduleService} from "../../service/schedule.service";

@Component({
  selector: 'app-report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.scss']
})
export class ReportComponent implements OnInit {
  private schedule: ScheduleService;
  
  dateList = {};
  reportGridObj: AngularGridInstance;
  reportColumnDefinitions: Column[];
  reportGridOptions: GridOption;
  reportDataset: any[] = [];
  reportClassset: any[] = [];
  timeTotalList = {0: 0, 1: 0, 2: 0};

  constructor(private router: Router, ar: ActivatedRoute, private sc: ScheduleService, private translate: TranslateService) {
    this.schedule = sc;
    let year = 0;
    let month = 0;
    ar.params.subscribe(params => {
      if (!!params['year']) {
        year = Number(params['year']);
      } else {
        year = new Date().getFullYear();
      }
      if (!!params['month']) {
        month = Number(params['month']);
      } else {
        month = new Date().getMonth() + 1;
      }
    });
    this.setDateList(year, month);
  }
  setDateList($year, $month) {
    const current = new Date($year, $month - 1, 1);
    this.dateList['current_year'] = current.getFullYear();
    this.dateList['current_month'] = current.getMonth() + 1;
    this.dateList['current_date'] = this.dateList['current_year'] + '/' + this.dateList['current_month'];
    const pastday = new Date($year, $month - 2, 1);
    this.dateList['past_year'] = pastday.getFullYear();
    this.dateList['past_month'] = pastday.getMonth() + 1;
    this.dateList['past_date'] = this.dateList['past_year'] + '/' + this.dateList['past_month'];
    const nextday = new Date($year, $month, 1);
    this.dateList['next_year'] = nextday.getFullYear();
    this.dateList['next_month'] = nextday.getMonth() + 1;
    this.dateList['next_date'] = this.dateList['next_year'] + '/' + this.dateList['next_month'];
  }

  ngOnInit() {
    this.initReportColumnDefinitions();
    this.initReportGridOptions();
    this.loadReportData();
  }
  // change edit date.
  changeCurrentDate($year, $month) {
    this.setDateList($year, $month);
    this.loadReportData();
  }

  reportReady(angularGrid: AngularGridInstance) {
    this.reportGridObj = angularGrid;
    this.styleSetting();
  }
  initReportColumnDefinitions() {
    this.reportColumnDefinitions = [
      { id: 'day', name: '日付', field: 'day', sortable: false, minWidth: 60, maxWidth: 60 },
      { id: 'start', name: '出勤時間', field: 'start', sortable: false, minWidth: 80 },
      { id: 'end', name: '退勤時間', field: 'end', sortable: false, minWidth: 80 },
      { id: 'rest', name: '除外時間', field: 'rest', sortable: false, minWidth: 80 },
      { id: 'work', name: '作業時間', field: 'work', sortable: false, minWidth: 80 },
      { id: 'p_work', name: '予定作業', field: 'p_work', sortable: false, minWidth: 80 },
      { id: 'p_start', name: '予定開始', field: 'p_start', sortable: false, minWidth: 80, type: FieldType.string, editor: { model: Editors.text }},
      { id: 'p_end', name: '予定終了', field: 'p_end', sortable: false, minWidth: 80, type: FieldType.string, editor: { model: Editors.text }},
      { id: 'p_rest', name: '予定除外', field: 'p_rest', sortable: false, minWidth: 80, type: FieldType.string, editor: { model: Editors.text }},
      { id: 'holiday', name: '休日', field: 'holiday', minWidth: 50, maxWidth: 50, cssClass: "ac", type: FieldType.integer, formatter: Formatters.checkmark, editor: { model: Editors.checkbox }}
    ];
  }
  initReportGridOptions() {
    this.reportGridOptions = {
      i18n: this.translate,
      enableAutoResize: true,
      asyncEditorLoading: true,
      editable: true,

      autoHeight: false,
      autoEdit: true,
      enableCellNavigation: true,
      enableColumnPicker: false,

      enableExcelCopyBuffer: true,
      showHeaderRow: false,
      enableGridMenu: false,
      enableSorting: false,
      enableHeaderMenu: true,
      enableHeaderButton: false,
      enableRowSelection: true,

      enableAddRow: false,
    };
  }
  loadReportData() {
    // data reset.
    this.reportDataset = [];
    this.reportClassset = [];
    this.timeTotalList = {0: 0, 1: 0, 2: 0};

    // 月次の作業予定データ取得
    let planDataList = {};
    const storagePlanData = localStorage.getItem('ss_plan-' + this.dateList['current_date']);
    if (storagePlanData !== null) {
      try {
        // 日報データあり
        planDataList = JSON.parse(storagePlanData);
      } catch ($e) {
        console.log($e);
      }
    }

    // 月次の日報データ取得
    const currentLastDay = new Date(this.dateList['current_year'], this.dateList['current_month'], 0).getDate();
    const current = new Date(this.dateList['current_year'], this.dateList['current_month'] - 1, 1);
    for (let day = 1; day <= currentLastDay; day++) {
      current.setDate(day);

      let scheduleData = null;
      const savedData = localStorage.getItem('ss_' + this.dateList['current_date'] + '/' + day);
      if (savedData !== null) {
        try {
          // 日報データあり
          scheduleData = JSON.parse(savedData);
        } catch ($e) {
          console.log($e);
        }
      }
      // レコード設定
      const item = this.createReportItem(current, scheduleData, planDataList);
      const classSet = this.createClassSet(item);
      this.reportDataset.push(item);
      this.reportClassset.push(classSet);
    }
    // 総時間数集計
    this.calTotalTime();
    // grid reset.
    if (!!this.reportGridObj) {
      this.reportGridObj.gridService.resetGrid(this.reportColumnDefinitions);
      this.styleSetting();
    }
  }
  styleSetting() {
    // css_styleを設定
    this.reportGridObj.slickGrid.setCellCssStyles("", this.reportClassset);
  }

  /**
   * レポートデータのitemを作成する
   * @param $current 日付インスタンス(Dateオブジェクト)
   * @param $scheduleData スケジュールデータ
   * @param $planDataList 作業予定データ
   * @return レポートデータitem
   */
  createReportItem($current, $scheduleData, $planDataList) {
    // 曜日名称と休日設定
    const dayNames = '日月火水木金土';
    const holidays = '1000001';
    // item作成とdefault設定
    const item = {
      id: this.dateList['current_date'] + '/' + $current.getDate(),
      day: this.zeroFill($current.getDate(), 2) + ' (' + dayNames[$current.getDay()] + ')',
      start: '10:00',
      end: '19:00',
      rest: '1.00',
      work: '8.00',
      p_work: '8.00',
      p_start: '10:00',
      p_end: '19:00',
      p_rest: '1.00',
      holiday: 0
    };
    // 休日default設定(休日と平日でdefault変更)
    if (holidays[$current.getDay()] === '1') {
      item.start = '';
      item.end = '';
      item.rest = '';
      item.work = '';
      item.p_work = '0.00';
      item.p_start = '';
      item.p_end = '';
      item.p_rest = '0.00';
      item.holiday = 1;
    }

    // scheduleデータ設定
    if (!!$scheduleData) {
      //TODO: 1日のレンジが00:00〜23:59想定、それを超えての1日定義は仕様変更が必要
      let start = '23:59';
      let end = '00:00';
      let work = 0;
      let rest = 0;
      $scheduleData.forEach(function($record){
        if ($record.start < start) {
          start = $record.start;
        }
        if (end < $record.end) {
          end = $record.end;
        }
        const hour = this.calWorkHour($record.start, $record.end);
        if ($record.category == 0) {
          work += hour;
        } else {
          rest += hour;
        }
      }, this);
      item.start = start;
      item.end = end;
      item.rest = rest.toFixed(2);
      item.work = work.toFixed(2);
    }

    // planデータ設定
    const planKey = $current.getFullYear() + '/' + ($current.getMonth() + 1) + '/' + $current.getDate();
    if (!!$planDataList[planKey]) {
      const planData = $planDataList[planKey];
      item.p_start = planData.p_start;
      item.p_end = planData.p_end;
      item.p_work = planData.p_work;
      item.p_rest = planData.p_rest;
      item.holiday = planData.holiday;
    }

    return item;
  }
  createClassSet($item) {
    let classSet = {
      day: '',
      start: '',
      end: '',
      rest: '',
      work: '',
      p_work: '',
      p_start: 'plan-cell',
      p_end: 'plan-cell',
      p_rest: 'plan-cell',
      holiday: 'plan-cell'
    };
    if ($item.holiday) {
      classSet = {
        day: 'holiday-cell-red',
        start: 'holiday-cell',
        end: 'holiday-cell',
        rest: 'holiday-cell',
        work: 'holiday-cell',
        p_work: 'holiday-cell',
        p_start: 'holiday-cell',
        p_end: 'holiday-cell',
        p_rest: 'holiday-cell',
        holiday: 'holiday-cell'
      };
    }
    return classSet;
  }
  calWorkHour($start, $end) {
    if (!$start || !$end) {
      return 0;
    }
    const separatorIdxStart: number = $start.indexOf(':');
    const separatorIdxEnd: number = $end.indexOf(':');
    if (separatorIdxStart < 0 || separatorIdxEnd < 0) {
      return 0;
    }
    const start_time: number = Number($start.substr(0, separatorIdxStart));
    const start_second: number = $start.substr(separatorIdxStart + 1) / 60;
    const end_time: number = Number($end.substr(0, separatorIdxEnd));
    const end_second: number = $end.substr(separatorIdxEnd + 1) / 60;
    const hour = (end_time + end_second) - (start_time + start_second);
    if (hour < 0) {
      return 0;
    }
    return hour;
  }
  calTotalTime() {
    // 総時間数の更新
    this.timeTotalList['work'] = 0;
    this.timeTotalList['rest'] = 0;
    this.timeTotalList['p_work'] = 0;
    this.timeTotalList['p_rest'] = 0;
    this.reportDataset.forEach(function($item){
      this.timeTotalList['work'] += Number($item.work);
      this.timeTotalList['rest'] += Number($item.rest);
      this.timeTotalList['p_work'] += Number($item.p_work);
      this.timeTotalList['p_rest'] += Number($item.p_rest);
    }, this);
  }
  savePlanItem() {
    // 現在のデータを登録する
    let count = 0;
    const saveData = {};
    this.reportDataset.forEach(function ($record) {
      const item = {
        p_start: $record['p_start'],
        p_end: $record['p_end'],
        p_rest: $record['p_rest'],
        p_work: $record['p_work'],
        holiday: $record['holiday']
      };
      saveData[$record['id']] = item;
      count++;
    });
    if (count < 1) {
      alert('保存できるデータが存在しません。' + "\n" + '"予定開始","予定終了","予定除外"の全てが設定されているレコードが保存対象になります。');
      return;
    }
    localStorage.setItem('ss_plan-' + this.dateList['current_date'], JSON.stringify(saveData));
    alert('[' + this.dateList['current_date'] + ']の作業予定を保存しました。');
  }
  onCellChanged(e, args) {
    // 作業予定変更
    if (args.cell === 6 || args.cell === 7 || args.cell === 8) {
      const updatedItem = this.reportGridObj.gridService.getDataItemByRowNumber(args.row);
      if (args.cell === 6) {
        if (!this.formatCheckTime(args.item.p_start)) {
          updatedItem.p_start = '';
          this.reportGridObj.gridService.renderGrid();
          return;
        }
      }
      if (args.cell === 7) {
        if (!this.formatCheckTime(args.item.p_end)) {
          updatedItem.p_end = '';
          this.reportGridObj.gridService.renderGrid();
          return;
        }
      }
      let work = this.calWorkHour(updatedItem.p_start, updatedItem.p_end);
      let rest = Number(updatedItem.p_rest);
      if (!rest) {
        // 休憩時間のフォーマットが数字以外の場合は"0.00"に差し替え
        updatedItem.p_rest = '0.00';
        rest = 0;
      }
      updatedItem.p_rest = rest.toFixed(2);
      updatedItem.p_work = (work - rest).toFixed(2);
      this.reportGridObj.gridService.renderGrid();
      return;
    }
    if (args.cell === 9) {
      this.reportClassset[args.row] = this.createClassSet(args.item);
      this.styleSetting();
      this.reportGridObj.gridService.renderGrid();
      return;
    }
  }

  /**
   * 指定文字列の左に"0"を付与する
   * 結果の文字列は第二引数に指定した文字長になる
   * @param string $str ゼロ埋めする文字列
   * @param number $digits ゼロ埋め後の文字数
   * @returns ゼロ埋めした文字列
   */
  zeroFill($str, $digits) {
    return ('00000000000000000000' + $str).slice(-$digits);
  }

  /**
   * 時刻形式をチェックする
   * @param string $check 00:00のような形式の文字列
   * return チェック結果
   */
  formatCheckTime($check) {
    if (!$check.match(/^(0?[0-9]|1[0-9]|2[0-3]):(0?[0-9]|[1-5][0-9])$/)) {
      return false;
    }
    return true;
  }
  /**
   * 数字形式をチェックする
   * @param string $check 数字形式の文字列(0.00も可)
   * return チェック結果
   */
  formatCheckNumber($check) {
    const num = Number($check);
    if (num !== 0 && !num) {
      return false;
    }
    return true;
  }
}
