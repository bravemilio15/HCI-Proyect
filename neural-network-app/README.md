# Red Neuronal de Aprendizaje Interactiva

Sistema web interactivo que simula una red neuronal de aprendizaje de conceptos de programación.

## Descripcion

Este prototipo permite a los usuarios interactuar con una visualización de red neuronal donde cada nodo representa un concepto de programación. Los usuarios pueden hacer clic en los nodos disponibles para "aprender" el concepto, progresando gradualmente hasta dominarlos y desbloquear nuevos conceptos.

## Stack Tecnologico

- **Next.js 15** - Framework React con App Router
- **TypeScript** - Tipado estatico
- **p5.js** - Visualizacion grafica en canvas
- **Tailwind CSS** - Estilos

## Requisitos

- Node.js >= 18.0.0
- npm >= 9.0.0

## Instalacion

1. Navegar al directorio del proyecto:
```bash
cd neural-network-app
```

2. Instalar dependencias:
```bash
npm install
```

3. Iniciar servidor de desarrollo:
```bash
npm run dev
```

4. Abrir el navegador en: `http://localhost:3000`

## Estructura del Proyecto

```
/app
  /api
    /network
      - route.ts              # API endpoints GET y POST
  - layout.tsx                # Layout principal
  - page.tsx                  # Pagina principal
  - globals.css              # Estilos globales

/components
  - NetworkCanvas.tsx         # Componente principal de visualizacion

/domain
  - neuron.types.ts          # Tipos e interfaces TypeScript

/data
  - mock-data.ts             # Datos mock y logica de negocio

/shared
  /constants
    - network.constants.ts   # Constantes (colores, tamaños)
  /utils
    - p5-sketch.ts          # Logica del sketch p5.js
```

## Como Usar

1. Al abrir la aplicacion, veras una red de conceptos de programacion
2. Los nodos **azules** estan disponibles para aprender
3. Haz clic en un nodo disponible para incrementar tu progreso (25% por clic)
4. Cuando alcances 100%, el nodo se vuelve **verde** (dominado)
5. Al dominar un concepto, se desbloquean nuevos conceptos relacionados

## Estados de las Neuronas

- **Gris oscuro**: Bloqueada (necesitas dominar prerrequisitos)
- **Azul pulsante**: Disponible (puedes hacer clic)
- **Amarillo con fase lunar**: En progreso (0-99%)
- **Verde con halo**: Dominada (100%)

## Red de Conceptos

La red incluye conceptos basicos de programacion:

```
Variables → Tipos de Datos → Operadores → Expresiones → Funciones
Condicionales → Bucles → Arrays → Metodos de Arrays → Objetos
Funciones → Parametros → Return / Scope
```

## Scripts Disponibles

### Desarrollo
```bash
npm run dev      # Servidor de desarrollo
npm run build    # Compilar para produccion
npm run start    # Servidor de produccion
npm run lint     # Ejecutar linter
```

### Conversion de Documentacion (Markdown a Word)
```bash
npm run md2docx:readme          # Convierte README.md a README.docx
npm run md2docx:claude          # Convierte CLAUDE.md a CLAUDE.docx
npm run md2docx:instrucciones   # Convierte Instrucciones.md a Instrucciones.docx
npm run md2docx <archivo.md>    # Convierte cualquier archivo .md a output.docx
```

**Nota**: Los archivos .docx generados se crean en la raiz del proyecto. Requiere Pandoc instalado (`choco install pandoc -y`).

## Caracteristicas Implementadas

- Sistema de progreso visual con "fase lunar"
- Animaciones de pulso en nodos disponibles
- Halo brillante en nodos dominados
- Conexiones sinapticas que se iluminan al dominar conceptos
- Feedback visual instantaneo al hacer clic
- Actualizacion optimista del estado
- API REST para persistencia (actualmente en memoria)

## Proximos Pasos (Fase 2)

- [ ] Implementar persistencia en JSON local
- [ ] Agregar boton de reset para reiniciar progreso
- [ ] Mejorar responsive design para mobile
- [ ] Agregar tooltips con descripcion de conceptos
- [ ] Implementar sistema de logros
- [ ] Agregar sonidos de feedback

## Arquitectura

El proyecto sigue principios SOLID y arquitectura en capas:

- **Presentation**: Componentes React
- **Application**: Logica de negocio (mock-data.ts)
- **Domain**: Tipos e interfaces
- **Infrastructure**: API Routes

## Licencia

MIT
