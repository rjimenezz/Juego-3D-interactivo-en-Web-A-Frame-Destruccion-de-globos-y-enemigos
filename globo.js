// Componente globo
AFRAME.registerComponent('globo', {
    schema: {
      color: { type: 'color', default: 'red' },
      lado: { type: 'number', default: 1 }
    },
    
    init: function() {
      var data = this.data;
      var el = this.el;
      
      // Establecer geometría de cubo
      el.setAttribute('geometry', {
        primitive: 'box',
        width: data.lado,
        height: data.lado,
        depth: data.lado
      });
      
      // Establecer material con color
      el.setAttribute('material', {
        color: data.color,
        opacity: 0.8
      });
      
      // Añadir colisionador para detectar colisiones
      el.setAttribute('obb-collider', '');
      
      // Manejar colisiones con otros globos
      this.colisionHandler = this.handleCollision.bind(this);
      el.addEventListener('obbcollisionstarted', this.colisionHandler);
    },
    
    handleCollision: function(event) {
      // Verificar si la colisión es con otro globo
      const otroElemento = event.detail.withEl;
      
      if (otroElemento && otroElemento.hasAttribute('globo')) {
        console.log('¡Colisión entre globos!');
        
        // Crear efecto de explosión antes de eliminar
        this.crearExplosion();
        
        // Eliminar ambos globos
        this.el.parentNode.removeChild(this.el);
        
        // Esperar un pequeño tiempo para que no haya problemas con el manejo de eventos
        setTimeout(function() {
          if (otroElemento.parentNode) {
            otroElemento.parentNode.removeChild(otroElemento);
          }
        }, 50);
      }
    },
    
    crearExplosion: function() {
      // Crear un efecto visual de explosión
      var posicion = this.el.getAttribute('position');
      var escena = this.el.sceneEl;
      
      // Crear partículas de explosión
      for (var i = 0; i < 10; i++) {
        var particula = document.createElement('a-entity');
        
        // Posición inicial de la partícula (misma que el globo)
        particula.setAttribute('position', posicion);
        
        // Geometría pequeña
        particula.setAttribute('geometry', {
          primitive: 'sphere',
          radius: 0.1
        });
        
        // Mismo color que el globo
        particula.setAttribute('material', {
          color: this.data.color,
          opacity: 0.7
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
          dur: 1000,
          easing: 'easeOutQuad'
        });
        
        particula.setAttribute('animation__opacity', {
          property: 'material.opacity',
          to: 0,
          dur: 1000,
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
        }(particula), 1100);
      }
    },
    
    remove: function() {
      // Limpiar eventos cuando se elimina el componente
      this.el.removeEventListener('obbcollisionstarted', this.colisionHandler);
    }
  });