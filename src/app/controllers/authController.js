const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const authConfig = require('../../config/auth.json')
const crypto = require('crypto')
const mailer = require('../../modules/mailer')

const User = require('../models/user')

const router = express.Router()

function generateToken(params = {}) {
  return jwt.sign(params, authConfig.secret, {
    expiresIn: 86488
  })
}

router.post('/register', async (req, res) => {
  const { email } = req.body
  try {
    if (await User.findOne({ email }))
      return res.status(400).send({ error: 'User already exists' })

    const user = await User.create(req.body)

    user.password = undefined

    return res.send({ user, token: generateToken({ id: user.id }) })
  } catch (error) {
    return res.status(400).send({ error: error.message })
  }
})

router.post('/authenticate', async (req, res) => {
  const { email, password } = req.body

  const user = await User.findOne({ email }).select('+password')

  if (!user) {
    return res.status(400).send({ error: 'User not found' })
  }

  if (!(await bcrypt.compare(password, user.password))) {
    return res.status(400).send({ error: 'Inválid password' })
  }

  user.password = undefined

  return res.send({ user, token: generateToken({ id: user.id }) })
})

router.post('/forgot_password', async (req, res) => {
  const { email } = req.body

  try {
    const user = await User.findOne({ email })

    if (!user) return res.status(401).send({ error: 'User not found' })

    const token = crypto.randomBytes(20).toString('hex')

    const now = new Date()
    now.setHours(now.getHours() + 1)

    await User.findByIdAndUpdate(user.id, {
      $set: {
        passwordResetToken: token,
        passwordResetExpires: now
      }
    })

    mailer.sendMail(
      {
        to: email,
        from: '',
        template: '/auth/forgotPassword',
        context: { token }
      },
      err => {
        if (err) return res.status(400).send({ erro: err.message })

        return res.send()
      }
    )
  } catch (err) {
    res.status(401).send({ error: 'error on forgot password, try again' })
  }
})

router.post('/reset_password', async (req, res) => {
  const { email, token, password } = req.body

  try {
    const user = await User.findOne({
      email
    }).select('+passwordResetToken passwordResetExpires')

    if (!user) return res.status(404).send({ error: 'User not found' })

    if (token != user.passwordResetToken)
      return res.status(404).send({ error: user.passwordResetToken })

    const now = new Date()

    if (now > user.passwordResetExpires)
      return res.status(404).send({ error: 'Token Expired' })

    user.password = password

    await user.save()

    res.send()
  } catch (err) {
    res.status(400).send({ error: 'cannot reset password, try again' })
  }
})

module.exports = app => {
  app.use('/auth', router)
}
