import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FindStreamComponent } from './find-stream.component';

describe('FindStreamComponent', () => {
  let component: FindStreamComponent;
  let fixture: ComponentFixture<FindStreamComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FindStreamComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FindStreamComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
