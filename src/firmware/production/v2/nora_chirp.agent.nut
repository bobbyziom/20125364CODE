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
    
    local data_index = data.lux.len()-1;
    
    tosend <- {
        collect_cycle = data.collect_cycle[data_index],
        humidity = data.humidity[data_index],
        lux = data.lux[data_index],
        temp = data.temp[data_index],
        moisture = data.moisture[data_index],
        battery = data.battery[data_index]
    }
    
    keen.sendEvent("norachirp5", tosend, function(resp) {
        server.log(resp.statuscode + ": " + resp.body);
    });
    
    
    
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