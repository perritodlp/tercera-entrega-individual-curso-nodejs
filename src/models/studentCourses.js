const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const studentCoursesSchema = new Schema({
    courseId: {
        type: Number,
        required: true
    },
    studentId: { 
        type: String, 
        required: true 
    }  
});

const studentCourse = mongoose.model('studentCourses', studentCoursesSchema);

module.exports = studentCourse;