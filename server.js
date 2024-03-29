let express = require('express')
let app = express()
require('dotenv').config()
let isauthenticate = 0;
const mongoose = require('mongoose');
let ejs = require('ejs')
app.use(express.urlencoded())
app.set('view engine', "ejs")
app.use('/static', express.static('static'))
app.get('/', (req, res) => {
  res.render('Main')
})
//databse on fake
const PORT =process.env.PORT||80
app.get('/register', (req, res) => {
  res.render('start')
})
app.get('/logout',(req,res)=>{
  res.redirect('/');
})
let url=process.env.MONGOURL
app.post('/register', (req, res) => {
  let registerConnection = mongoose.createConnection(url+"/UserData")
  const regSchema = new mongoose.Schema({
    Name: String,
    Password: String,
    Phone: String,
    Email: String
  });
  let name = req.body.givenName
  let email = req.body.givenEmail
  const regModel = registerConnection.model('Userdata', regSchema);
  regModel.find({ Email: req.body.givenEmail }, (err, result) => {
    if (Object.keys(result).length != 0) {
      res.render('userexists')
    }
    else {
      let data = new regModel({
        Name: req.body.givenName,
        Email: req.body.givenEmail,
        Password: req.body.givenPassword,
        Phone: req.body.givenPhone
      })
      isauthenticate = 1;
      data.save();
      res.redirect(`/index?name=${name}&email=${email}`);
    }
  }) 
})
app.get('/login', (req, res) => {
  res.render('start')
})

