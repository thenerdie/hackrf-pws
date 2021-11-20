const fs = require("fs")
const os = require("os")

const axios = require("axios")
const { format, getTime } = require("date-fns")
const { getTimezoneOffset } = require("date-fns-tz")

const path = process.argv[2] || `/home/${os.userInfo().username}/weather.json`

function cToF(c) {
    return c * 9 / 5 + 32
}

var openWeatherMapCache = null
var lastGot = 0

fs.watch(path, async eventType => {
    if (eventType != "change")
        return
    
    const data = fs.readFileSync(path).toString()
    const arrayLines = data.split("\n")
    const parsed = JSON.parse(arrayLines[arrayLines.length - 2])

    console.log(parsed)

    const now = Date.now()

    if ((now.valueOf() - lastGot) / 1E3 >= 300 && process.env.owmlat && process.env.owmlon) {
        try {
            const { data } = await axios.get("https://api.openweathermap.org/data/2.5/weather", {
                params: {
                    appid: process.env.owmappid,
                    lat: Number.parseFloat(process.env.owmlat),
                    lon: Number.parseFloat(process.env.owmlon),
                    units: "imperial"
                }
            })

            openWeatherMapCache = data

            lastGot = now.valueOf()
        }
        finally { }
    }

    axios.get("https://pwsupdate.pwsweather.com/api/v1/submitwx", {
        params: {
            "PASSWORD": process.env.pwspassword,
            "ID": "pwsov",
            "dateutc": format(new Date(Date.now().valueOf() - getTimezoneOffset("America/New_York") ), "Y-M-d H:m:ss"),
            "tempf": cToF(parsed.temperature_C),
            "humidity": parsed.humidity,
            "winddir": openWeatherMapCache?.wind.deg,
            "windspeedmph": openWeatherMapCache?.wind.speed,
            "windgustmph": openWeatherMapCache?.wind.gust,
            "baromin": openWeatherMapCache?.main.pressure / 33.864
        }
    }).then(({ data }) => {
        console.log(data)
    })
})