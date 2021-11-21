function cToF(c) {
    return c * 9 / 5 + 32
}

const stdin = JSON.parse(process.stdin)

axios.get("https://pwsupdate.pwsweather.com/api/v1/submitwx", {
    params: {
        "PASSWORD": process.argv[3],
        "ID": process.argv[2],
        "dateutc": "now",
        "tempf": cToF(stdin.temperature_C),
        "humidity": stdin.humidity
    }
}).then(({ data }) => {
    console.log(data)
})