// libraries
#require "KeenIO.class.nut:1.0.0"
#require "rocky.class.nut:1.1.1"

// classes
class MailGun {
    
    apikey  = null;
    domain  = null;
    from    = "imp@no-reply.com";
    
    constructor(_apiKey, _domain, _from="imp@no-reply.com") {
        apikey = _apiKey;
        domain = _domain;
        from = _from;
    }   
    
    function send(_to, _subject, _message) {
        local request = http.post("https://api:" + apikey + "@api.mailgun.net/v2/" + domain + "/messages", {"Content-Type": "application/x-www-form-urlencoded"}, "from=" + from + "&to=" + _to + "&subject=" + _subject + "&text=" + _message);
        local response = request.sendsync();
        return response.body;
    }
    
    function multisend(_contacts, _subject, _message) {
        foreach(contact in _contacts) {
            this.send(contact, _subject, _message);
        }
    }

}

// keen tokens
const KEEN_PROJECT_ID       = "";
const KEEN_WRITE_API_KEY    = "";

// mailgun credentials
const MG_API_KEY            = "";
const MG_DOMAIN             = "";
const MG_EMAIL              = "Spiio Notifications <notify@spiio.com>";

// 3rd party object setup
keen        <- KeenIO(KEEN_PROJECT_ID, KEEN_WRITE_API_KEY);
mail        <- MailGun(MG_API_KEY, MG_DOMAIN, MG_EMAIL);
api         <- Rocky({ accessControl = true, allowUnsecure = false, strictRouting = false, timeout = 10 });

// device config and credentials (keen collection name (default: "data"))
SETUP <- { 
    device = {
        name = "Test CN #1",
        collection = "data"
    }
    config = {
        collect = 10,
        interval = 120
    },
    reading = {
        collect_cycle = 0,
        humidity = 0,
        lux = 0,
        temp = 0,
        moisture = 0,
        battery = 0
    },
    notification = {
        contacts = [ "contact@spiio.com" ],
        entity = {
            battery = { value = 10, sent = false },
            moisture = { value = 35, sent = false }
        },
        interval = 43200
    }
};

// device handlers
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
    
    server.log("BATTERY: " + tosend.battery + "\t" + "TRIGGER VALUE: " + SETUP.notification.entity.battery.value);
    
    if(tosend.battery <= SETUP.notification.entity.battery.value) {
        if(!SETUP.notification.entity.battery.sent) {
            mail.multisend(SETUP.notification.contacts, "BATTERY LOW", "Battery is low (" + tosend.battery + "%) on " + SETUP.device.name + "! \n Best, spiio");
            SETUP.notification.entity.battery.sent = true;
            imp.wakeup(SETUP.notification.interval, function() {
                SETUP.notification.entity.battery.send = false;
            });
        }
    } 
    
    if(tosend.moisture <= SETUP.notification.entity.moisture.value) {
        if(!SETUP.notification.entity.moisture.sent) {
            mail.multisend(SETUP.notification.contacts, "MOISTURE LOW", "Moisture level is low (" + tosend.moisture + "%) on " + SETUP.device.name + "! \n Best, spiio"); 
            SETUP.notification.entity.moisture.sent = true;
            imp.wakeup(SETUP.notification.interval, function() {
                SETUP.notification.entity.moisture.send = false;
            });
        }
    }
    
    SETUP.reading.data <- tosend;
    SETUP.reading.time <- time();
    
    server.log(http.jsonencode(tosend));
    
    keen.sendEvent(SETUP.device.collection, tosend, function(resp) {
        //server.log(resp.statuscode + ": " + resp.body);
    });
    
    save_settings();
    
});

device.on("update", function(data) {
    
    // only send new config back if different from current (save wifi time)
    if(data.collect != SETUP.config.collect || data.interval != SETUP.config.interval) {
        device.send("update", { 
            collect = SETUP.config.collect,
            interval = SETUP.config.interval
        });
    }
    
});

// methods
function load_settings() {
    
    local loaded = server.load();
    
    if (loaded.len() != 0) {
        SETUP <- loaded;
        foreach(sensor in SETUP.notification.entity) {
            if(sensor.sent) {
                imp.wakeup(1, function() { 
                    sensor.sent = false;
                });
            }
        }
        server.log("settings loaded: " + http.jsonencode(SETUP));
    } else {
        server.log("No settings to load ...");
        server.log("collection = " + SETUP.device.collection);
    }
    
}

function save_settings() {
    
    server.log(http.jsonencode(SETUP));
    
    local err = server.save(SETUP);
    
    if (err == 0) {
        server.log("Settings saved");
    } else {
        server.log("Settings not saved. Error: " + err.tostring());
    }
    
}

// api
api.get("/read", function(context) {
    context.send(200, SETUP.reading);
});

api.get("/mail/([^/]*)", function(context) {
    mail.multisend(SETUP.notification.contacts, "TESTING", context.path[1]);
    context.send(200, "Mail sent!") 
});

api.post("/setup/([^/]*)/([^/]*)", function(context) {
    local name = context.path[1];
    local col = context.path[2];
    
    SETUP.device.name   <- name;
    SETUP.device.col    <- col;
    
    server.log(http.jsonencode(SETUP));
    
    context.send(200, SETUP); 
});

api.post("/setup/collection/([^/]*)", function(context) {
    local collection = context.path[2];
    SETUP.device.collection <- collection;
    save_settings();
    context.send(200, SETUP.device)
});

api.post("/setup/name/([^/]*)", function(context) {
    local name = context.path[2];
    SETUP.device.name <- name;
    context.send(200, SETUP.device);
});

api.post("/setup/notification/email/([^/]*)", function(context) {
    local email = context.path[3];
    SETUP.notification.contacts.push(email);
    save_settings();
    context.send(200, SETUP.notification.contacts);
});

api.post("/setup/notification/battery/([^/]*)", function(context) {
    local sensor = context.path[2];
    local value = context.path[3].tointeger();
    SETUP.notification.entity[sensor].value <- value;
    save_settings();
    context.send(200, SETUP.notification.entity);
});

api.post("/setup/notification/moisture/([^/]*)", function(context) {
    local sensor = context.path[2];
    local value = context.path[3].tointeger();
    SETUP.notification.entity[sensor].value <- value;
    save_settings();
    context.send(200, SETUP.notification.entity);
});

api.post("/setup/config/interval/([^/]*)", function(context) {
    local interval = context.path[3].tointeger();
    SETUP.config.interval <- interval;
    save_settings();
    context.send(200, SETUP.config);
});

api.post("/setup/config/collect/([^/]*)", function(context) {
    local interval = context.path[3].tointeger();
    SETUP.config.interval <- interval;
    save_settings();
    context.send(200, SETUP.config);
});

// start up
load_settings();