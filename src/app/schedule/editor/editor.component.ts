import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ScheduleService } from '../../service/schedule.service';
import { TranslateService } from '@ngx-translate/core';

import {
  AngularGridInstance,
  Column,
  EditorValidator,
  Editors,
  FieldType,
  Filters,
  Formatters,
  GridOption,
  OnEventArgs,
  OperatorType,
  Formatter
} from 'angular-slickgrid';

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.scss']
})
export class EditorComponent implements OnInit {
  private schedule: ScheduleService;

  private dateList = {};
  private planData = {};
  private planNoSetMsg = '';
  private editorGridObj: AngularGridInstance;

  private editorColumnDefinitions: Column[];
  private editorGridOptions: GridOption;
  private editorDataset: any[] = [];
  private nextId: number;
  private categoryList = {0: '業務内', 1: '休憩', 2: '業務外'};
  private categoryFormatter: Formatter = (row: number, cell: number, value: any, columnDef: Column, dataContext: any, grid?: any) => this.categoryList[value];
  private categoryTotalList = {0: 0, 1: 0, 2: 0};

  private viewerGridObj: AngularGridInstance;
  viewerColumnDefinitions: Column[];
  viewerGridOptions: GridOption;
  viewerDataset: any[] = [];

  constructor(private router: Router, ar: ActivatedRoute, private sc: ScheduleService, private translate: TranslateService) {
    this.schedule = sc;
    let year = 0;
    let month = 0;
    let day = 0;
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
      if (!!params['day']) {
        day = Number(params['day']);
      } else {
        day = new Date().getDate();
      }
    });
    this.setDateList(year, month, day);
  }
  setDateList($year, $month, $day) {
    const dayNames = '日月火水木金土';
    const current = new Date($year, $month - 1, $day);
    this.dateList['current_year'] = current.getFullYear();
    this.dateList['current_month'] = current.getMonth() + 1;
    this.dateList['current_day'] = current.getDate();
    this.dateList['current_weekday'] = dayNames[current.getDay()];
    this.dateList['current_date'] = this.dateList['current_year'] + '/' + this.dateList['current_month'] + '/' + this.dateList['current_day'];
    const pastday = new Date($year, $month - 1, $day - 1);
    this.dateList['past_year'] = pastday.getFullYear();
    this.dateList['past_month'] = pastday.getMonth() + 1;
    this.dateList['past_day'] = pastday.getDate();
    this.dateList['past_weekday'] = dayNames[pastday.getDay()];
    this.dateList['past_date'] = this.dateList['past_year'] + '/' + this.dateList['past_month'] + '/' + this.dateList['past_day'];
    const nextday = new Date($year, $month - 1, $day + 1);
    this.dateList['next_year'] = nextday.getFullYear();
    this.dateList['next_month'] = nextday.getMonth() + 1;
    this.dateList['next_day'] = nextday.getDate();
    this.dateList['past_weekday'] = dayNames[nextday.getDay()];
    this.dateList['next_date'] = this.dateList['next_year'] + '/' + this.dateList['next_month'] + '/' + this.dateList['next_day'];
  }
  // editor page, setup.
  ngOnInit() {
    this.initEditorColumnDefinitions();
    this.initEditorGridOptions();
    this.loadEditorData();
    // this.initViewerColumnDefinitions();
    // this.initViewerGridOptions();
    // this.loadViewerData(this.dateList['past_date']);
  }
  // change edit date.
  changeCurrentDate($year, $month, $day) {
    this.setDateList($year, $month, $day);
    this.loadEditorData();
    // this.loadViewerData(this.dateList['past_date']);
  }

  /* --------------------------------- *
   *  slickgrid option methods.
   * --------------------------------- */
  editorReady(angularGrid: AngularGridInstance) {
    this.editorGridObj = angularGrid;
  }
  viewerReady(angularGrid: AngularGridInstance) {
    this.viewerGridObj = angularGrid;
  }
  initEditorColumnDefinitions() {
    this.editorColumnDefinitions = [
      { id: 'start', name: '開始時間', field: 'start', sortable: true, minWidth: 80, maxWidth: 80, type: FieldType.string, editor: { model: Editors.text } },
      { id: 'end', name: '終了時間', field: 'end', sortable: true, minWidth: 80, maxWidth: 80, type: FieldType.string, editor: { model: Editors.text } },
      { id: 'hour', name: '時間数', field: 'hour', sortable: true, minWidth: 70, maxWidth: 70 },
      { id: 'category', name: '分類', field: 'category', sortable: true, minWidth: 100, maxWidth: 100, editor: {
          model: Editors.singleSelect,
          collection: Object.keys(this.categoryList).map(k => ({value: k, label: this.categoryList[k]})),
          collectionSortBy: {
            property: 'value',
            sortDesc: false
          },
        },
        formatter: this.categoryFormatter,
        params: this.categoryList,
      },
      { id: 'type', name: '種別', field: 'type', sortable: true, minWidth: 100, editor: { model: Editors.text } },
      { id: 'task', name: 'タスク名', field: 'task', sortable: true, minWidth: 100, type: FieldType.string, editor: { model: Editors.text } },
      { id: 'memo', name: 'メモ', field: 'memo', sortable: true, minWidth: 100, type: FieldType.string, editor: { model: Editors.longText } },
      { id: 'del', name: '', field: '', cssClass: 'del_btn_col', minWidth: 30, maxWidth: 30, focusable: false,
        formatter: function () { return '<button type="button" class="del_btn btn btn-outline-secondary">×</button>'; } }
    ];
  }
  initEditorGridOptions() {
    this.editorGridOptions = {
      i18n: this.translate,
      enableAutoResize: true,
      asyncEditorLoading: false,
      editable: true,
      autoHeight: false,

      autoEdit: true,
      enableCellNavigation: true,
      enableColumnPicker: false,

      enableExcelCopyBuffer: true,
      showHeaderRow: false,
      enableGridMenu: false,
      enableSorting: true,
      enableHeaderMenu: false,
      enableHeaderButton: false,
      enableRowSelection: true,
      enableAddRow: false,
    };
  }
  changeAutoEdit() {
    if (this.editorGridObj.slickGrid.getOptions().autoEdit) {
      this.editorGridObj.slickGrid.setOptions({autoEdit: false});
    } else {
      this.editorGridObj.slickGrid.setOptions({autoEdit: true});
    }
  }
  initViewerColumnDefinitions() {
    this.viewerColumnDefinitions = [
      { id: 'start', name: '開始時間', field: 'start', sortable: true, minWidth: 80, type: FieldType.string, editor: { model: Editors.text } },
      { id: 'end', name: '終了時間', field: 'end', sortable: true, minWidth: 80, type: FieldType.string, editor: { model: Editors.text } },
      { id: 'hour', name: '時間数', field: 'hour', sortable: true, minWidth: 80 },
      { id: 'category', name: '分類', field: 'category', sortable: true, minWidth: 100, editor: {
          model: Editors.singleSelect,
          collection: Object.keys(this.categoryList).map(k => ({value: k, label: this.categoryList[k]})),
          collectionSortBy: {
            property: 'value',
            sortDesc: false
          },
        },
        formatter: this.categoryFormatter,
        params: this.categoryList,
      },
      { id: 'type', name: '種別', field: 'type', sortable: true, minWidth: 100, editor: { model: Editors.text } },
      { id: 'task', name: 'タスク名', field: 'task', sortable: true, minWidth: 100, type: FieldType.string, editor: { model: Editors.text } },
      { id: 'memo', name: 'メモ', field: 'memo', sortable: true, minWidth: 100, type: FieldType.string, editor: { model: Editors.longText } },
    ];
  }
  initViewerGridOptions() {
    this.viewerGridOptions = {
      enableAutoResize: true,
      asyncEditorLoading: false,
      editable: true,
      autoEdit: true,
      autoHeight: false,
      enableCellNavigation: true,
      enableColumnPicker: true,
      enableExcelCopyBuffer: true,
      i18n: this.translate,
      showHeaderRow: false,
      enableGridMenu: false,
      enableSorting: true,
      enableHeaderMenu: false,
      enableHeaderButton: false,
      enableRowSelection: true,
    };
  }
  loadEditorData() {
    // grid再描画の場合のみ
    if (!!this.editorGridObj) {
      this.editorGridObj.gridService.resetGrid(this.editorColumnDefinitions);
    }
    const savedData = localStorage.getItem('ss_' + this.dateList['current_date']);
    let result = [];
    if (savedData !== null) {
      try {
        result = JSON.parse(savedData);
      } catch ($e) {
        console.log($e);
      }
    }
    this.editorDataset = result;
    this.nextId = 1 + this.editorDataset.length;
    // 未登録の場合は、基本要素を表示
    if (this.nextId === 1) {
      this.addBlankRow(10);
    }
    // 総時間数の更新
    this.calTotalTime();
    // 作業予定情報の取得
    this.loadCurrentPlanData();
  }

  /**
   * 現在のカレント日付の作業予定情報を取得する
   *  p_start: 作業開始予定時間,
   *  p_end: 作業終了予定時間,
   *  p_work: 作業予定時間数,
   *  p_rest: 除外予定時間数
   */
  loadCurrentPlanData() {
    let planLoadFlg = false;
    const savedData = localStorage.getItem('ss_plan-' + this.dateList['current_year'] + '/' + this.dateList['current_month']);
    if (savedData !== null) {
      try {
        const result = JSON.parse(savedData);
        if (!!result[this.dateList['current_date']]) {
          this.planData = result[this.dateList['current_date']];
          this.planNoSetMsg = '';
          planLoadFlg = true;
        }
      } catch ($e) {
        console.log($e);
      }
    }
    if (!planLoadFlg) {
      this.planData = {
        p_start: '-',
        p_end: '-',
        p_work: '-',
        p_rest: '-',
        holiday: 0
      };
      this.planNoSetMsg = ' ＞＞作業予定を月次集計ページで設定してください。';
    }
  }
  loadViewerData($datakey) {
    const savedData = localStorage.getItem('ss_' + $datakey);
    let result = [];
    if (savedData !== null) {
      try {
        result = JSON.parse(savedData);
      } catch ($e) {
        console.log($e);
      }
    }
    this.viewerDataset = result;
    // grid再描画の場合のみ
    if (!!this.viewerGridObj) {
      this.viewerGridObj.gridService.renderGrid();
    }
  }
  addBlankRow(addcount: number = 1) {
    const lastItem = this.editorDataset.pop(); // 末尾要素を取り出し
    const lastId = !!lastItem ? lastItem['id'] : 0;
    if (lastId !== 0) {
      this.editorDataset.push(lastItem); // 要素が存在した場合は戻す
    }
    // 指定行数分、基本要素を追加する
    for (let count = 1; count <= addcount; count++) {
      const item = {
        id: this.nextId,
        start: null,
        end: null,
        hour: '0.00',
        category: 0,
        type: null,
        task: null,
        memo: null,
        del: null,
      };
      this.editorDataset.push(item);
      this.nextId += 1;
    }
  }
  onCellChanged(e, args) {
    let updateFlg = false;

    // end time to next start.
    if (args.cell === 1) {
      const end = this.editorDataset[args.row]['end'];
      const updatedItem = this.editorGridObj.gridService.getDataItemByRowNumber(args.row + 1);
      if (!!updatedItem) {
        updatedItem.start = end;
        if (!!updatedItem.end) {
          updatedItem.hour = this.calWorkHour(updatedItem.start, updatedItem.end).toFixed(2);
        }
        updateFlg = true;
      }
    }
    // 時間を計算し設定する
    const hour = this.calWorkHour(this.editorDataset[args.row]['start'], this.editorDataset[args.row]['end']).toFixed(2);
    if (this.editorDataset[args.row]['hour'] !== hour) {
      this.editorDataset[args.row]['hour'] = hour;
      updateFlg = true;
    }
    // 総時間数の更新
    this.calTotalTime();
    // 更新がある場合は再レンダリングする
    if (updateFlg) {
      this.editorGridObj.gridService.renderGrid();
    }
  }
  calTotalTime() {
    // 総時間数の更新
    for (let idx in this.categoryTotalList) {
      this.categoryTotalList[idx] = 0;
    }
    this.editorDataset.forEach(function($item){
      if (!this.categoryList[$item.category]) {
        return;
      }
      this.categoryTotalList[$item.category] += Number($item.hour);
    }, this);
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
  onCellClick(e, args) {
    // delete btn process.
    if (args.cell === 7) {
      const row = args.row;
      if (this.editorDataset.length > 1 && confirm("[行番号: " + (row + 1) + "] 削除しますか？")) {
        const deleteItem = this.editorGridObj.gridService.getDataItemByRowNumber(row);
        this.editorGridObj.gridService.deleteDataGridItemById(deleteItem.id);
        // 総時間数の更新
        this.calTotalTime();
      }
    }
  }
  saveScheduleItem() {
    // 現在のデータを登録する
    const saveData = [];
    let count = 1;
    this.editorDataset.forEach(function ($record) {
      if (!!$record['start'] && !!$record['end']) {
        $record['id'] = count++;
        saveData.push($record);
      }
    });
    if (saveData.length < 1) {
      alert('保存できるデータが存在しません。' + "\n" + '"開始時間"と"終了時間"の両方が設定されているレコードが保存対象になります。');
      return;
    }
    this.editorDataset = saveData;
    localStorage.setItem('ss_' + this.dateList['current_date'], JSON.stringify(saveData));
    this.addBlankRow(1);
    alert('[' + this.dateList['current_date'] + ']の日報を保存しました。');
  }
  addEditorRow() {
    this.addBlankRow();
    const updatedItem = this.editorGridObj.gridService.getDataItemByRowNumber(0);
    if (!!updatedItem) {
      updatedItem.duration = 100;
      this.editorGridObj.gridService.updateDataGridItem(updatedItem);
    }
  }
}
