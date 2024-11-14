const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();
console.log("MongoDB Path:", process.env.MONGODB_PATH); // Debugging line

const app = express();

app.use(cors());
app.use(bodyParser.json());

mongoose.connect(process.env.MONGODB_PATH, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

app.listen(3001, () => {
    console.log("Server is running on Port 3001");
});

// Define question schema with all necessary fields
const questionSchema = mongoose.Schema({
    questionId: { type: String, required: true },
    timeUsed: { type: Number, required: true },
    hintsUsed: { type: Number, required: true },
    writtenResponse: { type: String },
    query: { type: String },
    isCorrect: { type: Boolean }
});

const userSchema = mongoose.Schema({
    username: { type: String, unique: true, required: true },
    score:{type:Number,default:150},
    totalQueriesSolved: { type: Number, default: 0 },
    questions: [questionSchema]
}, {
    timestamps: true
});

const User = mongoose.model('User', userSchema);

const responseSchema = new mongoose.Schema({
    username: {
      type: String,
      required: true,
      unique: true // Ensures each username is unique
    },
    responses: {
      type: Object, // object of strings to store user responses
      required: true
    }
  });
  const UserResponse = mongoose.model('UserResponse', responseSchema);

// Fetch all users
app.get("/getUsers", async (req, res) => {
    try {
        const users = await User.find({});
        res.json(users);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch users" });
    }
});


app.get("/getUser", async (req, res) => {
    const { username,password } = req.query; // Access username from query parameters
    try {
        let user = await User.findOne({ username });
        console.log("username:"+username);
        console.log("User: "+user);
        console.log("Password: "+password);
       
        if(password=="1234"){
            if (!user) {
                return res.status(200).json({username,isVerified:true}); // Handle user not found
            }
            else{
            return res.status(200).json({user,isVerified:true});
            }
        }else{
            return res.status(200).json({isVerified:false});
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

app.post("/submitSurveyResponse", async(req,res)=>{
    let {username,responses} =req.body;

    if(!username){
        return res.status(400).json({ error: "Missing required fields" });
    }

    try{
        let user_res = await UserResponse.findOne({ username });
        if(!user_res){
            user_res = new UserResponse({username,responses});
        }else{
            const num=Math.floor(Math.random()*100);
            username = "user"+num;
            user_res = new UserResponse({username,responses});
        }
        console.log(user_res);
        await user_res.save();
        res.status(200).json("Response have been stored successfully");
    }catch(err){
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
})

// New POST endpoint to receive user data
app.post("/submitUserData", async (req, res) => {
    const { username, queryIndex, queryTime, hintsUsed, query, isCorrect,score } = req.body;

    // Validate required fields
    if (!username || queryIndex === undefined || queryTime === undefined || hintsUsed === undefined || query === undefined || isCorrect === undefined) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    try {
        // Find or create user document
        let user = await User.findOne({ username });
        if (!user) {
            user = new User({ username, totalQueriesSolved: 0});
        } else {
            user.totalQueriesSolved = parseInt(user?.questions?.[user.questions.length - 1]?.questionId,10);
        }
        //update score
        user.score=score;
        // Add new question data
        user.questions.push({
            questionId: queryIndex,
            timeUsed: queryTime,
            query,
            isCorrect,
            hintsUsed,
        });

        await user.save();
        res.status(200).json({ message: "Data saved successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

