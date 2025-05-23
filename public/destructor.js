// Componente destructor
AFRAME.registerComponent('destructor', {
  schema: {
    objetivo: { type: 'string', default: 'destructible' }, // Clase objetivo a destruir
    direccion: { type: 'vec3', default: { x: 0, y: 0, z: -1 } }, // Dirección del rayo
    cerca: { type: 'number', default: 0 }, // Distancia mínima (near)
    lejos: { type: 'number', default: 10 }, // Distancia máxima (far)
    color: { type: 'color', default: '#FF0000' } // Color del rayo
  },
  
  init: function() {
    var data = this.data;
    var el = this.el;
    
    // Convertir la dirección a un string para el raycaster
    var direccionStr = data.direccion.x + ' ' + data.direccion.y + ' ' + data.direccion.z;
    
    // Añadir el raycaster a la entidad
    el.setAttribute('raycaster', {
      direction: direccionStr,
      origin: '0 0 0', // Origen relativo a la entidad
      far: data.lejos,
      near: data.cerca,
      showLine: true,
      lineColor: data.color,
      objects: '.' + data.objetivo // Buscar objetos con la clase especificada
    });
    
    // Registrar el manejador de eventos para las intersecciones
    this.interseccionHandler = this.handleIntersection.bind(this);
    el.addEventListener('raycaster-intersection', this.interseccionHandler);
    
    console.log('Destructor inicializado con objetivo: ' + data.objetivo);
  },
  
  handleIntersection: function(event) {
    // Procesar cada entidad con la que intersecta el rayo
    for (var i = 0; i < event.detail.els.length; i++) {
      var objetoIntersectado = event.detail.els[i];
      
      // Verificar si el objeto tiene la clase objetivo
      if (objetoIntersectado.classList.contains(this.data.objetivo)) {
        console.log('Destruyendo objeto:', objetoIntersectado.id || 'sin ID');
        
        // Crear efecto visual antes de destruir
        this.crearEfectoDestruccion(objetoIntersectado);
        
        // Determinar tipo del objeto destruido (globo o comedor)
        var tipo = 'desconocido';
        if (objetoIntersectado.hasAttribute('globo')) {
          tipo = 'globo';
        } else if (objetoIntersectado.hasAttribute('comedor')) {
          tipo = 'comedor';
        }
        
        // Emitir evento 'destruido' con información sobre el objeto
        var eventoDestruido = new CustomEvent('destruido', {
          detail: {
            id: objetoIntersectado.id,
            tipo: tipo,
            posicion: objetoIntersectado.getAttribute('position')
          }
        });
        document.dispatchEvent(eventoDestruido);
        console.log('Emitido evento destruido para: ' + tipo);
        
        // Eliminar el objeto
        if (objetoIntersectado.parentNode) {
          objetoIntersectado.parentNode.removeChild(objetoIntersectado);
        }
      }
    }
  },
  
  crearEfectoDestruccion: function(objeto) {
    // Obtener la posición del objeto
    var posicion = objeto.getAttribute('position');
    var escena = this.el.sceneEl;
    
    // Crear partículas de explosión
    for (var i = 0; i < 8; i++) {
      var particula = document.createElement('a-entity');
      
      // Posición inicial
      particula.setAttribute('position', posicion);
      
      // Geometría pequeña
      particula.setAttribute('geometry', {
        primitive: 'sphere',
        radius: 0.1
      });
      
      // Material con el color del objeto o del rayo
      var color = objeto.getAttribute('material') ? 
                 objeto.getAttribute('material').color : 
                 this.data.color;
      
      particula.setAttribute('material', {
        color: color,
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
  
  update: function(oldData) {
    // Actualizar el raycaster si cambian las propiedades
    var data = this.data;
    var el = this.el;
    var changes = AFRAME.utils.diff(oldData, data);
    
    // Si cambia la dirección, actualizar el raycaster
    if ('direccion' in changes) {
      var direccionStr = data.direccion.x + ' ' + data.direccion.y + ' ' + data.direccion.z;
      el.setAttribute('raycaster', 'direction', direccionStr);
    }
    
    // Actualizar otras propiedades
    if ('cerca' in changes) {
      el.setAttribute('raycaster', 'near', data.cerca);
    }
    if ('lejos' in changes) {
      el.setAttribute('raycaster', 'far', data.lejos);
    }
    if ('color' in changes) {
      el.setAttribute('raycaster', 'lineColor', data.color);
    }
    if ('objetivo' in changes) {
      el.setAttribute('raycaster', 'objects', '.' + data.objetivo);
    }
  },
  
  remove: function() {
    // Eliminar el event listener cuando se elimina el componente
    this.el.removeEventListener('raycaster-intersection', this.interseccionHandler);
    
    // Eliminar el raycaster
    this.el.removeAttribute('raycaster');
  }
});