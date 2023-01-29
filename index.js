const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const colors = require('colors');
const bcrypt = require('bcryptjs');
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
    const billingCollection = client.db('PH_Hack').collection('billing-list');

    app.post('/registration', async (req, res) => {
      const { email, name, password } = req.body;
      const query = req.body.email;

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const result = await userCollection.insertOne({
        email,
        name,
        password: hashedPassword,
      });
      if (result.acknowledged === true) {
        const token = jwt.sign(query, process.env.ACCESS_TOKEN_SECRET);
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

    app.post('/login', async (req, res) => {
      const data = req.body;
      const query = { email: data.email };

      if (!data.email || !data.password) {
        return res.status(400).json({
          success: false,
          message: 'Please Provide an Email and Password',
        });
      }

      const user = await userCollection.findOne(query);
      const isMatch = await bcrypt.compare(data.password, user.password);

      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials',
        });
      } else {
        const token = jwt.sign(query, process.env.ACCESS_TOKEN_SECRET);
        return res.status(200).json({
          success: true,
          token,
        });
      }
    });

    app.get('/billing-list', async (req, res) => {
      const pageNum = parseInt(req.query.pageNum);
      const result = await billingCollection
        .find({})
        .skip(pageNum * 10)
        .limit(10)
        .sort('-1')
        .toArray();
       res.status(200).json({
        success: true,
        result,
      });
    });


    app.get('/totalDataCount',  async (req, res) => {
      const count = await billingCollection.estimatedDocumentCount();
      res.send({ count });
    });

    app.post('/add-billing', async (req, res) => {
      const data = req.body;
      const result = await billingCollection.insertOne(data);
      res.status(200).json({
        success: true,
        message: 'Billing Data Added Successfully',
        result,
      });
    });

    app.put('/update-billing/:id', async (req, res) => {
      const id = req.params.id;
      const data = req.body;
      const query = { _id: ObjectId(id) };
      const updateDoc = {
        $set: data,
      };
      const result = await billingCollection.updateOne(query, updateDoc);
     res.status(200).json({
        success: true,
        message: 'Billing Data Update Successfully',
        result,
      });
    });





    app.delete('/delete-billing/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await billingCollection.deleteOne(query);
      res.status(200).json({
        success: true,
        message: 'Billing Data Delete Successfully',
        result,
      });
    });


  } catch (err) {
    console.log(err);
  }
}

myClient().catch(console.dir());

app.listen(port, () => {
  console.log(`Server On Runinng ${port}`.green.inverse);
});
