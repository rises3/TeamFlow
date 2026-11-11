import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Checklistitems } from './checklistitems';

describe('Checklistitems', () => {
  let component: Checklistitems;
  let fixture: ComponentFixture<Checklistitems>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Checklistitems],
    }).compileComponents();

    fixture = TestBed.createComponent(Checklistitems);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
