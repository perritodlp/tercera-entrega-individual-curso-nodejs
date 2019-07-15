/*jshint esversion: 6 */

// Models
const User = require('./models/users');
const Course = require('./models/courses');
const studentCourse = require('./models/studentCourses');

const fs = require('fs');
const bcrypt = require('bcrypt');

//courses = [];
availableCourses = [];
enrolledStudents = [];
enrolledStudentsByCourse = [];
users = [];
//const userSession = "";

const DEFAULT_USER_TYPE = 'Aspirante';

const saveCourse = async (course) => {
    let message;
    let error = false;  

    //coursesList();
    //availableCoursesList();
    let cur = {
        courseId: course.courseId,
        name: course.name,
        description: course.description,
        hourlyIntensity: course.hourlyIntensity,
        cost: course.cost,
        modality: course.modality,
        status: course.status
    };

    let duplicado = await findCourse("courseId", course.courseId);

    if(!duplicado){
        //courses.push(cur);

        return createCourse(cur).then((message) => {
            console.log('1st then, inside saveCourse(): ' + message);

            let response = {
                error: error,
                message: message,
                redirect: 'listCourses'
            };

            return JSON.stringify(response);
        });        

    } else {
        error = true;
        message = 'Ya existe otro curso con ese identificador';
    }

    let response = {
        error: error,
        message: message,
        redirect: 'createCourse'
    };

    return JSON.stringify(response);
};

const findCourse = async function (key, value) { 
    try { 
        var query = {};
        if( value !== "" ) {
            query[key] = value;
        } 
                
        return await Course.findOne(query);
    } catch(err) { 
        console.log(err) 
    }
};

const coursesList = async () => {
    try { 
        return await Course.find({});
    } catch(err) { 
        console.log(err) 
    }
};

const createCourse = (course, action = 'creado') => {

    let cur = new Course({
        courseId: course.courseId,
        name: course.name,
        description: course.description,
        hourlyIntensity: course.hourlyIntensity,
        cost: course.cost,
        modality: course.modality,
        status: course.status
    });

    return new Promise(function(resolve, reject) {
        cur.save((err, response) => {
            if( err ) reject(err);
            resolve("Curso de " + course.name + " " + action + " con éxito");
        });
    });
};

const enrolledStudentsList = () => {
    try {
        delete require.cache[require.resolve('./studentCourses.json')]

        enrolledStudents = require('./studentCourses.json');
    } catch(error) {
        enrolledStudents = [];
    }

    return enrolledStudents;
};

const availableCoursesList = () => {
    //let availableCourses = [];

    try {
        availableCourses = coursesList("status","Disponible").then(availableCourses => {
            console.log('Cursos disponibles: ' + availableCourses);
            
            return availableCourses;
        });
        /* courses.forEach(course => {
            if( course.status == 'Disponible') {
                availableCourses.push(course); 
            }
        }); */
    } catch(error) {
        availableCourses = null;
    }
    
    return availableCourses;
};

const enrollStudent = async (student) => {
    let message;
    let error = false;  

    availableCoursesList();
    enrolledStudentsList();
    let enrollStudent = {
        courseId: student.courseId,
        studentId: student.studentId
    };

    // Buscamos si el estudiante ya se encuentra matriculado en un curso, usando el número de identificación y el identificador del curso
    var results = [];
    enrolledStudents.forEach(x => {
        if (x.courseId == enrollStudent.courseId && x.identificationNumber == enrollStudent.identificationNumber) 
            results.push(x)
    });

    let courseName = availableCourses.find(id => (id.courseId == enrollStudent.courseId));
    let duplicado = ( results.length > 0 ) ? true : false;

    if(!duplicado){
        enrolledStudents.push(enrollStudent);

        return createStudentCourse(enrolledStudents, student.name, courseName.name).then((message) => {
            //console.log('1st then, inside enrollStudent(): ' + message);

            let response = {
                error: error,
                message: message
            };

            return JSON.stringify(response);
        });        

    } else {
        error = true;
        message = 'El estudiante ' + enrollStudent.name + ' ya se encuentra matriculado en el curso ' + courseName.name;
    }

    let response = {
        error: error,
        message: message
    };

    return JSON.stringify(response);
};

