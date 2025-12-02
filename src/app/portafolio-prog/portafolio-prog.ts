import { Component, Inject, OnInit, OnDestroy, AfterViewInit, inject, runInInjectionContext, Injector } from '@angular/core';
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

  private injector = inject(Injector);
  private firestore = inject(Firestore);

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
    @Inject(PLATFORM_ID) private platformId: Object
  ){}

  ngOnInit(): void {
    runInInjectionContext(this.injector, () => {
      const itemsCollection = collection(this.firestore, 'programadores');
      this.items = collectionData(itemsCollection) as Observable<PortafolioItem[]>;

      this.itemsSubscription = this.items.subscribe(data => {
        this.portafoliosFirebase = data; 
        this.resultados = data;
      });
    });

    this.obtenerUsuarioActual().then(() => this.obtenerDatosUsuario());
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

    const { ref } = await runInInjectionContext(this.injector, async () => {
        const uRef = doc(this.firestore, "usuarios", this.usuarioActual.uid);
        return { ref: uRef};
    });

    this.datosUsuario = await runInInjectionContext(this.injector, async () => {
      const ref = doc(this.firestore, 'usuarios', this.usuarioActual.uid);
      return firstValueFrom(docData(ref, { idField: 'id' }));
    });

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
