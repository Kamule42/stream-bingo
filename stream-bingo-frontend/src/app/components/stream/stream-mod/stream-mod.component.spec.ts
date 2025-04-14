import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StreamModComponent } from './stream-mod.component';

describe('StreamModComponent', () => {
  let component: StreamModComponent;
  let fixture: ComponentFixture<StreamModComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StreamModComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StreamModComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
