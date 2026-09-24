import Student from '../models/Student.js';

const errorResponse = (res, status, message, error) => {
  res.status(status).json({
    message,
    error
  });
};

export const createStudent = async (req, res) => {
  try {
    const student = await Student.create(req.body);

    res.status(201).json({
      message: 'Student created successfully',
      student
    });
  } catch (error) {
    if (error.code === 11000) {
      return errorResponse(res, 409, 'Email already exists', error.message);
    }

    if (error.name === 'ValidationError') {
      return errorResponse(res, 400, 'Student validation failed', error.message);
    }

    return errorResponse(res, 500, 'Failed to create student', error.message);
  }
};

export const getAllStudents = async (req, res) => {
  try {
    const students = await Student.find().sort({ createdAt: -1 });

    res.status(200).json(students);
  } catch (error) {
    errorResponse(res, 500, 'Failed to retrieve students', error.message);
  }
};

export const getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({
        message: 'Student not found'
      });
    }

    res.status(200).json(student);
  } catch (error) {
    if (error.name === 'CastError') {
      return errorResponse(res, 400, 'Invalid student ID', error.message);
    }

    errorResponse(res, 500, 'Failed to retrieve student', error.message);
  }
};

export const updateStudent = async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!student) {
      return res.status(404).json({
        message: 'Student not found'
      });
    }

    res.status(200).json({
      message: 'Student updated successfully',
      student
    });
  } catch (error) {
    if (error.code === 11000) {
      return errorResponse(res, 409, 'Email already exists', error.message);
    }

    if (error.name === 'ValidationError') {
      return errorResponse(res, 400, 'Student validation failed', error.message);
    }

    if (error.name === 'CastError') {
      return errorResponse(res, 400, 'Invalid student ID', error.message);
    }

    errorResponse(res, 500, 'Failed to update student', error.message);
  }
};

export const deleteStudent = async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);

    if (!student) {
      return res.status(404).json({
        message: 'Student not found'
      });
    }

    res.status(200).json({
      message: 'Student deleted successfully',
      student
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return errorResponse(res, 400, 'Invalid student ID', error.message);
    }

    errorResponse(res, 500, 'Failed to delete student', error.message);
  }
};
