console.log('=== RUNNING ROUTER ===') // confirming router is running


/******************************** ROUTER SETUP ********************************/
const router = require('express').Router(); // importing express and its router function
const db = require('./db'); // importing database


/******************************** REQUEST HANDLERS ********************************/
router.post('/', (req, res) => {
  const { title, contents } = req.body
  if((title === undefined || title === '') || (contents === undefined || contents === '')){
    res.status(400).json({ errorMessage: "Please provide title and contents for the post." })
  }else{
    db.insert(req.body)
    .then(newPostId => {
      console.log(newPostId)
      db.findById(newPostId.id)
        .then(userObj => {
          res.status(201).json(userObj)
        })
    })
    .catch(error => {
      res.status(500).json({ error: "There was an error while saving the post to the database" })
    })
  }
})

router.get('/', (req, res) => {
  db.find()
    .then(posts => {
      res.status(200).json(posts)
    })
    .catch(err => {
      res.status(500).json({ error: "The posts information could not be retrieved." })
    })
})

router.get('/:id', (req, res) => {
  const id = req.params.id;
  db.findById(id)
    .then(post => {
      // console.log(post)
      if(!post.id){
        res.status(404).json({ error: "The post with the specified ID does not exist." })
      }else if(post.id){
        console.log(post)
        res.status(200).json(post)
      }
    })
    .catch(err => {
      res.status(500).json({ error: "The post information could not be retrieved." })
    })
})

router.get('/:id/comments', (req, res) => {
  const id = req.params.id;
  db.findPostComments(id)
    .then(comments => {
      console.log(comments)
      if(!comments){
        res.status(404).json({ error: "The post with the specified ID does not exist." })
      }else{
        res.status(200).json(comments)
      }
    })
    .catch(err => {
      res.status(500).json({ error: "The post information could not be retrieved." })
    })
})

// POSTING COMMENT
  // 1. FIND POST ===> FINDBYID(REQ.PARAMS.ID)
  // 2. POST COMMENT ===> INSERTCOMMENT(REQ.BODY)
  // 3. FIND COMMENT AND SEND BACK ===> FINDCOMMENTBYID(ID GIVEN BY INSERTCOMMENT)
router.post('/:id/comments', (req, res) => {
  const id = req.params.id;
  const { text } = req.body;
  db.findById(id)
    .then(postId => {
      console.log(postId)
      if(!postId){
        res.status(404).json({ error: "The post with the specified ID does not exist." })
      }else if((text === undefined || text === '')){
        console.log("Please provide text for the comment.")
        res.status(400).json({ error: "Please provide text for the comment." })
      }else{
        db.insertComment(req.body)
          .then(comment => {
            res.status(201).json(comment)
          })
      }
    })
    .catch(err => {
      res.status(500).json({ error: "There was an error while saving the comment to the database" })
    })
})

// Endpoints
// Configure the API to handle to the following routes:

// Method	Endpoint	Description
// ***DONE*** POST /api/posts	Creates a post using the information sent inside the request body.
  // ===> INSERT + FINDBYID

//*****// POST	/api/posts/:id/comments	Creates a comment for the post with the specified id using information sent inside of the request body. 
  // ===> FINDPOST

// ***DONE*** GET	/api/posts	Returns an array of all the post objects contained in the database. 
  // ===> FIND

//*****// GET	/api/posts/:id	Returns the post object with the specified id. ===> FINDBYID

//*****// GET	/api/posts/:id/comments	Returns an array of all the comment objects associated with the post with the specified id. ===> FINDPOSTCOMMENTS

// DELETE	/api/posts/:id	Removes the post with the specified id and returns the deleted post object. You may need to make additional calls to the database in order to satisfy this requirement. ===> REMOVE

// PUT	/api/posts/:id	Updates the post with the specified id using data from the request body. Returns the modified document, NOT the original. ===> UPDATE








module.exports = router; // export router