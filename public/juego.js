AFRAME.registerComponent('juego', {
  schema: {
    num_globos: { type: 'number', default: 5 },
    num_comedores: { type: 'number', default: 3 },
    col_globos: { type: 'color', default: '#FF5555' },
    col_comedores: { type: 'color', default: '#FF9900' },
    col_jugador: { type: 'color', default: '#3399FF' },
    tam_globos: { type: 'number', default: 0.8 },
    tam_comedores: { type: 'number', default: 0.5 },
    tam_jugador: { type: 'number', default: 0.5 },
    vel_globos: { type: 'number', default: 1 },
    vel_comedores: { type: 'number', default: 0.01 },
    intervalo_globos: { type: 'number', default: 3000 },
    dir_destructor: { type: 'vec3', default: { x: 0, y: 0, z: -1 } },
    lejos_destructor: { type: 'number', default: 10 },
    cerca_destructor: { type: 'number', default: 0 }
  },
  
  init: function() {
    this.crearContenedor();
    this.configurarCamara();
    this.crearGlobos();
    this.crearComedores();
    
    // Inicializar contadores de objetivos
    this.globosIniciales = this.data.num_globos;
    this.comedoresIniciales = this.data.num_comedores;
    this.globosDestruidos = 0;
    this.comedoresDestruidos = 0;
    
    // Configurar el detector de destrucciones
    this.escucharDestrucciones();
    
    // Victoria prefabricada en el DOM pero oculta
    this.crearElementoVictoria();
    
    // Derrota prefabricada en el DOM pero oculta
    this.crearElementoDerrota();
    
    // Iniciar verificación periódica
    this.iniciarVerificacionPeriodica();
    
    // Escuchar evento de jugador eliminado
    this.configurarDeteccionDerrota();
  },
  
  crearElementoVictoria: function() {
    // Crear elemento de victoria en el DOM pero mantenerlo oculto
    this.victoriaElement = document.createElement('div');
    this.victoriaElement.style.position = 'fixed';
    this.victoriaElement.style.top = '50%';
    this.victoriaElement.style.left = '50%';
    this.victoriaElement.style.transform = 'translate(-50%, -50%)';
    this.victoriaElement.style.color = 'green';
    this.victoriaElement.style.fontSize = '5em';
    this.victoriaElement.style.fontWeight = 'bold';
    this.victoriaElement.style.textAlign = 'center';
    this.victoriaElement.style.fontFamily = 'Arial, sans-serif';
    this.victoriaElement.style.zIndex = '9999';
    this.victoriaElement.style.display = 'none'; // Inicialmente oculto
    this.victoriaElement.innerHTML = '¡VICTORIA!<br><button onclick="location.reload()" style="font-size: 0.3em; padding: 10px 20px; margin-top: 20px;">Jugar de nuevo</button>';
    
    document.body.appendChild(this.victoriaElement);
  },
  
  crearElementoDerrota: function() {
    // Crear elemento de derrota en el DOM pero mantenerlo oculto
    this.derrotaElement = document.createElement('div');
    this.derrotaElement.style.position = 'fixed';
    this.derrotaElement.style.top = '50%';
    this.derrotaElement.style.left = '50%';
    this.derrotaElement.style.transform = 'translate(-50%, -50%)';
    this.derrotaElement.style.color = 'red';
    this.derrotaElement.style.fontSize = '5em';
    this.derrotaElement.style.fontWeight = 'bold';
    this.derrotaElement.style.textAlign = 'center';
    this.derrotaElement.style.fontFamily = 'Arial, sans-serif';
    this.derrotaElement.style.zIndex = '9999';
    this.derrotaElement.style.display = 'none'; // Inicialmente oculto
    this.derrotaElement.innerHTML = '¡DERROTA!<br><button onclick="location.reload()" style="font-size: 0.3em; padding: 10px 20px; margin-top: 20px;">Intentar de nuevo</button>';
    
    document.body.appendChild(this.derrotaElement);
  },
  
  crearContenedor: function() {
    this.contenedor = document.createElement('a-entity');
    this.contenedor.setAttribute('id', 'contenedor-juego');
    this.el.sceneEl.appendChild(this.contenedor);
  },
  
  configurarCamara: function() {
    var camera = document.querySelector('[camera]');
    if (!camera) {
      camera = document.createElement('a-entity');
      camera.setAttribute('camera', '');
      camera.setAttribute('look-controls', '');
      camera.setAttribute('wasd-controls', '');
      camera.setAttribute('position', '0 1.6 0');
      this.el.sceneEl.appendChild(camera);
    }
    
    camera.setAttribute('jugador', {
      color: this.data.col_jugador,
      radio: this.data.tam_jugador
    });
    
    camera.setAttribute('destructor', {
      objetivo: 'objetivo-destruible',
      direccion: this.data.dir_destructor,
      cerca: this.data.cerca_destructor,
      lejos: this.data.lejos_destructor,
      color: this.data.col_jugador
    });
    
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
      z: -1
    });
    
    camera.appendChild(puntero);
  },
  
  crearGlobos: function() {
    var contenedorGlobos = document.createElement('a-entity');
    contenedorGlobos.setAttribute('id', 'contenedor-globos');
    this.contenedor.appendChild(contenedorGlobos);
    
    for (var i = 0; i < this.data.num_globos; i++) {
      var globo = document.createElement('a-entity');
      
      globo.setAttribute('id', 'globo-' + i);
      globo.setAttribute('class', 'objetivo-destruible');
      
      var posX = Math.random() * 20 - 10;
      var posY = Math.random() * 3 + 1;
      var posZ = Math.random() * 20 - 15;
      globo.setAttribute('position', posX + ' ' + posY + ' ' + posZ);
      
      globo.setAttribute('globo', {
        color: this.generarColorVariante(this.data.col_globos),
        lado: this.data.tam_globos
      });
      
      globo.setAttribute('movedor', {
        velocidad: this.data.vel_globos,
        intervalo: this.data.intervalo_globos
      });
      
      contenedorGlobos.appendChild(globo);
    }
  },
  
  crearComedores: function() {
    var contenedorComedores = document.createElement('a-entity');
    contenedorComedores.setAttribute('id', 'contenedor-comedores');
    this.contenedor.appendChild(contenedorComedores);
    
    for (var i = 0; i < this.data.num_comedores; i++) {
      var comedor = document.createElement('a-entity');
      
      comedor.setAttribute('id', 'comedor-' + i);
      comedor.setAttribute('class', 'objetivo-destruible');
      
      var posX = Math.random() * 20 - 10;
      var posY = Math.random() * 2 + 1;
      var posZ = Math.random() * 10 - 15;
      comedor.setAttribute('position', posX + ' ' + posY + ' ' + posZ);
      
      comedor.setAttribute('comedor', {
        color: this.generarColorVariante(this.data.col_comedores),
        radio: this.data.tam_comedores,
        velocidad: this.data.vel_comedores
      });
      
      contenedorComedores.appendChild(comedor);
    }
  },
  
  generarColorVariante: function(colorBase) {
    var r = parseInt(colorBase.slice(1, 3), 16);
    var g = parseInt(colorBase.slice(3, 5), 16);
    var b = parseInt(colorBase.slice(5, 7), 16);
    
    var variacion = 30;
    r = Math.max(0, Math.min(255, r + Math.floor(Math.random() * variacion * 2) - variacion));
    g = Math.max(0, Math.min(255, g + Math.floor(Math.random() * variacion * 2) - variacion));
    b = Math.max(0, Math.min(255, b + Math.floor(Math.random() * variacion * 2) - variacion));
    
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  },
  
  escucharDestrucciones: function() {
    var self = this;
    
    // Escuchar eventos de destrucción
    this.destruidoHandler = function(event) {
      if (event.detail) {
        if (event.detail.tipo === 'globo') {
          self.globosDestruidos++;
          console.log("Globo destruido. Total:", self.globosDestruidos);
        } else if (event.detail.tipo === 'comedor') {
          self.comedoresDestruidos++;
          console.log("Comedor destruido. Total:", self.comedoresDestruidos);
        }
        
        // Verificar condición de victoria inmediatamente
        self.verificarFinJuego();
      }
    };
    
    document.addEventListener('destruido', this.destruidoHandler);
    
    // También monitorear la eliminación de elementos para mayor redundancia
    this.originalRemoveChild = Element.prototype.removeChild;
    Element.prototype.removeChild = function(child) {
      if (child.classList && child.classList.contains('objetivo-destruible')) {
        setTimeout(function() {
          self.verificarFinJuego();
        }, 100);
      }
      return self.originalRemoveChild.call(this, child);
    };
  },
  
  configurarDeteccionDerrota: function() {
    var self = this;
    
    // Monitorear la eliminación del jugador
    this.jugadorRemovido = false;
    
    // Usar MutationObserver para detectar cuando se elimina el jugador
    var observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        if (mutation.removedNodes.length > 0) {
          for (var i = 0; i < mutation.removedNodes.length; i++) {
            var nodo = mutation.removedNodes[i];
            if (nodo.hasAttribute && nodo.hasAttribute('jugador')) {
              console.log("Jugador eliminado - Derrota");
              self.mostrarDerrota();
              self.jugadorRemovido = true;
            }
          }
        }
      });
    });
    
    // Configurar el observer para monitorear cambios en el DOM
    observer.observe(document.querySelector('a-scene'), { 
      childList: true, 
      subtree: true 
    });
    
    this.observer = observer;
  },
  
  iniciarVerificacionPeriodica: function() {
    var self = this;
    
    // Verificar periódicamente por si algún evento no se capturó correctamente
    this.verificacionInterval = setInterval(function() {
      // Si ya hubo derrota, no hacer nada más
      if (self.jugadorRemovido) return;
      
      var globosRestantes = document.querySelectorAll('[globo]').length;
      var comedoresRestantes = document.querySelectorAll('[comedor]').length;
      var jugadorExiste = document.querySelector('[jugador]') !== null;
      
      // Verificar derrota por ausencia de jugador
      if (!jugadorExiste) {
        console.log("Derrota detectada por verificación periódica");
        self.mostrarDerrota();
        clearInterval(self.verificacionInterval);
        return;
      }
      
      // Verificar victoria
      if (globosRestantes === 0 && comedoresRestantes === 0) {
        console.log("Victoria detectada por verificación periódica");
        self.mostrarVictoria();
        clearInterval(self.verificacionInterval);
      }
    }, 2000); // Verificar cada 2 segundos
  },
  
  verificarFinJuego: function() {
    // Si ya hubo derrota, no verificar victoria
    if (this.jugadorRemovido) return;
    
    var globosRestantes = document.querySelectorAll('[globo]').length;
    var comedoresRestantes = document.querySelectorAll('[comedor]').length;
    
    console.log("Verificando fin de juego - Globos: " + globosRestantes + ", Comedores: " + comedoresRestantes);
    
    // Verifica si se cumple alguna de las condiciones de victoria
    if (globosRestantes === 0 && comedoresRestantes === 0) {
      console.log("Victoria por ausencia de objetivos");
      this.mostrarVictoria();
      return;
    }
    
    // Alternativa: victoria basada en contadores
    if (this.globosDestruidos >= this.globosIniciales && 
        this.comedoresDestruidos >= this.comedoresIniciales) {
      console.log("Victoria por conteo de destrucciones");
      this.mostrarVictoria();
      return;
    }
  },
  
  mostrarVictoria: function() {
    // Mostrar el mensaje de victoria preexistente
    if (this.victoriaElement) {
      this.victoriaElement.style.display = 'block';
    }
    
    // Limpiar el intervalo de verificación periódica
    if (this.verificacionInterval) {
      clearInterval(this.verificacionInterval);
    }
    
    // Detener observer
    if (this.observer) {
      this.observer.disconnect();
    }
  },
  
  mostrarDerrota: function() {
    // Mostrar el mensaje de derrota preexistente
    if (this.derrotaElement) {
      this.derrotaElement.style.display = 'block';
    }
    
    // Limpiar el intervalo de verificación periódica
    if (this.verificacionInterval) {
      clearInterval(this.verificacionInterval);
    }
    
    // Detener observer
    if (this.observer) {
      this.observer.disconnect();
    }
  },
  
  remove: function() {
    // Limpiar event listeners
    document.removeEventListener('destruido', this.destruidoHandler);
    
    // Restaurar el removeChild original
    if (this.originalRemoveChild) {
      Element.prototype.removeChild = this.originalRemoveChild;
    }
    
    // Limpiar el intervalo si existe
    if (this.verificacionInterval) {
      clearInterval(this.verificacionInterval);
    }
    
    // Detener observer
    if (this.observer) {
      this.observer.disconnect();
    }
    
    // Eliminar el elemento de victoria si existe
    if (this.victoriaElement && this.victoriaElement.parentNode) {
      this.victoriaElement.parentNode.removeChild(this.victoriaElement);
    }
    
    // Eliminar el elemento de derrota si existe
    if (this.derrotaElement && this.derrotaElement.parentNode) {
      this.derrotaElement.parentNode.removeChild(this.derrotaElement);
    }
  }
});