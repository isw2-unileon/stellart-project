import { useState, useEffect } from "react"
import { getLoggedUser } from "@/service/apiService"

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

    if (isLoading) {
        return <div className="w-10 h-10 rounded-full bg-slate-200 animate-pulse"></div>;
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                    <Avatar className="cursor-pointer hover:brightness-80 transition">
                        {user ? (
                            <>
                                <AvatarImage src="https://avatars.githubusercontent.com/u/199582136?v=4" alt="Avatar del usuario" />
                                <AvatarFallback>
                                    {user.user_metadata?.full_name?.charAt(0).toUpperCase() || "U"}
                                </AvatarFallback>
                            </>
                        ) : (
                            <>
                                <AvatarImage src="https://static.vecteezy.com/system/resources/thumbnails/009/292/244/small/default-avatar-icon-of-social-media-user-vector.jpg" alt="Invitado" />
                                <AvatarFallback className="bg-slate-100 text-slate-500">👤</AvatarFallback>
                            </>
                        )}
                    </Avatar>
                </Button>
            </DropdownMenuTrigger>
            
            <DropdownMenuContent className="w-32">
                {user ? (
                    <>
                        <DropdownMenuGroup>
                            <DropdownMenuItem>Profile</DropdownMenuItem>
                            <DropdownMenuItem>Billing</DropdownMenuItem>
                            <DropdownMenuItem>Settings</DropdownMenuItem>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                            <DropdownMenuItem className="text-red-600 font-medium">Log out</DropdownMenuItem>
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