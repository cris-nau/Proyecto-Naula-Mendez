import { Component, Inject, OnInit  } from '@angular/core';
import { auth } from '../firebase-config';
import { signOut, onAuthStateChanged  } from 'firebase/auth';
import { Router } from '@angular/router';
import { createIcons, icons } from 'lucide';
import { PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { doc, docData, Firestore } from '@angular/fire/firestore';
import { firstValueFrom } from 'rxjs';
import { FirestoreModule } from '@angular/fire/firestore';

@Component({
  selector: 'app-programador-pagina',
  imports: [CommonModule, FormsModule, FirestoreModule],
  templateUrl: './programador-pagina.html',
  styleUrl: './programador-pagina.scss',
})
export class ProgramadorPagina implements OnInit {

  eliminarEspacios: boolean = true;
  mostrarFuncionesPort: boolean = false;
  mostrarContenidoBuscar: boolean = false;
  mostrarContenido: boolean = false;
  portAca: boolean = false;
  portProf: boolean = false;
  portA:boolean = false;
  iconoSeleccionado: string | null = null;
  modoEdicion: boolean = false;

  uid: string | null = null;

  usuarioActual: any = null;
  datosUsuario: any = null;

  constructor(private router: Router, @Inject(PLATFORM_ID) private platformId: Object, private firestore: Firestore){
    if (isPlatformBrowser(this.platformId)) {
      onAuthStateChanged(auth, (user) => {
        if (user) {
          this.uid = user.uid;
          
          const micro = localStorage.getItem(`microscopio_${this.uid}`);
          const maletin = localStorage.getItem(`maletin_${this.uid}`);

          if (micro === '1') this.portAca = true;
          if (maletin === '1') this.portProf = true;
        }
      });
    }
  }

  async ngOnInit() {
    this.mostrarContenidoBuscar = true;
    await this.obtenerUsuarioActual();
    await this.obtenerDatosUsuario();
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

    this.datosUsuario;
  }
  

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      createIcons({ icons });
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

  portafolios() {
    this.mostrarFuncionesPort = !this.mostrarFuncionesPort;
    this.eliminarEspacios = false;
    if (this.mostrarFuncionesPort) {
             setTimeout(() => { 
                if (isPlatformBrowser(this.platformId)) {
                    createIcons({ icons });
                }
      }, 0); 
    }
  }

  portafoliosAca() {
    this.portAca = true;
    if (this.uid) {
      localStorage.setItem(`microscopio_${this.uid}`, '1');
    }
    this.mostrarFuncionesPort = false;
  }

  portafoliosProf() {
    this.portProf = true;
    if (this.uid) {
      localStorage.setItem(`maletin_${this.uid}`, '1');
    }
    this.mostrarFuncionesPort = false;
  }

  alternarEdicion() {
    this.modoEdicion = !this.modoEdicion;
  }

  guardarPerfil() {
    console.log("Guardando cambios...");
    this.modoEdicion = false; 
  }

  crear(){

  }

  perfil(){
    this.mostrarContenidoBuscar = !this.mostrarContenidoBuscar;
  }
}
