import React, {useState} from 'react'
import {useNavigate} from 'react-router-dom'
import {getMe, login} from '../lib/api'

export default function LoginPage() {
    const navigate = useNavigate()
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault()
        setError('')
        setLoading(true)
        try {
            await login(username, password)
            await getMe()
            navigate('/users', {replace: true})
        } catch (e: any) {
            setError(e.response?.data?.error || 'Ошибка входа')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="row justify-content-center">
            <div className="col-12 col-md-6 col-lg-4">
                <div className="card">
                    <div className="card-body">
                        <h5 className="card-title mb-3">Вход</h5>
                        <form onSubmit={onSubmit}>
                            <div className="mb-3">
                                <label className="form-label">ФИО</label>
                                <input className="form-control" value={username}
                                       onChange={e => setUsername(e.target.value)} required/>
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Пароль</label>
                                <input type="password" className="form-control" value={password}
                                       onChange={e => setPassword(e.target.value)} required/>
                            </div>
                            {error && <div className="alert alert-danger py-2">{error}</div>}
                            <button className="btn btn-primary w-100" disabled={loading}>
                                {loading ? 'Входим...' : 'Войти'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
} 