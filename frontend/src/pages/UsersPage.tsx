import React, {useEffect, useMemo, useState} from 'react'
import {API_BASE_URL, createUser, deleteUser, getMe, listUsers, updateUser, type User, type UserIn} from '../lib/api'

function UserForm({initial, onSubmit, onCancel, isEdit = false}: {
    initial?: Partial<UserIn>,
    onSubmit: (v: UserIn) => void,
    onCancel: () => void,
    isEdit?: boolean
}) {
    const [form, setForm] = useState<UserIn>({
        name: initial?.name || '',
        birth_year: initial?.birth_year || new Date().getFullYear(),
        gender: (initial?.gender as any) || 'male',
        is_admin: Boolean(initial?.is_admin) || false,
        avatar_base64: initial?.avatar_base64 ?? null,
        password: initial?.password || '',
    })

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onload = (event) => {
                const result = event.target?.result as string
                const base64Data = result.split(',')[1]
                setForm({...form, avatar_base64: base64Data})
            }
            reader.readAsDataURL(file)
        }
    }

    const getAvatarUrl = () => {
        if (form.avatar_base64) {
            return `data:image/jpeg;base64,${form.avatar_base64}`
        }
        if (isEdit && (initial as any)?.avatar_path) {
            return `${API_BASE_URL}/${(initial as any).avatar_path}`
        }
        return null
    }

    const avatarUrl = getAvatarUrl()

    return (
        <form onSubmit={e => {
            e.preventDefault();
            onSubmit(form)
        }}>
            <div className="d-flex flex-column gap-3">
                <div>
                    <label className="form-label">Имя</label>
                    <input className="form-control" value={form.name}
                           onChange={e => setForm({...form, name: e.target.value})} required/>
                </div>
                <div>
                    <label className="form-label">Год рождения</label>
                    <input type="number" className="form-control" value={form.birth_year}
                           onChange={e => setForm({...form, birth_year: Number(e.target.value)})} required/>
                </div>
                <div>
                    <label className="form-label">Пол</label>
                    <select className="form-select" value={form.gender}
                            onChange={e => setForm({...form, gender: e.target.value as any})}>
                        <option value="male">Мужской</option>
                        <option value="female">Женский</option>
                    </select>
                </div>
                <div>
                    <div className="form-check">
                        <input id="is_admin" className="form-check-input" type="checkbox" checked={!!form.is_admin}
                               onChange={e => setForm({...form, is_admin: e.target.checked})}/>
                        <label htmlFor="is_admin" className="form-check-label">Админ</label>
                    </div>
                </div>
                <div>
                    <label className="form-label">Пароль{isEdit && ' (оставьте пустым, чтобы не изменять)'}</label>
                    <input type="password" className="form-control" value={form.password}
                           onChange={e => setForm({...form, password: e.target.value})} required={!isEdit}/>
                </div>
                <div>
                    <label className="form-label">Аватар</label>
                    {avatarUrl && (
                        <div className="mb-2">
                            <img
                                src={avatarUrl}
                                alt="Текущий аватар"
                                style={{width: '100px', height: '100px', objectFit: 'cover', borderRadius: '8px'}}
                            />
                        </div>
                    )}
                    <input type="file" className="form-control" accept="image/*" onChange={handleFileChange}/>
                </div>
            </div>
            <div className="mt-3 d-flex gap-2">
                <button className="btn btn-primary" type="submit">Сохранить</button>
                <button className="btn btn-outline-secondary" type="button" onClick={onCancel}>Отмена</button>
            </div>
        </form>
    )
}

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [me, setMe] = useState<User | null>(null)

    const [mode, setMode] = useState<'list' | 'create' | 'edit'>('list')
    const [editing, setEditing] = useState<User | null>(null)
    const [showAvatarModal, setShowAvatarModal] = useState(false)
    const [selectedAvatar, setSelectedAvatar] = useState<{ src: string, name: string } | null>(null)

    const [sortField, setSortField] = useState<keyof User>('created_at')
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')

    const isAdmin = useMemo(() => !!me?.is_admin, [me])

    const handleSort = (field: keyof User) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
        } else {
            setSortField(field)
            setSortDirection('asc')
        }
    }

    const parseDate = (str) => {
        const [datePart, timePart] = str.split(' ');
        const [day, month, year] = datePart.split('-').map(Number);
        const [hours, minutes] = timePart.split(':').map(Number);

        return new Date(year, month - 1, day, hours, minutes);
    }

    const sortedUsers = useMemo(() => {
        return [...users].sort((a, b) => {
            let aVal = a[sortField]
            let bVal = b[sortField]

            if (sortField === 'created_at') {
                aVal = parseDate(aVal as string).getTime()
                bVal = parseDate(bVal as string).getTime()
            }

            if (typeof aVal === 'boolean') {
                aVal = aVal ? 1 : 0
                bVal = bVal ? 1 : 0
            }

            if (typeof aVal === 'string' && typeof bVal === 'string') {
                aVal = aVal.toLowerCase()
                bVal = bVal.toLowerCase()
            }

            if (aVal == null && bVal == null) return 0

            if (aVal == null) return sortDirection === 'asc' ? -1 : 1
            if (bVal == null) return sortDirection === 'asc' ? 1 : -1

            if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1
            if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1
            return 0
        })
    }, [users, sortField, sortDirection])

    const getSortIcon = (field: keyof User) => {
        if (sortField !== field) return ' ↕'
        return sortDirection === 'asc' ? ' ↑' : ' ↓'
    }

    const handleAvatarClick = (user: User) => {
        if (user.avatar_path) {
            setSelectedAvatar({
                src: `${API_BASE_URL}/${user.avatar_path}`,
                name: user.name
            })
            setShowAvatarModal(true)
        }
    }

    async function refetch() {
        setLoading(true)
        try {
            const [meData, usersData] = await Promise.all([getMe().catch(() => null as any), listUsers()])
            if (meData) setMe(meData)
            const safeUsers = Array.isArray(usersData) ? usersData : []
            setUsers(safeUsers)
            if (!Array.isArray(usersData)) {
                setError('Ошибка формата ответа API')
            } else {
                setError('')
            }
        } catch (e) {
            setError('Не удалось загрузить пользователей')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        refetch()
    }, [])

    return (
        <div className="py-2">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h3 className="m-0">Пользователи</h3>
                {isAdmin && mode === 'list' && (
                    <button className="btn btn-primary" onClick={() => setMode('create')}>Добавить</button>
                )}
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            {mode === 'list' && (
                <div className="table-responsive">
                    <table className="table align-middle">
                        <thead>
                        <tr>
                            <th>Аватар</th>
                            <th
                                style={{cursor: 'pointer'}}
                                onClick={() => handleSort('id')}
                            >
                                ID{getSortIcon('id')}
                            </th>
                            <th
                                style={{cursor: 'pointer'}}
                                onClick={() => handleSort('name')}
                            >
                                Имя{getSortIcon('name')}
                            </th>
                            <th
                                style={{cursor: 'pointer'}}
                                onClick={() => handleSort('birth_year')}
                            >
                                Год рож.{getSortIcon('birth_year')}
                            </th>
                            <th
                                style={{cursor: 'pointer'}}
                                onClick={() => handleSort('gender')}
                            >
                                Пол{getSortIcon('gender')}
                            </th>
                            <th
                                style={{cursor: 'pointer'}}
                                onClick={() => handleSort('is_admin')}
                            >
                                Админ{getSortIcon('is_admin')}
                            </th>
                            <th
                                style={{cursor: 'pointer'}}
                                onClick={() => handleSort('created_at')}
                            >
                                Создан{getSortIcon('created_at')}
                            </th>
                            <th
                                style={{cursor: 'pointer'}}
                                onClick={() => handleSort('created_by' as keyof User)}
                            >
                                Кем создан{getSortIcon('created_by' as keyof User)}
                            </th>
                            <th></th>
                        </tr>
                        </thead>
                        <tbody>
                        {!loading && sortedUsers.length > 0 && sortedUsers.map(u => (
                            <tr key={u.id}>
                                <td>
                                    {u.avatar_path ? (
                                        <img
                                            src={`${API_BASE_URL}/${u.avatar_path}`}
                                            alt={`Аватар ${u.name}`}
                                            className="rounded-circle"
                                            style={{
                                                width: '40px',
                                                height: '40px',
                                                objectFit: 'cover',
                                                cursor: 'pointer'
                                            }}
                                            onClick={() => handleAvatarClick(u)}
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).style.display = 'none'
                                            }}
                                        />
                                    ) : (
                                        <div
                                            className="rounded-circle bg-secondary d-flex align-items-center justify-content-center text-white"
                                            style={{width: '40px', height: '40px', fontSize: '14px'}}
                                        >
                                            {u.name.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                </td>
                                <td>{u.id}</td>
                                <td>{u.name}</td>
                                <td>{u.birth_year}</td>
                                <td>{u.gender === 'male' ? 'М' : 'Ж'}</td>
                                <td>{u.is_admin ? 'Да' : 'Нет'}</td>
                                <td>{u.created_at}</td>
                                <td>{(u as any).created_by || '-'}</td>
                                <td className="text-end">
                                    {isAdmin && (
                                        <div className="btn-group btn-group-sm">
                                            <button className="btn btn-outline-secondary" onClick={() => {
                                                setEditing(u);
                                                setMode('edit')
                                            }}>Изм.
                                            </button>
                                            <button className="btn btn-outline-danger" onClick={async () => {
                                                if (confirm('Удалить пользователя?')) {
                                                    await deleteUser(u.id);
                                                    refetch()
                                                }
                                            }}>Удал.
                                            </button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {!loading && sortedUsers.length === 0 && (
                            <tr>
                                <td colSpan={9}>Нет данных</td>
                            </tr>
                        )}
                        {loading && (
                            <tr>
                                <td colSpan={9}>Загрузка...</td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>
            )}

            {mode === 'create' && (
                <UserForm
                    onSubmit={async (v) => {
                        await createUser(v);
                        setMode('list');
                        refetch()
                    }}
                    onCancel={() => setMode('list')}
                />
            )}

            {mode === 'edit' && editing && (
                <UserForm
                    initial={{...editing, password: ''} as any}
                    onSubmit={async (v) => {
                        await updateUser(editing.id, v);
                        setMode('list');
                        setEditing(null);
                        refetch()
                    }}
                    onCancel={() => {
                        setMode('list');
                        setEditing(null)
                    }}
                    isEdit={true}
                />
            )}

            {showAvatarModal && selectedAvatar && (
                <div className="modal d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Аватар {selectedAvatar.name}</h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setShowAvatarModal(false)}
                                ></button>
                            </div>
                            <div className="modal-body text-center">
                                <img
                                    src={selectedAvatar.src}
                                    alt={`Аватар ${selectedAvatar.name}`}
                                    className="img-fluid rounded"
                                    style={{maxHeight: '400px'}}
                                />
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setShowAvatarModal(false)}
                                >
                                    Закрыть
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
} 