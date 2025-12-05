import { Component, Inject, OnInit, OnDestroy, AfterViewInit, inject, runInInjectionContext, Injector } from '@angular/core';
import { Router } from '@angular/router';
import { createIcons, icons } from 'lucide';
import { PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Firestore, addDoc, collection, collectionData, query, where } from '@angular/fire/firestore';
import { doc, docData } from '@angular/fire/firestore';
import { Observable, Subscription } from 'rxjs';
import { auth } from '../firebase-config';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { FirestoreModule } from '@angular/fire/firestore';
import { firstValueFrom } from 'rxjs';

interface PortafolioDetalle {
  id?: string; 
  nombre: string;
  foto: string;
  contacto: string;
  descripcion?: string;
  especialidad?: string;
  redes_sociales?: { icono: string; url: string; nombre: string; }[];
  proyectosAca?: any[]; 
  proyectosProf?: any[]; 
}

interface PortafolioItem {
  id: string; 
  nombre: string;
  foto: string;
  contacto: string;
  descripcion: string;
}

interface Horario {
  fecha: string;
  horaInicio: string;
  horaFin: string;
}

interface ProgramadorCompleto { 
  id: string; 
  nombre: string;
  foto: string;
  contacto: string;
  descripcion: string;
  horarios?: Horario[]; 
  especialidad?: string;
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
  mostrarContenidoG: boolean = false;
  mostrarContenido: boolean = false;
  text: string = '';

  usuarioActual: any = null;
  datosUsuario: any = null;

  mostrarDetalle: boolean = false;
  portafolioSeleccionado: PortafolioDetalle | null = null;  

  buscarP: boolean = false;

  proyectoSeleccionadoDetalle: any = null;
  mostrarDetalleProyecto: boolean = false;

  mensaje: boolean = false;
  pro_dis: boolean = false;

  portafoliosFirebase1: ProgramadorCompleto[] = [];
  resultados1: ProgramadorCompleto[] = [];

  mostrarFormularioSolicitud: boolean = false;
  horariosProgramadorSeleccionado: any[] = [];

  solicitudesEnviadas: any[] = [];

  solicitudData: any = {
    programadorId: '',
    horarioSeleccionado: '',
    mensaje: ''
  };

  constructor(
    private router: Router, 
    @Inject(PLATFORM_ID) private platformId: Object
  ){
    if (isPlatformBrowser(this.platformId)) {
          onAuthStateChanged(auth, (user) => {
            if (!user) {
              this.router.navigate(['/']);
            }
          });
    }
  }

  ngOnInit(): void {
    runInInjectionContext(this.injector, () => {
      const itemsCollection = collection(this.firestore, 'programadores');
      this.items = collectionData(itemsCollection, { idField: 'id' }) as Observable<PortafolioItem[]>;

      this.itemsSubscription = this.items.subscribe(data => {
        this.portafoliosFirebase = data; 
        this.resultados = data;
        this.portafoliosFirebase1 = data; 
        this.resultados1 = data;
      });
    });

    this.obtenerUsuarioActual().then(() => this.obtenerDatosUsuario());
  }

  get programadoresDisponibles(): ProgramadorCompleto[] {
    return this.portafoliosFirebase1;
  }

  get nombreProgramadorSeleccionado(): string {
    const programador = this.portafoliosFirebase.find(p => p.id === this.solicitudData.programadorId);
    return programador ? `${programador.nombre}` : 'el Programador';
  }

