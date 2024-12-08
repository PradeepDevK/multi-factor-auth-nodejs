import { connect } from "mongoose";
const dbConnect = async () => {
    try {
        const mongoDBConnection = await connect(process.env.CONNECTION_STRING);
        console.log(`Database connected: ${mongoDBConnection.connection.host}`);
    } catch (err) {
        console.log(`Database connect failed ${err}`);
        process.exit(1);
    }
};

export default dbConnect;