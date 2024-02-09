
import { MongoClient, } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();
const connection_string = process.env.MONGODB_URI;
const client = new MongoClient(connection_string);
let connection = null;
try {
  console.log("Trying to establish connection...");
  connection = await client.connect();
  console.log(connection);
}
catch (e) {
  console.error(e)
}
let db = connection.db("JobifyDB");
export default db;