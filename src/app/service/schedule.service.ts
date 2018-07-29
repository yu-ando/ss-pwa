import { Injectable } from '@angular/core';

@Injectable()
export class ScheduleService {

  constructor() { }

  /**
   * 開始時間と終了時間から作業時間数を算出して返却する
   * @param $start 開始時間(00:00)
   * @param $end 終了時間(00:00)
   * @returns number 作業時間
   */
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
   * 時刻形式の文字列をチェックしフォーマットする
   * @param string $check 00:00のような形式の文字列
   * return チェック結果
   */
  formatTimeString($check) {
    if (!$check.match(/^(0?[0-9]|1[0-9]|2[0-3]):(0?[0-9]?|[1-5][0-9])$/)) {
      return '';
    }
    const times = $check.split(':');
    return this.zeroFill(times[0], 2) + ':' + this.zeroFill(times[1], 2);
  }
  /**
   * 全角英数字と"："を半角に変換する
   * @param $str
   * @returns {any}
   */
  convertToHankaku($str) {
    return $str.replace(/[Ａ-Ｚａ-ｚ０-９：]/g, function(s) {
      return String.fromCharCode(s.charCodeAt(0) - 65248);
    });
  }
}
