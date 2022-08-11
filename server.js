let express=require('express')
let app=express()
let md5=require('md5');
let isauthenticate=0;
const mongoose = require('mongoose');
let USERID="";
let temp=0;
let temp2=0
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
let name="";
let email=""

const Kitten = mongoose.model('UserInfo', kittySchema);
app.get('/',(req,res)=>{
    res.render('Main');
})
app.get('/index',(req,res)=>{
  if(isauthenticate==1)
  {
    
    if(temp==1)
    { 
      temp=0;
      delete mongoose.connection.models['email'];
      // delete mongoose.modelSchemas.kittySchema
    }
    const kittySchema = new mongoose.Schema({
      Email: String,
      Message: String,
    });
  const kitten = mongoose.model(email, kittySchema);
  temp=1;
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
      if(Object.keys(result).length)
      { 
        if(md5(req.body.givenPassword)==result[0].Password)
        {
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
        if(temp2==1)
        { temp2=0;
          delete mongoose.connection.models['req.body.givenEmail'];
        }
        const kittySchema = new mongoose.Schema({
          Email: String,
          Message: String,
        });
        const newKitten = mongoose.model(req.body.givenEmail, kittySchema);
        temp2=1;
        let data = new newKitten({ Email: email, Message:req.body.givenMessage });
        data.save();
        res.redirect('/index');
      }
})
}
else{
  res.redirect('/login')
}
})
app.post('/login',(req,res)=>{
  USERID=req.body.givenEmail
  const userdata = new Kitten({ data: "" , id: req.body.givenEmail,name:req.body.givenName });
  userdata.save()
  res.redirect('/index')
})
app.listen(80,()=>{
    console.log("Running at Port 80")
})