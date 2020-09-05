import { Injectable } from "@angular/core";

@Injectable()
export class FormatNumberService {
  constructor() {}

  formatNumberDecimals(value: number, decimals: number = 1): string {
    if (value != null) {
      return (Math.round(value * 100) / 100).toFixed(decimals);
    } else {
      return "";
    }
  }

  formatNumberPercentage(value: number): string {
    let number = this.formatNumberDecimals(value);
    if (Number(number) > 100) {
      return "100";
    } else {
      return number;
    }
  }

  formatNonZeroPositiveNumber(value: number): string {
    let number = this.formatNumberDecimals(value, 0);
    if (Number(number) <= 0) {
      return "1";
    } else {
      return number;
    }
  }

  fromCelsiusToFahrenheit(celsius: number) {
    return ((celsius * 9) / 5 + 32).toFixed(0);
  }

  fromFahrenheitToCelsius(fahrenheit: number) {
    return (((fahrenheit - 32) * 5) / 9).toFixed(0);
  }
}
