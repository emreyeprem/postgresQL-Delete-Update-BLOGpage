const express = require('express')
const mustacheExpress = require('mustache-express')
const bodyParser = require('body-parser')
const app = express()
// import the pg-promise library which is used to connect and execute SQL on a postgres database
const pgp = require('pg-promise')()
// connection string which is used to specify the location of the database
const connectionString = "postgres://localhost:5432/blogdb"
// creating a new database object which will allow us to interact with the database
const db = pgp(connectionString)

app.use(bodyParser.urlencoded({ extended: false }))

app.use(express.static('css'))
app.engine('mustache',mustacheExpress())
app.set('views','./views')
app.set('view engine','mustache')

app.listen(3009,function(req,res){
 console.log("Server has started...")
})
//----------------------------------------------------------

app.get('/',function(req,res){
  db.any('SELECT postid,username,posteddate,title,description from userposts;').then(function(result){
    res.render('index',{posts : result})
   })
})

app.get('/add_post',function(req,res){
  res.render('add_post')
})

app.post('/',function(req,res){
  let username = req.body.username
  let postDate = new Date().toLocaleString()
  let title = req.body.title
  let description = req.body.description
  db.none('INSERT INTO userposts(username,posteddate,title,description) VALUES($1,$2,$3,$4)',[username,postDate,title,description]).then(function(){
    res.redirect('/')
  })
  .catch(function(error){
    console.log(error)
  })

})
// ============ Delete post =======================

app.post('/delete_post',function(req,res){
  let postIdNo = req.body.postId
  db.none('DELETE FROM userposts WHERE postid = $1;',[postIdNo]).then(function(){
    res.redirect('/')
     })
  .catch(function(error){
    console.log(error)
  })
})

// ============= Update posts ======================

app.post('/update_post',function(req,res){
  let postId = req.body.postId
  let username = req.body.username
  let title = req.body.title
  let description = req.body.description
  let postDate = new Date().toLocaleString()
  db.none('UPDATE userposts SET username = $1, posteddate = $2, title = $3, description = $4 WHERE postid = $5',[username,postDate,title,description,postId]).then(
    res.redirect('/')
  )
  .catch(function(error){
    console.log(error)
  })
})

app.get('/update/:postid',function(req,res){
  let postId = req.params.postid
  db.one('SELECT postid,username,title,description FROM userposts WHERE postid = $1',[postId])
  .then(function(result){
    res.render('update_post',result)
  })
})
