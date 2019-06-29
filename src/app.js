/*jshint esversion: 6 */

const port = process.env.PORT || 3002;
const express = require('express');
const app = express();
const {check, validationResult} = require('express-validator/check');
const path = require("path");
const bodyParser = require('body-parser');
const hbs = require('hbs');
const funciones = require('./funciones');
require('./helpers/helpers');

const dirNodeModules = path.join(__dirname , '../node_modules');
const directorypartials = path.join(__dirname, '../template/partials');
hbs.registerPartials(directorypartials);

app.use('/css', express.static(dirNodeModules + '/bootstrap/dist/css'));
app.use('/js', express.static(dirNodeModules + '/jquery/dist'));
app.use('/js', express.static(dirNodeModules + '/popper.js/dist'));
app.use('/js', express.static(dirNodeModules + '/bootstrap/dist/js'));
app.use(express.static(path.join(__dirname + '/../public')));
app.use(bodyParser.urlencoded({extended: false}));

app.set('views', path.join(__dirname, '../template/views'));
app.set('view engine', 'hbs');

app.get('/', (req, res) => {
    const user = funciones.userSessionList()[0];

    res.render('index', {
        user: (user) ? user : null
    });
});

app.get('/createCourse', (req, res) => {
    res.render('createCourse',{
        user: funciones.userSessionList()[0]
    });
});

app.post('/saveCourse', [
    check('name').not().isEmpty().withMessage('Debe ingresar el nombre completo'),
    check('courseId').not().isEmpty().withMessage('Debe ingresar el id del curso'),
    check('cost').not().isEmpty().withMessage('Debe de ingresar el valor del curso'),
    check('description').not().isEmpty().withMessage('Debe de ingresar la descripción del curso'),
  ],function (req, res) {

    const errors = validationResult(req);
    let err = '';
    userSession = funciones.userSessionList()[0];
    availableCourses = funciones.availableCoursesList();

    if (!errors.isEmpty()) {
        err = JSON.stringify(errors.array());
        response = null;

        res.render('createCourse', {
            response: response,
            errors: err,
            user: userSession
        });         
    } else {

        let course = {
            courseId: parseInt(req.body.courseId),
            name: req.body.name,
            cost: req.body.cost, 
            description: req.body.description,
            modality: req.body.modality,
            hourlyIntensity: req.body.hourlyIntensity,
            status: 'Disponible' 
        };

        funciones.saveCourse(course).then((response) => {
            //console.log('3rd then, after calling saveCourse: ' + response);

            let redirect = JSON.parse(response).redirect;

            res.render(redirect, {
                response: response,
                errors: err,
                courses: courses,
                availableCourses: availableCourses,
                user: userSession
            });            
        });
    }
});

app.get('/listCourses', (req, res) => {
    courses = funciones.coursesList();
    availableCourses = funciones.availableCoursesList();
    userSession = funciones.userSessionList()[0];

    res.render('listCourses', {
        courses: courses,
        availableCourses: availableCourses,
        user: userSession
    });
});

app.get('/enroll', (req, res) => {
    availableCourses = funciones.availableCoursesList();
    res.render('enrollCourse', {
        availableCourses: availableCourses
    });
});

app.get('/enrollStudent/:courseId/:identificationNumber', [
    check('courseId').not().isEmpty().withMessage('Debe ingresar el identificador del curso'),
    check('identificationNumber').not().isEmpty().withMessage('Debe de ingresar el número de identificación').isDecimal().withMessage('El número de identificación debe ser numérico')
], function (req, res) {
    availableCourses = funciones.availableCoursesList();  
    const errors = validationResult(req);
    let err = '';

    if (!errors.isEmpty()) {
        err = JSON.stringify(errors.array());
        response = null;

        res.render('listCourses', {
            response: response,
            errors: err,
            availableCourses: availableCourses
        });         
    } else {
        
        studentFounded = funciones.getUser(req.params.identificationNumber);

        let student = {
            courseId: parseInt(req.params.courseId),
            name: studentFounded.user.name,
            phone: studentFounded.user.phone, 
            email: studentFounded.user.email,
            identificationNumber: studentFounded.user.identificationNumber
        };        

        funciones.enrollStudent(student).then((response) => {
            //console.log('3rd then, after calling enrollStudent: ' + response);

            res.render('listCourses', {
                response: response,
                errors: err,
                availableCourses: availableCourses,
                user: funciones.userSessionList()[0]
            });     
            //res.redirect('/listCourses/' + response + '/' + err);        
        });
    }    
});

