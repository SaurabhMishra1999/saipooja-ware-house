const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serve static files from the 'frontend' directory
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// --- In-memory data store ---
let users = [];
const bookings = [
    { bookingId: '1', userId: '101', city: 'New York', status: 'Pending' },
    { bookingId: '2', userId: '102', city: 'Los Angeles', status: 'Approved' },
    { bookingId: '3', userId: '103', city: 'Chicago', status: 'Rejected' },
];
const damageReports = [
    { reportId: '1', vehicleNo: 'MH-12-3456', date: '2024-07-28', status: 'Pending' },
    { reportId: '2', vehicleNo: 'MH-14-7890', date: '2024-07-29', status: 'Resolved' },
];
const payments = {
    pendingAmount: 15000,
    remainingStockValue: 250000
};
const inventory = [
    { id: '1', name: 'Laptops', quantity: 150, location: 'Aisle 5, Shelf B' },
    { id: '2', name: 'Mobile Phones', quantity: 300, location: 'Aisle 2, Shelf A' },
    { id: '3', name: 'Chargers', quantity: 500, location: 'Aisle 2, Shelf C' },
];
let coldStorage = [
    { id: '1', name: 'Ice Cream', quantity: 200, location: 'Freezer 1, Rack A' },
    { id: '2', name: 'Frozen Vegetables', quantity: 400, location: 'Freezer 2, Rack B' },
];

// --- Auth Middleware ---
const authMiddleware = (req, res, next) => {
    const userId = req.headers['user-id']; // Non-standard header for simplicity
    if (!userId || !users.find(u => u.id.toString() === userId)) {
        return res.status(401).json({ message: 'Unauthorized: User not logged in' });
    }
    next();
};

const apiRouter = express.Router();

// --- Auth Endpoints ---
apiRouter.post('/register', (req, res) => {
    const { fullName, email, password } = req.body;
    if (users.find(user => user.email === email)) {
        return res.status(400).json({ message: 'User already exists' });
    }
    const newUser = { id: Date.now().toString(), fullName, email, password }; // In a real app, hash the password!
    users.push(newUser);
    res.status(201).json({ id: newUser.id, fullName: newUser.fullName, email: newUser.email });
});

apiRouter.post('/login', (req, res) => {
    const { email, password } = req.body;
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
        res.json({ id: user.id, fullName: user.fullName, email: user.email });
    } else {
        res.status(401).json({ message: 'Invalid credentials' });
    }
});


// --- API Endpoints ---
apiRouter.get('/bookings', (req, res) => {
    res.json(bookings);
});

apiRouter.get('/damagereports', (req, res) => {
    res.json(damageReports);
});

apiRouter.get('/payments', (req, res) => {
    res.json(payments);
});

// ----- Inventory Endpoints -----
apiRouter.get('/inventory', (req, res) => {
    res.json(inventory);
});

apiRouter.post('/inventory', authMiddleware, (req, res) => {
    const newItem = {
        id: (inventory.length + 1).toString(),
        name: req.body.name,
        quantity: req.body.quantity,
        location: req.body.location
    };
    inventory.push(newItem);
    res.status(201).json(newItem);
});

// ----- Cold Storage Endpoints -----
apiRouter.get('/coldstorage', (req, res) => {
    res.json(coldStorage);
});

apiRouter.post('/coldstorage', authMiddleware, (req, res) => {
    const newItem = {
        id: (coldStorage.length > 0 ? Math.max(...coldStorage.map(item => parseInt(item.id))) + 1 : 1).toString(),
        name: req.body.name,
        quantity: req.body.quantity,
        location: req.body.location
    };
    coldStorage.push(newItem);
    res.status(201).json(newItem);
});

apiRouter.put('/coldstorage/:id', authMiddleware, (req, res) => {
    const { id } = req.params;
    const { name, quantity, location } = req.body;
    const itemIndex = coldStorage.findIndex(item => item.id === id);

    if (itemIndex > -1) {
        const updatedItem = { ...coldStorage[itemIndex], name, quantity, location };
        coldStorage[itemIndex] = updatedItem;
        res.json(updatedItem);
    } else {
        res.status(404).send('Item not found');
    }
});

apiRouter.delete('/coldstorage/:id', authMiddleware, (req, res) => {
    const { id } = req.params;
    const initialLength = coldStorage.length;
    coldStorage = coldStorage.filter(item => item.id !== id);

    if (coldStorage.length < initialLength) {
        res.status(204).send();
    } else {
        res.status(404).send('Item not found');
    }
});

app.use('/api', apiRouter);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});