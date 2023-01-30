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

---  
### Todo
- seperate subscription, playlist and player logic from App.jsx by adding a reducer
- move youtube api title feching to the server
---
### Browser issues
Only firefox autoplays when joining existing playlist
---

#### Note about scaleability :  
The initial idea was to use a message queue, that would notify all nodes about the changes made to the playlist.  
And then each node updates its subscribed users.  
Instead there is a job running checking if the playlist was changed.  
If it was changed, then each runnig node updates its subscribed users.  
<br />
Looks something like this.  
<br />
![alt text](https://github.com/boris-grinshpun/myplayer/blob/main/screen.png?raw=true)

