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
        server.log(response.body);
    }
    
    function multisend(_contacts, _subject, _message) {
        foreach(contact in _contacts) {
            this.send(contact, _subject, _message);
        }
    }

}

// keen tokens
const KEEN_PROJECT_ID       = "5506b201672e6c4a103511d7";
const KEEN_WRITE_API_KEY    = "130d3273c5071b58a42c2bb09b4ae7ff0863b2d90c1f047df2635b2481ebd2d15373f4fe610023d2fb427a17d3f9840af1be7021595fff43c2adebc2317314af99b4aa271393068c9faee52209d03bebd54ee644f4ebe3b9bcc9abfb2902bccc8dcce8be0169e568c87843a394cf6b76";

// mailgun credentials
const MG_API_KEY            = "key-628c937d33ab988ac72edaf04b73a6c6";
const MG_DOMAIN             = "sandbox9a94f840a24f478fa76e80bb52b9c155.mailgun.org";
const MG_EMAIL              = "Spiio Notifications <notify@spiio.com>";

// 3rd party object setup
keen        <- KeenIO(KEEN_PROJECT_ID, KEEN_WRITE_API_KEY);
mail        <- MailGun(MG_API_KEY, MG_DOMAIN, MG_EMAIL);
api         <- Rocky({ accessControl = true, allowUnsecure = false, strictRouting = false, timeout = 10 });

// device config and credentials
SETUP <- { 
    id = http.agenturl().slice(30),
    config = {
        collect = 10,
        interval = 600
    },
    reading = {
        data = {
            collect_cycle = 0,
            humidity = 0,
            lux = 0,
            temp = 0,
            moisture = 0,
            battery = 0
        },
        time = time()
    },
    notification = {
        contacts = [ ],
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
    
    //server.log("BATTERY: " + tosend.battery + "\t" + "TRIGGER VALUE: " + SETUP.notification.entity.battery.value);
    
    if(tosend.battery <= SETUP.notification.entity.battery.value) {
        if(!SETUP.notification.entity.battery.sent) {
            mail.multisend(SETUP.notification.contacts, "BATTERY LOW", "Battery is low (" + tosend.battery + "%) on " + SETUP.id + "! \n Best, spiio");
            SETUP.notification.entity.battery.sent = true;
            SETUP.notification.entity.battery.timestamp <- time();
            imp.wakeup(SETUP.notification.interval, function() {
                SETUP.notification.entity.battery.send = false;
            });
        }
    } 
    
    if(tosend.moisture <= SETUP.notification.entity.moisture.value) {
        if(!SETUP.notification.entity.moisture.sent) {
            mail.multisend(SETUP.notification.contacts, "MOISTURE LOW", "Moisture level is low (" + tosend.moisture + "%) on " + SETUP.id + "! \n Best, spiio"); 
            SETUP.notification.entity.moisture.sent = true;
            SETUP.notification.entity.moisture.timestamp <- time();
            imp.wakeup(SETUP.notification.interval, function() {
                SETUP.notification.entity.moisture.send = false;
            });
        }
    }
    
    SETUP.reading.data <- tosend;
    SETUP.reading.time <- time();
    
    server.log(http.jsonencode(tosend));
    
    keen.sendEvent(SETUP.id, tosend, function(resp) {
        server.log("Keen response: " + resp.statuscode + " \t body: " + resp.body);
    });
    
    save_settings();
    
});

device.on("update", function(data) {
    
    /*
    server.log("Device asking for update!");
    server.log("Current device interval: " + data.interval);
    server.log("Server interval config: " + SETUP.config.interval);
    server.log("Current device collect amount: " + data.collect);
    server.log("Server collect config: " + SETUP.config.collect);
    */
    
    // only send new config back if different from current (save wifi time)
    //if(data.collect != SETUP.config.collect || data.interval != SETUP.config.interval) {
        server.log("Sending updated values to device!");
        device.send("update", { 
            collect = SETUP.config.collect,
            interval = SETUP.config.interval
        });
    //}
    
});

device.on("print", function(data) {
   server.log(http.jsonencode(data)); 
});

// load settings from persistent
function load_settings() {
    
    local loaded = server.load();
    
    if (loaded.len() != 0) {
        SETUP <- loaded;
        foreach(i, sensor in SETUP.notification.entity) {
            if(sensor.sent) {
                sensor.sent = false;
            }
        }
        server.log(http.jsonencode(SETUP.notification));
    } else {
        server.log("No settings to load ...");
        server.log("collection = " + SETUP.id);
    }
    
}

// save settings to persistent
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
    mail.send("dal@graulund.net", "TESTING", context.path[1]);
    context.send(200, "Mail sent!") 
});

api.post("/setup", function(context) {
    // return setup and device id
    context.send(200, SETUP); 
});

api.post("/setup/notification/email/add/([^/]*)", function(context) {
    local email = context.path[4];
    SETUP.notification.contacts.push(email);
    save_settings();
    server.log(SETUP.notification.contacts);
    context.send(200, SETUP.notification.contacts);
});

api.post("/setup/notification/email/remove/([^/]*)", function(context) {
   local email = context.path[4];
   local index = SETUP.notification.contacts.find(email);
   SETUP.notification.contacts.remove(index);
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
    server.log("new moisture value: " + value);
    SETUP.notification.entity[sensor].value <- value;
    save_settings();
    context.send(200, SETUP.notification.entity);
});

api.get("/setup/config/interval/([^/]*)", function(context) {
    local interval = context.path[3].tointeger();
    SETUP.config.interval <- interval;
    save_settings();
    context.send(200, SETUP.config);
});

api.get("/setup/config/collect/([^/]*)", function(context) {
    local collect = context.path[3].tointeger();
    SETUP.config.collect <- collect;
    save_settings();
    context.send(200, SETUP.config);
});

// start up
load_settings();