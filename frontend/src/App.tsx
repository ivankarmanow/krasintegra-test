import {Link, Navigate, Route, Routes, useLocation} from 'react-router-dom'
import React, {useEffect, useState} from 'react'
import LoginPage from './pages/LoginPage'
import UsersPage from './pages/UsersPage'
import ChartPage from './pages/ChartPage'
import {getMe, logout} from './lib/api'
import reactLogo from "./assets/react.svg"

function Navbar() {
    const [me, setMe] = useState<Awaited<ReturnType<typeof getMe>> | null>(null)
    const location = useLocation()

    useEffect(() => {
        getMe().then(setMe).catch(() => setMe(null))
    }, [location.pathname])

    return (
        <nav className="navbar navbar-expand-lg bg-body-tertiary mb-4">
            <div className="container">
                <Link className="navbar-brand" to="/">
                    <img src={reactLogo} alt="Главная" className="logo"/>
                </Link>
                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav"
                        aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav me-auto">
                        <li className="nav-item"><Link className="nav-link" to="/users">Пользователи</Link></li>
                        <li className="nav-item"><Link className="nav-link" to="/chart">График</Link></li>
                    </ul>
                    <div className="d-flex align-items-center gap-2">
                        {me ? (
                            <>
                                <span className="text-nowrap">{me.name}{me.is_admin ? ' (admin)' : ''}</span>
                                <button className="btn btn-outline-secondary btn-sm"
                                        onClick={() => logout().finally(() => window.location.href = '/login')}>Выход
                                </button>
                            </>
                        ) : (
                            <Link to="/login" className="btn btn-primary btn-sm">Войти</Link>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    )
}

function RequireAuth({children}: { children: React.ReactElement }) {
    const [authorized, setAuthorized] = useState<boolean | null>(null)
    useEffect(() => {
        getMe().then(() => setAuthorized(true)).catch(() => setAuthorized(false))
    }, [])
    if (authorized === null) return <div className="container py-5">Загрузка...</div>
    if (!authorized) return <Navigate to="/login" replace/>
    return children
}

export default function App() {
    return (
        <>
            <Navbar/>
            <div className="container">
                <Routes>
                    <Route path="/" element={<Navigate to="/users" replace/>}/>
                    <Route path="/login" element={<LoginPage/>}/>
                    <Route path="/users" element={<RequireAuth><UsersPage/></RequireAuth>}/>
                    <Route path="/chart" element={<RequireAuth><ChartPage/></RequireAuth>}/>
                    <Route path="*" element={<Navigate to="/" replace/>}/>
                </Routes>
            </div>
        </>
    )
}
