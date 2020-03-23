# node-Kettler

a node-js wrapper to cumuncate with your Kettler Ergometer...
i only own a PX1 so its only tested with that...

### install

`npm i -S node-kettler`

### example

```
const Kettler = require("./kettler.js")
const k = new Kettler()
k.on("data",console.log)
await k.start()
```

### options

```
const k = new Kettler({path: "/dev/ttyUSB0", interval: 100})
```
##### interval

the interval in milliseconds at which the state will be requested from the device (default 100ms)

##### path

the path to your serialport. (default "/dev/ttyUSB0")

### methods

##### start

calls reset and starts a poling timer that polls every "interval" ms.

##### stop

stops the polling timer

##### setPower

sets the power

#### reset

resets all valus to zero

#### poll

request current state of the device

### events

##### data

`k.on("data", callback)`

will be fired whenever a change to the state of the device is detected

##### single valued events

each field will cemit it's own event whenever it changes...

* pulse
* rpm
* speed
* distance
* power
* energy
* duration
* avg-power

`k.on("avg-power", callback)`
