import { Injectable } from "@angular/core";

import * as moment from "moment";
import { interval } from "rxjs";
import { SPECIFIC_TIME_FORMAT, TIME_FORMAT } from "src/app/config/formats";
import { TimeModel } from "../models/production.model";

@Injectable()
export class TimeService {
  private time: Date;
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

  subtractTime(initial_date: Date, time: any, type: string): Date {
    return moment(initial_date).subtract(type, time).toDate();
  }

  formatTime(date: Date, format: string = TIME_FORMAT): string {
    return moment(date).format(format);
  }

  dateIsAfterNow(date: Date): boolean {
    return moment(date).isAfter(this.time, "minute");
  }

  dateIsBeforeNow(date: Date): boolean {
    return moment(date).isBefore(this.time, "minute");
  }

  dateIsSameOrAfterNow(date: Date): boolean {
    return moment(date).isSameOrAfter(this.time, "minute");
  }

  dateIsSameOrBeforeNow(date: Date): boolean {
    return moment(date).isSameOrBefore(this.time, "minute");
  }

  difference(start: Date, end: Date) {
    return moment.duration(moment(end).diff(start)).asMinutes();
  }

  differenceWithNow(date: Date) {
    return moment.duration(moment(this.time).diff(date)).asMinutes();
  }

  dateIsDifferentFromNow(date: Date) {
    return this.dateIsBeforeNow(date) || this.dateIsAfterNow(date);
  }

  private getMinutesOfDay(date: Date) {
    return moment(date).minutes() + moment(date).hours() * 60;
  }

  timeIsInRange(time: Date, range: TimeModel): boolean {
    range.start = moment(range.start).toDate();
    range.end = moment(range.end).toDate();

    // If hours cover different days
    if (range.start > range.end) {
      return (
        this.getMinutesOfDay(time) >= this.getMinutesOfDay(range.start) ||
        this.getMinutesOfDay(time) <= this.getMinutesOfDay(range.end)
      );
    } else {
      return (
        this.getMinutesOfDay(time) >= this.getMinutesOfDay(range.start) &&
        this.getMinutesOfDay(time) <= this.getMinutesOfDay(range.end)
      );
    }
  }

  fromMinutesToHours(total_minutes: number): {hours: number, minutes: number} {
    let hours: number = (total_minutes / 60) | 0
    let minutes: number = total_minutes - (hours*60)
    return {hours: hours, minutes: minutes};
  }
}
