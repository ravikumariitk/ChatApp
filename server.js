let express=require('express')
let app=express()
let md5=require('md5');
let isauthenticate=0;
const mongoose = require('mongoose');
let userId=""
let name=""
let email=""
var kitten;
main().catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb+srv://RaviKumar:Ravi%40123@cluster0.objb5kv.mongodb.net/Appdata');
}
let ejs=require('ejs')
app.use(express.urlencoded())
app.set('view engine', "ejs")
app.use('/static',express.static('static'))
const kittySchema = new mongoose.Schema({
  Email: String,
  Name: String,
  Password: String,
  Phone: String
});
const Kitten = mongoose.model('UserInfo', kittySchema);
app.get('/',(req,res)=>{
    res.render('Main');
})
app.get('/index',(req,res)=>{
  if(isauthenticate==1)
  {
    
  kitten.find({},(err,result)=>{
    res.render('index',{name:name, data:result})
  })
}

else{
  res.redirect('/login')
}
})
app.get('/register',(req,res)=>{
    res.render('Register')
})
app.post('/login',(req,res)=>{
  
  Kitten.find({Email: req.body.givenEmail},function(err, result){
    console.log(result)
    if(!err)
    {
      if((Object.keys(result)).length)
      { 
        if(md5(req.body.givenPassword)==result[0].Password)
        {
          userId=req.body.givenEmail;
          const kittySchema = new mongoose.Schema({
            Email: String,
            Message: String,
          });
          kitten = mongoose.model(userId, kittySchema);
          isauthenticate=1;
          name=result[0].Name;
          email= result[0].Email
          res.redirect("/index")
        }
        else{
          res.render('in')
        }
      }
      else{
        res.render("userdoesnotexists")
      }
    }
  })
})
app.get('/forget',(req,res)=>{
  res.render('forget')
})
app.post('/register',(req,res)=>{
  // console.log(req.body)
  Kitten.find({ Email:req.body.givenEmail},(err,result)=>{
    if(Object.keys(result).length!=0)
    {
      res.render('userexists')
    }
  })
  userId=req.body.givenEmail;
  const kittySchema = new mongoose.Schema({
    Email: String,
    Message: String,
  });
  kitten = mongoose.model(userId, kittySchema);
  const data = new Kitten({ Email:req.body.givenEmail,Name: req.body.givenName,Phone: req.body.givenPhone,Password:md5 (req.body.givenPassword)});
  data.save()
  isauthenticate=1;
  name=req.body.givenName;
   email= req.body.givenEmail
  res.redirect('/index')
})
app.get('/login',(req,res)=>{
  res.render('Login')
})
app.post('/forget',(req,res)=>{
// console.log(req.body)
Kitten.find({Email: req.body.givenEmail,Phone:req.body.givenPhone},function(err,result){
  if(Object.keys(result).length==0)
  {
    res.send("Check again")

  }else{
    res.render('reset')
  }
})
})
app.post('/logout',(req,res)=>{
  isauthenticate=0;
  delete mongoose.connection.models[userId];
  res.redirect('/')
})
app.post("/reset",(req,res)=>{
  Kitten.updateOne({Email: req.body.givenEmail},{Password:req.body.givenPassword},(err,result)=>{
    console.log(result)
    res.redirect('/login')
  })
})
app.post('/send',(req,res)=>{
  if(isauthenticate==1)
  {
     Kitten.find({Email:req.body.givenEmail},(err,result)=>{
      if(Object.keys(result).length==0)
      {
      res.send('Sorry!!! user is on on ChatApp.')
      }
      else{
        const kittySchema = new mongoose.Schema({
          Email: String,
          Title: String,
          Message: String,
        });
        newkitten = mongoose.model(req.body.givenEmail, kittySchema);
        let data = new newkitten({ Email:userId , Message:req.body.givenMessage, Title:req.body.givenTitle});
        data.save();
        delete mongoose.connection.models[req.body.givenEmail];
        res.redirect('/index');
      }
})
}
else{
  res.redirect('/login')
}
})
app.listen(80,()=>{
    console.log("Running at Port 80")
})