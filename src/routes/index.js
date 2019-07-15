const express = require('express');
const app = express();
const {check, validationResult} = require('express-validator/check');
const path = require("path");
const hbs = require('hbs');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const session = require('express-session');

// Models
const User = require('./../models/users');
const Course = require('./../models/courses');
const studentCourse = require('./../models/studentCourses');

const funciones = require('../funciones');
require('../helpers/helpers');

const directorypartials = path.join(__dirname, '../../template/partials');
const directoryviews = path.join(__dirname, '../../template/views');

hbs.registerPartials(directorypartials);

app.set('views', directoryviews);
app.set('view engine', 'hbs');

app.use(session({
  secret: 'Fz}*#hE4"fC,h4Sn*',
  resave: true,
  saveUninitialized: true,
  cookie: { maxAge: 86400000 }
}));

app.get('/', (req, res) => {
    const user = funciones.userSession(req);

    res.render('index', {
        user: (user) ? user : null
    });
});

app.get('/createCourse', (req, res) => {
    res.render('createCourse',{
        user: funciones.userSession(req)
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
    userSession = funciones.userSession(req);
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
            let error = JSON.parse(response).error;

            if(error) {
                res.render(redirect, {
                    response: response,
                    errors: err,
                    //courses: courses,
                    //availableCourses: availableCourses,
                    user: userSession,
                    req: req
                });
            } else {
                 res.redirect(redirect);
            }
        });
    }
});

app.get('/listCourses', (req, res) => {
    userSession = funciones.userSession(req);

    funciones.coursesList().then( courses => {

        res.render('listCourses', {
            courses: courses,
            user: userSession
        });

        return courses;
    });    
});

app.get('/enroll', (req, res) => {
    availableCourses = funciones.availableCoursesList();
    res.render('enrollCourse', {
        availableCourses: availableCourses
    });
});

app.get('/enrollStudent/:courseId/:studentId', [
    check('courseId').not().isEmpty().withMessage('Debe ingresar el identificador del curso'),
    check('studentId').not().isEmpty().withMessage('Debe de ingresar el número de identificación').isDecimal().withMessage('El número de identificación debe ser numérico')
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
                user: funciones.userSession(req)
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
    //availableCourses = funciones.availableCoursesList();
    enrolledStudents = funciones.enrolledStudentsList();
    user = funciones.userSession(req);
    
    funciones.coursesList("status","Disponible").then( availableCourses => {

        res.render('viewEnrolled', {
            availableCourses: availableCourses,
            enrolledStudents: enrolledStudents,
            user: user
        });

        return courses;
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

        user = funciones.userSession(req);

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
    check('username').not().isEmpty().withMessage('Debe de ingresar un nombre de usuario'),
    check('password').not().isEmpty().withMessage("La contraseña es requerida")
        .isLength({min: 6}).withMessage("La contraseña debe tener al menos 6 caracteres")
        .isLength({max: 20}).withMessage("La contraseña puede tener máximo 20 caracteres")
        .custom((value, { req }) => {
            if (value === req.body.confirmPassword) {
                return true;
            } else {
                return false;
            }
        }).withMessage("Las contraseñas no coinciden"),        
    check('username').custom(value => {
        return funciones.findUser("username",value).then(user => {
            if (user) {
                return Promise.reject('El usuario ya se encuentra en uso');
            }
        });
    })       
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
        var salt = bcrypt.genSaltSync(saltRounds);

        let user = {
            identificationNumber: parseInt(req.body.identificationNumber),
            name: req.body.name,
            phone: req.body.phone, 
            email: req.body.email,
            userType: req.body.userType,
            username: req.body.username,
            password: bcrypt.hashSync(req.body.password, salt) 
        };

        funciones.saveUser(user).then((response) => {
            console.log('3rd then, after calling saveUser: ' + response);

            redirect = JSON.parse(response).redirect;
            error = JSON.parse(response).error;
            
            if( error ) {
                res.render(redirect, {
                    response: response,
                    errors: err,
                    courses: courses,
                    availableCourses: availableCourses,
                    req: req
                });
            } else {
                res.redirect(redirect);
            }
        });
    }
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.post('/login', [
    check('username').not().isEmpty().withMessage('Debe ingresar el nombre de usuario'),
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

        funciones.loginUser(req).then((response) => {
            console.log('3rd then, after calling loginUser: ' + response);

            let redirect = JSON.parse(response).redirect;

            res.redirect(redirect);
        });
    }
});

app.get('/logout', (req, res) => {

	req.session.destroy((err) => {
  		if (err) 
          return console.log(err) 	
	})	

	res.redirect('/')    
});

app.get('/myCourses/:identificationNumber', (req, res) => {
    identificationNumber = req.params.identificationNumber;

    let response = funciones.myCourses(identificationNumber);
    let myCourses = (JSON.parse(response).myCourses != null) ? JSON.parse(response).myCourses : response.myCourses;
    let message =  JSON.parse(response).message;
    let error = JSON.parse(response).error;

    userSession = funciones.userSession(req);

    res.render('myCourses', {
        user: userSession,
        myCourses: myCourses,
        message: JSON.stringify(message),
        error: JSON.stringify(error)
    });
});

app.get('/usersAdmin', (req, res) => {
    userSession = funciones.userSession(req);
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
    userSession = funciones.userSession(req);

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

module.exports = app;