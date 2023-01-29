const express = require('express');
const { MongoClient, ServerApiVersion } = require('mongodb');
const colors = require('colors');
const cors = require('cors');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

// Express Middleware
app.use(express.json());
app.use(cors());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.tntar5h.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function myClient() {
  try {
    await client.connect();
   
    const userCollection = client.db('PH_Hack').collection('user-list');

  } catch (err) {
    console.log(err);
  }
}

myClient().catch(console.dir());

app.listen(port, () => {
  console.log(`Server On Runinng ${port}`.green.inverse);
});
