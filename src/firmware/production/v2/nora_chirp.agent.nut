#require "KeenIO.class.nut:1.0.0"

// keen tokens
const KEEN_PROJECT_ID = "";
const KEEN_WRITE_API_KEY = "";

// device config
config <- {
    collect = 10,
    interval = 125
}

// keen object
keen <- KeenIO(KEEN_PROJECT_ID, KEEN_WRITE_API_KEY);

device.on("keen", function(data) {
    
    //server.log(http.jsonencode(data));
    
    /*
    keen.sendEvent("data_test", data, function(resp) {
        server.log(resp.statuscode + ": " + resp.body);
    });
    */
    
    
});

device.on("print", function(data) {
    
    server.log(http.jsonencode(data));
    
});

device.on("update", function(data) {
    
    // only send new config back if different from current (save wifi time)
    if(data.collect != config.collect || data.interval != config.interval) {
        device.send("update", { 
            collect = config.collect,
            interval = config.interval
        });
    }
    
});

function request_handler(request, response) {

  response.send(200, "OK");
  
}
 
http.onrequest(request_handler);