import { Component, Inject, OnInit, PLATFORM_ID, inject, Injector } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { auth } from '../firebase-config'; 
import { signOut, onAuthStateChanged, createUserWithEmailAndPassword } from 'firebase/auth';
import { 
  Firestore, 
  collection, 
  collectionData, 
  doc, 
  docData, 
  updateDoc, 
  addDoc, 
  deleteDoc, 
  setDoc,
  query
} from '@angular/fire/firestore';
import { FirestoreModule } from '@angular/fire/firestore';

import { firstValueFrom, Observable } from 'rxjs';
import { runInInjectionContext } from '@angular/core';

import { createIcons, icons } from 'lucide';

interface Horario {
  dia: string;
  horaInicio: string;
  horaFin: string;
}

interface Programador {
  id?: string;
  nombre: string;
  apellido: string;
  email: string;
  password?: string; 
  especialidad: string;
  foto: string;
  activo: boolean;
  horarios: Horario[];
  descripcion?: string; 
}

interface AdminData {
  nombre: string;
  email: string;
}

@Component({
  selector: 'app-administrador-pagina',
  imports: [CommonModule, FormsModule, FirestoreModule],
  templateUrl: './administrador-pagina.html',
  styleUrl: './administrador-pagina.scss',
})
export class AdministradorPagina {
mostrarListaProgramadores: boolean = true;
  modoEdicionProgramador: boolean = false;
  mostrarPerfilAdmin: boolean = false;

  uidAdmin: string | null = null;
  datosAdmin: AdminData = { nombre: 'Administrador', email: '' };
  
  listaProgramadores: any[] = [];

  programadorSeleccionado: Programador = {
    nombre: '',
    apellido: '',
    email: '',
    especialidad: '',
    foto: '',
    activo: true,
    horarios: []
  };

  nuevoHorario: Horario = {
    dia: 'Lunes',
    horaInicio: '',
    horaFin: ''
  };

  private firestore = inject(Firestore);
  private injector = inject(Injector);

  constructor(
    private router: Router, 
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    if (isPlatformBrowser(this.platformId)) {
      onAuthStateChanged(auth, (user) => {
        if (user) {
          this.uidAdmin = user.uid;
          this.datosAdmin.email = user.email || '';
          this.cargarProgramadores(); 
        } else {
          this.router.navigate(['/']); 
        }
      });
    }
  }

  ngAfterViewInit(): void {
    this.refrescarIconos();
  }

  refrescarIconos() {
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => {
        createIcons({ icons });
      }, 100);
    }
  }

  

  inicioAdmin() {
    this.verGestionProgramadores();
  }

  verGestionProgramadores() {
    this.mostrarListaProgramadores = true;
    this.modoEdicionProgramador = false;
    this.mostrarPerfilAdmin = false;
    this.cargarProgramadores();
    this.refrescarIconos();
  }

  crearProgramador() {
    this.limpiarFormulario();
    this.mostrarListaProgramadores = false;
    this.modoEdicionProgramador = true;
    this.mostrarPerfilAdmin = false;
    this.refrescarIconos();
  }

  perfilAdmin() {
    this.mostrarListaProgramadores = false;
    this.modoEdicionProgramador = false;
    this.mostrarPerfilAdmin = true;
    this.refrescarIconos();
  }


  async cargarProgramadores() {
    await runInInjectionContext(this.injector, async () => {
      const colRef = collection(this.firestore, 'programadores');
      const consulta = query(colRef);
      
      this.listaProgramadores = await firstValueFrom(
        collectionData(consulta, { idField: 'id' })
      );
    });
  }

  editarProgramador(prog: any) {
    this.programadorSeleccionado = JSON.parse(JSON.stringify(prog));

    if (!this.programadorSeleccionado.horarios) {
      this.programadorSeleccionado.horarios = [];
    }

    this.mostrarListaProgramadores = false;
    this.modoEdicionProgramador = true;
    this.refrescarIconos();
  }

  async guardarCambiosProgramador() {
    if (!this.programadorSeleccionado.nombre || !this.programadorSeleccionado.email) {
      alert("Nombre y Email son obligatorios.");
      return;
    }

    try {
      const datosAGuardar = {
        nombre: this.programadorSeleccionado.nombre,
        apellido: this.programadorSeleccionado.apellido,
        email: this.programadorSeleccionado.email,
        especialidad: this.programadorSeleccionado.especialidad,
        horarios: this.programadorSeleccionado.horarios,
        activo: true 
      };

      if (this.programadorSeleccionado.id) {
        const docRef = doc(this.firestore, `programadores/${this.programadorSeleccionado.id}`);
        await updateDoc(docRef, datosAGuardar);
        alert("Programador actualizado correctamente.");
      } else {
        
        const colRef = collection(this.firestore, 'programadores');
        await addDoc(colRef, {
            ...datosAGuardar,
            fechaRegistro: new Date()
        });
        
        alert("Programador registrado en la base de datos.");
      }

      this.verGestionProgramadores(); 

    } catch (error) {
      console.error("Error al guardar programador:", error);
      alert("Error al guardar los datos.");
    }
  }

  async eliminarProgramador(prog: any) {
    if (!confirm(`¿Estás seguro de eliminar a ${prog.nombre}? Esta acción no se puede deshacer.`)) {
      return;
    }

    try {
      const docRef = doc(this.firestore, `programadores/${prog.id}`);
      await deleteDoc(docRef);
      alert("Programador eliminado.");
      this.cargarProgramadores();
    } catch (error) {
      console.error("Error al eliminar:", error);
      alert("Error al eliminar el usuario.");
    }
  }

  cancelarEdicion() {
    this.verGestionProgramadores();
  }

  limpiarFormulario() {
    this.programadorSeleccionado = {
      nombre: '',
      apellido: '',
      email: '',
      especialidad: '',
      foto: '',
      activo: true,
      horarios: []
    };
    this.nuevoHorario = { dia: 'Lunes', horaInicio: '', horaFin: '' };
  }


  agregarHorario() {
    if (!this.nuevoHorario.horaInicio || !this.nuevoHorario.horaFin) {
      alert("Debes seleccionar hora de inicio y fin.");
      return;
    }

    this.programadorSeleccionado.horarios.push({ ...this.nuevoHorario });

    this.nuevoHorario.horaInicio = '';
    this.nuevoHorario.horaFin = '';
    
    this.refrescarIconos();
  }

  eliminarHorario(index: number) {
    this.programadorSeleccionado.horarios.splice(index, 1);
  }


  async actualizarPerfilAdmin() {
    alert("Funcionalidad de actualizar perfil de Admin (Simulada)");
  }

  cerrarSesion() {
    signOut(auth).then(() => {
      this.router.navigate(['/']);
    });
  }
}
