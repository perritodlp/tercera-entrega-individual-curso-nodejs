/*jshint esversion: 6 */

const fs = require('fs');

courses = [];
availableCourses = [];
enrolledStudents = [];

const saveCourse = async (course) => {
    let message;
    let error = false;  

    coursesList();
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

const coursesList = () => {
    try {
        courses = require('./courses.json');
    } catch(error) {
        courses = [];
    }

    return courses;
};

const createCourse = (name) => {
    let data = JSON.stringify(courses);

    return new Promise(function(resolve, reject) {
        fs.writeFile('./src/courses.json', data, (err) => {
            if( err ) reject(err);
            resolve("Curso de " + name + " creado con éxito");
        });
    });    
};

const enrolledStudentsList = () => {
    try {
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

        return createStudentCourse(student.name, courseName.name).then((message) => {
            console.log('1st then, inside enrollStudent(): ' + message);

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

const createStudentCourse = (name, courseName) => {
    let data = JSON.stringify(enrolledStudents);

    return new Promise(function(resolve, reject) {
        fs.writeFile('./src/studentCourses.json', data, (err) => {
            if( err ) reject(err);
            resolve("El estudiante " + name + " ha sido inscrito al curso " + courseName + " con éxito");
        });
    });    
};

module.exports = {
    saveCourse,
    coursesList,
    availableCoursesList,
    createStudentCourse,
    enrollStudent,
    enrolledStudentsList
}