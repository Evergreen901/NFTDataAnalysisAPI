const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongooseConnection = require('./helpers/mongoose-connection');
const router = require('./routes');

const app = express();

app.use(bodyParser.urlencoded());
app.use(bodyParser.json());
app.use(cors());

app.use('/api', router);

app.use((_, res) => {
  res.send({
    message: 'Not found!',
  });
});

mongooseConnection().then((_res) => {
  app.listen(5000, (req, res) => {
    console.log('Server is listening on port 5000');
  });
});
