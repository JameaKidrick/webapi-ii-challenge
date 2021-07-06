console.log('=== RUNNING ===') // confirming backend is running


/******************************** SERVER SETUP ********************************/
const express = require('express'); // import express
const server = express(); //create server
server.listen(7000, () => { // created port at 7000: localhost:7000
  console.log('\n=== LISTENING TO PORT 7000 ===\n') // confirming server is running
})
server.use(express.json()); // allow express to read json input

const dbRouter = require('./data/db-router') // import router
server.use('/api/posts', dbRouter) // use router