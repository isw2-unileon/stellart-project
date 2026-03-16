import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { getLoggedUser, logoutUser } from "@/service/apiService"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function AvatarDropdown() {
    const [user, setUser] = useState(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        async function checkUser() {
            const loggedUser = await getLoggedUser();
            setUser(loggedUser);
            setIsLoading(false);
        }
        checkUser();
    }, []);

    const handleLogout = async () => {
        try {
            await logoutUser();
            window.location.reload(); 
        } catch (error) {
            console.error("Error al cerrar sesión:", error);
        }
    };

    if (isLoading) {
        return <div className="w-10 h-10 rounded-full bg-slate-200 animate-pulse"></div>;
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                    <Avatar className="cursor-pointer hover:brightness-80 transition border border-slate-200">
                        {user ? (
                            <>
                                {user.user_metadata?.avatar_url && (
                                    <AvatarImage src={user.user_metadata.avatar_url} alt="Avatar" />
                                )}
                                <AvatarFallback className="bg-yellow-500 text-black font-black uppercase">
                                    {user.user_metadata?.full_name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
                                </AvatarFallback>
                            </>
                        ) : (
                            <>
                                <AvatarFallback className="bg-slate-100 text-slate-500">👤</AvatarFallback>
                            </>
                        )}
                    </Avatar>
                </Button>
            </DropdownMenuTrigger>
            
            <DropdownMenuContent className="w-40" align="end">
                {user ? (
                    <>
                        <DropdownMenuGroup>
                            <DropdownMenuItem asChild className="cursor-pointer">
                                <Link to="/profile">Profile</Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer">Billing</DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer">Settings</DropdownMenuItem>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                            <DropdownMenuItem 
                                className="text-red-600 font-medium cursor-pointer"
                                onClick={handleLogout}
                            >
                                Log out
                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                    </>
                ) : (
                    <DropdownMenuGroup>
                        <DropdownMenuItem asChild>
                            <a href="/login" className="cursor-pointer w-full">Log in</a>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <a href="/register" className="cursor-pointer w-full">Register</a>
                        </DropdownMenuItem>
                    </DropdownMenuGroup>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}