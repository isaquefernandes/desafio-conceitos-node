const express = require("express");
const cors = require("cors");
const { uuid, isUuid } = require("uuidv4");
const { json } = require("express");

const app = express();

app.use(express.json());
app.use(cors());

app.use('/repositories/:id', isValidId);

const repositories = [];

function isValidId(request, response, next) {
  const { id } = request.params;

  if (!isUuid(id))
    return response.status(400).json({"error": "Invalid repository ID"})
  
  return next();
}

app.get("/repositories", (request, response) => {
  const { title } = request.query;

  const result = title ? repositories.filter(repository => repository.title.includes(title)) : repositories;
  
  return response.json(result);
});

app.post("/repositories", (request, response) => {
  const { title, url, techs } = request.body;
  const techArray = techs.split(',').map(tech => tech.trim());

  const repository = { id: uuid(), title, url, techArray, likes: 0 };

  repositories.push(repository);

  return response.json(repository)
});

app.put("/repositories/:id", (request, response) => {
  const { id } = request.params;
  const { title, url} = request.body;
  let { techs } = request.body;

  techs = techs.split(',').map(tech => tech.trim());

  const repositoryIndex = repositories.findIndex(repository => repository.id === id);

  if (repositoryIndex < 0)
    return response.status(400).json({ "error": "Repository not found."});

  const repositoryUpdated = {
    title,
    url,
    techs
  };

  //checa as propriedades do objeto original e do novo objeto de atualização, trocando assim apenas os valores dos campos equivalentes.
  for (const prop in repositoryUpdated) {
    if (prop in repositories[repositoryIndex]) {
      repositories[repositoryIndex][prop] = repositoryUpdated[prop];
    }
  }

  return response.json(repositories[repositoryIndex]);
});

app.delete("/repositories/:id", (request, response) => {
  const { id } = request.params;

  const repositoryIndex = repositories.findIndex(repository => repository.id === id); 

  if (repositoryIndex < 0)
    return response.status(400).json({ "error": "Repository not found."});

  repositories.splice(repository => repository.id === id);
   
  return response.status(204).send();
});

app.post("/repositories/:id/like", (request, response) => {
  const { id } = request.params;
  
  const repositoryIndex = repositories.findIndex(repository => repository.id === id); 

  if (repositoryIndex < 0)
    return response.status(400).json({ "error": "Repository not found."});

  repositories[repositoryIndex].likes += 1;

  return response.json(repositories[repositoryIndex]);
});

module.exports = app;
