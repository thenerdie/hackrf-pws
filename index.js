const axios = require("axios")

const {stdin} = process;

const getStdinBuffer = async () => {
	if (stdin.isTTY) {
		return Buffer.alloc(0);
	}

	const result = [];
	let length = 0;

	for await (const chunk of stdin) {
		result.push(chunk);
		length += chunk.length;
	}

	return Buffer.concat(result, length);
};

async function getStdin() {
	const buffer = await getStdinBuffer();
	return buffer.toString();
}

function cToF(c) {
    return c * 9 / 5 + 32
}

async function main() {
    const stdin = JSON.parse(await getStdin())

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
}

main()