  refrescarIconos() {
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => {
        createIcons({ icons });
      }, 100);
    }
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
    this.mostrarContenidoG = false;
    this.mostrarContenidoBuscar = true;
    this.mostrarContenido = true;
    this.buscarP = true;
    this.mostrarDetalleProyecto = false;
    this.mensaje = false;
    this.mostrarDetalle = false;
    this.pro_dis = false;
    this.mostrarFormularioSolicitud = false;
    this.refrescarIconos();
  }

  funcionProtG() {
    this.mostrarDetalle = false;
    this.buscarP = false;
    this.mostrarContenido = false;
    this.mostrarContenidoBuscar = false;
    this.mostrarDetalleProyecto = false;
    this.mensaje = false;
    this.pro_dis = false;
    this.mostrarFormularioSolicitud = false;
    this.mostrarContenidoG = !this.mostrarContenidoG;
    this.refrescarIconos();
  }

  buscar() {
    const texto = (this.text || '').toLowerCase().trim();
    this.resultados = this.portafoliosFirebase.filter(item =>
      (item.nombre?.toLowerCase() || '').toLowerCase().includes(texto) ||
      (item.contacto?.toLowerCase() || '').includes(texto)
    );
    this.refrescarIconos();
  }

  async verDetalle(item: PortafolioItem) {
    this.mostrarContenidoG = false;
    if (!item.id) {
        console.error("ID del portafolio no encontrado.");
        return;
    }

    const progDocRef = doc(this.firestore, 'programadores', item.id);
    const datosPrincipales = await firstValueFrom(docData(progDocRef, { idField: 'id' })) as PortafolioDetalle;

    const acaCollection = collection(this.firestore, 'programadores', item.id, 'proyectos_aca');
    const proyectosAcaSnapshot = await firstValueFrom(
      collectionData(acaCollection, { idField: 'id' })
    );

    const profCollection = collection(this.firestore, 'programadores', item.id, 'proyectos_prof');
    const proyectosProfSnapshot = await firstValueFrom(
      collectionData(profCollection, { idField: 'id' })
    );


    this.portafolioSeleccionado = {
        ...datosPrincipales,
        proyectosAca: proyectosAcaSnapshot,
        proyectosProf: proyectosProfSnapshot,
        
        foto: datosPrincipales.foto || item.foto, 
        contacto: datosPrincipales.contacto || item.contacto,
    };

    this.mostrarDetalle = true;
    this.buscarP = false;
    this.mostrarContenido = false;
    this.mostrarContenidoBuscar = false;
    this.mostrarContenidoG = false;
    this.mostrarDetalleProyecto = false;
    this.mensaje = false;
    this.pro_dis = false;
    this.mostrarFormularioSolicitud = false;
    this.refrescarIconos();
  }


  cerrarDetalle() {
    this.portafolioSeleccionado = null;

    this.mostrarDetalle = false;
    this.buscarP = false;
    this.mostrarContenido = false;
    this.mostrarContenidoBuscar = true;
    this.mostrarContenidoG = false;
    this.mostrarDetalleProyecto = false;
    this.mensaje = false;
    this.pro_dis = false;
    this.mostrarFormularioSolicitud = false;
    this.refrescarIconos();
  }

  async verProyectoDetalle(proyecto: any, tipo: 'aca' | 'prof') {
    this.mostrarDetalle = false;
    this.buscarP = false;
    this.mostrarContenido = false;
    this.mostrarContenidoBuscar = false;
    this.mostrarContenidoG = false;
    this.mostrarDetalleProyecto = true;
    this.mensaje = false;
    this.pro_dis = false;
    this.mostrarFormularioSolicitud = false;
    setTimeout(() => {
      if (isPlatformBrowser(this.platformId)) createIcons({ icons });
    }, 0);

    if (!this.portafolioSeleccionado?.id) {
      console.error("ID del programador no encontrado.");
      return;
    }

    try {
      const proyectoRef = doc(
        this.firestore,
        'programadores',
        this.portafolioSeleccionado.id,
        tipo === 'aca' ? 'proyectos_aca' : 'proyectos_prof',
        proyecto.id 
      );

      const datosProyecto = await firstValueFrom(
        docData(proyectoRef, { idField: 'id' })
      );

      this.proyectoSeleccionadoDetalle = datosProyecto;

    } catch (error) {
      console.error("Error cargando detalle del proyecto:", error);
    }
    this.refrescarIconos();
  }

  cerrarProyectoDetalle() {

    this.mostrarDetalle = true;
    this.buscarP = false;
    this.mostrarContenido = false;
    this.mostrarContenidoBuscar = true;
    this.mostrarContenidoG = false;
    this.mostrarDetalleProyecto = false;
    this.mensaje = false;
    this.pro_dis = false;
    this.mostrarFormularioSolicitud = false;
    this.refrescarIconos();
  }

  tutoria() {
    this.mostrarDetalleProyecto = false;
    this.mensaje = false;
    this.mostrarContenidoG = false;
    this.mostrarDetalle = false;
    this.mostrarContenidoBuscar = false;
    this.buscarP = false;
    this.mostrarFormularioSolicitud = false;
    this.pro_dis = true;
    this.refrescarIconos();
  }

  async mensajeFun() {
    this.mostrarDetalleProyecto = false;
    this.mensaje = false;
    this.mostrarContenidoG = false;
    this.mostrarDetalle = false;
    this.mostrarContenidoBuscar = false;
    this.buscarP = false;
    this.pro_dis = true;
    this.mostrarFormularioSolicitud = false;
    this.mensaje = !this.mensaje;
    if (this.mensaje) {
      await this.cargarSolicitudesEnviadas();
    }
    this.refrescarIconos();
  }

  iniciarSolicitud(programador: any) {
    if (!this.usuarioActual) {
      alert("Debes iniciar sesión para enviar una solicitud.");
      this.router.navigate(['/login']);
      return;
    }

    this.horariosProgramadorSeleccionado = programador.horarios || [];
    
    this.solicitudData.programadorId = programador.id;

    if (this.horariosProgramadorSeleccionado.length === 1) {
        this.solicitudData.horarioSeleccionado = this.formatearHorario(this.horariosProgramadorSeleccionado[0]);
    } else {
        this.solicitudData.horarioSeleccionado = '';
    }
    
    this.mostrarFormularioSolicitud = true;
    this.mostrarDetalleProyecto = false;
    this.mensaje = false;
    this.mostrarContenidoG = false;
    this.mostrarDetalle = false;
    this.mostrarContenidoBuscar = false;
    this.buscarP = false;
    this.pro_dis = false;
    this.refrescarIconos();

  }

  formatearHorario(horario: any): string {
      return `${horario.fecha}: ${horario.horaInicio} - ${horario.horaFin}`;
  }

  async enviarSolicitud() {
    if (!this.solicitudData.programadorId || !this.solicitudData.horarioSeleccionado) {
      alert("Por favor, selecciona un horario y escribe un mensaje.");
      return;
    }

    try {
      const colRef = collection(this.firestore, 'solicitudes'); 

      const solicitud = {
        programadorId: this.solicitudData.programadorId,
        programadorNombre: this.portafoliosFirebase.find(p => p.id === this.solicitudData.programadorId)?.nombre,

        usuarioId: this.usuarioActual.uid,
        usuarioEmail: this.usuarioActual.email,
        
        horario: this.solicitudData.horarioSeleccionado,
        mensaje: this.solicitudData.mensaje,
        estado: 'Pendiente', 
        fechaSolicitud: new Date()
      };
      
      await addDoc(colRef, solicitud);
      
      alert(`Solicitud enviada al programador ${solicitud.programadorNombre} con éxito. ¡Pronto te responderán!`);
      
      this.solicitudData = { programadorId: '', horarioSeleccionado: '', mensaje: '' };
      this.mostrarFormularioSolicitud = false;

    } catch (error) {
      console.error("Error al enviar la solicitud:", error);
      alert("Ocurrió un error al enviar la solicitud.");
    }
  }

  async cargarSolicitudesEnviadas() {
    if (!this.usuarioActual) return;

    await runInInjectionContext(this.injector, async () => {
      const colRef = collection(this.firestore, 'solicitudes');
      
      
      const q = query(colRef, where('usuarioId', '==', this.usuarioActual.uid)); 

      this.solicitudesEnviadas = await firstValueFrom(
        collectionData(q, { idField: 'id' })
      );

      this.solicitudesEnviadas.sort((a, b) => {
          if (a.estado === 'Pendiente' && b.estado !== 'Pendiente') return -1;
          if (a.estado !== 'Pendiente' && b.estado === 'Pendiente') return 1;
          
          return (b.fechaCreacion?.toMillis() || 0) - (a.fechaCreacion?.toMillis() || 0);
      });

    });
  }

  ngAfterViewInit(): void {
    this.refrescarIconos();
  }
}