app.post('/login', (req, res) => {
  let name = req.body.givenName;
  let email = req.body.givenEmail;
  // console.log(req.body);
  let loginConnection = mongoose.createConnection(url+"/UserData")
  const loginSchema = new mongoose.Schema({
    Password: String,
    Email: String
  });
  const loginModel = loginConnection.model('Userdata', loginSchema);
  loginModel.find({ Email: req.body.givenEmail }, (err, result) => {
    if (Object.keys(result).length != 0) {
      if (req.body.givenPassword == result[0].Password) {
        isauthenticate = 1
      if (isauthenticate == 1) {
        let userConnection = mongoose.createConnection(url+"/" + ((email).split("@"))[0])
        const userSchema = new mongoose.Schema({
          Email: String,
        });
        const userModel = userConnection.model('Friends', userSchema);
        userModel.find({}, (err, result) => {
          res.render('index', { name: email, friends: result } )
        })
      }
      else
        res.redirect('/login')
      }
      else {
        res.render('in')
      }
    }
    else {
      res.render('userdoesnotexists')
    }
  })
})
app.get('/index', (req, res) => {
    let name=req.query.name;
    let email=req.query.email;
  if (isauthenticate == 1) {
    let userConnection = mongoose.createConnection(url+"/" + ((email).split("@"))[0])
    const userSchema = new mongoose.Schema({
      Email: String,
    });
    const userModel = userConnection.model('Friends', userSchema);
    userModel.find({}, (err, result) => {
      res.render('index', { name: email, friends: result })
    })
  }
  else
    res.redirect('/login')
})
app.post('/logout', (req, res) => {
  isauthenticate = 0;
  res.redirect('/')
})
app.get('/forget', (req, res) => {
  res.render('forget')
})
app.post('/forget', (req, res) => {
  let forgetConnection = mongoose.createConnection(url+"/UserData")
  const forgetSchema = new mongoose.Schema({
    Phone: String,
    Email: String
  });
  // console.log(req.body);
  const forgetModel = forgetConnection.model('Userdata', forgetSchema);
  forgetModel.find({ Email: req.body.email, Phone: req.body.phone }, (err, result) => {
    if (Object.keys(result).length == 0) {
      res.send("Check your info again.")
    }
    else {
      res.render('reset')
    }
  })
})
app.post('/reset', (req, res) => {
  let resetConnection = mongoose.createConnection(url+"/UserData")
  const resetSchema = new mongoose.Schema({
    Password: String,
    Email: String
  });
  // console.log(req.body);
  const resetModel = resetConnection.model('Userdata', resetSchema);
  resetModel.updateOne({ Email: req.body.email }, { Password: req.body.givenPassword }, (err, update) => {
    if (err) {
      res.send("Some error occured!!!")
    }
    else {
      res.redirect('/login')
    }
  })
})
app.post('/send', (req, res) => {
  // console.log(req.body);
  let name=req.body.name;
  let email=req.body.email;
  // console.log(req.body);
  let checkConnection = mongoose.createConnection(url+"/UserData")
  const checkSchema = new mongoose.Schema({
    Email: String,
    Name: String,
    Phone: String,
    Password: String
  });
  const checkModel = checkConnection.model('UserData', checkSchema);
  checkModel.find({ Email: req.body.givenEmail }, (err, found) => {
    if (Object.keys(found).length == 0) {
      res.send("Sorry!!! The person is not on ChatApp😢")
    }
    else {
      let friendConnection = mongoose.createConnection(url+"/" + ((email).split("@"))[0])
      const friendSchema = new mongoose.Schema({
        Email: String,
      });
      const friendModel = friendConnection.model('Friends', friendSchema);
      friendModel.find({ Email: req.body.givenEmail }, (err, frd) => {
        if (Object.keys(frd).length == 0) {
          let data = new friendModel({
            Email: req.body.givenEmail,
          })
          data.save()
        }
      })
      function getCurrentDateTime() {
        const currentDate = new Date();
        const hours = String(currentDate.getHours()).padStart(2, '0');
        const minutes = String(currentDate.getMinutes()).padStart(2, '0');
        const date = String(currentDate.getDate()).padStart(2, '0');
        const month = String(currentDate.getMonth() + 1).padStart(2, '0');
        const year = String(currentDate.getFullYear());
        
        const dateTimeString = `${hours}:${minutes} (${date}/${month}/${year})`;
        return dateTimeString;
      }
      const currentDateTime = getCurrentDateTime();
      const sendSchema = new mongoose.Schema({
        Email: String,
        Message: String,
        Time:String,
        Type: String
      });
      const sendModel = friendConnection.model('Messages', sendSchema);
      let message = new sendModel({
        Email: req.body.givenEmail,
        Message: req.body.givenMessage,
        Time:currentDateTime,
        Type: "Send"
      })
      message.save()
      let sendMessageConnection = mongoose.createConnection(url+"/" + ((req.body.givenEmail).split("@"))[0])
      const sendMessageFriendSchema = new mongoose.Schema({
        Email: String,
      });
      const sendMessageFriendModel = sendMessageConnection.model('Friends', sendMessageFriendSchema);
      sendMessageFriendModel.find({ Email: email }, (err, frd) => {
        if (Object.keys(frd).length == 0) {
          let data = new sendMessageFriendModel({
            Email: email
          })
          data.save()
        }
      })
      const sendfrdSchema = new mongoose.Schema({
        Email: String,
        Message: String,
        Time:String,
        Type: String
      });
      const sendfrdModel = sendMessageConnection.model('Messages', sendfrdSchema);
      let recievemessage = new sendfrdModel({
        Email: email,
        Message: req.body.givenMessage,
        Time:currentDateTime,
        Type: "Recieved"
      })
      recievemessage.save()
      // res.redirect(`/index?name=${name}&email=${email}`)
      let messageConnection = mongoose.createConnection(url+"/" + ((req.body.email).split("@"))[0])
      const messageConnectionSchema = new mongoose.Schema({
        Email: String,
        Message: String,
        Time:String,
        Type: String
      });
      const messageModel = messageConnection.model('messages', messageConnectionSchema);
      messageModel.find({ Email: req.body.givenEmail }, (err, result) => {
        // console.log(result);
        res.redirect(`/messages?email=${req.body.email}&sender=${req.body.givenEmail}`)
      }) 
    }
  })
})
app.get('/messages',(req,res)=>{
  let email=req.query.email|| req.body.myEmail;
  let sender=req.query.sender||req.body.senderEmail;
  let messageConnection = mongoose.createConnection(url+"/" + ((email).split("@"))[0])
  const messageConnectionSchema = new mongoose.Schema({
    Email: String,
    Message: String,
    Time:String,
    Type: String
  });
  const messageModel = messageConnection.model('messages', messageConnectionSchema);
  messageModel.find({ Email: sender }, (err, result) => {
    // console.log(result);
    res.render('messages', { Data: result, name:sender,sender:email })
  }) 
})
app.post('/message', (req, res) => {
  // console.log(req.body);
  let email=req.query.email|| req.body.myEmail;
  let sender=req.query.sender||req.body.senderEmail;
  let messageConnection = mongoose.createConnection(url+"/" + ((email).split("@"))[0])
  const messageConnectionSchema = new mongoose.Schema({
    Email: String,
    Message: String,
    Time:String,
    Type: String
  });
  const messageModel = messageConnection.model('messages', messageConnectionSchema);
  messageModel.find({ Email: sender }, (err, result) => {
    // console.log(result);
    res.render('messages', { Data: result, name:sender,sender:email })
  }) 
})
app.listen(PORT, () => {
  console.log("Running at Port 80")
})