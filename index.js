const express = require("express");
const morgan = require("morgan");
const app = express();
app.use(express.json());
app.use(express.static("dist"));
morgan.token("reqContent", function getReqContent(req) {
  if (req.method === "POST") return JSON.stringify(req.body);
  return "";
});
app.use(
  morgan(
    ":method :url :status :res[content-length] - :response-time ms :reqContent"
  )
);
let persons = [
  {
    id: 1,
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: 2,
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: 3,
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: 4,
    name: "Mary Poppendieck",
    number: "39-23-6423122",
  },
];

const generateId = () => {
  return Math.floor(Math.random() * 10000000000);
};

app.get("/info", (request, response) => {
  const people = persons.length;
  const currentDate = new Date();
  const datetime = currentDate.toLocaleString("en-US");
  const infoResponse = `<p>Phonebook has info for ${people} people</p><p>${datetime}</p>`;
  response.send(infoResponse);
});

app.get("/api/persons", (request, response) => {
  response.json(persons);
});

app.post("/api/persons", (request, response) => {
  const body = request.body;
  if (!body.name || !body.number) {
    return response.status(400).json({
      error: "content missing",
    });
  }

  if (persons.find((n) => n.name === body.name)) {
    return response.status(400).json({
      error: "person already exists",
    });
  }

  const person = {
    id: generateId(),
    name: body.name,
    number: body.number,
  };

  persons = persons.concat(person);
  response.json(person);
});

app.get("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id);
  const person = persons.find((n) => n.id === id);

  if (person) {
    response.json(person);
  } else {
    response.status(404).end();
  }
});

app.delete("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id);
  persons = persons.filter((n) => n.id !== id);

  response.status(204).end();
});

const PORT = process.env.PORT || 3001;
app.listen(PORT);
console.log(`Server running on port ${PORT}`);
