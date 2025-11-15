import { Component, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { createIcons, icons } from 'lucide';
import { CommonModule } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';  

@Component({
  selector: 'app-portafolio-prog',
  imports: [],
  templateUrl: './portafolio-prog.html',
  styleUrl: './portafolio-prog.scss',
})
export class PortafolioProg {

  constructor(private router: Router, @Inject(PLATFORM_ID) private platformId: Object){}

  cerrarSesion() {
    this.router.navigate(['/portafolio']);
  }

  inicio() {
    this.cerrarSesion();
  }

  buscar() {
    this.cerrarSesion();
  }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      createIcons({ icons });
    }
  }
}
