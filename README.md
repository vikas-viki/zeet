### Login functionality.

1. login with email/google.
2. signup with google/email.
3. remember me for 30 days.


### audio & video handling

The webapp uses mediasoup for handling audio and video.

Mediasoup has 2 components

1. server:  
   1. a worker
   2. a router
   3. a transport
2. client
   1. a device
   2. a transport

when a user turns on mic/camera, the mediasoup produce transport (using device) gets created and starts transporting the porduced content at speed of 100kbps.
