import { Component, Inject, OnInit  } from '@angular/core';
import { auth } from '../firebase-config';
import { signOut, onAuthStateChanged  } from 'firebase/auth';
import { Router } from '@angular/router';
import { createIcons, icons } from 'lucide';
import { PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { doc, docData, Firestore, updateDoc, setDoc, arrayUnion  } from '@angular/fire/firestore';
import { firstValueFrom, Observable } from 'rxjs';
import { FirestoreModule } from '@angular/fire/firestore';

interface DatosProgramador {
  nombre: string,
  contacto: string,
  especialidad: string,
  foto: string,
  descripcion: string,
  redes_sociales: any[]
};

interface ProgramadorFirestore {
  id?: string;
  nombre?: string;
  foto?: string;
  contacto?: string;
  especialidad?: string;
  descripcion?: string;
  redes_sociales?: any[];
}

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
  portafolioProgramador: boolean = false;
  modoEdicionGeneral: boolean = false;
  modoEdicionGeneral_editar: boolean = false;
  mostrarPortAca: boolean = false;
  mostrarPortProf: boolean = false;

  uid: string | null = null;

  usuarioActual: any = null;
  datosUsuario: any = null;

  datosProg: DatosProgramador = {
    nombre: "",
    contacto: "",
    foto: "",
    especialidad: "",
    descripcion: "",
    redes_sociales: []
  };

  redSocial = {
    nombre: "",
    icono: "",
    url: ""
  };

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
    await this.obtenerDatosProg();
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

  async obtenerDatosProg() {
    if (!this.usuarioActual) return;

    const ref = doc(this.firestore, 'programadores', this.usuarioActual.uid);

    const data = await firstValueFrom(
      docData(ref, { idField: 'id' }) as Observable<ProgramadorFirestore>
    );

    this.datosProg = {
      nombre: data?.nombre || "",
      contacto: data?.contacto || "",
      foto: data?.foto || "",
      especialidad: data?.especialidad || "",
      descripcion: data?.descripcion || "",
      redes_sociales: data?.redes_sociales || []
    };
  }
  

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      createIcons({ icons });
    }
  }

  agregarRed() {
    if (!this.redSocial.nombre || !this.redSocial.icono || !this.redSocial.url) {
      alert("Completa todos los campos");
      return;
    }

    const nuevaRed = { ...this.redSocial };

    const indexExistente = this.datosProg.redes_sociales.findIndex(
        red => red.icono === nuevaRed.icono
    );

    if (indexExistente !== -1) {
        this.datosProg.redes_sociales[indexExistente] = nuevaRed;
        alert(`Red social (${nuevaRed.icono}) actualizada localmente.`);
    } else {
        // 4. SI NO EXISTE (Agregar el nuevo objeto local)
        this.datosProg.redes_sociales.push(nuevaRed);
        alert(`Nueva red social (${nuevaRed.icono}) agregada localmente.`);
    }

    this.guardarEnFirestore(nuevaRed);

    this.redSocial = { nombre: "", icono: "", url: "" };
  }

  eliminarRed(index: number) {
    this.datosProg.redes_sociales.splice(index, 1);
  }

  async guardarEnFirestore(nuevaRed: any) {
    if (!this.usuarioActual) return;

    const userRef = doc(this.firestore, `programadores/${this.usuarioActual.uid}`);

    await setDoc(userRef, this.datosProg, { merge: true });

    alert("Datos guardados correctamente");
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
    this.portafolioProgramador = true;
    this.modoEdicionGeneral = true;
    this.mostrarContenidoBuscar = false;
    this.mostrarPortProf = false;
    this.mostrarPortAca = false;
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
    this.mostrarContenidoBuscar = false;
    this.portafolioProgramador = false;
    this.mostrarPortProf = false;
    this.mostrarPortAca = true;
  }

  portafoliosProf() {
    this.portProf = true;
    if (this.uid) {
      localStorage.setItem(`maletin_${this.uid}`, '1');
    }
    this.mostrarFuncionesPort = false;
    this.mostrarContenidoBuscar = false;
    this.portafolioProgramador = false;
    this.mostrarPortAca = false;
    this.mostrarPortProf = true;
  }

  alternarEdicion() {
    this.modoEdicion = !this.modoEdicion;
  }

  alternarEdicionPort() {
    this.modoEdicionGeneral = !this.modoEdicionGeneral;
  }

  async guardarPerfil() {
    if (!this.usuarioActual || !this.datosUsuario) return;

    try {
      const refUser = doc(this.firestore, 'usuarios', this.usuarioActual.uid);

      const nombre = this.datosUsuario.nombre?.trim() || '';
      const apellido = this.datosUsuario.apellido?.trim() || '';

      if (nombre.length < 2 || apellido.length < 2) {
        alert("Nombre y apellido deben tener al menos 2 caracteres.");
        return;
      }


      await updateDoc(refUser, {
        nombre,
        apellido
      });

      this.modoEdicion = false;

      console.log("Perfil actualizado correctamente");

    } catch (error) {
      console.error("Error al guardar perfil:", error);
      alert("No se pudieron guardar los cambios.");
    }
  }

  perfil(){
    this.portafolioProgramador = false;
    this.mostrarContenidoBuscar = !this.mostrarContenidoBuscar;
  }
}