app.post('/enrollStudent', [
    check('name').not().isEmpty().withMessage('Debe ingresar el nombre completo'),
    check('courseId').not().isEmpty().withMessage('Debe ingresar el curso'),
    check('phone').not().isEmpty().withMessage('Debe de ingresar el teléfono').isDecimal().withMessage('El teléfono debe ser numérico'),
    check('email').not().isEmpty().isEmail().normalizeEmail().withMessage('Debe de ingresar el correo electrónico'),
    check('identificationNumber').not().isEmpty().withMessage('Debe de ingresar el número de identificación').isDecimal().withMessage('El número de identificación debe ser numérico'),
  ],function (req, res) {
    availableCourses = funciones.availableCoursesList();  
    const errors = validationResult(req);
    let err = '';

    if (!errors.isEmpty()) {
        err = JSON.stringify(errors.array());
        response = null;

        res.render('enrollCourse', {
            response: response,
            errors: err,
            availableCourses: availableCourses
        });         
    } else {

        let student = {
            courseId: parseInt(req.body.courseId),
            name: req.body.name,
            phone: req.body.phone, 
            email: req.body.email,
            identificationNumber: req.body.identificationNumber
        };

        funciones.enrollStudent(student).then((response) => {
            //console.log('3rd then, after calling enrollStudent: ' + response);

            res.render('enrollCourse', {
                response: response,
                errors: err,
                availableCourses: availableCourses
            });            
        });
    }
});

app.get('/viewEnrolled', (req, res) => {
    availableCourses = funciones.availableCoursesList();
    enrolledStudents = funciones.enrolledStudentsList();
    user = funciones.userSessionList()[0];
    
    res.render('viewEnrolled', {
        availableCourses: availableCourses,
        enrolledStudents: enrolledStudents,
        user: user
    });
});

const changeCourseStateHandler = (req, res) => {
    courseId = (req.method === 'GET') ? req.params.courseId : req.body.courseId;  

    availableCourses = funciones.availableCoursesList();
    courses = funciones.coursesList();
    userSession = funciones.userSessionList();

    const errors = validationResult(req);
    let err = '';

    if (!errors.isEmpty()) {
        err = JSON.stringify(errors.array());
        response = null;

        res.render('listCourses', {
            response: response,
            errors: err,
            courses: courses,
            availableCourses: availableCourses,
            user: userSession
        });        
      
    } else {
        funciones.changeCourseStatus(availableCourses, courseId, 'Cerrado').then((response) => {
            //console.log('3rd then, after calling changeCourseStatus: ' + response);

            res.render('listCourses', {
                response: response,
                errors: err,
                courses: courses,
                availableCourses: availableCourses,
                user: userSession
            });            
        });
    }    
};

app.get('/changeCourseState/:courseId', [
    check('courseId').not().isEmpty().withMessage('Debe seleccionar un curso para actualizar'),
  ], changeCourseStateHandler );

app.post('/changeCourseState', [
    check('courseId').not().isEmpty().withMessage('Debe seleccionar un curso para actualizar'),
  ], changeCourseStateHandler );  

app.get('/deleteStudentFromCourse/:studentId/:courseId', (req, res) => {
    studentId = req.params.studentId;
    courseId = req.params.courseId;  

    console.log('StudentId: ' + studentId);
    console.log('courseId: ' + courseId);

    let err = '';

    funciones.deleteStudentFromCourse(studentId, courseId).then((response) => {
        //console.log('3rd then, after calling deleteStudentFromCourse: ' + response);

        user = funciones.userSessionList()[0];

        if(user.userType == "Coordinador") {
            res.render('viewEnrolled', {
                response: response,
                errors: err,
                availableCourses: funciones.availableCoursesList(),
                enrolledStudents: funciones.enrolledStudentsList()
            });            
        } else {
            res.redirect("/myCourses/" + user.identificationNumber);
        }
    });
});

app.get('/signup', (req, res) => {
    res.render('register');
});

