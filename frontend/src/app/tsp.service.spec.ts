import { TestBed } from '@angular/core/testing';

import { TSPService } from './tsp.service';

describe('TSPService', () => {
  let service: TSPService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TSPService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
