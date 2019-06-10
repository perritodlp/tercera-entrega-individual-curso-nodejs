/*jshint esversion: 6 */

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
    res.render('index');
});

app.get('/createCourse', (req, res) => {
    res.render('createCourse');
});

app.post('/saveCourse', [
    check('name').not().isEmpty().withMessage('Debe ingresar el nombre completo'),
    check('courseId').not().isEmpty().withMessage('Debe ingresar el id del curso'),
    check('cost').not().isEmpty().withMessage('Debe de ingresar el valor del curso'),
    check('description').not().isEmpty().withMessage('Debe de ingresar la descripción del curso'),
  ],function (req, res) {

    const errors = validationResult(req);
    let err = '';

    if (!errors.isEmpty()) {
        err = JSON.stringify(errors.array());
        response = null;

        res.render('createCourse', {
            response: response,
            errors: err
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
            console.log('3rd then, after calling saveCourse: ' + response);

            let redirect = JSON.parse(response).redirect;

            res.render(redirect, {
                response: response,
                errors: err,
                courses: courses
            });            
        });
    }
});

app.get('/listCourses', (req, res) => {
    courses = funciones.coursesList();
    availableCourses = funciones.availableCoursesList();
    res.render('listCourses', {
        courses: courses,
        availableCourses: availableCourses
    });
});

app.get('/enroll', (req, res) => {
    availableCourses = funciones.availableCoursesList();
    res.render('enrollCourse', {
        availableCourses: availableCourses
    });
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
            console.log('3rd then, after calling enrollStudent: ' + response);

            res.render('enrollCourse', {
                response: response,
                errors: err,
                availableCourses: availableCourses
            });            
        });
    }
});

app.get('*', (req, res) => {
    res.render('error');
});

app.listen(3002, () => {
    console.log('Escuchando el puerto 3002');
});