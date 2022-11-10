const express = require('express');
const app = express()
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();

const port = process.env.PORT || 5000;

// middleware 
app.use(cors());
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.6llxg7j.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

function verfiyJWT (req,res,next){
    const authHeader = req.headers.authorization;

    if(!authHeader){
        return res.status(401).send({message:'unauthorized access'})
    }

    const token = authHeader.split(' ')[1];
    jwt.verify(token,process.env.SECRET_ACCESS_TOKEN, function(err, decoded){
        if(err){
            return res.status(403).send({message:'forbidden access'})
        }
        req.decoded = decoded;
        next();
    })
}

async function run(){
    try{
        const serviceCollection = client.db('nafisPhotography').collection('services');
        const reviewCollection = client.db('nafisPhotography').collection('review')

        app.post('/jwt', (req, res) =>{
            const user = req.body;
            const token = jwt.sign(user, process.env.SECRET_ACCESS_TOKEN, {expiresIn:'1d'});
            res.send({token});
        })

        app.get('/services',async (req,res)=>{
            const query = {}
            const cursor = serviceCollection.find(query).sort({'_id':-1})
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

        app.get('/review/:id', async (req,res)=>{
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const review = await reviewCollection.findOne(query);
            res.send(review);
        })

        // update review data 
        
        app.put('/review/:id', async (req,res)=>{
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const review = req.body;
            const updateReview = {
                $set: {
                    comment: review.comment,
                    description: review.description,
                    rating: review.rating
                }
            }
            const result = await reviewCollection.updateOne(filter,updateReview)
            res.send(result);
        })

        // get review data by email query & call verifyJWT funtion
        app.get('/userReview', verfiyJWT, async (req,res)=>{
            const decoded = req.decoded;

            if(decoded.email !== req.query.email){
                res.status(403).send({message: 'unauthorized access'})
            }

            let query = {};
            if(req.query.email){
                query = {
                    email: req.query.email
                }
            }

            const cursor = reviewCollection.find(query);
            const review = await cursor.toArray();
            res.send(review);
        })

        // add service by user 
        app.post('/allservices',async (req,res)=>{
            const addService = req.body;
            const result = await serviceCollection.insertOne(addService);
            res.send(result);
        })


        app.delete('/userReview/:id', async(req,res)=>{
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await reviewCollection.deleteOne(query);
            res.send(result);
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