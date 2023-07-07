import { connect } from "mongoose";


const connectDatabase = () => {
    console.log(process.env.DB_URI)
    connect(process.env.DB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }).then((data) => {
        console.log(`Mongodb connected with server: ${data.connect.host}`);
    })
}

export default connectDatabase