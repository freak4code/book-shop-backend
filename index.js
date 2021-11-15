const express = require("express");
const { MongoClient } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;
require("dotenv").config();
const cors = require("cors");

const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@mongodb-learning.p3lab.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    await client.connect();
    const database = client.db("nowhere-library");
    const bookCollection = database.collection("books");
    const reviewCollection = database.collection("reviews");
    const orderCollection = database.collection("orders");
    const usersCollection = database.collection("users");

    //Get all books
    app.get("/books", async (req, res) => {
      const books = await bookCollection.find({}).toArray();
      res.send(books);
    });

    // Get single service  by id
    app.get("/books/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const book = await bookCollection.findOne(query);
      res.json(book);
    });

    // Add book
    app.post("/books/add", async (req, res) => {
      const book = req.body;
      const result = await bookCollection.insertOne(book);
      res.json(result);
    });

    // Delete book
    app.delete("/books/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await bookCollection.deleteOne(query);
      res.json(result);
    });

    //get all reviews
    app.get("/reviews", async (req, res) => {
      const reviews = await reviewCollection.find({}).toArray();
      res.send(reviews);
    });

    // add review
    app.post("/reviews/add", async (req, res) => {
      const review = req.body;
      const result = await reviewCollection.insertOne(review);
      res.json(result);
    });

    // Get all orders
    app.get("/orders", async (req, res) => {
      const orders = await orderCollection.find({}).toArray();
      res.send(orders);
    });

    // Get orders by user email
    app.get("/orders/user", async (req, res) => {
      const userEmail = req.query.email;
      const query = { email: { $in: [userEmail] } };
      const orders = await orderCollection.find(query).toArray();
      res.send(orders);
    });

    // Add order
    app.post("/orders/add", async (req, res) => {
      const order = req.body;
      const result = await orderCollection.insertOne(order);
      res.json(result);
    });

    // Delete order
    app.delete("/orders/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await orderCollection.deleteOne(query);
      res.json(result);
    });

    // Get single order  by id
    app.get("/orders/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const order = await orderCollection.findOne(query);
      res.json(order);
    });

    // Update  order status  by id
    app.put("/orders/:id", async (req, res) => {
      const id = req.params.id;
      const updatedOrder = req.body;
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updateOrder = {
        $set: {
          name: updatedOrder.name,
          email: updatedOrder.email,
          address: updatedOrder.address,
          order_status: updatedOrder.order_status,
          service: updatedOrder.service,
        },
      };
      const result = await orderCollection.updateOne(
        filter,
        updateOrder,
        options
      );

      res.json(result);
    });

    // Add User
    app.post("/users", async (req, res) => {
      const user = req.body;
      const result = await usersCollection.insertOne(user);
      console.log(result);
      res.json(result);
    });

    // Add/ Update user
    app.put("/users", async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const options = { upsert: true };
      const updateDoc = { $set: user };
      const result = await usersCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.json(result);
    });

    // check if user admin
    app.get("/users/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      let isAdmin = false;
      if (user?.role === "admin") {
        isAdmin = true;
      }
      res.json({ admin: isAdmin });
    });

    // add new admin  by checking the requester is aslo an admin
    app.put("/users/admin/:email", async (req, res) => {
      const user = req.body;
      const requesterAccount = await usersCollection.findOne({
        email: req.params.email,
      });
      if (requesterAccount.role === "admin") {
        const filter = { email: user.email };
        const updateDoc = { $set: { role: "admin" } };
        const result = await usersCollection.updateOne(filter, updateDoc);
        res.json(result);
      }
    });
  } finally {
    // await client.close();
  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("বইয়ের খালাসি is running");
});

app.listen(port, () => {
  console.log("বইয়ের খালাসি Server running at port", port);
});
