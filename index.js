const express = require('express');
const { json } = require('express');
const { MongoClient, ObjectID } = require('mongodb');

const app = express();
const port = 3000;

const url = 'mongodb://mongodb:27017';
const dbName = 'mydatabase';

app.use(json());

// start
MongoClient.connect(url, { useUnifiedTopology: true }).then((client) => {
	console.log('Connected to Database');
	const db = client.db(dbName);
	const usersCollection = db.collection('users');

	// Delete a user by ID
	app.delete('/users/:id', async (req, res) => {
		const idToDelete = new ObjectID(req.params.id);
		// Find the document by ID
		const user = await usersCollection.findOne({ _id: idToDelete });
		if (!user) {
			// Handle the case when no document is found
			return res.status(404).json({ error: 'User not found' });
		}
		usersCollection.deleteOne({ _id: idToDelete }, function (err) {
			if (err) {
				console.status(500).error('Error deleting document:', err);
				return;
			}
			res.status(200).send('Document deleted successfully');
		});
	});
});
// end

app.get('/', (req, res) => {
	res.send('Hello World');
});

app.post('/users', async (req, res) => {
	try {
		const client = new MongoClient(url);
		await client.connect();
		const db = client.db(dbName);
		const collection = db.collection('users');
		const result = await collection.insertOne(req.body);
		res.status(200).send(req.body);
		client.close();
	} catch (error) {
		console.error(error);
		res.status(500).send('Internal Server Error');
	}
});

app.get('/users', async (req, res) => {
	try {
		const client = new MongoClient(url);
		await client.connect();
		const db = client.db(dbName);
		const collection = db.collection('users');
		const result = await collection.find().toArray();
		res.json(result);
		client.close();
	} catch (error) {
		console.error(error);
		res.status(500).send('Internal Server Error');
	}
});

app.put('/users/:id', async (req, res) => {
	try {
		const client = new MongoClient(url);
		await client.connect();
		const db = client.db(dbName);
		const collection = db.collection('users');
		const result = await collection.findOneAndUpdate(
			{ _id: req.params.id },
			{ $set: req.body },
			{ returnOriginal: false }
		);
		res.json(result.value);
		client.close();
	} catch (error) {
		console.error(error);
		res.status(500).send('Internal Server Error');
	}
});

app.listen(port, () => {
	console.log(`App listening at http://localhost:${port}`);
});
