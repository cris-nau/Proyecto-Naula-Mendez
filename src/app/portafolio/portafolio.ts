import { Component, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { createIcons, icons } from 'lucide';
import { PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';  


@Component({
  selector: 'app-portafolio',
  imports: [],
  templateUrl: './portafolio.html',
  styleUrl: './portafolio.scss',
})
export class Portafolio {

  constructor(private router: Router, @Inject(PLATFORM_ID) private platformId: Object){}

  currentYear: number = new Date().getFullYear();

  iniciarSesion() {
    this.router.navigate(['/inicio']);
  }

  inicio() {
    this.router.navigate(['/']);
  }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      createIcons({ icons });
    }
  }

}

