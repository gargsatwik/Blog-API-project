import express from "express";
import bodyParser from "body-parser";
import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();
const app = express();
const port = 4000;
const DB_URI = process.env.DB_URI;
const DB_NAME = "BLOG_API_PROJECT";

function generateDate(){
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  const formattedDateTime = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}Z`;
  return formattedDateTime;
}

const client = new MongoClient(DB_URI);
await client.connect();
const db = client.db(DB_NAME);
const postCollection = db.collection('posts');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/posts', async (req, res) => {
  const posts = await postCollection.find().toArray();
  res.send(posts);
})

app.get('/posts/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  const post = await postCollection.findOne({ "id": id });
  res.send(post);
})

app.post('/posts', async (req, res) => {
  const response = req.body;
  const newPost = {
    id: await postCollection.countDocuments() + 1,
    title: response.title,
    content: response.content,
    author: response.author,
    date: generateDate(),
  }
  await postCollection.insertOne(newPost);
  res.send(newPost);
})

app.patch('/posts/:id', async (req, res) => {
  const data = req.body;
  const id = parseInt(req.params.id);
  if (data.title) {
    await postCollection.updateOne({ "id": id }, {$set: { "title": data.title }})
  } else if (data.content) {
    await postCollection.updateOne({ "id": id }, {$set: { "content": data.content }})
  }
  await postCollection.updateOne({ "id": id }, {$set: { "date": generateDate() }})
  res.send(posts[postIndex]);
})

app.delete('/posts/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    await postCollection.deleteOne({ "id": id });
    res.sendStatus(200);
  } catch (error) {
    console.error("Failed to delete post: ", error.message);
  }
})

app.listen(port, () => {
  console.log(`API is running at http://localhost:${port}`);
});
