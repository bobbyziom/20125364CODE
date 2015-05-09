
# Firmware section

This section is divided into production firmware (which is versioned) and test firmware, which is used for testing purposes only and not maintained.

### v1

Version 1 of the firmware is built on a test environment on a breadboard and a imp001 SD formfaktor module. There is no documentation of the breakout. Therefore this code is no longer maintained, but kept here as a history of progress.

### v2

Version 2 is the current built and is maintained until the next hardware iteration of the project. 

### Device API

URL
https://agent.electricimp.com/<agent-id>

#### Get latest reading

```
endpoint path: /read
method: GET
```

return example:

```json
{
	"time": 1431174000,
	"data": {
		"humidity": 38.7,
		"temp": 27,
		"moisture": 136,
		"collect_cycle": 622,
		"lux": 159.17,
		"battery": 96
	}
}
```

#### Setup keen collection

```
endpoint path: /setup/collection/<collection-name>
method: POST
```

#### Set device name

```
endpoint path: /setup/collection/<device-name>
method: POST
```

#### Append email to notification subscriptions

```
endpoint path: /setup/notification/email/<email>
method: POST
```

#### Set battery notification trigger value

```
endpoint path: /setup/notification/battery/<value>
method: POST
```

#### Set moisture notifcation trigger value

```
endpoint path: /setup/notification/moisture/<value>
method: POST
```

#### Set waking interval

```
endpoint path: /setup/config/interval/<value>
method: POST
```

#### Set number of data collected before sending

```
endpoint path: /setup/config/collect/<value>
method: POST
```
