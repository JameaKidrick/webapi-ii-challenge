console.log('=== RUNNING ROUTER ===') // confirming router is running


/******************************** ROUTER SETUP ********************************/
const router = require('express').Router(); // importing express and its router function
const db = require('./db'); // importing database


/******************************** REQUEST HANDLERS ********************************/
// Post new post
router.post('/', (req, res) => {
  const { title, contents } = req.body
  if((title === undefined || title === '') || (contents === undefined || contents === '')){
    res.status(400).json({ errorMessage: "Please provide title and contents for the post." })
  }else{
    db.insert(req.body)
    .then(newPostId => {
      console.log(newPostId)
      db.findById(newPostId.id) // Used to get comment obj including created date/time and id
        .then(userObj => {
          res.status(201).json(userObj) // Returns full comment obj 
        })
    })
    .catch(error => {
      res.status(500).json({ error: "There was an error while saving the post to the database" })
    })
  }
})

// Get all posts
router.get('/', (req, res) => {
  db.find()
    .then(posts => {
      res.status(200).json(posts)
    })
    .catch(err => {
      res.status(500).json({ error: "The posts information could not be retrieved." })
    })
})

// Get specified post
router.get('/:id', (req, res) => {
  const id = req.params.id;
  db.findById(id)
    .then(post => {
      if(!post[0]){ // Set to check existence of the first element in the array otherwise an empty array is returned instead of error message
        res.status(404).json({ error: "The post with the specified ID does not exist." })
      }else{
        res.status(200).json(post)
      }
    })
    .catch(err => {
      res.status(500).json({ error: "The post information could not be retrieved." })
    })
})

// Get all comments on a specified post
router.get('/:id/comments', (req, res) => {
  const id = req.params.id;
  db.findById(id)
    .then(post => {
      if(!post[0]){ // checks whether post exists
        res.status(404).json({ error: "The post with the specified ID does not exist." })
      }else{
        db.findPostComments(id)
      .then(comments => {
        console.log(comments)
        if(!comments[0]){ // Set to check existence of the first element in the array otherwise an empty array is returned instead of error message
          res.status(404).json({ error: "The post with the specified ID does not have any comments." })
        }else{
          res.status(200).json(comments)
        }
      })
      .catch(err => {
        res.status(500).json({ error: "The post information could not be retrieved." })
      })
      }
    })
  
})

// Posting comment to specified post
router.post('/:id/comments', (req, res) => {
  const id = req.params.id;
  const info = req.body;
  info.post_id = id;
  if((info.text === undefined || info.text === '')){
    res.status(400).json({ error: "Please provide text for the comment." })
  }else{
    db.findById(id) // 1. Finds specified post
      .then(postId => {
        console.log(postId)
        if(!postId[0]){ // Set to check existence of the first element in the array otherwise an empty array is returned instead of error message
          res.status(404).json({ error: "The post with the specified ID does not exist." })
        }else{
          db.insertComment(req.body) // 2. Inserts comment
            .then(comment => {
              db.findCommentById(comment.id) // 3. Used to get comment obj including created date/time and id
              .then(commentObj => {
                res.status(201).json(commentObj) // Returns full comment object
              })
            })
        }
      })
      .catch(err => {
        res.status(500).json({ error: "There was an error while saving the comment to the database" })
      })

  }
})

// Deletes specified post
router.delete('/:id', (req, res) => {
  const id = req.params.id;
  db.findById(id) // used to find particular post so the full deleted post can be returned; this is unnecessary if you just want to confirm the item has been deleted
    .then(post => {
      if(!post[0]){ // Set to check existence of the first element in the array otherwise an empty array is returned instead of error message
        res.status(404).json({ error: "The post with the specified ID does not exist." })
      }else{
        db.remove(id)
        .then(deletePost => {
          console.log(deletePost)
          if(!deletePost){
            res.status(404).json({ error: "The post with the specified ID does not exist." })
          }else{
            res.status(205).json(post)
          }
        })
        .catch(err => {
          res.status(500).json({ error: "The post could not be removed" })
        })
      }
    })
})

// Updates specified post
router.put('/:id', (req, res) => {
  const id = req.params.id;
  const post = req.body;
  if((post.title === undefined || post.title === '') || (post.contents === undefined || post.contents === '')){
    res.status(400).json({ error: "Please provide title and contents for the post." })
  }else{
    db.update(id, post)
    .then(update => {
      console.log(update)
      if(!update){
        res.status(404).json({ error: "The post with the specified ID does not exist." })
      }else{
        db.findById(id) // Used to get comment obj including created date/time and id
        .then(postObj => {
          res.status(200).json(postObj) // Returns full post object
        })
      }
    })
    .catch(err => {
      res.status(500).json({ error: "The post information could not be modified."  })
    })
  }
})

module.exports = router; // export router