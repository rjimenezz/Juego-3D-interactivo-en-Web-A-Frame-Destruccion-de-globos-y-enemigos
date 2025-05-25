// Componente movedor
AFRAME.registerComponent('movedor', {
    schema: {
      velocidad: { type: 'number', default: 1 },    // Unidades por segundo
      intervalo: { type: 'number', default: 2000 }  // Milisegundos entre cambios de dirección
    },
    
    init: function() {
      // Guardar referencias para acceso desde otros métodos
      this.el.movedor = this;
      this.direccion = new THREE.Vector3(0, 0, 0);
      this.ultimoTiempo = 0;
      this.tiempoUltimoCambio = 0;
      
      // Iniciar con una dirección aleatoria
      this.cambiarDireccion();
    },
    
    tick: function(tiempo, deltaTime) {
      if (!deltaTime) return;
      
      // Convertir delta a segundos
      var delta = deltaTime / 1000;
      
      // Verificar si es momento de cambiar de dirección
      if (tiempo - this.tiempoUltimoCambio > this.data.intervalo) {
        this.cambiarDireccion();
        this.tiempoUltimoCambio = tiempo;
      }
      
      // Calcular el desplazamiento en este frame
      var desplazamiento = this.direccion.clone().multiplyScalar(this.data.velocidad * delta);
      
      // Obtener la posición actual
      var posicion = this.el.object3D.position;
      
      // Aplicar el desplazamiento
      posicion.add(desplazamiento);
      
      // Limitar el área de movimiento (opcional)
      this.limitarArea(posicion);
    },
    
    cambiarDireccion: function() {
      // Generar dirección aleatoria
      var x = Math.random() * 2 - 1;  // Valor entre -1 y 1
      var y = Math.random() * 2 - 1;  // Valor entre -1 y 1
      var z = Math.random() * 2 - 1;  // Valor entre -1 y 1
      
      // Normalizar el vector para que la velocidad sea constante
      this.direccion.set(x, y, z).normalize();

    },
    
    limitarArea: function(posicion) {
      // Establecer límites para que no se vaya demasiado lejos
      var limites = 10;
      
      // Comprobar límites en cada eje
      if (Math.abs(posicion.x) > limites) {
        posicion.x = Math.sign(posicion.x) * limites;
        this.rebotarEje('x');
      }
      
      if (Math.abs(posicion.y) > limites) {
        posicion.y = Math.sign(posicion.y) * limites;
        this.rebotarEje('y');
      }
      
      if (Math.abs(posicion.z) > limites) {
        posicion.z = Math.sign(posicion.z) * limites;
        this.rebotarEje('z');
      }
    },
    
    rebotarEje: function(eje) {
      // Invertir la componente de la dirección en el eje especificado
      this.direccion[eje] *= -1;
      
      // Actualizar la rotación para que mire en la nueva dirección
      var lookAtPos = new THREE.Vector3();
      lookAtPos.addVectors(this.el.object3D.position, this.direccion);
      this.el.object3D.lookAt(lookAtPos);
    },
    
    remove: function() {
      // Limpiar cuando se elimina el componente
      delete this.el.movedor;
    }
  });