const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());

// Helper function to read JSON files
const readJSON = (filename) => {
  try {
    const filePath = path.join(__dirname, 'data', filename);
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (error) {
    console.error(`Error reading ${filename}:`, error);
    return [];
  }
};

// Helper function to write JSON files
const writeJSON = (filename, data) => {
  try {
    const filePath = path.join(__dirname, 'data', filename);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    return data;
  } catch (error) {
    console.error(`Error writing ${filename}:`, error);
    return null;
  }
};

// API Routes

// Plants API
app.get('/api/plants', (req, res) => {
  const plants = readJSON('plants.json');
  const { search, category } = req.query;
  
  let filteredPlants = plants;
  
  if (search) {
    filteredPlants = filteredPlants.filter(plant => 
      plant.name.toLowerCase().includes(search.toLowerCase()) ||
      plant.species.toLowerCase().includes(search.toLowerCase())
    );
  }
  
  if (category) {
    filteredPlants = filteredPlants.filter(plant => 
      plant.tags.includes(category.toLowerCase())
    );
  }
  
  res.json(filteredPlants);
});

app.post('/api/plants', (req, res) => {
  const plants = readJSON('plants.json');
  const newPlant = {
    id: Date.now().toString(),
    ...req.body
  };
  plants.push(newPlant);
  writeJSON('plants.json', plants);
  res.status(201).json(newPlant);
});

// Customers API
app.get('/api/customers', (req, res) => {
  const customers = readJSON('customers.json');
  const { search, tier } = req.query;
  
  let filteredCustomers = customers;
  
  if (search) {
    filteredCustomers = filteredCustomers.filter(customer => 
      customer.name.toLowerCase().includes(search.toLowerCase()) ||
      customer.email.toLowerCase().includes(search.toLowerCase())
    );
  }
  
  if (tier) {
    filteredCustomers = filteredCustomers.filter(customer => 
      customer.loyaltyTier === tier
    );
  }
  
  res.json(filteredCustomers);
});

// Orders API
app.get('/api/orders', (req, res) => {
  const orders = readJSON('orders.json');
  const { status, customerId } = req.query;
  
  let filteredOrders = orders;
  
  if (status) {
    filteredOrders = filteredOrders.filter(order => order.status === status);
  }
  
  if (customerId) {
    filteredOrders = filteredOrders.filter(order => order.customerId === customerId);
  }
  
  res.json(filteredOrders);
});

// Inventory API
app.get('/api/inventory', (req, res) => {
  const inventory = readJSON('inventory.json');
  const { location, status } = req.query;
  
  let filteredInventory = inventory;
  
  if (location) {
    filteredInventory = filteredInventory.filter(item => item.location === location);
  }
  
  if (status) {
    filteredInventory = filteredInventory.filter(item => item.stockStatus === status);
  }
  
  res.json(filteredInventory);
});

// Analytics API
app.get('/api/analytics/dashboard', (req, res) => {
  const analytics = {
    totalRevenue: 24567,
    totalOrders: 342,
    totalCustomers: 89,
    totalPlants: 156,
    averageOrderValue: 71.84,
    inventoryTurnover: 4.2,
    customerRetentionRate: 78.5,
    monthlyRevenue: [
      { month: 'Jan', revenue: 12000 },
      { month: 'Feb', revenue: 15000 },
      { month: 'Mar', revenue: 18000 },
      { month: 'Apr', revenue: 22000 },
      { month: 'May', revenue: 24567 }
    ],
    topPlants: [
      { name: 'Tomato', sales: 145 },
      { name: 'Lettuce', sales: 98 },
      { name: 'Basil', sales: 87 }
    ]
  };
  
  res.json(analytics);
});

// Weather API
app.get('/api/weather', (req, res) => {
  const weather = {
    current: {
      temperature: 72,
      condition: 'Partly Cloudy',
      humidity: 65,
      windSpeed: 8
    },
    forecast: [
      { day: 'Mon', high: 75, low: 62, condition: 'Sunny', precipitation: 0 },
      { day: 'Tue', high: 73, low: 61, condition: 'Partly Cloudy', precipitation: 10 },
      { day: 'Wed', high: 68, low: 58, condition: 'Rainy', precipitation: 80 },
      { day: 'Thu', high: 70, low: 59, condition: 'Cloudy', precipitation: 20 },
      { day: 'Fri', high: 74, low: 63, condition: 'Sunny', precipitation: 5 }
    ],
    recommendations: [
      'Good day for planting tomatoes and peppers',
      'Water lettuce in the morning to avoid leaf burn',
      'Consider covering basil if heavy rain expected'
    ]
  };
  
  res.json(weather);
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'SeedFlow V5 Backend API',
    version: '1.0.0',
    status: 'Running'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
  console.log(`SeedFlow Backend Server running on port ${PORT}`);
});