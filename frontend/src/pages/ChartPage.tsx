import {useEffect, useMemo, useState} from 'react'
import {Bar} from 'react-chartjs-2'
import {BarElement, CategoryScale, Chart, Legend, LinearScale, Tooltip} from 'chart.js'
import {groupByHours, groupByMinutes} from '../lib/api'

Chart.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend)

function formatDay(d: Date) {
    return d.toISOString().slice(0, 10)
}

function minutesOfHour(): string[] {
    const res: string[] = []
    for (let m = 0; m < 60; m++) {
        res.push(String(m).padStart(2, '0'))
    }
    return res
}

function hoursOfDay(): string[] {
    const res: string[] = []
    for (let h = 0; h < 24; h++) {
        res.push(String(h).padStart(2, '0'))
    }
    return res
}

type ChartType = 'minutes' | 'hours'

export default function ChartPage() {
    const [day, setDay] = useState<string>(formatDay(new Date()))
    const [hour, setHour] = useState<number>(0)
    const [chartType, setChartType] = useState<ChartType>('hours')
    const [minutesData, setMinutesData] = useState<Record<string, number>>({})
    const [hoursData, setHoursData] = useState<Record<string, number>>({})
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    async function loadMinutesData() {
        setLoading(true)
        setError('')
        try {
            const data = await groupByMinutes(day, hour)
            console.log('Minutes data:', data)
            setMinutesData(data)
        } catch (e) {
            setError('Не удалось загрузить данные по минутам')
        } finally {
            setLoading(false)
        }
    }

    async function loadHoursData() {
        setLoading(true)
        setError('')
        try {
            const data = await groupByHours(day)
            console.log('Hours data:', data)
            setHoursData(data)
        } catch (e) {
            setError('Не удалось загрузить данные по часам')
        } finally {
            setLoading(false)
        }
    }

    async function load() {
        if (chartType === 'minutes') {
            await loadMinutesData()
        } else {
            await loadHoursData()
        }
    }

    useEffect(() => {
        load()
    }, [day, hour, chartType])

    const minutesLabels = useMemo(() => minutesOfHour(), [])
    const hoursLabels = useMemo(() => hoursOfDay(), [])

    const minutesChartData = useMemo(() => ({
        labels: minutesLabels,
        datasets: [{
            label: `Регистрации в минуту (${String(hour).padStart(2, '0')}:00-${String(hour).padStart(2, '0')}:59)`,
            data: minutesLabels.map(m => {
                const timeKey = `${String(hour).padStart(2, '0')}:${m}`
                return minutesData[timeKey] || 0
            }),
            backgroundColor: 'rgba(54, 162, 235, 0.6)'
        }]
    }), [minutesLabels, minutesData, hour])

    const hoursChartData = useMemo(() => ({
        labels: hoursLabels,
        datasets: [{
            label: 'Регистрации в час',
            data: hoursLabels.map(h => hoursData[h] || 0),
            backgroundColor: 'rgba(75, 192, 192, 0.6)'
        }]
    }), [hoursLabels, hoursData])

    const currentChartData = chartType === 'minutes' ? minutesChartData : hoursChartData

    return (
        <div className="py-2">
            <div className="d-flex align-items-end gap-3 mb-3 flex-wrap">
                <div>
                    <label className="form-label">День</label>
                    <input
                        type="date"
                        className="form-control"
                        value={day}
                        onChange={e => setDay(e.target.value)}
                    />
                </div>

                <div>
                    <label className="form-label">Тип графика</label>
                    <select
                        className="form-select"
                        value={chartType}
                        onChange={e => setChartType(e.target.value as ChartType)}
                    >
                        <option value="hours">По часам</option>
                        <option value="minutes">По минутам</option>
                    </select>
                </div>

                {chartType === 'minutes' && (
                    <div>
                        <label className="form-label">Час</label>
                        <select
                            className="form-select"
                            value={hour}
                            onChange={e => setHour(Number(e.target.value))}
                        >
                            {Array.from({length: 24}, (_, i) => (
                                <option key={i} value={i}>
                                    {String(i).padStart(2, '0')}:00
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                <button
                    className="btn btn-outline-secondary"
                    onClick={load}
                    disabled={loading}
                >
                    Обновить
                </button>
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            <div className="card">
                <div className="card-body">
                    {loading ? (
                        'Загрузка...'
                    ) : (
                        <Bar
                            data={currentChartData}
                            options={{
                                responsive: true,
                                scales: {
                                    y: {
                                        beginAtZero: true,
                                        ticks: {
                                            stepSize: 1
                                        },
                                        max: Math.max(...Object.values(currentChartData.datasets[0]?.data || [0])) * 1.25
                                    }
                                }
                            }}
                        />
                    )}
                </div>
            </div>
        </div>
    )
} 