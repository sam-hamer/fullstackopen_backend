require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const Person = require("./modules/person");
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

const errorHandler = (error, request, response, next) => {
  console.log(error.message);

  if (error.name === "CastError") {
    return response.status(400).send({ error: "malformatted id" });
  }

  next(error);
};
app.use(errorHandler);

app.get("/info", (request, response, next) => {
  Person.find({})
    .then((persons) => {
      const people = persons.length;
      const currentDate = new Date();
      const datetime = currentDate.toLocaleString("en-US");
      const infoResponse = `<p>Phonebook has info for ${people} people</p><p>${datetime}</p>`;
      response.send(infoResponse);
    })
    .catch((error) => next(error));
});

app.get("/api/persons", (request, response, next) => {
  Person.find({})
    .then((persons) => {
      response.json(persons);
    })
    .catch((error) => next(error));
});

app.post("/api/persons", (request, response, next) => {
  const body = request.body;

  // if(body.content === undefined) {
  //   return response.status(400).json({ error: "content missing" });
  // }
  if (!body.name || !body.number) {
    return response.status(400).json({
      error: "content missing",
    });
  }

  // if (persons.find((n) => n.name === body.name)) {
  //   return response.status(400).json({
  //     error: "person already exists",
  //   });
  // }

  const person = new Person({
    name: body.name,
    number: body.number,
  });

  person
    .save()
    .then((savedPerson) => {
      response.json(savedPerson);
    })
    .catch((error) => next(error));
});

app.get("/api/persons/:id", (request, response, next) => {
  Person.findById(request.params.id)
    .then((person) => {
      if (person) {
        response.json(person);
      } else {
        response.status(404).end();
      }
    })
    .catch((error) => next(error));
});

app.delete("/api/persons/:id", (request, response, next) => {
  Person.findByIdAndDelete(request.params.id)
    .then((result) => {
      response.status(204).end();
    })
    .catch((error) => next(error));
});

app.put("/api/persons/:id", (request, response, next) => {
  const body = request.body;

  const person = {
    name: body.name,
    number: body.number,
  };
  Person.findByIdAndUpdate(request.params.id, person, { new: true })
    .then((updatedPerson) => {
      response.json(updatedPerson);
    })
    .catch((error) => next(error));
});

const PORT = process.env.PORT;
app.listen(PORT);
console.log(`Server running on port ${PORT}`);