const createStudentCourse = (enrolledStudents, name, courseName, action = 'inscrito') => {
    return new Promise(function(resolve, reject) {
        let data = JSON.stringify(enrolledStudents);

        fs.writeFile('./src/studentCourses.json', data, (err) => {
            if( err ) reject(err);
            resolve("El estudiante " + name + " ha sido " + action + " con éxito, en el curso " + courseName);
        });
    });    
};

const changeCourseStatus = (availableCourses, courseId, newStatus) => {
    let message = '';
    let error = false;

    if( availableCourses ) {
        for (var i in availableCourses) {
            if (availableCourses[i].courseId == courseId) {
                availableCourses[i].status = newStatus;
                courseName = availableCourses[i].name;
                break; //Stop this loop, we found it!
            }
        }

        return createCourse(courseName, 'actualizado').then((message) => {
            //console.log('1st then, inside saveCourse(): ' + message);

            let response = {
                error: error,
                message: message,
                redirect: 'listCourses'
            };

            return JSON.stringify(response);
        });  

    } else {
        error = true;
        message = 'Se produjo un error obteniendo la información de los cursos';
    }

    let response = {
        error: error,
        message: message,
        redirect: 'listCourses'
    };

    return JSON.stringify(response);
};

const deleteStudentFromCourse = (studentId, courseId) => {
    let message = '';
    let error = false;  

    let availableCourses = availableCoursesList();
    let enrolledStudents = enrolledStudentsList();

    // Buscamos si el estudiante ya se encuentra matriculado en un curso, usando el número de identificación y el identificador del curso y obtenemos su nombre
    let studentData = enrolledStudents.filter(student => (student.courseId == courseId && student.identificationNumber == studentId));
    let studentName = studentData[0].name;

    let courseData = availableCourses.find(id => (id.courseId == courseId));
    let courseName = courseData.name;    

    // Buscamos si el estudiante ya se encuentra matriculado en un curso, usando el número de identificación y el identificador del curso y lo borramos   
    //enrolledStudents = enrolledStudents.filter(student => (student.courseId != courseId && student.identificationNumber == studentId) );

    var filter = {
        courseId: courseId,
        identificationNumber: studentId
    };

    enrolledStudents = multFilter(enrolledStudents, filter);

    if(enrolledStudents){

        return createStudentCourse(enrolledStudents, studentName, courseName, 'eliminado').then((message) => {
            //console.log('1st then, inside deleteStudentFromCourse(): ' + message);

            let response = {
                error: error,
                message: message
            };

            return JSON.stringify(response);
        });        

    } else {
        error = true;
        message = 'El estudiante ' + enrollStudent.name + ' no se encuentra matriculado en el curso ' + courseName.name;
    }

    let response = {
        error: error,
        message: message
    };

    return JSON.stringify(response);
};

const usersList = () => {
    try {
        delete require.cache[require.resolve('./users.json')]

        users = require('./users.json');
    } catch(error) {
        users = [];
    }

    return users;
};

const createUser = (user, action = 'creado') => {

    let usr = new User({
        name: user.name,
        email: user.email,
        identificationNumber: user.identificationNumber,
        phone: user.phone,
        userType: DEFAULT_USER_TYPE,
        username: user.username,
        password: user.password
    });    

    return new Promise(function(resolve, reject) {
        usr.save((err, response) => {
            if( err ) reject(err);
            resolve("El usuario " + user.username + " " + action + " con éxito");
        });
    });    
};

const findUser = async (key, value) => { 
    try { 
        var query = {};
        if( value !== "" ) {
            query[key] = value;
        } 
                
        return await User.findOne(query);
    } catch(err) { 
        console.log(err) 
    }
};

const saveUser = async (user) => {
    let message;
    let error = false;  

    let duplicado = await findUser("identificationNumber", user.identificationNumber);

    if(!duplicado){

        return createUser(user).then((message) => {
            console.log('1st then, inside saveUser(): ' + message);

            let response = {
                error: error,
                message: message,
                redirect: 'login'
            };

            return JSON.stringify(response);
        });        

    } else {
        error = true;
        message = 'Ya existe otro usuario con ese identificador';
    }

    let response = {
        error: error,
        message: message,
        redirect: 'register'
    };

    return JSON.stringify(response);
};

