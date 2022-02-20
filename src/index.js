const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const {username} = request.headers
  const user = users.find(user => user.username === username)

  if(!user){
    return response.status(404).json({error: "User not found"})
  }

  request.user = user

  return next()

}

app.post('/users', (request, response) => {
  const { name, username } = request.body

  const userAlreadyExists = users.find((user) => user.username === username)

  if(userAlreadyExists){
    return response.status(400).json({error: "Username Already Exists!"})
  }

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: []
  }

  users.push(user)

  return response.status(201).json(user)

});

app.get('/todos' ,checksExistsUserAccount, (request, response) => {
  const { user } = request

  return response.status(201).json(user.todos) //adicionar .todo, para mostrar apenas os toods.
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request
  const { title, deadline } = request.body
  

  const userTodo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  user.todos.push(userTodo)

  return response.status(201).json(userTodo)

});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request
  const { id } = request.params
  const { title, deadline } = request.body

  const userIdExists = user.todos.find(user => user.id === id)

  if(!userIdExists){
    return response.status(404).json({error: "Id not found"})
  }

  userIdExists.title = title
  userIdExists.deadline = new Date(deadline)

  return response.json(userIdExists)
  

});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user }= request
  const { id } = request.params
  const userIdExists = user.todos.find(user => user.id === id)

  if(!userIdExists){
    return response.status(404).json({error: "Todo not found"})
  }

  userIdExists.done = true

  return response.json(userIdExists)

});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request
  const { id } = request.params
  const userIdExists = user.todos.findIndex(user => user.id === id)

  if(userIdExists === -1){
    return response.status(404).json({error: "Todo not found"})
  }
  
  user.todos.splice(userIdExists, 1)

  return response.status(204).send()

});

module.exports = app;

