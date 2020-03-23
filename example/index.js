const Kettler = require("../kettler.js")
const k = new Kettler()
async function init(){
  await k.start()
  await k.setPower(75)
  k.on("data",console.log)
}
init()
