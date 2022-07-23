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

app.get('/api/persons/:id', (request, response) => {
  Person.findById(request.params.id).then(person => {
    if (person) {
        response.json(person.toJSON())
      } else {
        response.status(404).end()
      }
  })
  .catch(error => console.log(error))
})

app.get('/info', (request, response) => {
  datetime = new Date()
  Person.find({}).then(person => {
    response.send(`<p>Phonebook has info for ${person.length} people</p> ${""+datetime}`)
  })
})

app.delete('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  Person = Person.filter(person => person.id !== id)

  response.status(204).end()
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
  
  const exists = Person.some(person => person.name === body.name)
  if (exists) {
    return response.status(400).json({ 
      error: 'name must be unique' 
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

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}/`)
})
