### Segunda entrega grupal del curso de introducción a Node.Js mediante el desarrollo de un proyecto ágil

Se lleva a cabo la implementación de las cinco (8) historias de usuario asignadas y se verifica el cumplimiento de los criterios de aceptación.

### :cloud: Probando la aplicación en Heroku

```bash
# Abrir en el navegador la aplicación
https://curso-fundamentos-nodejs.herokuapp.com/
```

### :cloud: Instalación


```bash
# Clonar el repositorio
git clone https://github.com/perritodlp/segunda-entrega-individual-curso-nodejs.git
# Cambiarse al directorio del repo creado
cd segunda-entrega-individual-curso-nodejs
```

```bash
# Instalar dependencias
npm install
```

### :clipboard: Ejecución

Historias de usuario de la primera a la ocho

```bash
# Ejecutar en la consola el siguiente comando
nodemon -e js,hbs src/app
```
### :yum: Visualización
```bash
# Abrir una ventana o pestaña de navegador, abrir la siguiente dirección y probar
http://localhost:3002/
```

### :yum: Indicaciones necesarias
```bash
# Credenciales usuario coordinador
usuario: 12345678
contraseña: 12345678

# Opciones generales
Inicio de sesión y registro: No se están manejando sesiones por tanto en algunas ocasiones no aparecerán los datos del usuario en la cabecera del sitio. Se recomienda darle clic a inicio para que aparezcan de nuevo.

El usuario y contraseña serán el número de identificación del usuario.

# Opciones como coordinador:
1. Crear curso: Permite la creación de un curso
2. Ver inscritos: Permite listar los cursos disponibles con los alumnos inscritos, eliminar un estudiante de un curso y cerrar el curso
3. Administrar usuarios: Permite listar los usuarios de la plataforma y cambiar el rol de aspirante a docente y viceversa.
4. Ver cursos: Permite listar los cursos creados, ver su estado y en la parte inferior, cambiar el estado de un curso a cerrado.

# Opciones como aspirante
1. Ver cursos: Permite ver una lista de cursos disponibles y optar por inscribirse en uno.
2. Mis cursos: Lista los cursos en se encuentra inscrito el aspirante y permite desuscribirse de ellos.
```