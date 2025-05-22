// Componente juego
AFRAME.registerComponent('juego', {
  schema: {
    // Número de elementos
    num_globos: { type: 'number', default: 5 },
    num_comedores: { type: 'number', default: 3 },
    
    // Colores
    col_globos: { type: 'color', default: '#FF5555' },
    col_comedores: { type: 'color', default: '#FF9900' },
    col_jugador: { type: 'color', default: '#3399FF' },
    
    // Tamaños
    tam_globos: { type: 'number', default: 0.8 },
    tam_comedores: { type: 'number', default: 0.5 },
    tam_jugador: { type: 'number', default: 0.5 },
    
    // Velocidades
    vel_globos: { type: 'number', default: 1 },
    vel_comedores: { type: 'number', default: 0.01 },
    
    // Intervalo para cambio de dirección de los globos
    intervalo_globos: { type: 'number', default: 3000 },
    
    // Propiedades del destructor
    dir_destructor: { type: 'vec3', default: { x: 0, y: 0, z: -1 } },
    lejos_destructor: { type: 'number', default: 10 },
    cerca_destructor: { type: 'number', default: 0 }
  },
  
  init: function() {
    // Crear contenedor para los elementos del juego
    this.crearContenedor();
    
    // Configurar la cámara con los componentes jugador y destructor
    this.configurarCamara();
    
    // Crear globos y comedores
    this.crearGlobos();
    this.crearComedores();
    
    // Inicializar contador de puntos
    this.puntos = 0;
    this.crearContadorPuntos();
    
    // Escuchar eventos de elementos destruidos para sumar puntos
    this.escucharDestrucciones();
  },
  
  crearContenedor: function() {
    // Crear un contenedor para todos los elementos del juego
    this.contenedor = document.createElement('a-entity');
    this.contenedor.setAttribute('id', 'contenedor-juego');
    this.el.sceneEl.appendChild(this.contenedor);
  },
  
  configurarCamara: function() {
    // Obtener la cámara o crearla si no existe
    var camera = document.querySelector('[camera]');
    if (!camera) {
      camera = document.createElement('a-entity');
      camera.setAttribute('camera', '');
      camera.setAttribute('look-controls', '');
      camera.setAttribute('wasd-controls', '');
      camera.setAttribute('position', '0 1.6 0');
      this.el.sceneEl.appendChild(camera);
    }
    
    // Añadir componente jugador a la cámara
    camera.setAttribute('jugador', {
      color: this.data.col_jugador,
      radio: this.data.tam_jugador
    });
    
    // Añadir componente destructor a la cámara
    camera.setAttribute('destructor', {
      objetivo: 'objetivo-destruible',
      direccion: this.data.dir_destructor,
      cerca: this.data.cerca_destructor,
      lejos: this.data.lejos_destructor,
      color: this.data.col_jugador
    });
    
    // Añadir un puntero (anillo) para ver dónde apunta el destructor
    var puntero = document.createElement('a-entity');
    puntero.setAttribute('id', 'puntero');
    puntero.setAttribute('geometry', {
      primitive: 'ring',
      radiusInner: 0.01,
      radiusOuter: 0.02
    });
    puntero.setAttribute('material', {
      color: this.data.col_jugador,
      shader: 'flat',
      opacity: 0.8
    });
    puntero.setAttribute('position', {
      x: 0,
      y: 0,
      z: -1 // 1 unidad frente a la cámara
    });
    
    camera.appendChild(puntero);
  },
  
  crearGlobos: function() {
    // Crear contenedor para los globos
    var contenedorGlobos = document.createElement('a-entity');
    contenedorGlobos.setAttribute('id', 'contenedor-globos');
    this.contenedor.appendChild(contenedorGlobos);
    
    // Crear los globos según el número especificado
    for (var i = 0; i < this.data.num_globos; i++) {
      var globo = document.createElement('a-entity');
      
      // Establecer ID y clase para que pueda ser destruido
      globo.setAttribute('id', 'globo-' + i);
      globo.setAttribute('class', 'objetivo-destruible');
      
      // Posición aleatoria
      var posX = Math.random() * 20 - 10;
      var posY = Math.random() * 3 + 1;
      var posZ = Math.random() * 20 - 15;
      globo.setAttribute('position', posX + ' ' + posY + ' ' + posZ);
      
      // Añadir componente globo
      globo.setAttribute('globo', {
        color: this.generarColorVariante(this.data.col_globos),
        lado: this.data.tam_globos
      });
      
      // Añadir componente movedor
      globo.setAttribute('movedor', {
        velocidad: this.data.vel_globos,
        intervalo: this.data.intervalo_globos
      });
      
      // Añadir al contenedor
      contenedorGlobos.appendChild(globo);
    }
  },
  
  crearComedores: function() {
    // Crear contenedor para los comedores
    var contenedorComedores = document.createElement('a-entity');
    contenedorComedores.setAttribute('id', 'contenedor-comedores');
    this.contenedor.appendChild(contenedorComedores);
    
    // Crear los comedores según el número especificado
    for (var i = 0; i < this.data.num_comedores; i++) {
      var comedor = document.createElement('a-entity');
      
      // Establecer ID y clase para que pueda ser destruido
      comedor.setAttribute('id', 'comedor-' + i);
      comedor.setAttribute('class', 'objetivo-destruible');
      
      // Posición aleatoria
      var posX = Math.random() * 20 - 10;
      var posY = Math.random() * 2 + 1;
      var posZ = Math.random() * 10 - 15;
      comedor.setAttribute('position', posX + ' ' + posY + ' ' + posZ);
      
      // Añadir componente comedor
      comedor.setAttribute('comedor', {
        color: this.generarColorVariante(this.data.col_comedores),
        radio: this.data.tam_comedores,
        velocidad: this.data.vel_comedores,
        retrasoInicial: 2000
      });
      
      // Añadir al contenedor
      contenedorComedores.appendChild(comedor);
    }
  },
  
  generarColorVariante: function(colorBase) {
    // Convertir color hexadecimal a RGB
    var r = parseInt(colorBase.slice(1, 3), 16);
    var g = parseInt(colorBase.slice(3, 5), 16);
    var b = parseInt(colorBase.slice(5, 7), 16);
    
    // Añadir una pequeña variación
    var variacion = 30; // Valor máximo de variación
    r = Math.max(0, Math.min(255, r + Math.floor(Math.random() * variacion * 2) - variacion));
    g = Math.max(0, Math.min(255, g + Math.floor(Math.random() * variacion * 2) - variacion));
    b = Math.max(0, Math.min(255, b + Math.floor(Math.random() * variacion * 2) - variacion));
    
    // Convertir de nuevo a hexadecimal
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  },
  
  crearContadorPuntos: function() {
    // Crear el contador de puntos
    this.contadorPuntos = document.createElement('div');
    this.contadorPuntos.style.position = 'fixed';
    this.contadorPuntos.style.top = '20px';
    this.contadorPuntos.style.left = '20px';
    this.contadorPuntos.style.padding = '10px';
    this.contadorPuntos.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    this.contadorPuntos.style.color = 'white';
    this.contadorPuntos.style.fontFamily = 'Arial, sans-serif';
    this.contadorPuntos.style.fontSize = '18px';
    this.contadorPuntos.style.zIndex = '999';
    this.actualizarContadorPuntos();
    
    document.body.appendChild(this.contadorPuntos);
  },
  
  actualizarContadorPuntos: function() {
    this.contadorPuntos.textContent = 'Puntos: ' + this.puntos;
  },
  
  escucharDestrucciones: function() {
    // Escuchar la eliminación de elementos para sumar puntos
    var self = this;
    
    // Sobrescribir removeChild para detectar elementos destruidos
    var originalRemoveChild = Element.prototype.removeChild;
    
    Element.prototype.removeChild = function(child) {
      // Verificar si el elemento eliminado es un objetivo destruible
      if (child.classList && child.classList.contains('objetivo-destruible')) {
        // Verificar si es un globo o un comedor y asignar puntos
        if (child.id.includes('globo')) {
          self.puntos += 10;
        } else if (child.id.includes('comedor')) {
          self.puntos += 20;
        }
        
        // Actualizar el contador de puntos
        self.actualizarContadorPuntos();
        
        // Verificar si se han destruido todos los objetivos
        self.verificarFinJuego();
      }
      
      // Llamar al método original
      return originalRemoveChild.call(this, child);
    };
  },
  
  verificarFinJuego: function() {
    // Verificar si quedan globos o comedores
    var globosRestantes = document.querySelectorAll('#contenedor-globos .objetivo-destruible').length;
    var comedoresRestantes = document.querySelectorAll('#contenedor-comedores .objetivo-destruible').length;
    
    if (globosRestantes === 0 && comedoresRestantes === 0) {
      this.mostrarVictoria();
    }
  },
  
  mostrarVictoria: function() {
    // Crear elemento de victoria
    var victoria = document.createElement('div');
    victoria.style.position = 'fixed';
    victoria.style.top = '50%';
    victoria.style.left = '50%';
    victoria.style.transform = 'translate(-50%, -50%)';
    victoria.style.color = 'green';
    victoria.style.fontSize = '5em';
    victoria.style.fontWeight = 'bold';
    victoria.style.textAlign = 'center';
    victoria.style.fontFamily = 'Arial, sans-serif';
    victoria.style.zIndex = '9999';
    victoria.innerHTML = '¡VICTORIA!<br><span style="font-size: 0.5em;">Puntuación final: ' + this.puntos + '</span><br><button onclick="location.reload()" style="font-size: 0.3em; padding: 10px 20px; margin-top: 20px;">Jugar de nuevo</button>';
    
    document.body.appendChild(victoria);
  },
  
  remove: function() {
    // Limpiar cuando se elimina el componente
    if (this.contadorPuntos && this.contadorPuntos.parentNode) {
      this.contadorPuntos.parentNode.removeChild(this.contadorPuntos);
    }
    
    // Restaurar el método removeChild original
    if (this.originalRemoveChild) {
      Element.prototype.removeChild = this.originalRemoveChild;
    }
  }
});