/*jshint esversion: 6 */

const hbs = require('hbs');

hbs.registerHelper('alertMessageHelper', (response) => {
    let alert_message = '';

    if( response != undefined ) {
        let response_obj = JSON.parse(response);

        let alert_type = (response_obj.error) ? 'warning' : 'success';

        alert_message =  "<div class=\"alert alert-" + alert_type + "\" role=\"alert\">";
        alert_message += "<strong>" + response_obj.message + "</strong>";
        alert_message += "</div>";
    }

    return new hbs.SafeString(alert_message);
});

hbs.registerHelper('errorsMessageHelper', (errors) => {
    let errors_message = '';

    if( errors ) {
        let response_obj = JSON.parse(errors);

        errors_message = "<div class=\"alert alert-danger\" role=\"alert\">";
        errors_message += "<ul>";

        for (var i = 0; i < response_obj.length; i++) {
            errors_message += '<li><strong>' + response_obj[i].msg + '</strong></li>';
        } 

        errors_message += "</ul>";
        errors_message += "</div>";
    }

    return new hbs.SafeString(errors_message);
});

hbs.registerHelper('ifCond', function(v1, v2, options) {
  if(v1 === v2) {
    return options.fn(this);
  }
  return options.inverse(this);
});

hbs.registerHelper('enrolledStudentsByCourseCounterHelper', (enrolledStudents, courseId) => { 
    let data = '';

    enrolledStudentsByCourse = enrolledStudents.filter(student => student.courseId === courseId);

    data += "&nbsp;&nbsp;&nbsp;&nbsp;<span class=\"text-right\">" + enrolledStudentsByCourse.length + ' ' + ((enrolledStudentsByCourse.length == 1 ) ? "estudiante inscrito": "estudiantes inscritos" ) + "</span>";

    return new hbs.SafeString(data); 
});

hbs.registerHelper('enrolledStudentsByCourseHelper', (enrolledStudents, courseId) => {
    let row_data = '';

    enrolledStudentsByCourse = enrolledStudents.filter(student => student.courseId === courseId);

    if( enrolledStudentsByCourse.length ) {

        for (var i = 0; i < enrolledStudentsByCourse.length; i++) {
            row_data += "<tr>";
            row_data += "    <th scope=\"row\">" + enrolledStudentsByCourse[i].identificationNumber + "</th>";
            row_data += "    <td>" + enrolledStudentsByCourse[i].name + "</td>";
            row_data += "    <td>" + enrolledStudentsByCourse[i].email + "</td>";
            row_data += "    <td>" + enrolledStudentsByCourse[i].phone + "</td>";
            row_data += "    <td><a href=\"/deleteStudentFromCourse/" + enrolledStudentsByCourse[i].identificationNumber + "/" + enrolledStudentsByCourse[i].courseId + "\">Eliminar</a></td>";
            row_data += "</tr>";   
        }     
    } else {
        row_data += "<tr>";
        row_data += "    <td colspan=\"5\">No existen estudiantes matriculados en este curso</td>";
        row_data += "</tr>";         
    }

    return new hbs.SafeString(row_data);
});