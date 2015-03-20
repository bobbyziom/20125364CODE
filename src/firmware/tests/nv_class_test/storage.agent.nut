device.on("send", function(data) {
   
   server.log(http.jsonencode(data));
    
});

device.on("update", function() {
   
   
   
   device.send("update", time());
    
});