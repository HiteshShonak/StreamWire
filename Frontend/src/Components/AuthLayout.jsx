import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { LoadingPulse } from './Common/LoadingIndicator'

export default function AuthLayout({ children, authentication = true }) {
    const navigate = useNavigate()
    const [loader, setLoader] = useState(true)
    const authStatus = useSelector((state) => state.auth.status)

    useEffect(() => {
        // if another page (e.g. Register) is handling its own redirect, don't interfere
        const pendingRedirect = sessionStorage.getItem('pendingRedirect')
        if (pendingRedirect) {
            sessionStorage.removeItem('pendingRedirect')
            setLoader(false)
            return
        }

        // if page needs auth and user isn't logged in -> login
        if (authentication && authStatus !== authentication) {
            navigate("/login")
        } else if (!authentication && authStatus !== authentication) {
            // guest-only page but user is logged in -> send to home
            navigate("/home")
        }

        setLoader(false)
    }, [authStatus, navigate, authentication])

    return loader ? (
        <div className="w-full h-[50vh] flex justify-center items-center">
            <LoadingPulse size="md" />
        </div>
    ) : <>{children}</>
}