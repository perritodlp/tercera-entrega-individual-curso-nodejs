/*jshint esversion: 6 */

const fs = require('fs');

courses = [];
availableCourses = [];
enrolledStudents = [];
enrolledStudentsByCourse = [];
users = [];
userSession = [];

const DEFAULT_USER_TYPE = 'Aspirante';

const saveCourse = async (course) => {
    let message;
    let error = false;  

    coursesList();
    availableCoursesList();
    let cur = {
        courseId: course.courseId,
        name: course.name,
        description: course.description,
        hourlyIntensity: course.hourlyIntensity,
        cost: course.cost,
        modality: course.modality,
        status: course.status
    };

    let duplicado = courses.find(id => id.courseId == course.courseId);

    if(!duplicado){
        courses.push(cur);

        return createCourse(course.name).then((message) => {
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
        message = 'Ya existe otro curso con ese identificador';
    }

    let response = {
        error: error,
        message: message,
        redirect: 'createCourse'
    };

    return JSON.stringify(response);
};

const coursesList = () => {
    try {
        courses = require('./courses.json');
    } catch(error) {
        courses = [];
    }

    return courses;
};

const createCourse = (name, action = 'creado') => {
    let data = JSON.stringify(courses);

    return new Promise(function(resolve, reject) {
        fs.writeFile('./src/courses.json', data, (err) => {
            if( err ) reject(err);
            resolve("Curso de " + name + " " + action + " con éxito");
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
    let availableCourses = [];

    try {
        courses = coursesList();
        courses.forEach(course => {
            if( course.status == 'Disponible') {
                availableCourses.push(course); 
            }
        });
    } catch(error) {
        availableCourses = [];
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
        name: student.name,
        identificationNumber: student.identificationNumber,
        email: student.email,
        phone: student.phone,
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
        //delete require.cache[require.resolve('./users.json')]

        users = require('./users.json');
    } catch(error) {
        users = [];
    }

    return users;
};

const createUser = (userName, action = 'creado') => {
    let data = JSON.stringify(users);

    return new Promise(function(resolve, reject) {
        fs.writeFile('./src/users.json', data, (err) => {
            if( err ) reject(err);
            resolve("El usuario " + userName + " " + action + " con éxito");
        });
    });    
};

const saveUser = async (user) => {
    let message;
    let error = false;  

    usersList();

    let usr = {
        name: user.name,
        email: user.email,
        identificationNumber: user.identificationNumber,
        phone: user.phone,
        userType: DEFAULT_USER_TYPE
    };

    let duplicado = users.find(id => id.identificationNumber == user.identificationNumber);

    if(!duplicado){
        users.push(usr);

        return createUser(user.identificationNumber).then((message) => {
            console.log('1st then, inside saveUser(): ' + message);

            let response = {
                error: error,
                message: message,
                redirect: 'listCourses'
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

const userSessionList = () => {
    try {
        delete require.cache[require.resolve('./userSession.json')]

        userSession = require('./userSession.json');
    } catch(error) {
        userSession = [];
    }

    return userSession;
};

/*
*
*
*/
const createSession = (user, name, action = 'creada') => {
    let data = JSON.stringify(user);

    return new Promise(function(resolve, reject) {
        fs.writeFile('./src/userSession.json', data, (err) => {
            if( err ) reject(err);
            resolve("Sesión de " + name + " " + action + " con éxito");
        });
    });    
};

const loginUser = (userName, password) => {
    let message;
    let error = false;  
    let redirect = '';
    let userData;

    usersList();

    let userExists = users.find(user => (user.identificationNumber == userName && user.identificationNumber == password));

    if(userExists){
        redirect = 'listCourses';
        userData = userExists;

        userSessionList();

        userSession.push(userData);

        return createSession(userSession, userData.name).then((message) => {
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
        message = 'El usuario no existe o contraseña incorrecta';
        redirect = 'login';
        userData = null;
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

const logout = (identificationNumber) => {
    let message = '';
    let error = false;  

    userSessionList();

    let userExists = userSession.find(user => (user.identificationNumber == identificationNumber));

    // Buscamos si el usuario estaba en sesión, usando el número de identificación y lo borramos   
    logoutUser = userSession.filter(user => (user.identificationNumber != identificationNumber));

    if(logoutUser){
        return createSession(logoutUser, userExists.name, 'cerrada').then((message) => {
            console.log('1st then, inside logout(): ' + message);

            let response = {
                error: error,
                message: message
            };

            return JSON.stringify(response);
        });        

    } else {
        error = true;
        message = 'Error cerrando sesión del usuario ' + logoutUser.name;
    }

    let response = {
        error: error,
        message: message
    };

    return JSON.stringify(response);
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
    userSessionList,
    logout,
    myCourses
}