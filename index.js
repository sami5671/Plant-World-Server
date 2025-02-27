const express = require("express");
const app = express();
const cors = require("cors");
// --------------------FOR Socket.io--------------------------------------------
const http = require("http");
// const { Server } = require("socket.io");
// ----------------------------------------------------------------
var jwt = require("jsonwebtoken");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const port = process.env.PORT || 5000;

//----------------------- Middleware ------------------------
app.use(cors());
app.use(express.json());

// =================================================================

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.fmvmv30.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});
// ===================SSL Commerce==============================================
// const store_id = process.env.STORE_ID;
// const store_passwd = process.env.STORE_PASSWORD;
// const is_live = false; //true for live, false for sandbox

// =================================================================
async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    // =================All Collection================================================
    const userCollection = client.db("PlantDB").collection("users");
    const AllPlantsCollection = client.db("PlantDB").collection("AllPlants");
    const cartCollection = client.db("PlantDB").collection("carts");
    const paymentCollection = client.db("PlantDB").collection("payment");
    const shippedCollection = client.db("PlantDB").collection("shipped");
    const paymentHistoryCollection = client
      .db("PlantDB")
      .collection("paymentHistory");

    // =================================================================

    // ---------------------------JWT related API-------------------------------------
    app.post("/jwt", async (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "1h",
      });
      res.send({ token });
    });
    // MIDDLEWARE
    const verifyToken = (req, res, next) => {
      // console.log("inside the verifyToken", req.headers.authorization);
      if (!req.headers.authorization) {
        return res.status(401).send({ message: "Unauthorized Access" });
      }
      const token = req.headers.authorization.split(" ")[1];
      jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (error, decoded) => {
        if (error) {
          return res.status(401).send({ message: "Unauthorized Access" });
        }
        req.decoded = decoded;
        next();
      });
    };
    // use verify admin after verifyToken
    const verifyAdmin = async (req, res, next) => {
      const email = req.decoded.email;
      const query = { email: email };
      const user = await userCollection.findOne(query);
      const isAdmin = user?.role === "admin";
      if (!isAdmin) {
        return res.status(403).send({ message: "Forbidden Access" });
      }
      next();
    };
    //  ------------------------------------------------------------------------------------------------
    // ----------------------User Related ApI------------------------------------------
    app.post("/users", async (req, res) => {
      const user = req.body;
      const query = { email: user.email };
      const existingUser = await userCollection.findOne(query);
      if (existingUser) {
        return res.send({ message: "User already exists", insertedId: null });
      }
      const result = await userCollection.insertOne(user);
      res.send(result);
    });

    app.get("/users", verifyToken, async (req, res) => {
      // console.log(req.headers);
      const result = await userCollection.find().toArray();
      res.send(result);
    });

    app.get("/users/admin/:email", async (req, res) => {
      const email = req.params.email;
      // checking the admin
      // if (email !== req.decoded.email) {
      //   return res.status(403).send({ message: "Forbidden access" });
      // }
      const query = { email: email };
      const user = await userCollection.findOne(query);
      let admin = false;

      if (user) {
        admin = user?.role == "admin";
      }
      res.send({ admin });
    });

    app.patch("/users/admin/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          role: "admin",
        },
      };
      const result = await userCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

    app.patch("/users/moderator/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          role: "moderator",
        },
      };
      const result = await userCollection.updateOne(filter, updateDoc);
      res.send(result);
    });
    app.delete("/deleteUser/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await userCollection.deleteOne(query);
      res.send(result);
    });
    // =======================Plants Related Api==========================================
    app.get("/AllPlants", async (req, res) => {
      const result = await AllPlantsCollection.find().toArray();
      console.log(result);
      res.send(result);
    });
    app.post("/addProduct", async (req, res) => {
      const treeItem = req.body;
      const result = await AllPlantsCollection.insertOne(treeItem);
      res.send(result);
    });

    app.get("/product/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await AllPlantsCollection.findOne(query);
      res.send(result);
    });

    app.patch("/updateProduct/:id", async (req, res) => {
      const item = req.body;
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          name: item.name,
          previousPrice: item.previousPrice,
          newPrice: item.newPrice,
          plantType: item.plantType,
          material: item.material,
          color: item.color,
          category: item.category,
          stock: item.stock,
          rating: item.rating,
          description: item.description,
          img1: item.img1,
          img2: item.img2,
          img3: item.img3,
          img4: item.img4,
        },
      };
      const result = await AllPlantsCollection.updateOne(filter, updateDoc);
      res.send(result);
    });
    app.delete("/deleteProduct/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await AllPlantsCollection.deleteOne(query);
      res.send(result);
    });

    app.patch("/product/trending/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          trending: "true",
        },
      };
      const result = await AllPlantsCollection.updateOne(filter, updateDoc);
      res.send(result);
    });
    app.patch("/product/removeTrending/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          trending: "false",
        },
      };
      const result = await AllPlantsCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

    // =================================================================

    // =======================Cart Collection==========================================
    app.post("/carts", async (req, res) => {
      const cartItem = req.body;
      const result = await cartCollection.insertOne(cartItem);
      res.send(result);
    });
    app.get("/carts", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const result = await cartCollection.find(query).toArray();
      res.send(result);
    });
    app.delete("/carts/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await cartCollection.deleteOne(query);
      res.send(result);
    });
    // ===========================Order Related api======================================
    app.patch("/payments/orderProcessing/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          orderStatus: "processing",
        },
      };
      const result = await paymentCollection.updateOne(filter, updateDoc);
      res.send(result);
    });
    app.patch("/payments/orderPacking/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          orderStatus: "packing",
        },
      };
      const result = await paymentCollection.updateOne(filter, updateDoc);
      res.send(result);
    });
    app.patch("/payments/orderShipping/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          orderStatus: "shipping",
        },
      };
      const result = await paymentCollection.updateOne(filter, updateDoc);
      res.send(result);
    });
    app.patch("/payments/orderDelivered/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          orderStatus: "delivered",
        },
      };
      const result = await paymentCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

    app.get("/paymentsByEmail", verifyToken, async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const result = await paymentCollection.find(query).toArray();
      res.send(result);
    });
    // =================================================================

    // =============================Payment api====================================
    app.post("/create-payment-intent", async (req, res) => {
      const { price } = req.body;
      const amount = parseInt(price * 100);

      // Create a PaymentIntent with the order amount and currency
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount,
        currency: "usd",
        payment_method_types: ["card"],
      });
      res.send({
        clientSecret: paymentIntent.client_secret,
      });
    });

    app.post("/payments", async (req, res) => {
      const payment = req.body;
      const paymentResult = await paymentCollection.insertOne(payment);
      const paymentHistory = await paymentHistoryCollection.insertOne(payment);

      // carefully delete each item
      const query = {
        _id: {
          $in: payment.cartIds.map((id) => new ObjectId(id)),
        },
      };
      const deleteResult = await cartCollection.deleteMany(query);

      res.send({ paymentResult, deleteResult, paymentHistory });
    });

    app.get("/payments", verifyToken, async (req, res) => {
      const result = await paymentCollection.find().toArray();
      res.send(result);
    });

    app.get("/payments/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await paymentCollection.findOne(query);
      res.send(result);
    });

    app.delete("/deleteOrder/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await paymentCollection.deleteOne(query);
      res.send(result);
    });

    app.get("/paymentHistoryByEmail", verifyToken, async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const result = await paymentHistoryCollection.find(query).toArray();
      res.send(result);
    });

    app.delete("/deletePaymentHistory/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await paymentHistoryCollection.deleteOne(query);
      res.send(result);
    });

    app.post("/shippingConfirmed", async (req, res) => {
      const shipped = req.body;
      const shippingResult = await shippedCollection.insertOne(shipped);
      res.send({ shippingResult });
    });

    app.get("/shippingConfirmByEmail", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const result = await shippedCollection.find(query).toArray();
      res.send(result);
    });
    app.delete("/deleteShippedHistory/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await shippedCollection.deleteOne(query);
      res.send(result);
    });
    // -----------------------------------------------------------------
    // ========================DASH-BOARD CALCULATION APIS=========================================
    app.get(
      "/revenueCalculation",
      verifyToken,
      verifyAdmin,
      async (req, res) => {
        const result = await paymentHistoryCollection.find().toArray();
        res.send(result);
      }
    );

    // =================================================================

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

// ------------------------FOR Socket.io----------------------------------------
// const server = http.createServer(app);

// const io = new Server(server, {
//   cors: {
//     origin: "https://planet-world-fc802.web.app",
//     methods: ["GET", "POST"],
//   },
// });
// ----------------------------------------------------------------

// -------------------- FOR socket.io connection --------------------------------------------

// io.on("connection", (socket) => {
//   console.log(`User Connected: ${socket.id}`);

//   socket.on("join_room", (data) => {
//     socket.join(data);
//     console.log(`User with ID: ${socket.id} joined room: ${data}`);
//   });

//   socket.on("send_message", (data) => {
//     socket.to(data.room).emit("receive_message", data);
//   });

//   socket.on("disconnect", () => {
//     console.log("User disconnected", socket.id);
//   });
// });
// server.listen(5000, () => {
//   console.log("Web socket Server Running");
// });
// ----------------------------------------------------------------
// =================================================================
app.get("/", (req, res) => {
  res.send("Plant server is running");
});

app.listen(port, () => {
  console.log(`Plant World server is sitting on port ${port}`);
});
