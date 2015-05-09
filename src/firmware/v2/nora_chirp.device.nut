// timeout policy
server.setsendtimeoutpolicy(RETURN_ON_ERROR, WAIT_TIL_SENT, 5);

// imp initial configs (power save enabled / blinkup disabled)
imp.setpowersave(true);
imp.enableblinkup(false);

// cycle watch (setting start flag)
local duty_start = hardware.millis();
local collect_stop;

// classes / libraries
class Sensor {

    i2c       = null;
    addr      = null;
    name      = "sensor";
    
    constructor(_i2c=null, _addr=null) {
        i2c = _i2c;
        addr = _addr;
        if (i2c) i2c.configure(CLOCK_SPEED_400_KHZ);
    }

    function reset() {
        if (i2c) {
            i2c.write(0x00,format("%c",RESET_VAL));
            imp.sleep(0.01);
        }
    }
    
}

class Tsl2561 extends Sensor {

    static TSL2561_CMD           = "\x80";
    static TSL2561_CMD_CLEAR     = "\xC0";
    static TSL2561_REG_CONTROL   = "\x00";
    static TSL2561_REG_TIMING    = "\x01";
    static TSL2561_REG_THRESH_L  = "\x02";
    static TSL2561_REG_THRESH_H  = "\x04";
    static TSL2561_REG_INTCTL    = "\x06";
    static TSL2561_REG_ID        = "\x0A";
    static TSL2561_REG_DATA_0    = "\x0C";
    static TSL2561_REG_DATA_1    = "\x0E";

    static WAIT = 450;
    static name = "light";
    
    constructor(_i2c, _addr = 0x52) {
        base.constructor(_i2c, _addr);
    }
    
    function convert(reg0, reg1) {

        local ch0 = ((reg0[1] & 0xFF) << 8) + (reg0[0] & 0xFF);
        local ch1 = ((reg1[1] & 0xFF) << 8) + (reg1[0] & 0xFF);
    
        local ratio = ch1 / ch0.tofloat();
        local lux = 0.0;
        if (ratio <= 0.5){
            lux = 0.0304*ch0 - 0.062*ch0*math.pow(ratio,1.4);
        } else if( ratio <= 0.61){
            lux = 0.0224 * ch0 - 0.031 * ch1;
        } else if( ratio <= 0.8){
            lux = 0.0128*ch0 - 0.0153*ch1;
        } else if( ratio <= 1.3){
            lux = 0.00146*ch0 - 0.00112*ch1;
        } else {
                throw "Invalid lux calculation: " + ch0 + ", " + ch1;
          return null;
        }

        // Round to 2 decimal places
        lux = (lux*100).tointeger() / 100.0;

        //server.log(format("Ch0: 0x%04X Ch1: 0x%04X Ratio: %f Lux: %f", ch0, ch1, ratio, lux));
        return lux;
    }


    function read(callback = null) {
        
        i2c.write(addr, "\x80\x03");
        imp.wakeup(WAIT/1000.0, function() {
            
            local reg0 = i2c.read(addr, "\xAC", 2);
            local reg1 = i2c.read(addr, "\xAE", 2);
            
            if (reg0 == null || reg1 == null) {
                return callback(null);
            } else {
                // convert(reg0, reg1)
                return callback(convert(reg0, reg1));
            }
            
        }.bindenv(this));
        
    }

}

class Si7021 extends Sensor {
    
    static READ_RH      = "\xF5"; 
    static READ_TEMP    = "\xF3";
    static PREV_TEMP    = "\xE0";
    static RH_MULT      = 125.0/65536.0;
    static RH_ADD       = -6;
    static TEMP_MULT    = 175.72/65536.0;
    static TEMP_ADD     = -46.85;
    
    static name         = "temphum";

    constructor(_i2c, _addr = 0x80) {
        base.constructor(_i2c, _addr);
    }
    
    // read the humidity
    // Input: (none)
    // Return: relative humidity (float)
    function readRH() { 
        i2c.write(addr, READ_RH);
        local reading = i2c.read(addr, "", 2);
        while (reading == null) {
            //server.log("reading rh");
            reading = i2c.read(addr, "", 2);
            //imp.sleep(2);
        }
        local humidity = RH_MULT*((reading[0] << 8) + reading[1]) + RH_ADD;
        return humidity;
    }
    
