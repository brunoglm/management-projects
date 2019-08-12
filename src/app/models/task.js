const moongose = require('../../database')

const TaskSchema = new moongose.Schema({
  title: {
    type: String,
    required: true
  },
  project: {
    type: moongose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  assignedTo: {
    type: moongose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  completed: {
    type: String,
    required: true,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
})

const Task = moongose.model('Task', TaskSchema)

module.exports = Task
