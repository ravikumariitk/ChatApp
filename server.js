let express = require('express')
let app = express()
require('dotenv').config()
let isauthenticate = 0;
const mongoose = require('mongoose');
let ejs = require('ejs')
app.use(express.urlencoded())
app.set('view engine', "ejs")
app.use('/static', express.static('static'))
const { mailer } = require('./mailer')
const{ Otp, User , Cookie} = require('./models');
const { hashPassword, comparePassword } = require('./hasher');
const multer = require('multer');
const upload = multer();

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }))


const jwt = require('jsonwebtoken');

const secretKey = 'EFvfr4VFHB4GGE5554FHKUTvnjt8548H';

// Connect to MongoDB
async function dbconnect(uri) {
    try {
        await mongoose.connect(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('Error connecting to MongoDB', error);
        process.exit(1);
    }
}

function verifyToken(token) {
    try {
        // Verify the token using the secret key
        const decoded = jwt.verify(token, secretKey, { algorithms: ['HS256'] });
        console.log('Token is valid:', decoded);
        return 1; // Return the decoded payload if needed
    } catch (error) {
        console.error('Token is invalid or expired:', error.message);
        return 0; // Token is invalid or expired
    }
}

// Define your schema once
const messageSchema = new mongoose.Schema({
    senderName: String,
    recipientName: String,
    recipientPhone: String,
    senderPhone: String,
    message: String,
    time: String,
    type: String
});

// Function to retrieve the model or create it if it doesn't exist
function getMessageModel(phone) {
    const modelName = `${phone}_messages`;
    // Check if the model is already compiled
    if (mongoose.models[modelName]) {
        return mongoose.model(modelName);
    } else {
        return mongoose.model(modelName, messageSchema);
    }
}
app.get("/home", async (req, res) => {
    const mongoURI = 'mongodb+srv://ravikumariitk21:Ravi123@cluster0.36spd.mongodb.net/ChatApp';
    await dbconnect(mongoURI);
    const username = req.query.username;
    const phone =  req.query.phone;
    const name = req.query.key;
    const result = await Cookie.findOne({ phone: phone });
    const token = result.token;

    if (verifyToken(token)) {
        const MessageSender = getMessageModel(phone); // Get or create the model
        const results = await MessageSender.find();
        const data = {};

        results.forEach((result) => {
            var key
            if(result.type=='Send')
            {
                key = [result.recipientPhone , result.recipientName];
            }
            else{
                key = [result.senderPhone,result.senderName];

            }
            if (!data[key]) {
                data[key] = [];
            }
            data[key].push(result);
        });
        // console.log(data);
        return res.render("home", { username: username, phone: phone , data:data,name:name});
    } else {
        return res.redirect('/login');
    }
});

app.get('/real', async (req,res)=>{
    console.log("recieved")
    const mongoURI = 'mongodb+srv://ravikumariitk21:Ravi123@cluster0.36spd.mongodb.net/ChatApp';
    await dbconnect(mongoURI);
    const username = req.query.username;
    const phone =  req.query.phone;
    const name = req.query.key;
        const MessageSender = getMessageModel(phone); // Get or create the model
        const results = await MessageSender.find();
        const data = {};
        results.forEach((result) => {
            var key
            if(result.type=='Send')
            {
                key = [result.recipientPhone , result.recipientName];
            }
            else{
                key = [result.senderPhone,result.senderName];

            }
            if (!data[key]) {
                data[key] = [];
            }
            data[key].push(result);
        });
        // console.log(data);
        return res.json(data);
})

app.get('/', (req, res) => {
    return res.render('Main')
  })

app.get('/register', (req, res) => {
    return res.render('signin')
  })

app.post('/register', async (req, res) => {
   console.log(req.body);
   const OTP = Math.floor(100000 + Math.random() * 900000);
   const token = jwt.sign({}, secretKey, { algorithm: 'HS256', expiresIn: '120s' });
    const data = new Otp({
        phone: req.body.phone,
        otp: OTP,
        token: token
    });
    const mongoURI = 'mongodb+srv://ravikumariitk21:Ravi123@cluster0.36spd.mongodb.net/ChatApp';
    await dbconnect(mongoURI);
     data.save();
    mailer(req.body.email, OTP, "registration",req.body.username);
    return res.render("verifyotp" , { phone:req.body.phone,username: req.body.username, email: req.body.email, phone: req.body.phone, password:req.body.password});
})
async function cookieSave(phone) {
    try {
        let result = await Cookie.findOne({ phone: phone });
        const token = jwt.sign({}, secretKey, { algorithm: 'HS256', expiresIn: '1h' });

        if (result) {
            await Cookie.updateOne(
                { phone: phone },
                { $set: { token: token } }
            );
        } else {
            const cookieData = new Cookie({
                phone: phone,
                token: token
            });
            await cookieData.save();
        }
        // console.log('Token saved/updated successfully.');
    } catch (error) {
        return res.render('error')
        console.error('Error saving/updating token:', error);
    }
}
app.post('/verify-otp', async (req,res)=>{
    console.log(req.body);
    const mongoURI = 'mongodb+srv://ravikumariitk21:Ravi123@cluster0.36spd.mongodb.net/ChatApp';
    await dbconnect(mongoURI);
    const otpRecord = await Otp.findOne({ phone: req.body.phone });
    if(!otpRecord) res.send("No phone number found");
    token = otpRecord.token;
    const result = await Otp.deleteMany({ phone: req.body.phone });
    const exiting = await User.findOne({phone:req.body.phone})
    if(exiting) {
        console.log(exiting)
        return res.render('userexistes')
    };
    const eexiting = await User.findOne({email:req.body.email})
    if(eexiting) return res.send("Email already exists");
    const hashed = await hashPassword(req.body.password);
    await cookieSave(req.body.phone);
    jwt.verify(token, secretKey, (err, decoded) => {
        if (err) {
            return res.render("tokenExpired")
        } else {
           if (req.body.otp == otpRecord.otp) {
            console.log("otp verified");
            const user = new User({
                username: req.body.username,
                email: req.body.email,
                password:hashed,
                phone:req.body.phone
            });
            user.save();
            res.redirect(`/home?username=${req.body.username}&phone=${req.body.phone}&email=${req.body.email}`);
           }
           else{
            return res.render("invalidotp");
           }
        }
    });
})
app.get('/login',(req,res)=>{
    return res.render("login");
})
app.post('/login',async (req,res)=>{
    console.log(req.body)
    const mongoURI = 'mongodb+srv://ravikumariitk21:Ravi123@cluster0.36spd.mongodb.net/ChatApp';
    await dbconnect(mongoURI);
    console.log(req.body.phone)
    await cookieSave(req.body.phone);
    if(req.body.phone!=""){
        const exiting = await User.findOne({phone:req.body.phone});
        if(exiting)
        {
            const hashedPassword = await hashPassword(req.body.password);
            if(hashedPassword==exiting.password)
            {
                res.redirect(`/home?username=${exiting.username}&phone=${exiting.phone}&email=${exiting.email}`);
            }
        }
        else return res.render("userdoesnotexists");
    }
    else{
        return res.send("No phone provided");
    }
})
app.get('/forget',(req,res)=>{
    return res.render("forget");
})
app.post('/forget', async (req,res)=>{
    console.log(req.body)
    const mongoURI = 'mongodb+srv://ravikumariitk21:Ravi123@cluster0.36spd.mongodb.net/ChatApp';
    await dbconnect(mongoURI);
    const result = await User.findOne({phone:req.body.phone,email:req.body.email});
    if(result)
    {
        const OTP = Math.floor(100000 + Math.random() * 900000);
        const token = jwt.sign({}, secretKey, { algorithm: 'HS256', expiresIn: '120s' });
        const data = new Otp({
            phone: req.body.phone,
            otp: OTP,
            token: token
        });
        mailer(req.body.email, OTP, "forget",req.body.username);
        data.save();
        return res.render('verifyotp-reset',{username:req.body.username,email:req.body.email,phone:req.body.phone});
    }
    else{
        return res.render("userdoesnotexists")
    }
})

app.post('/verify-otp-reset', async (req,res)=>{
    console.log(req.body);
    const mongoURI = 'mongodb+srv://ravikumariitk21:Ravi123@cluster0.36spd.mongodb.net/ChatApp';
    await dbconnect(mongoURI);
    const otpRecord = await Otp.findOne({ phone: req.body.phone });
    if(!otpRecord) return res.render("userdoesnotexists")
    token = otpRecord.token;
    await Otp.deleteMany({ phone: req.body.phone })
    const hashed = await hashPassword(req.body.password);
    jwt.verify(token, secretKey, (err, decoded) => {
        if (err) {
            return res.render("tokenExpired")
        } else {
           if (req.body.otp == otpRecord.otp) {
             return res.render("changePassword",{phone:req.body.phone})
           }
           else{
            return res.render('invalidotp')
           }
        }
    });
})
app.post('/change-password',async (req,res)=>{
    const mongoURI = 'mongodb+srv://ravikumariitk21:Ravi123@cluster0.36spd.mongodb.net/ChatApp';
    await dbconnect(mongoURI);
    try{
        const result = await User.updateOne(
            { phone: req.body.phone },  
            { $set: { password: req.body.newPassword} }
          );
         return  res.render('passwordChanged')
    }catch(err)
    {
        res.send(err);
    }
})
function getCurrentTime() {
    const now = new Date();

    // Format the time part
    let hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;

    const timeString = `${hours}:${minutes} ${ampm}`;
    const day = now.getDate();
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", 
                        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const month = monthNames[now.getMonth()];
    const year = now.getFullYear();

    const dateString = `${day}th ${month} ${year}`;

    // Combine the time and date strings
    return `${timeString}, ${dateString}`;
}

app.post('/newChat',upload.none(), async (req, res) => {
    // const { phone, senderPhone, senderName } = req.body;
    // console.log("data at backed",req.body)
    var phone = req.body.phone
    if(phone==undefined) phone = req.body.recipientPhone
    const senderPhone = req.body.senderPhone;
    const senderName =  req.body.senderName;

    if (!phone || !senderPhone) {
        return res.json("Phone numbers must be provided");
    }

    if (phone === senderPhone) {
        return res.send("You can't send a message to yourself");
    }

    const mongoURI = 'mongodb+srv://ravikumariitk21:Ravi123@cluster0.36spd.mongodb.net/ChatApp';
    await dbconnect(mongoURI);
    const messageSchema = new mongoose.Schema({
        senderName: String,
        recipientName: String,
        recipientPhone: String,
        senderPhone: String,
        message: String,
        time: String,
        type: String
    });
    const result = await User.findOne({ phone: phone });
    if (!result) {
        return res.render('userdoesnotexists')
    }
    var message = req.body.message;
    if(message==undefined) message = "Hi";
    const recipientName = result.username;
    const MessageSender = getMessageModel(senderPhone);
    const MessageRecipient = getMessageModel(phone);
    // Sender message
    const newMessageSender = new MessageSender({
        senderName: senderName,
        recipientName: recipientName,
        recipientPhone: phone,
        senderPhone: senderPhone,
        message: message,
        time: getCurrentTime(),
        type: "Send"
    });
    await newMessageSender.save();

    // Recipient message
    const newMessageRecipient = new MessageRecipient({
        senderName: senderName,
        recipientName: recipientName,
        recipientPhone: phone,
        senderPhone: senderPhone,
        message: message,
        time: getCurrentTime(),
        type: "Receive"
    });
    await newMessageRecipient.save();
    const name = phone + ","+recipientName;
    res.status(200)
    res.redirect(`/home?username=${senderName}&phone=${senderPhone}&key=${name}`);
});

app.post('/rand',(req,res)=>{
    console.log(req.body);
})
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});