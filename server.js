const express = require('express')
const colors = require('colors')
const dotenv = require('dotenv').config()
const {errorHandler} = require('./middleware/errorMiddleware')
const connectDB = require('./config/db')
const path = require('path')
const port = process.env.PORT || 5000
const cors = require('cors');

connectDB()

const app = express()

const allowedOrigins = require('./config/allowedOrigins');
app.use(cors({ origin: allowedOrigins }));

app.use(express.json())
app.use(express.urlencoded({extended: false}))

app.use('/api/users', require('./routes/userRoutes'))
app.use('/api/userDetails', require('./routes/userDetailRoutes'))
app.use('/api/blogs', require('./routes/blogRoutes'))
app.use('/api/goals', require('./routes/goalRoutes'))
app.use('/api/upload', require('./routes/uploadRoutes'));

// Serve Frontend
const index_file = require('./index')
if (process.env.NODE_ENV === 'production') {
    app.get('*', (req, res) => res.send(index_file))
} else {
    app.get('/', (req, res) => res.send('Please set to production'))
}

app.use(errorHandler)

app.listen(port, () => console.log(`Server started on port ${port}`.blue.bold))
