import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IonSearchbar } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { FaqService } from 'src/app/core/services/faq.service';
import { SearchBarService } from 'src/app/core/services/search-bar.service';

@Component({
  selector: 'app-faq',
  templateUrl: './faq.page.html',
  styleUrls: ['./faq.page.scss'],
})
export class FaqPage implements OnInit {

  // Search bar
  @ViewChild('searchBar', {static: false}) searchBar: IonSearchbar;

  // faqs categories
  faqs: any[];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    public translateService: TranslateService,
    private searchService: SearchBarService,
    private faqService: FaqService
  ) { }

  ngOnInit() {
    this.faqService.getFAQs().subscribe(
      (faqs) => {
        this.faqs = faqs.faq.categories;

        for (let index = 0; index < this.faqs.length; index++) {
          this.faqs[index] = Object.values(this.faqs[index])[0]
        }        
      }
    )
  }

  search() {
    this.searchService.searchFAQ(this.faqs, this.searchBar.value)
  }

  goToAnswer(answer: string) {
    this.router.navigate(['./answer'], {relativeTo: this.route, state: {data: answer}})
  }

  allHidden(faq: any) {
    return faq.questions.every((element) => { return element['hidden'] == true })
  }

}
