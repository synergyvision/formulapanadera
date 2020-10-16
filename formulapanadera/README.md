# Haz pan en casa 🍞

<h1 align="center">
  <img src="src/assets/logo/logo.png" alt="Logo" width="400" height="auto">
</h1>

![ionic/angular version](https://img.shields.io/badge/ionic/angular-5.3.3-blue)
![angular version](https://img.shields.io/badge/angular-10.1.2-blue)
![typescript version](https://img.shields.io/badge/typescript-4.0.2-blue)
![capacitor version](https://img.shields.io/badge/capacitor-2.4.1-blue)
![firebase](https://img.shields.io/badge/firebase-7.21.0-blue)
![moment](https://img.shields.io/badge/moment-2.29.0-blue)

**Haz pan en casa** es una herramienta de trabajo para la producción panadera y optimización del uso del horno.

## Proyecto 💻

### Tabla de contenido

- [Pre-requisitos](#pre-requisitos)
- [Instalación](#instalación)
- [Ejecutar la aplicación](<#ejecutar-la-aplicación-(web)>)
  - [Web](<#ejecutar-la-aplicación-(web)>)
  - [Android](<#ejecutar-la-aplicación-(android)>)
  - [iOS](<#ejecutar-la-aplicación-(ios)>)
- [Autor](#autor)

### Pre-requisitos

- [NodeJS](https://nodejs.org/en/)
- [Git](https://git-scm.com/)
- [Ionic CLI](https://ionicframework.com/docs/intro/cli)
- [Android Studio](https://developer.android.com/studio/?gclid=CjwKCAjwkJj6BRA-EiwA0ZVPVvJ8JbjUZ8vMZR7WxLUztMkdxgTqOuAhmIdfprN29xYVsx_I50KZvBoC5bsQAvD_BwE&gclsrc=aw.ds) (Pruebas en dispositivos Android)
- [Xcode](https://developer.apple.com/xcode/) (Pruebas en dispositivos iOS)

### Instalación

1. Realiza los siguientes comandos para instalar la aplicación y sus dependencias

```bash
git clone https://github.com/synergyvision/formulapanadera.git
cd formulapanadera
npm install
```

2. Una vez descargados los archivos del repositorio, debe agregar en la raiz del proyecto (src/) la carpeta "environments", que contiene dos archivos: "environment.ts" y "environment.prod.ts" que poseen las credenciales de la base de datos. Esta carpeta se debe solicitar a los desarrolladores por motivos de seguridad.

3. Realice el build de la aplicación, esto creará una carpeta con el nombre de "www".

```bash
ionic build
```

4. Una vez terminado el build, cree las aplicaciones de Android y Ios con los siguientes comando:

```bash
ionic cap add android
ionic cap add ios
```

5. Ejecute el siguiente comando para generar los iconos y Splash Screen en sus carpetas nativas.

```bash
npm run resources
```

### Ejecutar la aplicación (web)

```bash
ionic serve
```

### Ejecutar la aplicación (Android)

> Para ejecutar la aplicación en dispositivos Android debes tener instalado Android Studio.
> Antes de ejecutar la aplicación en Android o iOS, debe ejecutar el siguiente comando para copiar los cambios realizados

```bash
ionic cap copy
```

1. Ejecute el siguiente comando y espere que Android Studio realice las configuraciones del proyecto y construya los gradle:

```bash
ionic cap open android
```

2. Conecte un dispositivo Android en su computador y procure que esté habilitada la depuración en el dispositivo.

3. Seleccione su dispositivo en Android Studio y ejecute la aplicación.

### Ejecutar la aplicación (iOS)

> Para ejecutar la aplicación en dispositivos iOS se requiere de una Mac que posea Xcode.
> Antes de ejecutar la aplicación en Android o iOS, debe ejecutar el siguiente comando para copiar los cambios realizados

```bash
ionic cap copy
```

1. Ejecute el siguiente comando y espere que Xcode realice las configuraciones del proyecto y construya los gradle:

```bash
ionic cap open ios
```

2. Conecte un dispositivo iOS en su computador y procure que esté habilitada la depuración en el dispositivo.

3. Seleccione su dispositivo en Xcode y ejecute la aplicación.

## Autor

- **Alba Sánchez** - _Desarrollador (Estudiante de Ingeniería Informática. Pasante)_ - [albasanchez](https://github.com/albasanchez)
