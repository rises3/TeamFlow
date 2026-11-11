import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Statuses } from './statuses';

describe('Statuses', () => {
  let component: Statuses;
  let fixture: ComponentFixture<Statuses>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Statuses],
    }).compileComponents();

    fixture = TestBed.createComponent(Statuses);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
