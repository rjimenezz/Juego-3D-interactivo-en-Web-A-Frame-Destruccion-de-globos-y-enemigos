// Componente comedor
AFRAME.registerComponent('comedor', {
  schema: {
    color: { type: 'color', default: 'red' },
    radio: { type: 'number', default: 0.5 },
    velocidad: { type: 'number', default: 0.01 }  // Velocidad constante
  },
  
  init: function() {
    var data = this.data;
    var el = this.el;
    
    // Establecer geometría esférica
    el.setAttribute('geometry', {
      primitive: 'sphere',
      radius: data.radio
    });
    
    // Establecer material con color
    el.setAttribute('material', {
      color: data.color,
      metalness: 0.2,
      roughness: 0.8
    });
    
    // Buscar al jugador
    this.jugador = document.querySelector('[jugador]');
    
    // Para cálculos de movimiento
    this.direccion = new THREE.Vector3();
    this.posJugador = new THREE.Vector3();
    this.posComedor = new THREE.Vector3();
    
    // Añadir detector de colisiones
    el.setAttribute('obb-collider', '');
    
    // Manejar colisiones con el jugador
    this.colisionHandler = this.handleCollision.bind(this);
    el.addEventListener('obbcollisionstarted', this.colisionHandler);
  },
  
  tick: function(time, deltaTime) {
    // Si no hay jugador o el comedor fue eliminado, no hacer nada
    if (!this.jugador || !this.jugador.parentNode || !this.el.parentNode) {
      return;
    }
    
    // Obtener las posiciones actuales
    this.jugador.object3D.getWorldPosition(this.posJugador);
    this.el.object3D.getWorldPosition(this.posComedor);
    
    // Calcular la dirección hacia el jugador
    this.direccion.subVectors(this.posJugador, this.posComedor).normalize();
    
    // Convertir deltaTime a segundos (viene en ms)
    var deltaSeconds = deltaTime / 1000;
    
    // Usar velocidad constante independientemente de la distancia o dirección
    var velocidadConstante = this.data.velocidad;
    
    // Aplicar movimiento con velocidad constante
    this.el.object3D.position.addScaledVector(this.direccion, velocidadConstante * deltaSeconds * 60);
    
    // Hacer que el comedor mire al jugador
    this.el.object3D.lookAt(this.posJugador);
  },
  
  handleCollision: function(event) {
    // Verificar si la colisión es con el jugador
    var otroElemento = event.detail.withEl;
    
    if (otroElemento && otroElemento.hasAttribute('jugador')) {
      console.log('¡Comedor capturó al jugador!');
      
      // Eliminar al jugador
      if (otroElemento.parentNode) {
        otroElemento.parentNode.removeChild(otroElemento);
      }
    }
  },
  
  remove: function() {
    // Limpiar cuando se elimina el componente
    if (this.colisionHandler) {
      this.el.removeEventListener('obbcollisionstarted', this.colisionHandler);
    }
  }
});

// Componente jugador
AFRAME.registerComponent('jugador', {
  schema: {
    color: { type: 'color', default: 'blue' },
    radio: { type: 'number', default: 0.5 }
  },
  
  init: function() {
    var data = this.data;
    var el = this.el;
    
    el.setAttribute('geometry', {
      primitive: 'sphere',
      radius: data.radio
    });
    
    // Establecer material con color
    el.setAttribute('material', {
      color: data.color,
      metalness: 0.3,
      roughness: 0.6
    });
    
    // Añadir detector de colisiones
    el.setAttribute('obb-collider', '');
  }
});