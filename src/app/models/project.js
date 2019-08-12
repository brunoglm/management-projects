const moongose = require('../../database')

const ProjectSchema = new moongose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  user: {
    type: moongose.Schema.Types.ObjectId,
    ref: 'User'
  },
  tasks: [
    {
      type: moongose.Schema.Types.ObjectId,
      ref: 'Task'
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  }
})

const Project = moongose.model('Project', ProjectSchema)

module.exports = Project
