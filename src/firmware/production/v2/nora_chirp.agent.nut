#require "KeenIO.class.nut:1.0.0"

// keen tokens
const KEEN_PROJECT_ID = "";
const KEEN_WRITE_API_KEY = "";

// device config
config      <- {
    collect = 10,
    interval = 125
};

// settings (keen collection name (default: "data"))
setup       <- { collection = "data" };

// latest reading
reading     <- {};

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
    
    reading.data <- tosend;
    reading.time <- time();
    
    server.log(http.jsonencode(tosend));
    //server.log(settings.collection);
    
    keen.sendEvent(setup.collection, tosend, function(resp) {
        //server.log(resp.statuscode + ": " + resp.body);
    });
    
    save_settings();
    
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

function load_settings() {
    
    local loaded = server.load();
    
    if (loaded.len() != 0) {
        setup   <- loaded.setup;
        reading <- loaded.reading;
        server.log("settings loaded: collection = " + setup.collection);
    } else {
        server.log("No settings to load ...");
        server.log("collection = " + setup.collection);
    }
    
}

function save_settings() {
    
    settings            <- {};
    settings.reading    <- reading;
    settings.setup      <- setup;
    
    server.log(http.jsonencode(settings));
    
    local err = server.save(settings);
    
    if (err == 0) {
        server.log("Settings saved");
    } else {
        server.log("Settings not saved. Error: " + err.tostring());
    }
    
}

function request_handler(request, response) {
    
    response.header("Access-Control-Allow-Origin", "*");
    response.header("Access-Control-Allow-Headers","Authorization, Origin, X-Requested-With, Content-Type, Accept");
    response.header("Access-Control-Allow-Methods", "POST, GET, OPTIONS");

  if ("col" in request.query) {
      
    // if it was, send the value of it to the device
    setup.collection <- request.query["col"];
    server.log("collection now: " + setup.collection);
    save_settings();
    
  }
  
  if(request.path == "/read") {
      
      response.send(200, http.jsonencode(reading));
      return;
  }
  
  response.send(200, "OK");
  
}
 
http.onrequest(request_handler);

load_settings();