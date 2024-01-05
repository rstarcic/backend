
import { MongoClient, } from 'mongodb';
const connection_string = "mongodb+srv://rstarcic:jobifyApp123@jobifycluster.ebnrdry.mongodb.net/?retryWrites=true&w=majority";
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