const SerialPort = require('serialport')
const EventEmitter = require('events');
const ReadLine = require('@serialport/parser-readline')
const { tee } = require('t-readable');

let last = [0,0,0,0,0,0,0,0]
const func = [
  pulse=>parseInt(pulse),
  rpm=>parseInt(rpm),
  speed=>parseInt(speed)/10,
  distance=>parseInt(distance)/10,
  power=>parseInt(power),
  energy=>parseInt(energy),
  time=>{
    const tt=time.split(":")
    return parseInt(tt[0])*60+parseInt(tt[1])
  },
  avgPower => parseInt(avgPower)
]
const name = ["pulse","rpm", "speed", "distance", "power", "energy", "duration", "avg-power"]

class Kettler extends EventEmitter{
  constructor(opt){
    super()
    const options = {...{path:"/dev/ttyUSB0", interval: 100},...opt}
    this.interval = options.interval
    this.intervalID
    this.port = new SerialPort(options.path,{baudRate: 9600})
    this.parser = this.port.pipe(new ReadLine())
    this.parser.on("data",this.portListener.bind(this))
  }
  async start(){
    await this.reset()
    this.intervalID = setInterval(function(){
      this.port.write("ST\n")
    }.bind(this),this.interval)
  }
  stop(){
    clearInterval(this.intervalID)
  }
  async reset(){
    await send("RS",this.port)
        last = [0,0,0,0,0,0,0,0]
  }
  poll(){
    this.port.write("ST\n")
  }
  async setPower(x){
    await send("CM",this.port)
    await send(`PW ${x}`,this.port)
  }
  portListener(data){
    var dat=data.split("\t")
    if(dat.length<8) return
    let cd = 0
    for(var i = 0; i<8;i++){
      if(last[i]!==dat[i]){
        this.emit(name[i],func[i](dat[i]))
        last[i]=dat[i]
        cd = 1
      }
    }
    if(cd===1){
      this.emit("data",this.dataToJson(dat))
    }
  }
  dataToJson(dat){
    let res ={}
    for(var i = 0; i<8;i++){
      res[name[i]] = func[i](dat[i])
    }
    return res
  }
}

function send(command, port){
  return new Promise((resolve,reject)=>{
    const copy = tee(port)[0]
    const parser = copy.pipe(new ReadLine())
    const handler = (x)=>{
        copy.unpipe(parser)
        parser.removeAllListeners()
        delete parser
        delete copy
        resolve(x)
      }
    parser.once("data",handler)
    port.write(command+"\n")
    //copy.unpipe(parser)
  })
}

module.exports = Kettler
