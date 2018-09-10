import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ScheduleService } from '../../service/schedule.service';
import { ConfigService } from '../../service/config.service';
import { TranslateService } from '@ngx-translate/core';

import { SimpleModalService } from 'ngx-simple-modal';
import { HistoryModalComponent } from '../history-modal/history-modal.component';

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
  editorMode = '1';
  saveStateMsg = '';

  dateList = {};
  planData = {};
  planNoSetMsg = '';
  editorGridObj: AngularGridInstance;

  editorColumnDefinitions: Column[];
  editorGridOptions: GridOption;
  editorDataset: any[] = [];
  editorClassset: any[] = [];
  nextId: number;
  categoryList = {0: '業務内', 1: '休憩', 2: '業務外'};
  categoryFormatter: Formatter = (row: number, cell: number, value: any, columnDef: Column, dataContext: any, grid?: any) => this.categoryList[value];
  categoryTotalList = {0: 0, 1: 0, 2: 0};

  tagSetting = {};

  constructor(
      private router: Router,
      private activatedRoute: ActivatedRoute,
      private scheduleService: ScheduleService,
      private configService: ConfigService,
      private translate: TranslateService,
      private simpleModalService: SimpleModalService) {
    let year = 0;
    let month = 0;
    let day = 0;
    activatedRoute.params.subscribe(params => {
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
    this.dateList['current_year'] = this.scheduleService.zeroFill(current.getFullYear(), 4);
    this.dateList['current_month'] = this.scheduleService.zeroFill(current.getMonth() + 1, 2);
    this.dateList['current_day'] = this.scheduleService.zeroFill(current.getDate(), 2);
    this.dateList['current_weekday'] = dayNames[current.getDay()];
    this.dateList['current_date'] = this.dateList['current_year'] + '/' + this.dateList['current_month'] + '/' + this.dateList['current_day'];
    const pastday = new Date($year, $month - 1, $day - 1);
    this.dateList['past_year'] = this.scheduleService.zeroFill(pastday.getFullYear(), 4);
    this.dateList['past_month'] = this.scheduleService.zeroFill(pastday.getMonth() + 1, 2);
    this.dateList['past_day'] = this.scheduleService.zeroFill(pastday.getDate(), 2);
    this.dateList['past_weekday'] = dayNames[pastday.getDay()];
    this.dateList['past_date'] = this.dateList['past_year'] + '/' + this.dateList['past_month'] + '/' + this.dateList['past_day'];
    const nextday = new Date($year, $month - 1, $day + 1);
    this.dateList['next_year'] = this.scheduleService.zeroFill(nextday.getFullYear(), 4);
    this.dateList['next_month'] = this.scheduleService.zeroFill(nextday.getMonth() + 1, 2);
    this.dateList['next_day'] = this.scheduleService.zeroFill(nextday.getDate(), 2);
    this.dateList['past_weekday'] = dayNames[nextday.getDay()];
    this.dateList['next_date'] = this.dateList['next_year'] + '/' + this.dateList['next_month'] + '/' + this.dateList['next_day'];
  }
  // editor page, setup.
  ngOnInit() {
    this.initEditorColumnDefinitions();
    this.initEditorGridOptions();
    this.loadEditorData();
  }
  // change edit date.
  changeCurrentDate($year, $month, $day) {
    this.setDateList(Number($year), Number($month), Number($day));
    this.loadEditorData();
  }

  /* --------------------------------- *
   *  slickgrid option methods.
   * --------------------------------- */
  editorReady(angularGrid: AngularGridInstance) {
    this.editorGridObj = angularGrid;
    this.styleSetting();

    // @ts-ignore: AngularSlickgrid unsupported Slick.RowMoveManager
    var moveRowsPlugin = new window.Slick.RowMoveManager({
      cancelEditOnDrag: true
    });
    moveRowsPlugin.onBeforeMoveRows.subscribe(function (e, data) {
      for (var i = 0; i < data.rows.length; i++) {
        // no point in moving before or after itself
        if (data.rows[i] == data.insertBefore || data.rows[i] == data.insertBefore - 1) {
          e.stopPropagation();
          return false;
        }
      }
      return true;
    });
    var _self = this;
    moveRowsPlugin.onMoveRows.subscribe(function (e, args) {
      const selectedRowNum = args.rows[0];
      const insertBeforeCount = args.insertBefore;
      const target = _self.editorDataset[selectedRowNum];
      let movedDataset = [];
      for (var i = 0; i < _self.editorDataset.length; ++i) {
        if (i === selectedRowNum) {
          continue;
        }
        movedDataset.push(_self.editorDataset[i]);
        if ((i + 1) === insertBeforeCount) {
          movedDataset.push(target);
        }
      }
      _self.editorDataset = movedDataset;
      _self.editorGridObj.slickGrid.resetActiveCell();
      _self.editorGridObj.slickGrid.setData(_self.editorDataset);
      _self.editorGridObj.slickGrid.setSelectedRows(selectedRowNum);
      _self.editorGridObj.slickGrid.render();
    });
    this.editorGridObj.slickGrid.registerPlugin(moveRowsPlugin);

    this.editorGridObj.slickGrid.onDragInit.subscribe(function (e, dd) {
      // prevent the grid from cancelling drag'n'drop by default
      e.stopImmediatePropagation();
    });
  }
  initEditorColumnDefinitions() {
    // config load.
    this.tagSetting = this.configService.getTagSetting(true);
    this.editorMode = this.configService.getEditorMode();

    this.editorColumnDefinitions = [
      // @ts-ignore: AngularSlickgrid Column unsupported 'behavior'
      { id: '#', name: '', field: '', behavior: 'selectAndMove', width: 40, selectable: false, resizable: false, cssClass: 'cell-reorder dnd' },
      { id: 'start', name: '開始時間', field: 'start', sortable: true, minWidth: 60, maxWidth: 60, type: FieldType.string, editor: { model: Editors.text } },
      { id: 'end', name: '終了時間', field: 'end', sortable: true, minWidth: 60, maxWidth: 60, type: FieldType.string, editor: { model: Editors.text } },
      { id: 'hour', name: '時間数', field: 'hour', sortable: true, minWidth: 50, maxWidth: 50 },
      { id: 'category', name: '分類', field: 'category', minWidth: 100, maxWidth: 100, editor: {
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
      { id: 'tag1', name: this.tagSetting['tag1']['name'], field: 'tag1', minWidth: 125, maxWidth: 125, type: FieldType.string, editor: { model: Editors.text } },
      { id: 'tag2', name: this.tagSetting['tag2']['name'], field: 'tag2', minWidth: 125, maxWidth: 125, type: FieldType.string, editor: { model: Editors.text } },
      { id: 'tag3', name: this.tagSetting['tag3']['name'], field: 'tag3', minWidth: 125, maxWidth: 125, type: FieldType.string, editor: { model: Editors.text } },
      { id: 'memo', name: 'メモ', field: 'memo', minWidth: 50, type: FieldType.string, editor: { model: Editors.text } },
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
      forceFitColumns: true,
    };
  }
  changeAutoEdit() {
    if (this.editorGridObj.slickGrid.getOptions().autoEdit) {
      this.editorGridObj.slickGrid.setOptions({autoEdit: false});
    } else {
      this.editorGridObj.slickGrid.setOptions({autoEdit: true});
    }
  }
  loadEditorData() {
    const savedData = localStorage.getItem('ss_sc-' + this.dateList['current_date']);
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
    // style css reset.
    for (let idx in this.editorDataset) {
      this.editorClassset.push(this.createClassSet(this.editorDataset[idx]));
    }
    // grid reset.
    if (!!this.editorGridObj) {
      this.editorGridObj.gridService.resetGrid(this.editorColumnDefinitions);
      this.styleSetting();
    }
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
    const savedData = localStorage.getItem('ss_pl-' + this.dateList['current_year'] + '/' + this.dateList['current_month']);
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
  createClassSet($item) {
    return  {
      start: '',
      end: '',
      hour: '',
      category: '',
      tag1: '',
      tag2: '',
      tag3: '',
      memo: '',
    };
  }
  styleSetting() {
    // css_styleを設定
    this.editorGridObj.slickGrid.setCellCssStyles("", this.editorClassset);
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
        tag1: null,
        tag2: null,
        tag3: null,
        memo: null,
        del: null,
      };
      this.editorDataset.push(item);
      this.nextId += 1;
    }
  }
  onCellChanged(e, args) {
    if (args.cell === 1 || args.cell === 2) {
      const editRowItem = this.editorGridObj.gridService.getDataItemByRowNumber(args.row);
      if (args.cell === 1) { // 開始時間
        editRowItem.start = this.scheduleService.formatTimeString(this.scheduleService.convertToHankaku(args.item.start));
      }
      if (args.cell === 2) { // 終了時間
        editRowItem.end = this.scheduleService.formatTimeString(this.scheduleService.convertToHankaku(args.item.end));
        // 次の行の開始時間を変更する
        const nextRowItem = this.editorGridObj.gridService.getDataItemByRowNumber(args.row + 1);
        if (!!nextRowItem) {
          nextRowItem.start = editRowItem.end;
          if (!!nextRowItem.end) {
            nextRowItem.hour = this.scheduleService.calWorkHour(nextRowItem.start, nextRowItem.end).toFixed(2);
          }
        }
      }
      // 時間を計算し設定する
      const hour = this.scheduleService.calWorkHour(editRowItem.start, editRowItem.end).toFixed(2);
      if (editRowItem.hour !== hour) {
        editRowItem.hour = hour;
      }
    }
    // 総時間数の更新
    this.calTotalTime();
    // 再描画
    this.editorGridObj.gridService.renderGrid();

    // editorMode '2': realtime save.
    if (this.editorMode == '2') {
      this.saveScheduleItem(false);
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
  onCellClick(e, args) {
    // delete btn process.
    if (args.cell === 9) {
      const row = args.row;
      if (this.editorDataset.length > 1 && confirm("[行番号: " + (row + 1) + "] 削除しますか？")) {
        const deleteItem = this.editorGridObj.gridService.getDataItemByRowNumber(row);
        this.editorGridObj.gridService.deleteDataGridItemById(deleteItem.id);
        // 総時間数の更新
        this.calTotalTime();
      }
    }
  }
  saveScheduleItem($alertMsgFlg = true) {
    // 現在のデータを登録する
    const saveData = [];
    let count = 1;
    let lines = 0;
    let stopFlg = false;
    let alertMsgs = '';
    this.editorDataset.forEach(function ($record) {
      lines++;
      if (!!$record['start'] && !!$record['end']) {
        $record['id'] = count++;
        saveData.push($record);

        // データバリデーション
        if ($record['start'] >= $record['end']) {
          stopFlg = true;
          alertMsgs = alertMsgs + '[line.' + lines + '] 開始時間と終了時間が逆転もしくは同一になっています\n';
        }
        // 必須条件判定
        if (this.tagSetting['tag1']['require']) {
          if (!$record['tag1']) {
            stopFlg = true;
            alertMsgs = alertMsgs + '[line.' + lines + '] [必須条件エラー]"' + this.tagSetting['tag1']['name'] + '"を入力してください\n';
          }
        }
        if (this.tagSetting['tag2']['require']) {
          if (!$record['tag2']) {
            stopFlg = true;
            alertMsgs = alertMsgs + '[line.' + lines + '] [必須条件エラー]"' + this.tagSetting['tag2']['name'] + '"を入力してください\n';
          }
        }
        if (this.tagSetting['tag3']['require']) {
          if (!$record['tag3']) {
            stopFlg = true;
            alertMsgs = alertMsgs + '[line.' + lines + '] [必須条件エラー]"' + this.tagSetting['tag3']['name'] + '"を入力してください\n';
          }
        }
      }
    }, this);
    if (saveData.length < 1) {
      if ($alertMsgFlg) {
        alert('保存できるデータが存在しません。\n"開始時間"と"終了時間"の両方が設定されているレコードが保存対象になります。');
      }
      return;
    }
    if (stopFlg) {
      if ($alertMsgFlg) {
        alert('入力内容に不備があります。以下の内容を確認してください。\n' + alertMsgs);
      }
      return;
    }
    localStorage.setItem('ss_sc-' + this.dateList['current_date'], JSON.stringify(saveData));
    if ($alertMsgFlg) {
      // アラートメッセージ表示(editorMode='1')の場合のみデータを再セットする
      this.editorDataset = saveData;
      this.addBlankRow(1);
      alert('[' + this.dateList['current_date'] + ']の日報を保存しました。');
    } else {
      const date = new Date();
      this.saveStateMsg = '[' + date.toLocaleTimeString() + ']日報を保存しました';
    }
  }
  addEditorRow() {
    this.addBlankRow();
    const updatedItem = this.editorGridObj.gridService.getDataItemByRowNumber(0);
    if (!!updatedItem) {
      updatedItem.duration = 100;
      this.editorGridObj.gridService.updateDataGridItem(updatedItem);
    }
  }

  // 過去履歴参照モーダルの表示
  showHistoryModal() {
    this.simpleModalService.addModal(HistoryModalComponent, {
      scheduleDate: this.dateList['current_date'],
    })
    .subscribe((copySchedule) => {
      if (!copySchedule || copySchedule.length < 1) {
        return;
      }
      // 履歴コピー処理
      console.log(this.editorDataset);
      console.log(copySchedule);
      const copyMaxCount = copySchedule.length;
      let copyCount = 0;
      for (const idx in this.editorDataset) {
        const check = this.editorGridObj.gridService.getDataItemByRowNumber(Number(idx));
        if (!check.start && !check.end && !check.tag1 && !check.tag2 && !check.tag3 && !check.memo && check.category == 0) {
          check.category = copySchedule[copyCount].category;
          check.tag1 = copySchedule[copyCount].tag1;
          check.tag2 = copySchedule[copyCount].tag2;
          check.tag3 = copySchedule[copyCount].tag3;
          check.memo = copySchedule[copyCount].memo;
          if (++copyCount >= copyMaxCount) {
            break;
          }
        }
      }

      // から行がなかった場合、新規行として追加する TODO:未実装
      console.log('max: ' + copyMaxCount);
      console.log('now: ' + copyCount);
      for (;copyCount < copyMaxCount; ++copyCount) {
        this.addBlankRow();
        const check = this.editorGridObj.gridService.getDataItemByRowNumber(this.editorDataset.length);
        check.category = copySchedule[copyCount].category;
        check.tag1 = copySchedule[copyCount].tag1;
        check.tag2 = copySchedule[copyCount].tag2;
        check.tag3 = copySchedule[copyCount].tag3;
        check.memo = copySchedule[copyCount].memo;
      }
      // コピー要素がなくなるまで上書き挿入
      this.editorGridObj.gridService.renderGrid();
    });
  }
}