    // read the temperature
    // Input: (none)
    // Return: temperature in celsius (float)
    function readTemp() { 
        i2c.write(addr, READ_TEMP);
        local reading = i2c.read(addr, "", 2);
        while (reading == null) {
            //server.log("reading temp");
            reading = i2c.read(addr, "", 2);
            //imp.sleep(2);
        }
        local temperature = TEMP_MULT*((reading[0] << 8) + reading[1]) + TEMP_ADD;
        return temperature;
    }
    
    // read the temperature from previous rh measurement
    // this method does not have to recalculate temperature so it is faster
    // Input: (none)
    // Return: temperature in celsius (float)
    function readPrevTemp() {
        i2c.write(addr, PREV_TEMP);
        local reading = i2c.read(addr, "", 2);
        local temperature = TEMP_MULT*((reading[0] << 8) + reading[1]) + TEMP_ADD;
        return temperature;
    }
}

class Chirp25 extends Sensor {
    
    static REG_RST      = "\x06"; 
    static REG_MOIST    = "\x00";
    static READ_STEP    = 0.24;
    static READ_OFFSET  = -50.0;
    
    static name         = "chirp";
    
    constructor(_i2c, _addr = 0x20) {
        base.constructor(_i2c, _addr << 1);
        this.reset();
    }
    
    function toadc(reading) {
        return (reading[0] << 8) | reading[1];
    }
    
    function topct(reading) {
        local adc_val = (reading[0] << 8) | reading[1];
        return (READ_STEP*adc_val+READ_OFFSET).tointeger();
    }
    
    function reset() {
        i2c.write(addr, REG_RST);
    }
    
    function read(callback = null) {

        local reading = i2c.read(addr, REG_MOIST, 2);

        while(reading == null || reading[0] == 255 && reading[1] == 255) {
            //server.log("reading chirp");
            reading = i2c.read(addr, REG_MOIST, 2);
            //imp.sleep(2);
        }
        
        callback({ pct = this.topct(reading), adc = this.toadc(reading) });

    }
    
}

class Battery extends Sensor {

    pin = null;
    name = "battery"

    constructor(_pin) {
        base.constructor();
        pin = _pin;
        pin.configure(ANALOG_IN);
    }
    
    function to_pct(reading) {
        return (77.0*reading-146.0).tointeger();
    }

    function read(callback = null) {
        local r = pin.read() / 65535.0;
        local v = hardware.voltage() * r;
        local p = 100.0 * r;
        callback({voltage = v, pct = to_pct(v) });
    }
}

class FeedbackLed {
    
    rpin = null;
    gpin = null;
    
    constructor(_rpin, _gpin) {
        rpin = _rpin;
        gpin = _gpin;
        rpin.configure(DIGITAL_OUT);
        gpin.configure(DIGITAL_OUT);
    }
    
    function success() {
        gpin.write(1);   
    }
    
    function warning() {
        gpin.write(1);
        rpin.write(1);
    }
    
    function danger() {
        rpin.write(1);
    }
    
    function off() {
        rpin.write(0);
        gpin.write(0);
    }
    
}

class PowerGate {
    
    en_l_pin = null;
    drain_pin = null;
    
    constructor(_en_l_pin, _drain_pin) {
        en_l_pin = _en_l_pin;
        drain_pin = _drain_pin;
        en_l_pin.configure(DIGITAL_OUT);
        drain_pin.configure(DIGITAL_OUT);
    }
    
    function open() {
        en_l_pin.write(0);
        drain_pin.write(1); 
    }
    
    function close() {
        en_l_pin.write(1);
        drain_pin.write(0); 
    }
    
}

class Storage {
    
    collect_max = null;
    interval    = null;
    
    constructor(_col_max = 5, _interval = 120) {
        collect_max = _col_max;
        interval    = _interval;
        if (!("nv" in getroottable())) {
            reset_nv();
        }
    }
    
