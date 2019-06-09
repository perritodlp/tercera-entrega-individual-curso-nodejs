/*jshint esversion: 6 */

const fs = require('fs');

courses = [];

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

module.exports = {
    saveCourse,
    coursesList
}