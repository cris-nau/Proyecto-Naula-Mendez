import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PortafolioProg } from './portafolio-prog';

describe('PortafolioProg', () => {
  let component: PortafolioProg;
  let fixture: ComponentFixture<PortafolioProg>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PortafolioProg]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PortafolioProg);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
