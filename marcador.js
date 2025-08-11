// Componente marcador
AFRAME.registerComponent('marcador', {
  schema: {
    color: { type: 'color', default: '#FFFFFF' }, // Color del texto
    bgColor: { type: 'color', default: '#000000' }, // Color del fondo
    width: { type: 'number', default: 1 },
    height: { type: 'number', default: 0.5 },
    escala: { type: 'number', default: 1 }, // Escala del texto
    posicion: { type: 'vec3', default: { x: 0, y: 0, z: 0 } }, // Posición relativa
    estilo: { type: 'string', default: "3d" } // "3d" o "pantalla"
  },
  
  init: function() {
    var data = this.data;
    var el = this.el;
    
    // Crear contador inicial
    this.contador = 0;
    
    // Dependiendo del estilo, crear un marcador 3D o un marcador de pantalla
    if (data.estilo === "3d") {
      this.crearMarcador3D();
    } else {
      this.crearMarcadorPantalla();
    }
    
    // Escuchar el evento 'destruido' desde el componente destructor
    this.destruidoHandler = this.handleDestruido.bind(this);
    document.addEventListener('destruido', this.destruidoHandler);
    console.log('Marcador inicializado');
  },
  
  crearMarcador3D: function() {
    var data = this.data;
    
    // Crear plano para mostrar el marcador
    this.plano = document.createElement('a-plane');
    this.plano.setAttribute('width', data.width);
    this.plano.setAttribute('height', data.height);
    this.plano.setAttribute('color', data.bgColor);
    this.plano.setAttribute('position', data.posicion);
    
    // Crear texto para mostrar el contador
    this.texto = document.createElement('a-text');
    this.texto.setAttribute('value', 'Globos: 0');
    this.texto.setAttribute('color', data.color);
    this.texto.setAttribute('align', 'center');
    this.texto.setAttribute('position', {
      x: 0, 
      y: 0, 
      z: 0.01 // Ligeramente delante del plano
    });
    this.texto.setAttribute('scale', {
      x: data.escala,
      y: data.escala,
      z: data.escala
    });
    
    // Añadir texto al plano
    this.plano.appendChild(this.texto);
    
    // Añadir plano a la entidad
    this.el.appendChild(this.plano);
  },
  
  crearMarcadorPantalla: function() {
    // Crear el contador de globos en la esquina superior derecha
    this.contadorHTML = document.createElement('div');
    this.contadorHTML.style.position = 'fixed';
    this.contadorHTML.style.top = '20px';
    this.contadorHTML.style.right = '20px';
    this.contadorHTML.style.padding = '10px';
    this.contadorHTML.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    this.contadorHTML.style.color = 'white';
    this.contadorHTML.style.fontFamily = 'Arial, sans-serif';
    this.contadorHTML.style.fontSize = '18px';
    this.contadorHTML.style.zIndex = '999';
    this.contadorHTML.textContent = 'Globos destruidos: 0';
    
    document.body.appendChild(this.contadorHTML);
  },
  
  handleDestruido: function(event) {
    // Verificar si el objeto destruido es un globo
    if (event.detail && event.detail.tipo === 'globo') {
      this.contador++;
      this.actualizarTexto();
      console.log('Globo destruido. Total:', this.contador);
    }
  },
  
  actualizarTexto: function() {
    if (this.data.estilo === "3d") {
      // Actualizar texto del marcador 3D
      this.texto.setAttribute('value', 'Globos: ' + this.contador);
    } else {
      // Actualizar texto del marcador de pantalla
      this.contadorHTML.textContent = 'Globos destruidos: ' + this.contador;
    }
  },
  
  remove: function() {
    // Limpieza al eliminar el componente
    document.removeEventListener('destruido', this.destruidoHandler);
    
    // Eliminar el contador HTML si existe
    if (this.contadorHTML && this.contadorHTML.parentNode) {
      this.contadorHTML.parentNode.removeChild(this.contadorHTML);
    }
  }
});