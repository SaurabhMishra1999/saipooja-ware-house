
const express = require('express');
const bcrypt = require('bcrypt');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;
const usersFilePath = path.join(__dirname, 'users.json');

// Middleware
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(express.json()); // Enable parsing of JSON request bodies

// Helper function to read users from the JSON file
async function getUsers() {
    try {
        const data = await fs.readFile(usersFilePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        if (error.code === 'ENOENT') {
            return [];
        }
        throw error;
    }
}

// Helper function to write users to the JSON file
async function saveUsers(users) {
    await fs.writeFile(usersFilePath, JSON.stringify(users, null, 2));
}

// Root route
app.get('/', (req, res) => {
  res.send('Hello from the warehouse backend!');
});

// Registration route
app.post('/api/register', async (req, res) => {
    try {
        const { fullName, email, password } = req.body;

        if (!fullName || !email || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const users = await getUsers();

        const userExists = users.some(user => user.email === email);
        if (userExists) {
            return res.status(409).json({ message: 'User with this email already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = {
            id: Date.now().toString(),
            fullName,
            email,
            password: hashedPassword,
            role: 'client'
        };
        users.push(newUser);

        await saveUsers(users);

        res.status(201).json({ message: 'User registered successfully', userId: newUser.id });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Server error during registration' });
    }
});

// Login route
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        const users = await getUsers();

        const user = users.find(user => user.email === email);
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' }); // User not found
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' }); // Password does not match
        }

        // On successful login, send back some user info (but not the password!)
        res.status(200).json({
            message: 'Login successful',
            user: {
                id: user.id,
                fullName: user.fullName,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error during login' });
    }
});


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
