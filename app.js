require('dotenv').config();    //to host the todolist
const express=require("express");
const bodyParser=require("body-parser");
//const date=require(__dirname+"/date.js");  //this is a module which is local and saved in date.js
const mongoose = require("mongoose");
const _ = require("lodash");

const PORT = process.env.PORT  || 3000;    //either run on port 3000 or .env

// //better to use let than var. no needed if nosql is used
// var items=["Buy food", "Cook food", "Eat food"]; //global as app.get and app.post both have to use it
// let workItems = [];

mongoose.connect(`process.env.MONGO_URI`, {useNewUrlParser: true});   // mongodb://0.0.0.0:27017/todolistDB  ... to host locally

const itemsSchema = {   //structure of a collection
    name : String
};
const Item = mongoose.model("Item", itemsSchema);  //new collection

const listSchema = {
    name: String,
    items: [itemsSchema]
};
const List = mongoose.model("List", listSchema);

const item1 = new Item({
    name: "Welcome to your to-do list!"
});
const item2 = new Item({
    name: "Hit the + button to add item"
});
const item3 = new Item({
    name: "<-- hit this to delete item"
});

const defaultItems = [item1, item2, item3];

const app=express();
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
app.set('view engine', 'ejs');

app.get("/", function(req,res){
    
    //var day = date.getDate();  //this function imported from require("date.js") and use getDate function only

    Item.find({})
    .then(function(foundItems){

        if( foundItems.length === 0 ){
            Item.insertMany(defaultItems) 
            .then(function(){
            console.log("Successfully saved all the items to todolistDB");
            })
            .catch(function(err){
            console.log(err);
            });

            res.redirect("/"); 
        }
        else{
            res.render("list", { listTitle: "Today", newListItems: foundItems });   //to get only name part, go to list.ejs and change there
        }
        })
        .catch(function(err){
            console.log(err);
    });
    
});

// app.get("/work", function(req, res){
//     res.render("list", {listTitle: "Work List", newListItems: workItems});
// })

app.get("/:customListName", function(req,res){
    const customListName = _.capitalize(req.params.customListName);

    List.findOne({name:customListName})
    .then(function(foundList){
        
          if(!foundList){
            //create new list
            const list = new List({
              name:customListName,
              items:defaultItems
            });
          
            list.save();
            console.log("saved");
            res.redirect("/"+customListName);
          }
          else{
            //show the existing list
            res.render("list",{listTitle:foundList.name, newListItems:foundList.items});
          }
    })
    .catch(function(err){});

})

app.get("/about", function(req,res){
    res.render("about");
})

app.post("/", function(req, res){
    var item=req.body.newItem;    //newItem is in attribute of name in button HTML ejs
    const listName = req.body.list.trim();

    const newItem = new Item({
        name: item
    });

    if(listName === "Today"){
        newItem.save();
        res.redirect("/");
    }
    else{
        List.findOne({name: listName})
        .then(function(foundList){
            foundList.items.push(newItem);     // items is the collection name
            foundList.save();
            res.redirect("/"+listName);
        })
        .catch(function(err){
            console.log(err);
        })
    }
    

    // if(req.body.list === "Work List"){  //check button type '+' in ejs n this is to go into value attribute of button
    //     workItems.push(item);
    //     res.redirect("/work");
    // }
    // else{
    //     items.push(item);
    //     //as only one res.render can be there in .js, use above res.render to send item variable to ejs
    //     res.redirect("/");  //redirects to app.get function
    // }
})

app.post("/delete", function(req,res){
    const checkedItemId = req.body.checkbox.trim();
    const listName = req.body.listName.trim();


    if(listName === "Today"){
        Item.findByIdAndRemove(checkedItemId)
        .then (function() {
            console.log("Succesfully deleted checked item from the database");
            res.redirect("/");
        })
        .catch (function(err){
            console.log(err);
        })
    }
    else{
        List.findOneAndUpdate({name:listName}, {$pull: {items: {_id: checkedItemId}}})
          .then(function (foundList)
          {
            res.redirect("/" + listName);
          }).catch( function(err){
            console.log(err)
          });
           
    }
})

// app.post("/work", function(req, res){
//     let item = req.body.newItem;
//     workItems.push(item);

//     res.redirect("/work");
// })



app.listen(PORT,function(){
    console.log(`server running on port ${PORT}`);
});
