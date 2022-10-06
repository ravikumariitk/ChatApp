let express = require('express')
let app = express()
let md5 = require('md5');
let isauthenticate = 0;
const mongoose = require('mongoose');
let ejs = require('ejs')
app.use(express.urlencoded())
app.set('view engine', "ejs")
var name = ""
var email = "";
app.use('/static', express.static('static'))
app.get('/', (req, res) => {
  res.render('Main')
})
app.get('/register', (req, res) => {
  res.render('Register')
})
app.post('/register', (req, res) => {
  let registerConnection = mongoose.createConnection("mongodb://localhost:27017/UserData")
  const regSchema = new mongoose.Schema({
    Name: String,
    Password: String,
    Phone: String,
    Email: String
  });
  name = req.body.givenName
  email = req.body.givenEmail
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
      res.redirect('/index')
    }
  })

})
app.get('/login', (req, res) => {
  res.render('login')
})
app.post('/login', (req, res) => {
  let loginConnection = mongoose.createConnection("mongodb://localhost:27017/UserData")
  const loginSchema = new mongoose.Schema({
    Password: String,
    Email: String
  });
  const loginModel = loginConnection.model('Userdata', loginSchema);
  loginModel.find({ Email: req.body.givenEmail }, (err, result) => {
    if (Object.keys(result).length != 0) {
      if (req.body.givenPassword == result[0].Password) {
        isauthenticate = 1
        name = result[0].Name
        email = result[0].Email
        res.redirect('/index')
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
  if (isauthenticate == 1) {
    let userConnection = mongoose.createConnection("mongodb://localhost:27017/" + ((email).split("@"))[0])
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
  let forgetConnection = mongoose.createConnection("mongodb://localhost:27017/UserData")
  const forgetSchema = new mongoose.Schema({
    Phone: String,
    Email: String
  });
  const forgetModel = forgetConnection.model('Userdata', forgetSchema);
  forgetModel.find({ Email: req.body.givenEmail, Phone: req.body.givenPhone }, (err, result) => {
    if (Object.keys(result).length == 0) {
      res.send("Check your info again.")
    }
    else {
      res.render('reset')
    }
  })
})
app.post('/reset', (req, res) => {
  let resetConnection = mongoose.createConnection("mongodb://localhost:27017/UserData")
  const resetSchema = new mongoose.Schema({
    Password: String,
    Email: String
  });
  const resetModel = resetConnection.model('Userdata', resetSchema);
  resetModel.updateOne({ Email: req.body.givenEmail }, { Password: req.body.givenPassword }, (err, update) => {
    // console.log(update)
    if (err) {
      res.send("Some error occured!!!")
    }
    else {
      res.redirect('/login')

    }
  })
})
app.post('/send', (req, res) => {
  let checkConnection = mongoose.createConnection("mongodb://localhost:27017/UserData")
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
      let friendConnection = mongoose.createConnection("mongodb://localhost:27017/" + ((email).split("@"))[0])
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
      const sendSchema = new mongoose.Schema({
        Email: String,
        Message: String,
        Type: String
      });
      const sendModel = friendConnection.model('Messages', sendSchema);
      let message = new sendModel({
        Email: req.body.givenEmail,
        Message: req.body.givenMessage,
        Type: "Send"
      })
      message.save()
      let sendMessageConnection = mongoose.createConnection("mongodb://localhost:27017/" + ((req.body.givenEmail).split("@"))[0])
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
        Type: String
      });
      const sendfrdModel = sendMessageConnection.model('Messages', sendfrdSchema);
      let recievemessage = new sendfrdModel({
        Email: email,
        Message: req.body.givenMessage,
        Type: "Recieved"
      })
      recievemessage.save()
      res.redirect('/index')
    }
  })

})
app.post('/message', (req, res) => {
  let messageConnection = mongoose.createConnection("mongodb://localhost:27017/" + ((email).split("@"))[0])
  const messageConnectionSchema = new mongoose.Schema({
    Email: String,
    Message: String,
    Type: String
  });
  const messageModel = messageConnection.model('messages', messageConnectionSchema);
  messageModel.find({ Email: req.body.email }, (err, result) => {
    res.render('messages', { Data: result, name: req.body.email })
  })

})
app.listen(80, () => {
  console.log("Running at Port 80")
})