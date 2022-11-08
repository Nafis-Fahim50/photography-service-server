const express = require('express');
const app = express()
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();

const port = process.env.PORT || 5000;

// middleware 
app.use(cors());
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.6llxg7j.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run(){
    try{
        const serviceCollection = client.db('nafisPhotography').collection('services');
        const reviewCollection = client.db('nafisPhotography').collection('review')

        app.get('/services',async (req,res)=>{
            const query = {}
            const cursor = serviceCollection.find(query)
            const services = await cursor.limit(3).toArray()
            res.send(services);
        })

        app.get('/allservices',async (req,res)=>{
            const query = {}
            const cursor = serviceCollection.find(query)
            const services = await cursor.toArray()
            res.send(services);
        })

        app.get('/services/:id', async (req,res)=>{
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const service = await serviceCollection.findOne(query);
            res.send(service);
        })

        app.post('/review',async (req,res)=>{
            const review = req.body;
            const result = await reviewCollection.insertOne(review);
            res.send(result);
        })

        app.get('/review', async (req,res)=>{
            const query = {};
            const cursor = reviewCollection.find(query);
            const review = await cursor.toArray();
            res.send(review);
        })
    }
    finally{

    }
}
run().catch(error => console.error(error))

app.get('/',(req,res)=>{
    res.send('Nafis Photography Server is Running...')
})

app.listen(port, ()=>{
    console.log(`Server is running on ${port}`)
})