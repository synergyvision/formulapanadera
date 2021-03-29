import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { FaqService } from 'src/app/core/services/faq.service';
import { Plugins } from '@capacitor/core';
const { Browser } = Plugins;

@Component({
  selector: 'app-answer',
  templateUrl: './answer.component.html',
  styleUrls: ['./answer.component.scss'],
})
export class AnswerComponent implements OnInit {

  answer: string;
  answerObject: any;

  constructor(
    private router: Router,
    private faqService: FaqService,
    public translateService: TranslateService,
  ) {
    this.answer = this.router.getCurrentNavigation().extras.state.data;
  }

  ngOnInit() {
    this.faqService.getAnswer(this.answer).subscribe(
      (answer) => {        
        this.answerObject = answer;        
      }
    )
  }

  openLink() {
    Browser.open({
      url: this.answerObject.link,
      windowName: '_system'}
    );
  }

}
