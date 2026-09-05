# Manual de usuario — Lumis

Guía de uso de **Lumis**, la biblioteca virtual personalizable: subís tus libros, los
organizás en estanterías armadas por vos, los leés desde un lector propio y llevás tus
notas, subrayados y reseñas en un mismo lugar.

> Este manual describe la aplicación completa (frontend + API) desde la perspectiva de
> quien la usa. La parte evaluada en el Cuarto Proyecto Integrador es la API — este
> documento es un complemento pensado para entender qué hace la app en la práctica.

- **App en producción:** https://lumis-web-sandy.vercel.app

## Índice

1. [Crear una cuenta e iniciar sesión](#1-crear-una-cuenta-e-iniciar-sesión)
2. [Subir un libro](#2-subir-un-libro)
3. [Armar tus estanterías](#3-armar-tus-estanterías)
4. [Leer un libro](#4-leer-un-libro)
5. [Subrayar y tomar notas](#5-subrayar-y-tomar-notas)
6. [La sección Notas](#6-la-sección-notas)
7. [Reseñas](#7-reseñas)
8. [Perfil y estadísticas](#8-perfil-y-estadísticas)
9. [Preguntas frecuentes](#9-preguntas-frecuentes)

## 1. Crear una cuenta e iniciar sesión

1. Entrá a la landing de Lumis y tocá **"Crear cuenta"**.
2. Completá email, nombre y contraseña. La contraseña nunca se guarda en texto plano — se
   hashea antes de persistirse.
3. Con la cuenta creada, iniciá sesión desde **"Iniciar sesión"**.
4. La sesión se mantiene activa automáticamente: la app renueva tu token de acceso en
   segundo plano usando el refresh token, sin que tengas que volver a loguearte cada rato.
5. Podés cerrar sesión en cualquier momento desde tu perfil — eso invalida el refresh token
   de ese dispositivo puntual (las demás sesiones activas no se ven afectadas).

## 2. Subir un libro

Desde **"Tu biblioteca"**:

1. Tocá **"Subir libro"**.
   - En pantallas chicas, este formulario queda colapsado detrás del botón "Subir libro"
     para no ocupar espacio; en desktop se muestra siempre abierto.
2. Elegí el archivo. Formatos soportados: **PDF, EPUB, MOBI, CBR, CBZ y TXT**.
3. Completá el título y demás metadata (autor, portada si querés subir una propia).
4. Confirmá — el libro queda disponible en tu biblioteca, con su portada generada
   automáticamente si no subiste una.

Desde la biblioteca también podés reordenar tus libros (arrastrándolos) o eliminarlos.

## 3. Armar tus estanterías

Desde **"Tus estanterías"**:

1. Creá una estantería nueva con **"Crear nueva estantería"**.
2. Dentro del editor, arrastrás una estantería (el mueble) al canvas para colocarla —
   podés tener varias, cambiarles el color, y acomodarlas como quieras en el espacio.
3. Arrastrás tus libros desde la lista hacia las estanterías ya puestas, en la posición
   exacta que quieras (el editor recuerda esa posición).
4. Podés sacar un libro de una estantería sin borrarlo de tu biblioteca ("Quitar de la
   estantería").
5. Una vez que guardás los cambios, la estantería queda "bloqueada": tocar la portada de un
   libro ya no lo mueve, sino que **abre directamente el lector** en ese libro.
6. Podés borrar una estantería completa — los libros que tenía no se borran, solo dejan de
   estar ahí.

## 4. Leer un libro

Al abrir un libro se abre el **lector**, con controles para:

- **Paginado**: pasar de página en modo horizontal o vertical, según lo que te resulte más
  cómodo (se adapta también a celular).
- **Regla de lectura** ("line focus"): un overlay que resalta la línea que estás leyendo y
  sombrea el resto de la página, para no perder el lugar. Se activa/desactiva con el botón
  correspondiente en los controles del lector, y la app recuerda tu preferencia libro por
  libro.
- **Progreso de lectura**: la página en la que quedaste se guarda automáticamente; al
  volver a abrir el libro, retomás donde lo dejaste.
- **Herramientas de dibujo/marcado**: lápiz, marcador, cepillo y otros pinceles para
  subrayar o anotar directamente sobre el texto (ver sección siguiente).

## 5. Subrayar y tomar notas

- Cualquiera de los pinceles disponibles (lápiz, marcador, cepillo, etc.) funciona igual:
  al pasarlo sobre un fragmento de texto, ese fragmento queda **subrayado de verdad**
  (anclado al texto, no un dibujo suelto) y aparece después como una nota adhesiva
  ("post-it") en la sección Notas.
- Además de subrayar, podés escribir una nota libre asociada a una página o fragmento del
  libro.
- Tanto los subrayados como las notas se pueden **fijar** (📌) para elegir cuál va a ser la
  cita/nota destacada de ese libro — la que se muestra primero en su resumen.

## 6. La sección Notas

Desde el menú principal, **"Notas"** muestra:

- Un buscador y filtros para encontrar rápido una nota o subrayado puntual.
- Una tarjeta por libro, con sus post-its (notas y subrayados juntos) uno al lado del otro.
- Un pie con estadísticas rápidas: cantidad de notas, de subrayados, y de libros con
  anotaciones.
- El botón **"Ver todas"** de cada libro te lleva a una página propia con **todos** los
  post-its de ese libro (no al lector) — tanto notas como subrayados.

Si un libro todavía no tiene ninguna nota ni subrayado, la sección muestra una pantalla
vacía ilustrada en lugar de un listado en blanco.

## 7. Reseñas

Cada libro tiene su propia reseña personal: un puntaje y un comentario que solo vos ves.
Se guarda automáticamente al escribirla, y podés editarla cuando quieras — no hay un botón
de "publicar", es simplemente tu registro privado de qué te pareció.

## 8. Perfil y estadísticas

Desde tu perfil podés:

- Editar tu nombre, bio, ubicación, frase favorita y avatar.
- Elegir tema visual (claro/oscuro/según el sistema) y tipografía preferida para toda la
  app.
- Ver tus estadísticas de lectura: cantidad de libros, progreso general, y actividad
  reciente.

## 9. Preguntas frecuentes

**¿Qué pasa si subo un archivo en un formato no soportado?**
La app lo rechaza antes de subirlo y te avisa qué formatos sí acepta (PDF, EPUB, MOBI, CBR,
CBZ, TXT).

**¿Puedo acceder a mis libros desde otro dispositivo?**
Sí, iniciando sesión con la misma cuenta — todo (biblioteca, estanterías, progreso, notas)
está asociado a tu usuario, no al dispositivo.

**¿Se puede recuperar una estantería que borré por error?**
No — borrar una estantería es una acción permanente sobre esa estantería (los libros que
contenía se conservan igual en tu biblioteca, solo se pierde el armado visual). Prestá
atención al mensaje de confirmación antes de borrar.

**¿Mis datos están protegidos si otra persona entra a mi cuenta?**
Todos los endpoints que exponen o modifican datos personales requieren estar autenticado, y
cada operación valida que el recurso (libro, estantería, nota, etc.) te pertenezca antes de
mostrarlo o modificarlo.
