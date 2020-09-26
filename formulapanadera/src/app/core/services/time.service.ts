import { Injectable } from "@angular/core";

import * as moment from "moment";
import { TIME_FORMAT } from "src/app/config/formats";

@Injectable()
export class TimeService {
  constructor() {}

  currentDate(): Date {
    return new Date();
  }

  addTime(initial_date: Date, time: any, type: string): Date {
    return moment(initial_date).add(type, time).toDate();
  }

  formatTime(date: Date): string {
    return moment(date).format(TIME_FORMAT);
  }
}
