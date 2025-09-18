module.exports = {
	config: {
		name: "nude",
		aliases: ["nangai"],
		version: "1.0",
		author: "OtinXSandip",
		countDown: 5,
		role: 2,
		shortDescription: "send you pic of nude",
		longDescription: "sends u pic of girls nude",
		category: "18+",
		guide: "{pn}"
	},

	onStart: async function ({ message }) {
	 var link = [ 
"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRJZ63h7B1RE9d0B3cxBIzxMSl84pkhG3HyUFZmzLrJpxx5aQOG8TlkbLI&s=10","https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSIDrwe_zAFeUNywPAoLiy3yWr3KXaxmg8TxP0lo-mBMCHGkKd3RybgASjs&s=10","https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQKykwogHp4xd_sP7jgLcGObEzV4euDtRuEtsC3POoamPcZ-gScE4tdWFNu&s=10","https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSMbN8zRSI33tfSvvo3AmDDK-A_kZ5EAgwShr9x3V5xS1TFdfCMM2m90B8&s=10","https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSuJQKnCWVHu8HWUFo-kaxkxUC-T00YZZic1oylUGmhOmIHBhvo_cLCIOQ&s=10","https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR_jeA00I2OICExtYX6pkMjdjE5K0NDiG-iCtjiK63U2flYjWo4oU8qKHI&s=10","https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRkLjcGskr2qZKhJbMtezQOQQPNGugXxB9DZbfJUgVnhYiZiCRMSACf0sw&s=10","https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS1woeTyxgqpUhYkAZyRDo-53fRISQBZKNm5spaWWJv9oagy9EruGH65Oq3&s=10","https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRJZ63h7B1RE9d0B3cxBIzxMSl84pkhG3HyUFZmzLrJpxx5aQOG8TlkbLI&s=10","https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQGvg80XaTN8ViRzABXPisQrkuwX9cIyYijGfHUOxtYA7jJdJZ5ha3BgbU&s=10",
	]
let img = link[Math.floor(Math.random()*link.length)]
message.send({
	body: '「 Sugar Mumma Ahh💦🥵 」',attachment: await global.utils.getStreamFromURL(img)
})
}
}
