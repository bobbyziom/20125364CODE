class Storage {
    
    collect_max = null;
    
    constructor(_collect_max = 4) {
        collect_max = _collect_max;
        if (!("nv" in getroottable())) {
            reset_nv();
        }
    }
    
    function set_collect_max(_collect_max) {
        collect_max = _collect_max;
        if (("nv" in getroottable()) && ("max_collect" in ::nv)) {
            ::nv["max_collect"] <- collect_max;
        } else {
            reset_nv();
        }
    }
    
    function get_nv(key) {
    	if (("nv" in getroottable()) && (key in ::nv)) {
            return ::nv[key];
    	} else {
    	    return null;   
    	}
    }

    function append_nv(key, value) {
        if (!("nv" in getroottable())) {
            ::nv <- {};  
        } else {
            ::nv[key].append(value);
        }
    }
    
    function reset_nv() {
        ::nv <- { 
            temp = [],
            hum = [],
            lux = [],
            mois = [],
            time = [],
            max_collect = collect_max,
            count = 0
        };  
    }
    
    function full_nv() {
        ::nv["count"]++;
        if(::nv["count"] >= collect_max) {
            return true;
        } else {
            return false;
        }
    }  
    
}

store    <- Storage(5);

function send() {
    agent.send("send", {
        humidity = ::nv["hum"],
        temp = ::nv["temp"],
        lux = ::nv["lux"],
        moisture = ::nv["mois"],
        timestamp = ::nv["time"]
    });
    reset_nv();
}

function update() {
    // should pass collect max
    // and maybe other variable, for the agent to check if it should reply with new config
    
    agent.send("update", true)
}

function startup() {

    // collect data and store it in NV table
 
    store.append_nv("temp", 2);
    store.append_nv("hum", 20);
    store.append_nv("lux", 399);
    store.append_nv("mois", 4);
    store.append_nv("time", time());
    
    // check if exeeding NV table max size
    // if so: connect to wifi, send nv data and update device config if any changes
    
    if(store.full_nv()) {
        send();
        update();
    };
    
    server.log("data logged: (" + nv.count + ")");
    
    // Go to deep sleep for en seconds
    
    imp.onidle(function(){imp.deepsleepfor(10.0)})
}

agent.on("update", function(config) {
    
    server.log("device updated: " + config);
    
});
 
// When the code, execute the startup function
 
startup()