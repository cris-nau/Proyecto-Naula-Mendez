import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-portafolio',
  imports: [],
  templateUrl: './portafolio.html',
  styleUrl: './portafolio.scss',
})
export class Portafolio {

  constructor(private router: Router){}

  explorar() {
    this.router.navigate(['/portafolioProg']);
  }

  cerrarSesion() {
    this.router.navigate(['/inicio']);
  }

}
