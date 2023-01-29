const express = require('express');
const { MongoClient, ServerApiVersion } = require('mongodb');
const colors = require('colors');
const jwt = require('jsonwebtoken');
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

    app.post('/registration', async (req, res) => {
      const data = req.body;
      const result = await userCollection.insertOne(data);
      if (result.acknowledged === true) {
        const token = jwt.sign(data._id, process.env.ACCESS_TOKEN_SECRET);
        return res.status(200).json({
          success: true,
          message: 'User Create Account Successfully',
          token,
        });
      } else {
        return res.status(400).json({
          success: false,
          message: 'Something Went Wrong',
        });
      }

      

    

    });
  } catch (err) {
    console.log(err);
  }
}

myClient().catch(console.dir());

app.listen(port, () => {
  console.log(`Server On Runinng ${port}`.green.inverse);
});
