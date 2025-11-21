import { Component, Inject, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { createIcons, icons } from 'lucide';
import { PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Firestore, collection, collectionData } from '@angular/fire/firestore';
import { doc, docData } from '@angular/fire/firestore';
import { Observable, Subscription } from 'rxjs';
import { auth } from '../firebase-config';
import { signOut } from 'firebase/auth';
import { FirestoreModule } from '@angular/fire/firestore';
import { firstValueFrom } from 'rxjs';

interface PortafolioItem {
  nombre: string;
  foto: string;
  contacto: string;
}

@Component({
  selector: 'app-portafolio-prog',
  standalone: true,
  imports: [CommonModule, FormsModule, FirestoreModule],
  templateUrl: './portafolio-prog.html',
  styleUrl: './portafolio-prog.scss',
})

export class PortafolioProg implements OnInit, OnDestroy, AfterViewInit{

  items!: Observable<PortafolioItem[]>;
  portafoliosFirebase: PortafolioItem[] = [];
  resultados: PortafolioItem[] = [];
  private itemsSubscription!: Subscription;

  mostrarContenidoBuscar: boolean = false;
  mostrarContenido: boolean = false;
  text: string = '';

  usuarioActual: any = null;
  datosUsuario: any = null;

  constructor(
    private router: Router, 
    @Inject(PLATFORM_ID) private platformId: Object, 
    private firestore: Firestore
  ){}

  ngOnInit(): void {
    const itemsCollection = collection(this.firestore, 'programadores');
    this.items = collectionData(itemsCollection) as Observable<PortafolioItem[]>;
    this.obtenerUsuarioActual();
    this.obtenerDatosUsuario();

    this.itemsSubscription = this.items.subscribe(data => {
      this.portafoliosFirebase = data; 
      this.resultados = data;
    });
  }

  async obtenerUsuarioActual() {
    this.usuarioActual = auth.currentUser;

    
    if (!this.usuarioActual) {
      await new Promise(resolve => setTimeout(resolve, 300));
      this.usuarioActual = auth.currentUser;
    }

    this.usuarioActual;
  }

  
  async obtenerDatosUsuario() {
    if (!this.usuarioActual) return;

    const ref = doc(this.firestore, 'usuarios', this.usuarioActual.uid);

    this.datosUsuario = await firstValueFrom(
      docData(ref, { idField: 'id' })
    );

    this.usuarioActual;
  }

  ngOnDestroy(): void {
    if (this.itemsSubscription) {
      this.itemsSubscription.unsubscribe();
    }
  }

  cerrarSesion() {
    signOut(auth)
    .then(() => {
      console.log('Sesión cerrada correctamente');
      this.router.navigate(['/']);
    })
    .catch((error) => {
      console.error('Error al cerrar sesión:', error);
      alert('No se pudo cerrar sesión. Intente de nuevo.');
    });
  }

  inicio() {
    this.cerrarSesion();
  }

  funcionBuscar() {
    this.mostrarContenidoBuscar = true;
    this.mostrarContenido = true;
  }

  buscar() {
    const texto = this.text.toLowerCase().trim();
    this.resultados = this.portafoliosFirebase.filter(item =>
      item.nombre.toLowerCase().includes(texto) ||
      item.contacto.toLowerCase().includes(texto)
    );
  }


  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      createIcons({ icons });
    }
  }
}
