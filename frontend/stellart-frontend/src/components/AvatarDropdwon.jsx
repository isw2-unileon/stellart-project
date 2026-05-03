import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { getLoggedUser, getProfile, logoutUser } from "@/service/apiService"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User, MapPin, Bookmark, LogOut } from "lucide-react";

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
            if (loggedUser) {
                const profile = await getProfile(loggedUser.id);
                if (profile?.avatar_url) {
                    loggedUser.user_metadata = {
                        ...loggedUser.user_metadata,
                        avatar_url: profile.avatar_url,
                    };
                }
            }
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
            
            <DropdownMenuContent className="w-48" align="end">
                {user ? (
                    <>
                        <DropdownMenuGroup>
                            <DropdownMenuItem asChild className="cursor-pointer">
                                <Link to="/profile" className="flex items-center gap-2 w-full">
                                    <User className="w-4 h-4 text-slate-500" />
                                    <span>Profile</span>
                                </Link>
                            </DropdownMenuItem>

                            <DropdownMenuItem asChild className="cursor-pointer">
                                <Link to="/wishlist" className="flex items-center gap-2 w-full">
                                    <Bookmark className="w-4 h-4 text-slate-500" />
                                    <span>Wishlist</span>
                                </Link>
                            </DropdownMenuItem>
                            
                            <DropdownMenuItem asChild className="cursor-pointer">
                                <Link to="/shipping" className="flex items-center gap-2 w-full">
                                    <MapPin className="w-4 h-4 text-slate-500" />
                                    <span>Shipping addresses</span>
                                </Link>
                            </DropdownMenuItem>

                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                            <DropdownMenuItem 
                                className="text-red-600 font-medium cursor-pointer flex items-center gap-2 w-full"
                                onClick={handleLogout}
                            >
                                <LogOut className="w-4 h-4" />
                                <span>Log out</span>
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