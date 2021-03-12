import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { FlashcardsSetsDetailsComponent } from './flashcards-sets-details.component';

describe('FlashcardsSetsDetailsComponent', () => {
  let component: FlashcardsSetsDetailsComponent;
  let fixture: ComponentFixture<FlashcardsSetsDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FlashcardsSetsDetailsComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(FlashcardsSetsDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
