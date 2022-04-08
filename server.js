if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

require('./config/database').connect();

const express = require('express');

const app = express();

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.set('layout', 'layouts/layout');

require('./middleware')(app);

//// Routes
const indexRouter = require('./routes/index');
const registerRouter = require('./routes/register');
const loginRouter = require('./routes/login');
const dashboardRouter = require('./routes/dashboard');
const passwordResetRouter = require('./routes/passwordReset');

app.use('/', indexRouter);
app.use('/register', registerRouter);
app.use('/login', loginRouter);
app.use('/dashboard', dashboardRouter);
app.use('/passwordReset', passwordResetRouter);

app.listen(process.env.PORT || 3000);