// Componente comedor
AFRAME.registerComponent('comedor', {
  schema: {
    color: { type: 'color', default: 'red' },
    radio: { type: 'number', default: 0.5 },
    velocidad: { type: 'number', default: 0.01 },  // Velocidad base
    velocidadVertical: { type: 'number', default: 0.015 }, // Velocidad para seguir verticalmente
    distanciaDeteccion: { type: 'number', default: 30 }, // Distancia máxima para detectar al jugador
    retrasoInicial: { type: 'number', default: 2000 } // Retraso antes de activar colisiones (ms)
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
    
    // Mostrar un efecto de amenaza
    this.crearEfectoAmenaza();
    
    // Bandera para indicar si las colisiones están activas
    this.colisionesActivas = false;
    
    // Para cálculos de movimiento
    this.direccion = new THREE.Vector3();
    this.posJugador = new THREE.Vector3();
    this.posComedor = new THREE.Vector3();
    this.tempVector = new THREE.Vector3();
    
    // Agregar el colisionador y listener después de un retraso para evitar falsas colisiones al inicio
    var self = this;
    setTimeout(function() {
      // Añadir detector de colisiones
      el.setAttribute('obb-collider', '');
      
      // Manejar colisiones con el jugador
      self.colisionHandler = self.handleCollision.bind(self);
      el.addEventListener('obbcollisionstarted', self.colisionHandler);
      
      self.colisionesActivas = true;
      console.log("Colisiones activadas para comedor", el.id);
    }, this.data.retrasoInicial);
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
    
    // Calcular la distancia al jugador
    var distancia = this.posComedor.distanceTo(this.posJugador);
    
    // Solo perseguir si está dentro del rango de detección
    if (distancia <= this.data.distanciaDeteccion) {
      // Convertir deltaTime a segundos (viene en ms)
      var deltaSeconds = deltaTime / 1000;
      
      // Velocidad base ajustada según distancia (más rápido si está más lejos)
      var velocidadAjustada = this.data.velocidad * (1 + Math.min(distancia / 10, 2));
      
      // Ajustar la velocidad vertical si el jugador está por encima
      var diferenciaY = this.posJugador.y - this.posComedor.y;
      
      // Si el jugador está significativamente más arriba, aumentar la velocidad vertical
      if (diferenciaY > 0.5) {
        // Crear un vector de movimiento con énfasis en el componente Y
        this.tempVector.copy(this.direccion);
        
        // Aumentar el componente Y para perseguir mejor hacia arriba
        this.tempVector.y *= 1 + (diferenciaY * 0.5);
        this.tempVector.normalize();
        
        // Usar velocidad vertical aumentada
        var velocidadVerticalAjustada = this.data.velocidadVertical * (1 + Math.min(diferenciaY / 3, 3));
        
        // Aplicar movimiento con énfasis en vertical
        this.el.object3D.position.addScaledVector(this.tempVector, velocidadVerticalAjustada * deltaSeconds * 60);
      } else {
        // Movimiento normal
        this.el.object3D.position.addScaledVector(this.direccion, velocidadAjustada * deltaSeconds * 60);
      }
      
      // Hacer que el comedor mire al jugador
      this.el.object3D.lookAt(this.posJugador);
    }
  },
  
  handleCollision: function(event) {
    // Si las colisiones no están activas aún, ignorar
    if (!this.colisionesActivas) return;
    
    // Verificar si la colisión es con el jugador
    var otroElemento = event.detail.withEl;
    
    if (otroElemento && otroElemento.hasAttribute('jugador')) {
      console.log('¡Comedor capturó al jugador!');
      
      // Crear efecto de captura
      this.crearEfectoCaptura(otroElemento);
      
      // Eliminar al jugador
      if (otroElemento.parentNode) {
        otroElemento.parentNode.removeChild(otroElemento);
      }
      
      // Mostrar mensaje de fin de juego
      this.mostrarGameOver();
    }
  },
  
  crearEfectoAmenaza: function() {
    // Añadir un halo de amenaza alrededor del comedor
    var halo = document.createElement('a-entity');
    
    halo.setAttribute('geometry', {
      primitive: 'sphere',
      radius: this.data.radio * 1.2
    });
    
    halo.setAttribute('material', {
      color: this.data.color,
      opacity: 0.3,
      transparent: true,
      shader: 'flat'
    });
    
    halo.setAttribute('animation', {
      property: 'material.opacity',
      from: 0.3,
      to: 0.1,
      dur: 1000,
      dir: 'alternate',
      loop: true,
      easing: 'easeInOutSine'
    });
    
    this.el.appendChild(halo);
  },
  
  crearEfectoCaptura: function(jugador) {
    // Obtener la posición del jugador
    var posicion = jugador.getAttribute('position');
    var escena = this.el.sceneEl;
    
    // Crear partículas de explosión
    for (var i = 0; i < 15; i++) {
      var particula = document.createElement('a-entity');
      
      // Posición inicial
      particula.setAttribute('position', posicion);
      
      // Geometría pequeña
      particula.setAttribute('geometry', {
        primitive: 'sphere',
        radius: 0.1
      });
      
      // Material con el color del jugador
      var colorJugador = jugador.getAttribute('material').color;
      
      particula.setAttribute('material', {
        color: colorJugador,
        opacity: 0.8,
        transparent: true
      });
      
      // Animación para expandir la explosión
      var direccionX = Math.random() * 2 - 1;
      var direccionY = Math.random() * 2 - 1;
      var direccionZ = Math.random() * 2 - 1;
      
      particula.setAttribute('animation', {
        property: 'position',
        to: (posicion.x + direccionX) + ' ' + 
            (posicion.y + direccionY) + ' ' + 
            (posicion.z + direccionZ),
        dur: 1500,
        easing: 'easeOutQuad'
      });
      
      particula.setAttribute('animation__opacity', {
        property: 'material.opacity',
        to: 0,
        dur: 1500,
        easing: 'easeOutQuad'
      });
      
      // Añadir partícula a la escena
      escena.appendChild(particula);
      
      // Eliminar partícula después de la animación
      setTimeout(function(p) {
        return function() {
          if (p.parentNode) {
            p.parentNode.removeChild(p);
          }
        };
      }(particula), 1600);
    }
  },
  
  mostrarGameOver: function() {
    // Crear elemento de Game Over
    var gameOver = document.createElement('div');
    gameOver.style.position = 'fixed';
    gameOver.style.top = '50%';
    gameOver.style.left = '50%';
    gameOver.style.transform = 'translate(-50%, -50%)';
    gameOver.style.color = 'red';
    gameOver.style.fontSize = '5em';
    gameOver.style.fontWeight = 'bold';
    gameOver.style.textAlign = 'center';
    gameOver.style.fontFamily = 'Arial, sans-serif';
    gameOver.style.zIndex = '9999';
    gameOver.innerHTML = '¡GAME OVER!<br><button onclick="location.reload()" style="font-size: 0.5em; padding: 10px 20px; margin-top: 20px;">Reiniciar</button>';
    
    document.body.appendChild(gameOver);
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
    
    // Establecer geometría esférica
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
    
    // Añadir efecto visual para el jugador
    this.crearEfectoJugador();
  },
  
  crearEfectoJugador: function() {
    // Añadir un halo de protección alrededor del jugador
    var halo = document.createElement('a-entity');
    
    halo.setAttribute('geometry', {
      primitive: 'sphere',
      radius: this.data.radio * 1.2
    });
    
    halo.setAttribute('material', {
      color: this.data.color,
      opacity: 0.2,
      transparent: true,
      shader: 'flat'
    });
    
    halo.setAttribute('animation', {
      property: 'material.opacity',
      from: 0.2,
      to: 0.4,
      dur: 1500,
      dir: 'alternate',
      loop: true,
      easing: 'easeInOutSine'
    });
    
    this.el.appendChild(halo);
  }
});