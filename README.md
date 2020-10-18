# Haz pan en casa 🍞

<h1 align="center">
  <img src="formulapanadera/src/assets/logo/logo.png" alt="Logo" width="400" height="auto">
</h1>

![ionic/angular version](https://img.shields.io/badge/ionic/angular-5.3.3-blue)
![angular version](https://img.shields.io/badge/angular-10.1.2-blue)
![typescript version](https://img.shields.io/badge/typescript-4.0.2-blue)
![capacitor version](https://img.shields.io/badge/capacitor-2.4.1-blue)
![firebase](https://img.shields.io/badge/firebase-7.21.0-blue)
![moment](https://img.shields.io/badge/moment-2.29.0-blue)

**Haz pan en casa** es una herramienta de trabajo para la producción panadera y optimización del uso del horno.

## Bienvenido 📱

---

### Tabla de contenido

- [Contexto](#contexto)
- [Documentación](#documentación-)
- [Proyecto](#proyecto-)
- [Funcionalidades](#funcionalidades-)
- [Autor](#autor-)

## Contexto

La panadería como actividad cuenta con una serie de tareas y pasos bien definidos por los cuales se debe pasar para elaborar un pan de forma exitosa. Los panaderos deben planificar la producción y para ello cuentan con la fórmula
panadera, que coloca todos los ingredientes en función de la harina y calcula la hidratación de la masa, lo cual va a generar distintos tipos de panes, ya sean enriquecidos, que contienen mantequilla, huevo, azúcar y leche o panes rústicos que tienen alto nivel de hidratación. Basado en estas proporciones se calcula el costo de
los ingredientes y el costo por unidad.

Adicionalmente los panaderos deben realizar las actividades de paso a paso panadero, estas consisten en 12 pasos que requieren un tiempo específico. Es por esto por lo que siempre se busca maximizar el uso del horno, ya que en las panaderías este es el cuello de botella, si se deja reposar una masa o pastón más del tiempo requerido este se puede sobre fermentar y pierde la calidad, ya que el pan se acidifica.

Por esos motivos, se desarrolló **Haz pan en casa**, una aplicación móvil que permite cargar las fórmulas, calcular el nivel de hidratación y las proporciones de los ingredientes para una producción dada y además ofrece una herramienta de gestión del tiempo para maximizar el uso del horno y evitar tiempos de espera adicionales a los especificados en las fórmulas de una producción.

## Documentación 📖

Encuentra la documentación del proyecto [aquí](https://github.com/synergyvision/formulapanadera/tree/master/docs)

## Proyecto 💻

Si quieres conocer detalles de cómo ejecutar el proyecto y el código del mismo, ingresa a [formulapanadera](https://github.com/synergyvision/formulapanadera/tree/master/formulapanadera)

## Funcionalidades 📄

- **Internacionalización**
- **Autentificación**
  - Registro
  - Inicio y cierre de sesión
  - Recuperación de contraseña
  - Cambio de contraseña
- **Ingredientes**
  - CRUD de ingredientes simples y compuestos
- **Fórmulas**
  - CRUD de fórmulas (simples, con prefermentos y con rellenos, barnices y coberturas)
  - Cálculo de fórmulas dependiendo de una cantidad de unidades especificada _(detalles de una fórmula)_
  - Compartir, publicar y clonar fórmulas _(detalles de una fórmula)_
  - Registro de creditos de creador y modificadores de una fórmula _(detalles de una fórmula)_
- **Producción**
  - CRUD de producción
  - Ejecución de una producción _(ordenando la misma dependiendo del tiempo de uso del horno)_
  - Verificación de jornada laboral _(ejecución de una producción)_

## Autor 🐈

- **Alba Sánchez** - _Desarrollador (Estudiante de Ingeniería Informática. Pasante)_ - [albasanchez](https://github.com/albasanchez)
