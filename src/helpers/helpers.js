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