const express = require('express')
const app = express()
const routes = require('./routes')
const session = require('express-session')
const port = 3000
const { formatCurrency, formatDate } = require('./helpers/helper');

app.locals.formatCurrency = formatCurrency;
app.locals.formatDate = formatDate;

app.set("view engine", 'ejs')
app.use(express.urlencoded({ extended: false }))

app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    sameSite: true //tambahan security dari csrf attack
  }
}))
app.use(routes)

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})