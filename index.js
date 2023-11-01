const express = require('express');
const cors = require('cors');
require('dotenv').config();
const jwt = require("jsonwebtoken");
const cookieParser = require('cookie-parser');
const app = express();
const port = process.env.PORT || 5000;

// middleware 
app.use(cors({
    origin: ['http://localhost:5173'],
    credentials: true,
}));
app.use(express.json());
app.use(cookieParser());


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.prs1keb.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        // await client.connect();
        const carCollection = client.db('carsDB').collection('cars');
        const brandCollection = client.db('carsDB').collection('brands');
        const cartCollection = client.db('carsDB').collection('cart');

        // auth related apis 
        app.post('/jwt', async (req, res) => {
            const user = req.body;
            console.log(user);
            const token = jwt.sign(user,
                process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: '1h' });
            res
                .cookie('token', token, {
                    httpOnly: true,
                    secure: false,
                    sameSite: 'none'
                })
                .send({ success: true });
        })

        // carCollections data 
        app.post('/cars', async (req, res) => {
            const newCar = req.body;
            console.log(newCar);
            const result = await carCollection.insertOne(newCar);
            res.send(result);
        })

        app.get('/cars', async (req, res) => {
            const cursor = carCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        })

        app.get('/cars/:brand', async (req, res) => {
            const brand = req.params.brand;
            const query = { brand_name: (brand) };
            const result = await carCollection.find(query).toArray();
            res.send(result);
        })

        app.get('/detail/:id', async (req, res) => {
            const id = req.params.id;
            console.log("get the id", id)
            const query = { _id: new ObjectId(id) };
            const result = await carCollection.findOne(query);
            res.send(result);
        })

        app.put('/detail/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const options = { upsert: true };
            const updatedCar = req.body;
            const car = {
                $set: {
                    name: updatedCar.name,
                    type: updatedCar.type,
                    price: updatedCar.price,
                    detail: updatedCar.detail,
                    brand_name: updatedCar.brand_name,
                    title: updatedCar.title,
                    rating: updatedCar.rating,
                    image: updatedCar.image,
                    thumbnail_img: updatedCar.thumbnail_img,
                }
            }
            const result = await carCollection.updateOne(filter, car, options);
            res.send(result);
        })





        // brands collection 
        app.post('/brands', async (req, res) => {
            const newBrand = req.body;
            console.log(newBrand);
            const result = await brandCollection.insertOne(newBrand);
            res.send(result);
        })

        app.get('/brands', async (req, res) => {
            const cursor = brandCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        })

        // cart collection 
        app.post('/cart', async (req, res) => {
            const newProduct = req.body;
            console.log(newProduct);
            const result = await cartCollection.insertOne(newProduct);
            res.send(result);
        })

        app.get('/cart', async (req, res) => {
            const cursor = cartCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        })


        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!!!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', async (req, res) => {
    res.send('Salford cars Automotive Brand Shop is running')
});
app.listen(port, () => {
    console.log(`Brand Shop Server Side is running on port: ${port}`)
});