import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'

export default function AuthLayout({ children, authentication = true }) {
    const navigate = useNavigate()
    const [loader, setLoader] = useState(true)
    const authStatus = useSelector((state) => state.auth.status)

    useEffect(() => {
        // Logic:
        // If page requires Auth AND user is NOT logged in -> Go to Login
        // If page is Guest Only AND user IS logged in -> Go to Dashboard

        if (authentication && authStatus !== authentication) {
            navigate("/login")
        } else if (!authentication && authStatus !== authentication) {
            navigate("/home")
        }

        setLoader(false)
    }, [authStatus, navigate, authentication])

    return loader ? (
        <div className="w-full h-[50vh] flex justify-center items-center">
            <Loader2 className="animate-spin text-indigo-600 h-10 w-10" />
        </div>
    ) : <>{children}</>
}