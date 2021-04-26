import { Injectable } from "@angular/core";

import { DECIMALS } from "src/app/config/formats";

@Injectable()
export class FormatNumberService {
  constructor() { }
  
  formatStringToDecimals(value: string, decimals: number = 1): string {
    let number = 0;
    if (value) {
      value = value.replace(/[^0-9.,]/, '');
      value = value.replace(/[,]/, '.');
      var parts = value.split(".");
      if (parts[1] !== undefined)
        value = parts.slice(0, -1).join('') + "." + parts.slice(-1);
      number = Number(value)
      if (isNaN(number)) {
        return "";
      } else if (number < 1) {
        return (Math.round(number * 100) / 100).toFixed(2);
      } else {
        return (Math.round(number * 100) / 100).toFixed(decimals);
      }
    } else {
      return "";
    }
  }

  formatNumberFixedDecimals(value: number, decimals: number = 1): string {
    if (value != null) {
      if (value < 1) {
        return (Math.round(value * 100) / 100).toFixed(2);
      } else {
        return (Math.round(value * 100) / 100).toFixed(decimals);
      }
    } else {
      return "";
    }
  }

  formatNumberPercentage(value: number): string {
    let number = this.formatNumberFixedDecimals(value);
    if (Number(number) > 100) {
      return "100";
    } else {
      return number;
    }
  }

  formatNonZeroPositiveNumber(value: number): string {
    let number = this.formatNumberFixedDecimals(value, 0);
    if (Number(number) <= 0) {
      return "1";
    } else {
      return number;
    }
  }

  fromCelsiusToFahrenheit(celsius: number) {
    return ((celsius * 9) / 5 + 32).toFixed(DECIMALS.temperature);
  }

  fromFahrenheitToCelsius(fahrenheit: number) {
    return (((fahrenheit - 32) * 5) / 9).toFixed(DECIMALS.temperature);
  }
}
