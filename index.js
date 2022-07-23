require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')
const app = express()

morgan.token('body', req => {
  if (req.method == "POST")
    return JSON.stringify(req.body)
  return null
})

app.use(cors())
app.use(express.json())
app.use(morgan(
  ':method :url :status :res[content-length] - :response-time ms :body'
  ))
app.use(express.static('build'))

app.get('/api/persons', (request, response) => {
  morgan.token('id', function getId (req) {
    console.log(req.id)
  })
  Person.find({}).then(person => {
    response.json(person)
  })
})

app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id).then(person => {
    if (person) {
      response.json(person.toJSON())
    } 
    else {
      response.status(404).end()
    }
  })
  .catch(error => next(error))
})

app.get('/info', (request, response) => {
  datetime = new Date()
  Person.find({}).then(person => {
    response.send(`<p>Phonebook has info for ${person.length} people</p> ${""+datetime}`)
  })
})

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndDelete(request.params.id).then(person => {
    if (person) {
      response.status(204).end()
    } 
    else {
      response.status(404).end()
    }
  })
  .catch(error => next(error))
})

app.post('/api/persons', (request, response) => {
  const body = request.body

  if (!body.name) {
    return response.status(400).json({ 
      error: 'name missing' 
    })
  }
  else if (!body.number) {
    return response.status(400).json({ 
      error: 'number missing' 
    })
  }

  const person = new Person({
    name: body.name,
    number: body.number
  })

  person.save().then(savedPerson => {
    response.json(savedPerson)
  })
})

app.put('/api/persons/:id', (request, response, next) => {
  const body = request.body

  const person = {
    name: body.name,
    number: body.number
  }

  Person.findByIdAndUpdate(request.params.id, person, { new: true })
    .then(updatedPerson => {
        response.json(updatedPerson)
    })
    .catch(error => next(error))
  })

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}/`)
})

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } 

  next(error)
}

app.use(errorHandler)