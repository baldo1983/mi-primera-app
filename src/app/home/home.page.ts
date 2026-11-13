// ==========================================
// 1. IMPORTACIONES DE ANGULAR Y LIBRERÍAS
// ==========================================
// Importamos las herramientas básicas que necesita el componente y NgZone para forzar el refresco de pantalla.
import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit, OnDestroy, NgZone , ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Importamos los componentes visuales que usamos de la librería Ionic.
import { 
  IonHeader, IonToolbar, IonTitle, IonContent, 
  IonCard, IonCardHeader, IonCardSubtitle, IonCardTitle, IonCardContent,
  IonItem, IonInput, IonButton, IonList, IonLabel, IonToast, IonIcon  
} from '@ionic/angular';

// Importamos el sistema de iconos de Ionic y la papelera concreta.
import { addIcons } from 'ionicons';
import { trashOutline } from 'ionicons/icons';

// Importamos las funciones de Firebase Firestore para base de datos en la nube y tiempo real.
import { collection, addDoc, deleteDoc, doc, onSnapshot, Unsubscribe } from 'firebase/firestore';
import { db } from '../service/firebase.config';

// ==========================================
// 2. CONFIGURACIÓN DEL COMPONENTE
// ==========================================
@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [
    CommonModule,
    FormsModule,
    IonHeader, IonToolbar, IonTitle, IonContent, 
    IonCard, IonCardHeader, IonCardSubtitle, IonCardTitle, IonCardContent,
    IonItem, IonInput, IonButton, IonList, IonLabel, IonToast, IonIcon
  ],
  standalone: true, // Indicamos que es un componente moderno independiente
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush // <--- Añadimos esto para control estricto de la vista
})
export class HomePage implements OnInit, OnDestroy {
  
  // ==========================================
  // 3. DECLARACIÓN DE VARIABLES Y ESTADOS
  // ==========================================
  public mensaje: string = "¡Hola BMA! Mis prácticas van sobre ruedas.";
  public horasFCT: number = 370;
  public contador: number = 0;
  public mensajeGuardado: string = "";
  public valorInput: string = "";
  public valorHoras: number = 8; // Nueva variable para las horas (por defecto 8)

  // Referencia directa al icono de la papelera para asegurarnos de que se pinta bien
  public trashIcon = trashOutline;

  // Array que almacenará la lista de tareas que vienen de Firebase
  public listaTareas: Array<{ id: string; titulo: string; horas: number }> = [];

  // Controladores para las notificaciones flotantes (Toast)
  public isToastOpen: boolean = false;
  public toastMessage: string = "";

  // Variable privada para apagar la escucha de Firebase cuando salgamos de la página
  private unsubscribeFirestore!: Unsubscribe;

  // ==========================================
  // 4. CONSTRUCTOR (INICIALIZACIÓN DE ICONOS Y ZONA)
  // ==========================================
  constructor(private zone: NgZone, private cdr: ChangeDetectorRef) {
    // Registramos el icono de la papelera en Ionic al arrancar
    addIcons({ trashOutline });
  }

  // ==========================================
  // 5. CICLO DE VIDA: ngOnInit (AL ABRIR LA PÁGINA)
  // ==========================================
  ngOnInit() {
    // Al cargar la vista, lanzamos el escuchador en tiempo real de Firebase
    this.escucharTareasEnTiempoReal();
  }

  // ==========================================
  // 6. CICLO DE VIDA: ngOnDestroy (AL SALIR)
  // ==========================================
  ngOnDestroy() {
    // Si la suscripción a Firestore sigue activa, la cortamos para evitar consumo de memoria
    if (this.unsubscribeFirestore) {
      this.unsubscribeFirestore();
    }
  }

  // ==========================================
  // 7. LÓGICA DE TIEMPO REAL (ONSNAPSHOT)
  // ==========================================
 escucharTareasEnTiempoReal() {
    const tareasRef = collection(db, 'tareas');
    this.unsubscribeFirestore = onSnapshot(tareasRef, (snapshot) => {
      this.zone.run(() => {
        this.listaTareas = snapshot.docs.map(docSnapshot => ({
          id: docSnapshot.id,
          titulo: docSnapshot.data()['titulo'],
          horas: docSnapshot.data()['horas']
        }));

        this.horasFCT = this.listaTareas.reduce((total, tarea) => total + (Number(tarea.horas) || 0), 0);
        console.log("Lista actualizada en tiempo real:", this.listaTareas);
        
        // Forzamos la actualización completa marcando el componente y detectando cambios al instante
        this.cdr.markForCheck();
        this.cdr.detectChanges();
      });
    });
  }
  // ==========================================
  // 8. ACCIÓN: GUARDAR NUEVA TAREA EN FIREBASE
  // ==========================================
async cambiarMensaje() {
    if (this.valorInput.trim() !== "") {
      try {
        await addDoc(collection(db, 'tareas'), {
          titulo: this.valorInput,
          horas: Number(this.valorHoras) || 0 // Usamos el input de horas de forma segura
        });

        this.zone.run(() => {
          this.toastMessage = "¡Tarea guardada en Firebase!";
          this.isToastOpen = true;
          this.valorInput = ""; 
          this.valorHoras = 8; // Reseteamos a 8 por defecto si quieres
          this.cdr.markForCheck();
          this.cdr.detectChanges();
        });
      } catch (error) {
        console.error("Error al guardar:", error);
      }
    }
  }

  // ==========================================
  // 9. ACCIÓN: ELIMINAR TAREA POR SU ID
  // ==========================================
  async eliminarTarea(id: string) {
    try {
      // Borramos el documento específico usando su ID único en Firestore
      await deleteDoc(doc(db, 'tareas', id));
      
      // Mostramos el aviso de éxito
      this.zone.run(() => {
        this.toastMessage = "Tarea eliminada correctamente";
        this.isToastOpen = true;
      });
    } catch (error) {
      console.error("Error al borrar:", error);
    }
  }

  // ==========================================
  // 10. CONTROL DEL TOAST (NOTIFICACIÓN)
  // ==========================================
  public setToastOpen(isOpen: boolean) {
    this.isToastOpen = isOpen;
  }
}