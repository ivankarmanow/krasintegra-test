import axios from 'axios'

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const tokenStorage = {
    get: () => localStorage.getItem('token') || '',
    set: (t: string) => localStorage.setItem('token', t),
    clear: () => localStorage.removeItem('token'),
}

export const api = axios.create({baseURL: API_BASE_URL})

api.interceptors.request.use((config) => {
    const token = tokenStorage.get()
    if (token) {
        config.headers = config.headers || {}
        ;(config.headers as any)['X-Token'] = token
    }
    return config
})

export type GenderEnum = 'male' | 'female'

export interface User {
    name: string
    birth_year: number
    gender: GenderEnum
    is_admin?: boolean
    id: number
    created_at: string
    created_by: string | null
    avatar_path: string | null
}

export interface UserIn {
    name: string
    birth_year: number
    gender: GenderEnum
    is_admin?: boolean
    avatar_base64: string | null
    password: string
}

export async function login(username: string, password: string) {
    const {data} = await api.post<{ token: string }>(`/auth/login`, {username, password})
    tokenStorage.set(data.token)
    return data
}

export async function logout() {
    try {
        await api.post(`/auth/logout`)
    } catch {
    }
    tokenStorage.clear()
}

export async function getMe() {
    const {data} = await api.get<User>(`/auth/me`)
    return data
}

export async function listUsers() {
    const {data} = await api.get<User[]>(`/user/`)
    return data
}

export async function createUser(payload: UserIn) {
    const {data} = await api.post<{ status: boolean }>(`/user/create`, payload)
    return data
}

export async function updateUser(user_id: number, payload: UserIn) {
    const {data} = await api.patch<{ status: boolean }>(`/user/update`, payload, {params: {user_id}})
    return data
}

export async function deleteUser(user_id: number) {
    const {data} = await api.delete<{ status: boolean }>(`/user/delete`, {params: {user_id}})
    return data
}

export async function groupByMinutes(day: string, hour?: number) {
    const params: any = {day}
    if (hour !== undefined) params.hour = hour
    const {data} = await api.get<Record<string, number>>(`/user/group_by_minutes`, {params})
    return data
}

export async function groupByHours(day: string) {
    const {data} = await api.get<Record<string, number>>(`/user/group_by_hours`, {params: {day}})
    return data
}