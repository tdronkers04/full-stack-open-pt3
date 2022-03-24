const express = require('express');
const app = express();

app.use(express.json())

let persons = [
  { 
    "id": 1,
    "name": "Arto Hellas", 
    "number": "040-123456"
  },
  { 
    "id": 2,
    "name": "Ada Lovelace", 
    "number": "39-44-5323523"
  },
  { 
    "id": 3,
    "name": "Dan Abramov", 
    "number": "12-43-234345"
  },
  { 
    "id": 4,
    "name": "Mary Poppendieck", 
    "number": "39-23-6423122"
  }
];

app.get('/', (req, res) => {
  res.send('<h1>Phonebook App</h1><p>For the API, Navigate to http://localhost:3001/api</p>')
})

app.get('/api/persons', (req, res) => {
  res.json(persons);
})

app.get('/info', (req, res) => {
  let totalPersons = persons.length;
  let currentTime = new Date().toUTCString();
  let html = `<h3>Phonebook has info for ${totalPersons} ${totalPersons === 1 ? 'persons' : 'people'}</h3>
    <p>${currentTime}</p>`
  
    res.send(html)
})

app.get('/api/persons/:id', (req, res) => {
  let id = Number(req.params.id);
  let person = persons.find(person => person.id === id);

  if (person) {
    res.json(person)
  } else {
    res.status(404).end();
  }
})

app.delete('/api/persons/:id', (req, res) => {
  let id = Number(req.params.id);
  persons = persons.filter(person => person.id !== id);
  res.status(204).end()
})

const generateId = () => {
  let random = Math.floor(Math.random() * 100000);
  return random;
}

app.post('/api/persons', (req, res) => {
  let body = req.body;

  if (!body.name || !body.number) {
    res.status(400).json({error: 'content missing'})
  } else if ([...persons.map(person => person.name)].includes(body.name)) {
    res.status(400).json({error: 'contact already exists'})
  } else {
    let newPerson = {
      id: generateId(),
      name: body.name,
      number: body.number,
    }
    persons = persons.concat(newPerson);
    res.json(newPerson)
  }
})

const PORT = 3001;
app.listen(PORT, () => console.log(`Server is running on Port ${PORT}...`));