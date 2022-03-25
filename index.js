require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const Person = require('./models/phonebook');
// eslint-disable-next-line no-undef
const PORT = process.env.PORT;
const app = express();

app.use(express.static('build'));
app.use(cors());
app.use(express.json());
app.use(morgan('tiny'));

app.get('/api/persons', (req, res) => {
  Person.find({}).then(people => {
    res.json(people);
  });
});

app.get('/info', async (req, res) => {
  let totalPersons = await Person.find({}).then(people => people.length);
  let currentTime = new Date().toUTCString();
  let html = `<h3>Phonebook has info for ${totalPersons} ${totalPersons === 1 ? 'persons' : 'people'}</h3>
    <p>${currentTime}</p>`;

  res.send(html);
});

app.get('/api/persons/:id', (req, res, next) => {
  let id = req.params.id;

  Person.findById(id)
    .then(person => {
      if (person) {
        res.json(person);
      } else {
        res.status(404).end();
      }
    })
    .catch(error => next(error));
});

app.delete('/api/persons/:id', (req, res, next) => {
  let id = req.params.id;
  Person.findByIdAndRemove(id)
    .then(() => res.status(204).end())
    .catch(error => next(error));
});

app.post('/api/persons', (req, res, next) => {
  const body = req.body;

  let newPerson = new Person({
    name: body.name,
    number: body.number,
  });

  newPerson.save()
    .then(savedPerson => res.json(savedPerson))
    .catch(error => next(error));

});

app.put('/api/persons/:id', (req, res, next) => {
  let id = req.params.id;
  let body = req.body;

  let updatedObj = {
    name: body.name,
    number: body.number
  };

  Person.findByIdAndUpdate(
    id,
    updatedObj,
    { new: true, runValidators: true, context: 'query' }
  )
    .then(updatedObj => res.json(updatedObj))
    .catch(error => next(error));
});

const unknownEndpoint = (req, res) => {
  res.status(404).send({ error: 'unknown endpoint' });
};

const errorHandler = (error, req, res, next) => {
  console.error('ERROR =>', error.message);

  if (error.name === 'CastError') {
    return res.status(400).send({ error: 'malformed id' });
  } else if (error.name === 'ValidationError') {
    if (error.message.includes('number')) {
      return res.status(400).json({ error: error.message + ' US Phone Numbers only.' });
    } else {
      return res.status(400).json({ error: error.message });
    }

  }

  next(error);
};

app.use(unknownEndpoint);
app.use(errorHandler);

app.listen(PORT, () => console.log(`Server is running on Port ${PORT}...`));