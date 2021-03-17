import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Plugins } from '@capacitor/core';
import { ContactService } from 'src/app/core/services/contact.service';

const { Browser } = Plugins;

@Component({
  selector: 'app-contact',
  templateUrl: './contact.page.html',
  styleUrls: ['./contact.page.scss'],
})
export class ContactPage implements OnInit {

  // Contact info
  contact: any;

  userEmail: string;

  // Subscriptions
  afSubscription: Subscription;
  contactSubscription: Subscription;

  // Pages' banner
  banner: any[] = [];
  bannerSubscription: Subscription;

  constructor(
    private contactService: ContactService
  ) { }

  ngOnInit() {
    this.contactSubscription = this.contactService.getAllContact().subscribe(
      (contact) => {
        this.contact = contact;
      }
    )
  }


  ngOnDestroy() {
    this.contactSubscription.unsubscribe();
  }

  /* Send email */
  sendEmail(recipient: string) {
    /**/
    // let email: EmailComposerOptions = {
    //   from: this.userEmail, // IOS only
    //   to: recipient,
    //   cc: '', // email addresses for CC field
    //   bcc: '', // email addresses for BCC field
    //   attachments: [], // file paths or base64 data streams
    //   subject: '', // subject of the email
    //   body: '', // email body (for HTML, set isHtml to true)
    //   isHtml: false, // indicats if the body is HTML or plain text
    // } as EmailComposerOptions
    // this.emailComposer.open(email)
  }

  // Send by whatsapp
  openWhatsapp(reciver: string) {
    Browser.open({
      url: 'https://wa.me/'+reciver,
      windowName: '_system'
    });
  }

}
