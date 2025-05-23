const lcjs = require('@lightningchart/lcjs')
const { lightningChart, Themes, ImageFill, AxisTickStrategies, emptyLine, emptyTick, emptyFill } = lcjs

const lc = lightningChart({
            resourcesBaseUrl: new URL(document.head.baseURI).origin + new URL(document.head.baseURI).pathname + 'resources/',
        })
const chart = lc
    .ChartXY({
        theme: Themes[new URLSearchParams(window.location.search).get('theme') || 'darkGold'] || undefined,
    })
    .setTitle('Visitor reviews by date and time of day')
    .setPadding({ left: 80 })
    .setCursorMode('show-nearest')
    .setCursor((cursor) => cursor.setTickMarkerXVisible(false))

const reviewTypes = [
    {
        name: 'Unhappy',
        src: document.head.baseURI + 'examples/assets/0056/review-bad.png',
    },
    {
        name: 'Neutral',
        src: document.head.baseURI + 'examples/assets/0056/review-neutral.png',
    },
    {
        name: 'Happy',
        src: document.head.baseURI + 'examples/assets/0056/review-happy.png',
    },
].map((item) => {
    const image = new Image()
    image.crossOrigin = ''
    image.src = item.src
    const imageFill = new ImageFill({ source: image })
    const icon = chart.engine.addCustomIcon(image, { height: 32 })
    const series = chart
        .addPointLineAreaSeries({ dataPattern: null })
        .setAreaFillStyle(emptyFill)
        .setStrokeStyle(emptyLine)
        .setPointFillStyle(imageFill)
        .setPointSize(0.1)
        .setName(item.name)
        .setIcon(icon)
    series.addEventListener('highlightchange', (event) => {
        series.setPointSize(Number(event.highlight) > 0 ? 0.15 : 0.1)
    })
    return { ...item, series }
})

chart
    .getDefaultAxisX()
    .setTitle('Time of day')
    .setInterval({ start: 5.5, end: 22.5 })
    .setTickStrategy(AxisTickStrategies.Numeric, (ticks) =>
        ticks.setMinorTickStyle(emptyTick).setFormattingFunction((hour) => hour.toFixed(0)),
    )
chart.getDefaultAxisY().setTitle('Date').setTickStrategy(AxisTickStrategies.DateTime)

const legend = chart
    .addLegendBox()
    .add(chart)
    .setEntries((entry, component) => {
        entry.setButtonSize(20).setPadding(5)
    })

// Generate random data set for example purposes
let time = Date.UTC(2021, 4, 4, 12)
let count = 0
do {
    time += 10 * 60 * 1000 + Math.random() * 240 * 60 * 1000
    const date = new Date(time)
    const hour = date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600
    const chanceNeutral = 0.05
    const chanceHappy = hour > 20 ? 1.0 : 0.05
    const chanceUnhappy = hour < 8 ? 1.0 : 0.05
    const chanceTotal = chanceNeutral + chanceHappy + chanceUnhappy
    const rand = Math.random() * chanceTotal
    const reviewType = rand <= chanceNeutral ? reviewTypes[1] : rand <= chanceNeutral + chanceHappy ? reviewTypes[2] : reviewTypes[0]
    reviewType.series.appendSample({ y: time, x: hour })
    count += 1
} while (time < Date.UTC(2021, 5, 4, 12))
