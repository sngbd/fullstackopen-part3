const mongoose = require('mongoose')

if (process.argv.length < 3) {
  console.log('Please provide the password as an argument: node mongo.js <password>')
  process.exit(1)
}
else if (process.argv.length === 4) {
  console.log('Please provide the name and numbers as arguments: node mongo.js <password> <name> <number>')
  process.exit(1)
}

const length = process.argv.length
const password = process.argv[2]
const name = process.argv[3]
const number = process.argv[4]

const url = `mongodb+srv://sngbd:${password}@cluster0.2pad7.mongodb.net/phonebook?retryWrites=true&w=majority`

const personSchema = new mongoose.Schema({
  name: String,
  number: String
})

const Person = mongoose.model('Person', personSchema)

mongoose
  .connect(url)
  .then((result) => {
    if (length == 5) {
      const person = new Person({
        name: name,
        number: number
      })
      return person.save()
    }

    Person.find({}).then(result => {
      console.log('phonebook:') 
      result.forEach(person => {
        console.log(`${person.name} ${person.number}`)
      })
      return mongoose.connection.close()
    })
  })
  .then(() => {
    if (length == 5) {
      console.log(`added ${name} number ${number} to phonebook`)
      return mongoose.connection.close()
    }
  })
  .catch((err) => console.log(err))