    function set_collect_max(_collect_max) {
        collect_max = _collect_max;
        if (("nv" in getroottable()) && ("max_collect" in ::nv)) {
            ::nv["max_collect"] <- collect_max;
        } else {
            reset_nv(interval, collect_max);
        }
    }
    
    function set_interval_store(_interval) {
        interval = _interval;
        if (("nv" in getroottable()) && ("interval" in ::nv)) {
            ::nv["interval"] <- _interval;
        } else {
            reset_nv(interval, collect_max);
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
    
    function reset_nv(defint = 120, maxcol = 5) {
        ::nv <- { 
            temp = [],
            hum = [],
            lux = [],
            mois = [],
            time = [],
            bat = [],
            cyc = [],
            max_collect = maxcol,
            interval = interval,
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
    
    function configured() {
        return (!("nv" in getroottable()));
    }
    
}

// sensor instantiation and pin config
temphum     <- Si7021(hardware.i2c89);
light       <- Tsl2561(hardware.i2c89);
moisture    <- Chirp25(hardware.i2c89);
battery     <- Battery(hardware.pin2);
feedback    <- FeedbackLed(hardware.pinC, hardware.pinE);
gate        <- PowerGate(hardware.pin6, hardware.pin5);
store       <- Storage();

// value table instatiation
reading     <- {};

// main methods
function connection_handler(reason) {
    
    if(reason == SERVER_CONNECTED) {
        
        // send data to the server
        agent.send("keen", {
            humidity = ::nv["hum"],
            temp = ::nv["temp"],
            lux = ::nv["lux"],
            moisture = ::nv["mois"],
            timestamp = ::nv["time"],
            battery = ::nv["bat"],
            collect_cycle = ::nv["cyc"]
        });
        
        /*
        foreach(v in nv.cyc) {
            server.log(v);
        }
        
        foreach(b in nv.bat) {
            server.log(b);
        }
        
        
        foreach(b in nv.mois) {
            server.log(b);
        }
        
        */
        
        // clear readings nv table
        store.reset_nv();
        
        // check for updates
        agent.send("update", { interval = nv.interval, collect = nv.max_collect }); 
        
    }
    
    // go to sleep when idle
    imp.onidle(sleep);

} 

function update() {
    if (server.isconnected()) {
        connection_handler(SERVER_CONNECTED);
    } else {
        server.connect(connection_handler, 5);
    }
}

function run() {
    
    gate.open();
    feedback.danger();
    
    light.read(function(lux) {
         moisture.read(function(moist) { 
            battery.read(function(bat) {
                
                store.append_nv("temp", format("%0.1f", temphum.readPrevTemp()).tofloat());
                store.append_nv("hum", format("%0.1f", temphum.readRH()).tofloat());
                store.append_nv("lux", lux);
                store.append_nv("mois", moist.pct);
                store.append_nv("time", time());
                store.append_nv("bat", bat.pct);
                
                feedback.success();
                gate.close();
                
                // set stop timestamp for sensor collect mode (10mA)
                collect_stop = hardware.millis();
                
                // log collection time
                store.append_nv("cyc", (collect_stop - duty_start));
                
                /*
                foreach(b in nv.lux) {
                    server.log(b);
                }
                */
                
                // check if exeeding NV table max size
                // if so: connect to wifi, send nv data and update device config if any changes
                
                if(store.full_nv()) {
                    update();
                } else {
                    imp.onidle(sleep);
                }
                
                // debug:
                //agent.send("keen", reading);
                //imp.wakeup(10, run);
                
            });
        });
    });
 
    
}

function sleep() {
    // time feedback for optimization (visualizing how much time in each state)
    
    /*
    local total_duty =  hardware.millis() - duty_start;
    local total_collect = collect_stop - duty_start;
    local total_online =  hardware.millis() - collect_stop;
    
    server.log("duty cycle total: " + total_duty);
    server.log("collected data for: " + total_collect);
    server.log("online for: " + total_online);
    */

    server.sleepfor(120);
    
    //imp.wakeup(5, run);
}

// update handler
agent.on("update", function(config) {
   
   store.set_collect_max(config.collect);
   store.set_interval_store(config.interval);
   
   server.log("Updated!");
    
});

// start the program
run();