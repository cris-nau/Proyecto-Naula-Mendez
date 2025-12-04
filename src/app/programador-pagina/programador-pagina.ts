import { Component, Inject, OnInit  } from '@angular/core';
import { auth } from '../firebase-config';
import { signOut, onAuthStateChanged  } from 'firebase/auth';
import { Router } from '@angular/router';
import { createIcons, icons } from 'lucide';
import { PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { doc, docData, Firestore, updateDoc, setDoc, collection, collectionData, query, addDoc, deleteDoc  } from '@angular/fire/firestore';
import { firstValueFrom, Observable, Subscription } from 'rxjs';
import { FirestoreModule } from '@angular/fire/firestore';
import { inject, Injector } from '@angular/core';
import { runInInjectionContext } from '@angular/core';

interface Solicitud {
  id: string;
  usuarioUid: string;
  usuarioEmail: string; 
  usuarioId: string;
  horario: string;
  mensaje: string;
  estado: 'Pendiente' | 'Aceptada' | 'Rechazada';
  fechaCreacion?: any;
}

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

interface PortafolioItem {
  id?: string;
  nombre?: string;
  descripcion?: string;
  tipo?: string;
  tecnologia?: any[];
  enlace?: any[];
  enlace_despliegue?: any[];
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
  crearNuevoPort: boolean = false;
  portAcaLista: any[] = [];
  portProfLista: any[] = [];

  uid: string | null = null;

  usuarioActual: any = null;
  datosUsuario: any = null;

  tecTemp = "";
  enlaceTemp = "";
  enlaceDespTemp = "";

  mostrarMensajes: boolean = false; 
  solicitudesRecibidas: Solicitud[] = [];

  datosProg: DatosProgramador = {
    nombre: "",
    contacto: "",
    foto: "https://i.pinimg.com/236x/9b/47/a0/9b47a023caf29f113237d61170f34ad9.jpg",
    especialidad: "",
    descripcion: "",
    redes_sociales: []
  };

  redSocial = {
    nombre: "",
    icono: "",
    url: ""
  };

  datosPorAca: PortafolioItem = {
    nombre: "",
    descripcion: "",
    tipo: "",
    tecnologia: [],
    enlace: [],
    enlace_despliegue: []
  };

  nuevoPortAca = {
    id: "",
    nombre: "",
    descripcion: "",
    tipo: "",
    tecnologia: [] as string[],
    enlace: [] as string[],
    enlace_despliegue: [] as string[],
    uid: ""
  };

  private injector = inject(Injector);
  private firestore = inject(Firestore);

  constructor(private router: Router, @Inject(PLATFORM_ID) private platformId: Object){
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
    if (isPlatformBrowser(this.platformId)) {
      onAuthStateChanged(auth, (user) => {
        if (!user) {
          this.router.navigate(['/']);
        }
      });
    }
  }

  async ngOnInit() {
    this.mostrarContenidoBuscar = true;
    await this.obtenerUsuarioActual();
    await this.obtenerDatosUsuario();
    await this.obtenerDatosProg();
    await this.obtenerDatosPorAca();
    await this.cargarProyectosAca();
    await this.cargarSolicitudesRecibidas();
  }

  async cargarSolicitudesRecibidas() {
    if (!this.usuarioActual) return;

    await runInInjectionContext(this.injector, async () => {
      const colRef = collection(this.firestore, 'solicitudes');
      
      const q = query(colRef);

      const todasSolicitudes: any[] = await firstValueFrom(
        collectionData(q, { idField: 'id' })
      );
      this.solicitudesRecibidas = todasSolicitudes
        .filter(s => s.programadorId === this.usuarioActual.uid)
        .map(s => ({ 
            ...s, 
            id: s.id,
            horario: s.horario,
            estado: s.estado || 'Pendiente' 
        })) as Solicitud[];

      console.log("Solicitudes recibidas cargadas:", this.solicitudesRecibidas);
    });
  }

  async responderSolicitud(solicitudId: string, nuevoEstado: 'Aceptada' | 'Rechazada') {
    if (!this.usuarioActual) return;

    try {
        const docRef = doc(this.firestore, 'solicitudes', solicitudId);
        
        await updateDoc(docRef, {
            estado: nuevoEstado,
            fechaRespuesta: new Date()
        });
        
        alert(`Solicitud ${solicitudId} ha sido marcada como: ${nuevoEstado}.`);
        await this.cargarSolicitudesRecibidas(); 
        
    } catch (error) {
        console.error("Error al responder la solicitud:", error);
        alert("Ocurrió un error al actualizar el estado.");
    }
  }

  mensajes() {
      this.mostrarMensajes = !this.mostrarMensajes;
      this.cargarSolicitudesRecibidas(); 
      this.refrescarIconos();
  }

  refrescarIconos() {
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => {
        createIcons({ icons });
      }, 100);
    }
  }

  async cargarProyectosAca() {
    if (!this.usuarioActual) return;

    await runInInjectionContext(this.injector, async () => {
      
      const colRef = collection(this.firestore, `programadores/${this.usuarioActual.uid}/proyectos_aca`);

      const consulta = query(colRef); 

      this.portAcaLista = await firstValueFrom(
        collectionData(consulta, { idField: "id" })
      );
      
      console.log("Proyectos cargados:", this.portAcaLista);
    });
  }

  async cargarProyectosProf() {
    if (!this.usuarioActual) return;

    await runInInjectionContext(this.injector, async () => {
      const colRef = collection(this.firestore, `programadores/${this.usuarioActual.uid}/proyectos_prof`);

      this.portProfLista = await firstValueFrom(
        collectionData(query(colRef), { idField: "id" })
      );
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


    const { ref } = await runInInjectionContext(this.injector, async () => {
        const uRef = doc(this.firestore, "usuarios", this.usuarioActual.uid);
        return { ref: uRef};
    });

    this.datosUsuario = await runInInjectionContext(this.injector, async () =>
      firstValueFrom(docData(ref, { idField: 'id' }))
    );
  }

  async obtenerDatosProg() {
    if (!this.usuarioActual) return;

    const { ref } = await runInInjectionContext(this.injector, async () => {
        const uRef = doc(this.firestore, "programadores", this.usuarioActual.uid);
        return { ref: uRef};
    });

    const data = await runInInjectionContext(this.injector, async () =>
      firstValueFrom(docData(ref, { idField: 'id' })) as Promise<ProgramadorFirestore>
    );

    this.datosProg = {
      nombre: data?.nombre || "",
      contacto: data?.contacto || "",
      foto: data?.foto || "https://i.pinimg.com/236x/9b/47/a0/9b47a023caf29f113237d61170f34ad9.jpg",
      especialidad: data?.especialidad || "",
      descripcion: data?.descripcion || "",
      redes_sociales: data?.redes_sociales || []
    };
  }

  async obtenerDatosPorAca() {
    if (!this.usuarioActual) return;

    const { ref } = await runInInjectionContext(this.injector, async () => {
        const uRef = doc(this.firestore, "pro_port_aca", this.usuarioActual.uid);
        return { ref: uRef};
    });

    const data = await runInInjectionContext(this.injector, async () =>
      firstValueFrom(docData(ref, { idField: 'id' })) as Promise<PortafolioItem>
    );

    this.datosPorAca = {
      nombre: data?.nombre || "",
      descripcion: data?.descripcion || "",
      tipo: data?.tipo || "",
      tecnologia: data?.tecnologia || [],
      enlace: data?.enlace || [],
      enlace_despliegue: data?.enlace_despliegue || []
    };
  }
  
  

  ngAfterViewInit(): void {
    this.refrescarIconos();
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
        this.datosProg.redes_sociales.push(nuevaRed);
        alert(`Nueva red social (${nuevaRed.icono}) agregada localmente.`);
    }

    this.guardarEnFirestore(nuevaRed);

    this.redSocial = { nombre: "", icono: "", url: "" };
    this.refrescarIconos();
  }

  eliminarRed(index: number) {
    this.datosProg.redes_sociales.splice(index, 1);
    this.refrescarIconos();
  }

  async guardarEnFirestore(nuevaRed: any) {
    if (!this.usuarioActual) return;

    const userRef = doc(this.firestore, `programadores/${this.usuarioActual.uid}`);

    await setDoc(userRef, this.datosProg, { merge: true });

    alert("Datos guardados correctamente");
    this.refrescarIconos();
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
    this.refrescarIconos();
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
    this.cargarProyectosAca();
    this.refrescarIconos();
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
    this.cargarProyectosProf();
    this.refrescarIconos();
  }

  alternarEdicion() {
    this.modoEdicion = !this.modoEdicion;
    this.refrescarIconos();
  }

  alternarEdicionPort() {
    this.modoEdicionGeneral = !this.modoEdicionGeneral;
    this.refrescarIconos();
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
    this.refrescarIconos();
  }

  perfil(){
    this.portafolioProgramador = false;
    this.mostrarPortProf = false;
    this.mostrarPortAca = false;
    this.mostrarContenidoBuscar = !this.mostrarContenidoBuscar;
    this.refrescarIconos();
  }

  async guardarPortafolio() {
    if (!this.usuarioActual) return;

    let nombreColeccion: string;
    if (this.mostrarPortAca) {
      nombreColeccion = 'proyectos_aca';
    } else if (this.mostrarPortProf) {
      nombreColeccion = 'proyectos_prof';
    } else {
      console.error("Error: No se ha seleccionado Portafolio Académico ni Profesional.");
      alert("Error de contexto: Selecciona un tipo de portafolio.");
      return;
    }

    try {
      const rutaColeccionBase = `programadores/${this.usuarioActual.uid}/${nombreColeccion}`;

      const datosProyecto = {
        uid: this.usuarioActual.uid,
        nombre: this.nuevoPortAca.nombre,
        descripcion: this.nuevoPortAca.descripcion,
        tipo: this.nuevoPortAca.tipo,
        tecnologia: this.nuevoPortAca.tecnologia,
        enlace: this.nuevoPortAca.enlace,
        enlace_despliegue: this.nuevoPortAca.enlace_despliegue,
      };


      if (this.nuevoPortAca.id) {
        const docRef = doc(this.firestore, `${rutaColeccionBase}/${this.nuevoPortAca.id}`);
        await updateDoc(docRef, datosProyecto);
        alert(`Proyecto (${nombreColeccion}) actualizado correctamente`);

      } else {
        const colRef = collection(this.firestore, rutaColeccionBase);
        await addDoc(colRef, { ...datosProyecto, fechaCreacion: new Date() });
        alert(`Proyecto (${nombreColeccion}) creado exitosamente`);
      }

      this.limpiarFormulario(); 

      if (this.mostrarPortAca) {
        await this.cargarProyectosAca(); 
      } else if (this.mostrarPortProf) {
        await this.cargarProyectosProf(); 
      }

    } catch (error) {
      console.error(`Error al guardar/editar en ${nombreColeccion}:`, error);
      alert("Hubo un error al procesar la solicitud.");
    }
    this.refrescarIconos();
  }

  limpiarFormulario() {
    this.nuevoPortAca = {
      id: "",
      uid: "",
      nombre: "",
      descripcion: "",
      tipo: "",
      tecnologia: [],
      enlace: [],
      enlace_despliegue: [],
    };
    this.tecTemp = "";
    this.enlaceTemp = "";
    this.enlaceDespTemp = "";
    this.crearNuevoPort = false;
  }


  agregarTec() {
    if (!this.nuevoPortAca.tecnologia) this.nuevoPortAca.tecnologia = [];
    if (this.tecTemp.trim() !== "") {
      this.nuevoPortAca.tecnologia.push(this.tecTemp.trim());
      this.tecTemp = "";
    }
    this.refrescarIconos();
  }

  agregarEnlace() {
    if (!this.nuevoPortAca.enlace) this.nuevoPortAca.enlace = [];
    if (this.enlaceTemp.trim() !== "") {
      this.nuevoPortAca.enlace.push(this.enlaceTemp.trim());
      this.enlaceTemp = "";
    }
    this.refrescarIconos();
  }

  agregarEnlaceDesp() {
    if (!this.nuevoPortAca.enlace_despliegue) this.nuevoPortAca.enlace_despliegue = [];
    if (this.enlaceDespTemp.trim() !== "") {
      this.nuevoPortAca.enlace_despliegue.push(this.enlaceDespTemp.trim());
      this.enlaceDespTemp = "";
    }
    this.refrescarIconos();
  }

  portNuevo() {
    this.limpiarFormulario();
    this.crearNuevoPort = true;
    this.refrescarIconos();
  }

  editarProyecto(port: any){
    this.nuevoPortAca = {
      id: port.id,
      uid: port.uid,
      nombre: port.nombre,
      descripcion: port.descripcion,
      tipo: port.tipo,
      tecnologia: port.tecnologia ? [...port.tecnologia] : [],
      enlace: port.enlace ? [...port.enlace] : [],
      enlace_despliegue: port.enlace_despliegue ? [...port.enlace_despliegue] : []
    };

    this.crearNuevoPort = true;
  }

  async eliminarProyecto(proyecto: any) {
    if (!this.usuarioActual || !proyecto.id) return;

    const confirmar = confirm(`¿Estás seguro de que quieres eliminar el proyecto "${proyecto.nombre}"? Esta acción es irreversible.`);
    
    if (!confirmar) {
      return; 
    }
    
    let nombreColeccion: string;

    if (this.mostrarPortAca) { 
      nombreColeccion = 'proyectos_aca';
    } else if (this.mostrarPortProf) {
      nombreColeccion = 'proyectos_prof';
    } else {
      console.error("No se pudo determinar el tipo de portafolio para la eliminación.");
      return;
    }

    try {
      const rutaDoc = `programadores/${this.usuarioActual.uid}/${nombreColeccion}/${proyecto.id}`;
      const docRef = doc(this.firestore, rutaDoc);

      await deleteDoc(docRef);

      alert("Proyecto eliminado correctamente.");

      if (this.mostrarPortAca) {
        await this.cargarProyectosAca(); 
      } else if (this.mostrarPortProf) {
        await this.cargarProyectosProf();
      }

    } catch (error) {
      console.error("Error al eliminar el proyecto:", error);
      alert("Hubo un error al intentar eliminar el proyecto.");
    }
    this.refrescarIconos();
  }
}
