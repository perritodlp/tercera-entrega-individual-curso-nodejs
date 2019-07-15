const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const coursesSchema = new Schema({
    courseId: {
        type: Number,
        required: true
    },
    name: { 
        type: String, 
        required: true 
    },
    description: { 
        type: String , 
        required: true
    },
    hourlyIntensity: { 
        type: Number, 
        required: true 
    },
    cost: { 
        type: String, 
        required: true 
    },
    modality: {
        type: String, 
        required: true
    },
    status: {
        type: String,
        required: true
    }   
});

const Course = mongoose.model('Courses', coursesSchema);

module.exports = Course;