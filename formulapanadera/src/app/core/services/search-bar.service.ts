import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Injectable()
export class SearchBarService {

  constructor(
    private translateService: TranslateService
  ) { }

  // Searchs instruments
  searchMatchs(list: any[], key: string) {
    let pattern = new RegExp(key, "i")
    if (!key || key == '') {
 
      list.forEach(element => {
        element.hidden = false;
      })
    }
    else {

      list.forEach(element => {
        if (pattern.test(element.symbol)
          || pattern.test(element.name)
          || pattern.test(element.category)
          || pattern.test(element.subCategoty)
          || pattern.test(element.displayName)
          || pattern.test(element.instrument)
        ) {
          element.hidden = false;
        }
        else {
          element.hidden = true;
        }
      })
    }
    return list;
  }

  // Search faq
  searchFAQ(faqs: any [], key: string) {
    let pattern = new RegExp(key, "i")
    for (let index = 0; index < faqs.length; index++) {
      faqs[index].questions.forEach(element => {
        if (pattern.test(element['title-'+this.translateService.currentLang])) {
          element['hidden'] = false;
        }
        else {
          element['hidden'] = true;
        }
      });
      
    }
  }
}
