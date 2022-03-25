require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const Person = require('./models/phonebook');
const PORT = process.env.PORT;
const app = express();

app.use(express.static('build'));
app.use(cors());
app.use(express.json());
app.use(morgan("tiny"));

app.get('/api/persons', (req, res) => {
  Person.find({}).then(people => {
    res.json(people)
  })
})

app.get('/info', async (req, res) => {
  let totalPersons = await Person.find({}).then(people => people.length);
  let currentTime = new Date().toUTCString();
  let html = `<h3>Phonebook has info for ${totalPersons} ${totalPersons === 1 ? 'persons' : 'people'}</h3>
    <p>${currentTime}</p>`;
  
  res.send(html)
})

app.get('/api/persons/:id', (req, res, next) => {
  let id = req.params.id;

  Person.findById(id)
    .then(person => {
      if (person) {
        res.json(person)
      } else {
        res.status(404).end();
      }    
    })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (req, res, next) => {
  let id = req.params.id;
  Person.findByIdAndRemove(id)
    .then(result => res.status(204).end())
    .catch(error => next(error))
})

app.post('/api/persons', (req, res) => {
  const body = req.body;

  if (!body.name || !body.number) {
    res.status(400).json({error: 'content missing'})
  } else {
    let newPerson = new Person({
      name: body.name,
      number: body.number,
    })
    
    newPerson.save().then(savedPerson => res.json(savedPerson));
  }
})

app.put('/api/persons/:id', (req, res) => {
  let id = req.params.id;
  let body = req.body;

  let updatedObj = {
    name: body.name,
    number: body.number
  }

  Person.findByIdAndUpdate(id, updatedObj, { new: true })
    .then(updatedObj => res.json(updatedObj))
    .catch(error => next(error));
})

const unknownEndpoint = (req, res) => {
  res.status(404).send({ error: 'unknown endpoint' })
}

const errorHandler = (error, req, res, next) => {
  console.error('ERROR =>', error.message);

  if (error.name === 'CastError') {
    return res.status(400).send({ error: 'malformed id' })
  }
  next(error)
}

app.use(unknownEndpoint);
app.use(errorHandler);

app.listen(PORT, () => console.log(`Server is running on Port ${PORT}...`));