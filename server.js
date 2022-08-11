let express=require('express')
let app=express()
const mongoose = require('mongoose');
let USERID="";
main().catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb+srv://RaviKumar:Ravi%40123@cluster0.objb5kv.mongodb.net/Appdata');
}
const kittySchema = new mongoose.Schema({
  data: String,
  id: String,
  name: String
});
const Kitten = mongoose.model('Chatdata', kittySchema);
let ejs=require('ejs')
app.use(express.urlencoded())
app.set('view engine', "ejs")
app.use('/static',express.static('static'))
app.get('/',(req,res)=>{
    res.render('login');
})
app.get('/index',(req,res)=>{
  Kitten.find((err,result)=>{
    res.render('index',{Data:result,userid:USERID,name:req.body.givenName})
  })
  
 
})
app.post('/logout',(req,res)=>{
  const userdata = new Kitten({ data:"Left" , id : USERID, name:req.body.givenName});
  userdata.save()   
  res.redirect('/')
})
app.post('/send',(req,res)=>{
  const userdata = new Kitten({ data: req.body.givenData , id : USERID, name:req.body.givenName});
  userdata.save()
  res.redirect('/index')
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