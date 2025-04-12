import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StreamHeaderComponent } from './stream-header.component';

describe('StreamHeaderComponent', () => {
  let component: StreamHeaderComponent;
  let fixture: ComponentFixture<StreamHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StreamHeaderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StreamHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