const userSession = (req) => {
    try {
        user = req.session.user;
    } catch(error) {
        if(error) 
            console.log('Error: ' + error);
            
        user = null;
    }

    return user;
};

/*
*
*
*/
const createSession = (req, user, action = 'creada') => {

    return new Promise(function(resolve, reject) {
        req.session.user = user;
        
        req.session.save(function(err) {
            if (err) {
                console.log('Error saving session to store', err);
                reject(err);
            }
            resolve ("Sesión de " + user.name + " " + action + " con éxito"); 
        });
    });        
};

const loginUser = async (req) => {
    let message = '';
    let error = false;  
    let redirect = '';
    let userData;

    let userExists = await findUser("username", req.body.username);

    if(userExists){
        redirect = 'listCourses';
        userData = userExists;

        let passwordMatch = bcrypt.compareSync(req.body.password, userExists.password);

        if(!passwordMatch) {
            let response = {
                error: true,
                message: 'La contraseña no es correcta',
                redirect: 'login',
                user: null
            };

            return JSON.stringify(response);            
        }

        return createSession(req, userData).then((message) => {
            console.log('1st then, inside createSession(): ' + message);

            let response = {
                error: false,
                message: message,
                redirect: 'listCourses',
                user: userData
            };

            return JSON.stringify(response);
        });    

    } else {
        error = true;
        message = 'Usuario no encontrado';
        redirect = 'login';
        userData = null
    }

    let response = {
        error: error,
        message: message,
        redirect: redirect,
        user: userData
    };

    return JSON.stringify(response);
};

const getUser = (identificationNumber) => {
    let message;
    let error = false;
    let userData;

    usersList();

    let userExists = users.find(user => (user.identificationNumber == identificationNumber));
    console.log(userExists);

    if(userExists){
        userData = userExists;
    } else {
        error = true;
        message = 'El usuario no existe';
        userData = null;
    }

    let response = {
        error: error,
        message: message,
        user: userData
    };

    return response;
};

const myCourses = (identificationNumber) => {
    let message = '';
    let error = false;  

    let availableCourses = availableCoursesList();
    enrolledStudentsList();

    // Buscamos si el estudiante ya se encuentra matriculado en un curso, usando el número de identificación y el identificador del curso
    var results = [];
    enrolledStudents.forEach(x => {
        if (x.identificationNumber == identificationNumber) {
            let courseData = availableCourses.find(course => (course.courseId == x.courseId));

            if( courseData != null || courseData != undefined)
                results.push(courseData);
        }    
    });

    if( results.length == 0 ) {
        message = 'El estudiante no se encuentra inscrito en ningún curso';
        results = null;
    }

    let response = {
        error: error,
        message: message,
        myCourses: results
    };

    return JSON.stringify(response);
};

const multFilter = (data, filter) => {
    const dataFiltered = data.filter(function(item) {
        for (var key in filter) {
            if (item[key] === undefined || item[key] != filter[key])
            return true;
        }

        return false;
    });

    return dataFiltered;
}

const changeUserType = (users, identificationNumber, newUserType) => {
    let message = '';
    let error = false;

    if( users ) {
        for (var i in users) {
            if (users[i].identificationNumber == identificationNumber) {
                users[i].userType = newUserType;
                userName = users[i].name;
                break; //Stop this loop, we found it!
            }
        }

        return createUser(userName, 'actualizado a ' + newUserType + ' ').then((message) => {
            console.log('1st then, inside createUser(): ' + message);

            let response = {
                error: error,
                message: message,
                redirect: 'usersAdmin'
            };

            return JSON.stringify(response);
        });  

    } else {
        error = true;
        message = 'Se produjo un error obteniendo la información de los usuarios';
    }

    let response = {
        error: error,
        message: message,
        redirect: 'changeUserType'
    };

    return JSON.stringify(response);
};

module.exports = {
    saveCourse,
    coursesList,
    availableCoursesList,
    createStudentCourse,
    enrollStudent,
    enrolledStudentsList,
    changeCourseStatus,
    deleteStudentFromCourse,
    usersList,
    createUser,
    saveUser,
    loginUser,
    getUser,
    userSession,
    myCourses,
    changeUserType,
    findUser,
    findCourse
}