app.post('/signup', [
    check('name').not().isEmpty().withMessage('Debe ingresar el nombre completo'),
    check('identificationNumber').not().isEmpty().withMessage('Debe ingresar el número de identificación'),
    check('phone').not().isEmpty().withMessage('Debe de ingresar el teléfono'),
    check('email').not().isEmpty().withMessage('Debe de ingresar correo electrónico'),
  ],function (req, res) {

    const errors = validationResult(req);
    let err = '';

    if (!errors.isEmpty()) {
        err = JSON.stringify(errors.array());
        response = null;

        res.render('register', {
            response: response,
            errors: err,
            req: req
        });         
    } else {

        let user = {
            identificationNumber: parseInt(req.body.identificationNumber),
            name: req.body.name,
            phone: req.body.phone, 
            email: req.body.email,
            userType: req.body.userType 
        };

        funciones.saveUser(user).then((response) => {
            console.log('3rd then, after calling saveUser: ' + response);

            let redirect = JSON.parse(response).redirect;

            res.render(redirect, {
                response: response,
                errors: err,
                courses: courses,
                availableCourses: availableCourses
            });            
        });
    }
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.post('/login', [
    check('username').not().isEmpty().withMessage('Debe ingresar el número de identificación como nombre de usuario'),
    check('password').not().isEmpty().withMessage('Debe de ingresar la contraseña'),
  ],function (req, res) {

    const errors = validationResult(req);
    let err = '';

    if (!errors.isEmpty()) {
        err = JSON.stringify(errors.array());
        response = null;

        res.render('login', {
            response: response,
            errors: err,
            req: req
        });         
    } else {

        funciones.loginUser(req.body.username, req.body.password).then((response) => {
            console.log('3rd then, after calling loginUser: ' + response);

            let redirect = JSON.parse(response).redirect;
            let err = JSON.parse(response).error;

            res.render(redirect, {
                response: response.message,
                errors: err,
                courses: funciones.coursesList(),
                availableCourses: funciones.availableCoursesList(),
                user: JSON.parse(response).user
            });
        });
    }
});

app.get('/logout/:identificationNumber', (req, res) => {
    identificationNumber = req.params.identificationNumber;

    funciones.logout(identificationNumber).then((response) => {
        console.log('3rd then, after calling logout: ' + response);

        res.render('index',{
            user: null
        });         
    });
});

app.get('/myCourses/:identificationNumber', (req, res) => {
    identificationNumber = req.params.identificationNumber;

    let response = funciones.myCourses(identificationNumber);
    let myCourses = (JSON.parse(response).myCourses != null) ? JSON.parse(response).myCourses : response.myCourses;
    let message =  JSON.parse(response).message;
    let error = JSON.parse(response).error;

    userSession = funciones.userSessionList()[0];

    res.render('myCourses', {
        user: userSession,
        myCourses: myCourses,
        message: JSON.stringify(message),
        error: JSON.stringify(error)
    });
});

app.get('/usersAdmin', (req, res) => {
    userSession = funciones.userSessionList()[0];
    users = funciones.usersList();

    res.render('usersAdmin', {
        user: userSession,
        users: users,
        response: '',
        errors: '',
        message: ''
    });
});

app.get('/changeUserType/:identificationNumber/:newUserType', [
    check('identificationNumber').not().isEmpty().withMessage('Debe enviar el número de identificación del usuario a modificar'),
  ], (req, res) => {
    identificationNumber = req.params.identificationNumber; 
    newUserType = req.params.newUserType; 

    users = funciones.usersList();
    userSession = funciones.userSessionList()[0];

    const errors = validationResult(req);
    let err = '';

    if (!errors.isEmpty()) {
        err = JSON.stringify(errors.array());
        response = null;

        res.render('usersAdmin', {
            response: response,
            errors: err,
            user: userSession,
            users: users
        });        
      
    } else {
        funciones.changeUserType(users, identificationNumber, newUserType).then((response) => {
            console.log('3rd then, after calling changeUserType: ' + response);

            res.render('usersAdmin', {
                response: response,
                errors: err,
                user: userSession,
                users: users
            });            
        });
    }    
});

app.get('*', (req, res) => {
    res.render('error');
});

app.listen(port, () => {
    console.log('Escuchando el puerto ' + port);
});