import { TestBed } from '@angular/core/testing';

import { HowToService } from './how-to.service';

describe('HowToService', () => {
  let service: HowToService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HowToService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
