/*
*
*
*       Complete the API routing below
*       
*       
*/

'use strict';

var expect = require('chai').expect;
var mongoose = require('mongoose')
var objectId = mongoose.Types.ObjectId

var bookSchema = new mongoose.Schema({
  title: String,
  comments: { type: [String], default: [] }
})

var Book = mongoose.model('book', bookSchema)

module.exports = function (app) {

  app.route('/api/books')
    .get(function (req, res) {
      //response will be array of book objects
      //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
      let project = {
        _id: 1,
        title: 1,
        commentcount: { $size: '$comments' }
      }
      Book.aggregate([{ $match: {} }, { $project: project }], (err, books) => {
        if (err) {
          res.status(500).send(err)
        } else {
          res.json(books)
        }
      })
    })
    
    .post(function (req, res){
      let title = req.body.title
      if (!title) {
        return res.status(400).send('no title given')
      }
      //response will contain new book object including atleast _id and title
      let newBook = new Book({ title })
      newBook.save((err, book) => {
        if (err) {
          res.status(500).send('could not save')
        } else {
          res.json(book)
        }
      })
    })
    
    .delete(function(req, res) {
      Book.deleteMany({}, err => {
        if (err) {
          res.status(500).send(err)
        } else {
          res.send('complete delete successful')
        }
      })
    });



  app.route('/api/books/:id')
    .get(function (req, res) {
      let bookid = req.params.id;
    
      Book.findById(bookid, (err, book) => {
        if (err) {
          res.status(500).send(err)
        } else if (!book) {
          res.status(404).send('no book exists')
        } else {
          res.json(book)
        }
      })
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
    })
    
    .post(function(req, res) {
      let bookid = req.params.id;
      let comment = req.body.comment;
      //json res format same as .get
      Book.findOneAndUpdate({ _id: bookid }, { $push: { comments: comment } }, { new: true }, (err, book) => {
        if (err) {
          res.status(500).send(err)
        } else {
          res.json(book)
        }
      })
    })
    
    .delete(function(req, res){
      let bookid = req.params.id

      Book.findById(bookid)
        .then(issue => {
          if (!issue) {
            throw 'no book exists'
          }
          return Book.deleteOne({ _id: bookid })
        })
        .then(removed => {
          res.send('delete successful')
        })
        .catch(err => {
          res.status(404).send('no book exists')
        })
    })
  
};
