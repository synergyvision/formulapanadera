import { Injectable } from "@angular/core";

import * as moment from "moment";
import { interval } from "rxjs";
import { SPECIFIC_TIME_FORMAT, TIME_FORMAT } from "src/app/config/formats";

@Injectable()
export class TimeService {
  time: Date;
  constructor() {}

  currentDate(): Date {
    return new Date();
  }

  startCurrentTime(): void {
    if (!this.time) {
      this.time = new Date();
    }
    interval(1000).subscribe(() => {
      this.time = this.addTime(this.time, 1, "s");
    });
  }

  getCurrentTime(): string {
    return this.formatTime(this.time, SPECIFIC_TIME_FORMAT);
  }

  addTime(initial_date: Date, time: any, type: string): Date {
    return moment(initial_date).add(type, time).toDate();
  }

  formatTime(date: Date, format: string = TIME_FORMAT): string {
    return moment(date).format(format);
  }

  dateIsAfterNow(date: Date): boolean {
    return moment(date).isAfter(this.time, "minute");
  }
}
