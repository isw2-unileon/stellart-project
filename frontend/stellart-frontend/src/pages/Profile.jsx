import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { 
    getLoggedUser, 
    getProfile,
    getMasterSkills, 
    getProfileSkills, 
    updateProfileAndSkills,
    uploadAvatar 
} from "../service/apiService";
import SkillBar from "../components/SkillBar";
import ProfileGallery from "../components/ProfileGallery";
import { Button } from "../components/ui/button";

export default function Profile() {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [skills, setSkills] = useState([]);
    const [bio, setBio] = useState("");
    const navigate = useNavigate();
    const textareaRef = useRef(null);
    const maxBioLength = 150;

    // --- Avatar states ---
    const [avatar, setAvatar] = useState(null);
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
    const  fileInputRef = useRef(null);

    const displayName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "";

    useEffect(() => {
        async function fetchProfileData() {
            try {
                const loggedUser = await getLoggedUser();
                if (!loggedUser) {
                    navigate("/login");
                    return;
                }
                setUser(loggedUser);

                const [profile, masterSkills, userSkills] = await Promise.all([
                    getProfile(loggedUser.id),
                    getMasterSkills(),
                    getProfileSkills(loggedUser.id).catch(() => []) 
                ]);

                if (profile) {
                    setAvatar(profile.avatar_url || null);
                    setBio(profile.biography || "");
                } else {
                    setAvatar(loggedUser.user_metadata?.avatar_url || null);
                }

                const colors = [
                    "bg-yellow-500", "bg-amber-500", "bg-sky-500", 
                    "bg-emerald-500", "bg-violet-500", "bg-rose-500"
                ];

                const formattedSkills = masterSkills.map((master, index) => {
                    const savedSkill = (userSkills || []).find(s => s.skill_id === master.id);
                    return {
                        skill_id: master.id,
                        label: master.name,
                        value: savedSkill ? savedSkill.level : 0,
                        color: colors[index % colors.length] 
                    };
                });

                setSkills(formattedSkills);
            } catch {
                console.error("Fetch error.");
                toast.error("Error loading profile data");
            } finally {
                setIsLoading(false);
            }
        }
        fetchProfileData();
    }, [navigate]);

    // ----- Avatar upload handler -----
    const handleAvatarUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const maxSize = 5 * 1024 * 1024; // 5MB for avatars
        if (file.size > maxSize) {
            toast.error("Avatar must be less than 5MB");
            return;
        }

        try {
            setIsUploadingAvatar(true);
            const url = await uploadAvatar(file);
            setAvatar(url);

            // Persist to database immediately using the url variable
            // (not state, which hasn't re-rendered yet)
            await updateProfileAndSkills(user.id, {
                fullName: displayName,
                email: user.email,
                biography: bio,
                avatarUrl: url
            }, skills.map(s => ({
                profile_id: user.id,
                skill_id: s.skill_id,
                level: parseInt(s.value)
            })));

            toast.success("Avatar updated");
        } catch {
            console.error("Avatar upload error.");
            toast.error("Failed to upload avatar");
        } finally {
            setIsUploadingAvatar(false);
        }
    }

    const handleSaveProfile = useCallback(async () => {
        if (!user?.id) return;
        try {
            const profileData = {
                fullName: displayName,
                email: user.email,
                biography: bio,
                avatarUrl: avatar
            };

            const skillsData = skills.map(s => ({
                profile_id: user.id,
                skill_id: s.skill_id,
                level: parseInt(s.value)
            }));

            await updateProfileAndSkills(user.id, profileData, skillsData);
            toast.success("Profile saved");
        } catch {
            toast.error("Save failed");
        }
    }, [user?.id, displayName, bio, avatar, skills]);

    const [initialLoadDone, setInitialLoadDone] = useState(false);

    useEffect(() => {
        if (!isLoading && user?.id && skills.length > 0) {
            if (!initialLoadDone) {
                setInitialLoadDone(true);
                return;
            }
            const timeoutId = setTimeout(() => {
                handleSaveProfile();
            }, 2000);
            return () => clearTimeout(timeoutId);
        }
    }, [handleSaveProfile, isLoading, user?.id, user?.email, skills.length, initialLoadDone]);

    const handleBioChange = (e) => {
        setBio(e.target.value);
        e.target.style.height = "auto"; 
        e.target.style.height = `${e.target.scrollHeight}px`; 
    };

    useEffect(() => {
        if (!isLoading && textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [isLoading, bio]);

    const handleSkillChange = (label, newValue) => {
        setSkills((prev) =>
            prev.map((s) => (s.label === label ? { ...s, value: newValue } : s))
        );
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-12 h-12 rounded-full border-4 border-slate-200 border-t-yellow-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto px-6 py-12">
            <section className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-14">
                <div className="relative shrink-0">
                    <div className="w-36 h-36 rounded-full bg-slate-100 border-4 border-white shadow-lg overflow-hidden flex items-center justify-center relative">
                        {isUploadingAvatar ? (
                            // Spinner de carga mientras sube la foto
                            <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
                                <div className="w-8 h-8 rounded-full border-4 border-slate-200 border-t-yellow-500 animate-spin" />
                            </div>
                        ) : null}

                        {avatar ? (
                            <img src={avatar} alt="Avatar" className="w-full h-full object-cover group-hover:opacity-80 transition-opacity" />
                        ) : (
                            <span className="text-5xl font-black text-yellow-500 uppercase select-none">
                                {displayName?.charAt(0)}
                            </span>
                        )}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-yellow-400 rounded-full border-2 border-white flex items-center justify-center shadow cursor-pointer"
                        onClick={() => fileInputRef.current.click()}
                    >
                        <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            ref={fileInputRef}
                            onChange={handleAvatarUpload}
                        />

                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z" />
                        </svg>
                    </div>
                </div>

                <div className="flex flex-col items-center md:items-start gap-2 text-center md:text-left">
                    <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-slate-900">
                        {displayName}
                    </h1>
                    <p className="text-slate-400 text-sm font-medium">{user.email}</p>
                    <div className="relative w-full max-w-md mt-2">
                        <textarea
                            ref={textareaRef}
                            value={bio}
                            onChange={handleBioChange}
                            maxLength={maxBioLength}
                            rows={3}
                            className="peer w-full resize-none overflow-y-hidden bg-transparent p-2 -ml-2 text-slate-500 text-center md:text-left text-base leading-relaxed outline-none focus:bg-slate-50 focus:ring-2 focus:ring-yellow-400 rounded-lg transition-colors"
                            placeholder="Escribe algo sobre ti..."
                        />
                        <div className="absolute bottom-2 right-2 text-xs text-slate-400 opacity-0 peer-focus:opacity-100 transition-opacity pointer-events-none">
                            {bio.length} / {maxBioLength}
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleSaveProfile}
                        className="mt-1 cursor-pointer text-xs font-semibold text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50 px-3 py-1 h-auto"
                    >
                        Save bio
                    </Button>
                    <div className="flex gap-3 mt-4">
                        <span className="px-4 py-1.5 rounded-full bg-yellow-50 text-yellow-600 text-xs font-bold border border-yellow-200">
                            Ilustration
                        </span>
                        <span className="px-4 py-1.5 rounded-full bg-slate-50 text-slate-600 text-xs font-bold border border-slate-200">
                            Concept Art
                        </span>
                        <span className="px-4 py-1.5 rounded-full bg-slate-50 text-slate-600 text-xs font-bold border border-slate-200">
                            Design
                        </span>
                    </div>
                </div>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 flex flex-col gap-8">
                    <div>
                        <div className="flex items-center gap-3 mb-6">
                            <h2 className="text-2xl font-black tracking-tight text-slate-900">Gallery</h2>
                            <div className="h-1 flex-1 bg-slate-100 rounded-full" />
                        </div>
                        <ProfileGallery />
                    </div>
                    <UploadArtworkLink />
                </div>
                <div>
                    <div className="flex items-center gap-3 mb-6">
                        <h2 className="text-2xl font-black tracking-tight text-slate-900">Skills</h2>
                        <div className="h-1 flex-1 bg-slate-100 rounded-full" />
                    </div>
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 flex flex-col gap-6">
                        {skills.map((skill) => (
                            <SkillBar
                                key={skill.label}
                                label={skill.label}
                                initialValue={skill.value}
                                color={skill.color}
                                onChange={handleSkillChange}
                            />
                        ))}
                    </div>
                    <Button 
                        variant="outline"
                        onClick={handleSaveProfile}
                        className="w-full mt-6 cursor-pointer font-bold bg-yellow-500 text-slate-900 transition-all duration-300 hover:brightness-105 hover:bg-yellow-500 hover:translate-y-[-2px] shadow-md hover:shadow-lg"
                    >
                        Save profile
                    </Button>
                </div>
            </div>
        </div>
    );
}

function UploadArtworkLink() {
    return (
        <Link 
            to="upload" 
            className="group block w-full bg-slate-50 hover:bg-white rounded-3xl border-2 border-dashed border-slate-200 hover:border-yellow-400 hover:shadow-md transition-all duration-300 p-8 text-center cursor-pointer"
        >
            <div className="flex flex-col items-center justify-center gap-3">
                <div className="w-12 h-12 bg-white group-hover:bg-yellow-50 rounded-full flex items-center justify-center shadow-sm border border-slate-100 group-hover:border-yellow-200 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-slate-400 group-hover:text-yellow-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                </div>
                <div>
                    <h3 className="text-lg font-bold text-slate-700 group-hover:text-slate-900 transition-colors">
                        Upload your new artwork!
                    </h3>
                    <p className="text-sm text-slate-500 mt-1">
                        Share your art with the Stellart community
                    </p>
                </div>
            </div>
        </Link>
    );
}