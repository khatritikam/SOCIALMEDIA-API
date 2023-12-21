import {Server} from './server';

let server = new Server().app;
let port = 4000;

server.listen(port,()=>{
    console.log('server is running');
})




