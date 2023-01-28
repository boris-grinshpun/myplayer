### Run in this order

1. CDN
- cd cdn
- npm install
- npm run cdn

2. Server
- cd server
- npm install
- node index.js / nodemon index.js 

3. Client
- cd client
- npm install
- npm run dev
---
### Tests
- cd client
- npm test
- npm test:coverage

The initial idea was to use a message queue, that would notify all nodes about the changes made to the playlist.  
And then each node updated its subscribes users.  
<br />
Instead there is a job running checking if the playlist was changed.  
If it was changed, then the node updates it's subscribed users.  

![alt text](https://github.com/boris-grinshpun/myplayer/blob/main/screen.png?raw=true)

