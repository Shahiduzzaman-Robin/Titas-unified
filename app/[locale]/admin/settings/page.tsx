"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Trash2, Plus, Pencil, Check, X, User } from "lucide-react"
import { useTranslations, useLocale } from 'next-intl'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useSearchParams, useRouter, usePathname } from "next/navigation"

export default function SettingsPage() {
    const t = useTranslations('admin.settings')
    const searchParams = useSearchParams()
    const router = useRouter()
    const pathname = usePathname()

    const activeTab = searchParams.get('tab') || 'sessions'

    const handleTabChange = (value: string) => {
        // Update URL without full reload
        const params = new URLSearchParams(searchParams)
        params.set('tab', value)
        router.push(`${pathname}?${params.toString()}`)
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">{t('title')}</h1>
                <p className="text-gray-600 mt-2">{t('subtitle')}</p>
            </div>

            <div className="md:hidden mb-4">
                <Select value={activeTab} onValueChange={handleTabChange}>
                    <SelectTrigger className="w-full bg-white border-gray-200">
                        <div className="flex items-center gap-2">
                            <SelectValue placeholder="Select section" />
                        </div>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="sessions" className="cursor-pointer font-medium">{t('sessions')}</SelectItem>
                        <SelectItem value="departments" className="cursor-pointer font-medium">{t('departments')}</SelectItem>
                        <SelectItem value="halls" className="cursor-pointer font-medium">{t('halls')}</SelectItem>
                        <SelectItem value="upazilas" className="cursor-pointer font-medium">{t('upazilas')}</SelectItem>
                        <SelectItem value="admins" className="cursor-pointer font-medium">{t('admins')}</SelectItem>
                        <SelectItem value="email-templates" className="cursor-pointer font-medium">{t('emailTemplates')}</SelectItem>
                        <SelectItem value="profile" className="cursor-pointer font-medium">{t('profile')}</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                <TabsList className="hidden md:inline-flex w-full md:w-auto h-auto md:h-10 flex-wrap md:flex-nowrap justify-start md:justify-center p-1">
                    <TabsTrigger value="sessions">{t('sessions')}</TabsTrigger>
                    <TabsTrigger value="departments">{t('departments')}</TabsTrigger>
                    <TabsTrigger value="halls">{t('halls')}</TabsTrigger>
                    <TabsTrigger value="upazilas">{t('upazilas')}</TabsTrigger>
                    <TabsTrigger value="admins">{t('admins')}</TabsTrigger>
                    <TabsTrigger value="email-templates">{t('emailTemplates')}</TabsTrigger>
                    <TabsTrigger value="profile">{t('profile')}</TabsTrigger>
                </TabsList>

                <TabsContent value="sessions">
                    <OptionManager type="sessions" title={t('sessionList')} placeholder={t('newSessionPlaceholder')} />
                </TabsContent>

                <TabsContent value="departments">
                    <OptionManager type="departments" title={t('departmentList')} placeholder={t('newDepartmentPlaceholder')} />
                </TabsContent>

                <TabsContent value="halls">
                    <OptionManager type="halls" title={t('hallList')} placeholder={t('newHallPlaceholder')} />
                </TabsContent>

                <TabsContent value="upazilas">
                    <OptionManager type="upazilas" title={t('upazilaList')} placeholder={t('newUpazilaPlaceholder')} />
                </TabsContent>

                <TabsContent value="admins">
                    <AdminManager />
                </TabsContent>

                <TabsContent value="email-templates">
                    <EmailTemplateManager />
                </TabsContent>

                <TabsContent value="profile">
                    <ProfileManager />
                </TabsContent>
            </Tabs>
        </div>
    )
}


import { Loader2, Edit } from "lucide-react"

interface EmailTemplate {
    id: number
    key: string
    name: string
    subject: string
    updatedAt: string
}

function EmailTemplateManager() {
    const locale = useLocale()
    const [templates, setTemplates] = useState<EmailTemplate[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchTemplates()
    }, [])

    const fetchTemplates = async () => {
        try {
            const res = await fetch('/api/admin/email-templates')
            if (res.ok) {
                const data = await res.json()
                setTemplates(data)
            }
        } catch (error) {
            console.error("Failed to fetch templates", error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center h-48">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {templates.map((template) => (
                    <Card key={template.id} className="hover:shadow-lg transition-all duration-300 border-slate-200 group">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 border-b bg-slate-50/50 rounded-t-xl px-4 sm:px-6">
                            <CardTitle className="text-base sm:text-lg font-bold text-slate-700 truncate mr-2">
                                {template.name}
                            </CardTitle>
                            <Link href={`/${locale}/admin/settings/email-templates/${template.id}`}>
                                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white">
                                    <Edit className="h-4 w-4" />
                                </Button>
                            </Link>
                        </CardHeader>
                        <CardContent className="p-4 sm:p-6">
                            <div className="space-y-4">
                                <div>
                                    <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Subject Line</div>
                                    <div className="text-sm font-medium text-slate-900 truncate bg-slate-50 p-2 rounded-md border border-slate-100">{template.subject}</div>
                                </div>

                                <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                                    <div className="text-[10px] text-slate-400">
                                        Last Refreshed: {new Date(template.updatedAt).toLocaleDateString()}
                                    </div>
                                    <Link href={`/${locale}/admin/settings/email-templates/${template.id}`}>
                                        <Button variant="default" className="h-8 px-4 text-xs font-semibold shadow-sm">Configure</Button>
                                    </Link>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}


import { useSession } from "next-auth/react"

function AdminManager() {
    const t = useTranslations('admin.settings')
    const common = useTranslations('common')
    const { data: session } = useSession()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [admins, setAdmins] = useState<{ id: number, name: string, email: string, createdAt: string }[]>([])
    const [newName, setNewName] = useState("")
    const [newEmail, setNewEmail] = useState("")
    const [loading, setLoading] = useState(false)

    const fetchAdmins = async () => {
        try {
            const res = await fetch("/api/admin/accounts")
            if (res.ok) {
                setAdmins(await res.json())
            }
        } catch (error) {
            console.error(error)
        }
    }

    useEffect(() => {
        fetchAdmins()
    }, [])

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            const res = await fetch("/api/admin/accounts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: newName, email: newEmail })
            })

            const data = await res.json()

            if (res.ok) {
                toast.success(data.message)
                setNewName("")
                setNewEmail("")
                fetchAdmins()
            } else {
                toast.error(data.message || t('addFailed'))
            }
        } catch (error) {
            toast.error(t('error'))
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (id: number) => {
        try {
            const res = await fetch(`/api/admin/accounts?id=${id}`, {
                method: "DELETE"
            })
            const data = await res.json()

            if (res.ok) {
                toast.success(data.message)
                fetchAdmins()
            } else {
                toast.error(data.message || t('deleteFailed'))
            }
        } catch (error) {
            toast.error(t('error'))
        }
    }

    const isSystemAdmin = session?.user?.isSystemAdmin

    return (
        <div className="space-y-6">
            {isSystemAdmin && (
                <Card>
                    <CardHeader>
                        <CardTitle>{t('createAdmin')}</CardTitle>
                        <CardDescription>{t('createAdminDesc')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleAdd} className="space-y-4 max-w-md">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">{t('adminName')}</label>
                                <Input
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    placeholder="Admin Name"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">{t('adminEmail')}</label>
                                <Input
                                    type="email"
                                    value={newEmail}
                                    onChange={(e) => setNewEmail(e.target.value)}
                                    placeholder="admin@example.com"
                                    required
                                />
                            </div>
                            <div className="bg-blue-50 text-blue-700 p-3 rounded-md text-sm border border-blue-200">
                                {t('passwordSentNote')}
                            </div>
                            <Button type="submit" disabled={loading} className="w-full">
                                {loading ? common('loading') : t('createAdminBtn')}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>{t('adminList')}</CardTitle>
                    <CardDescription>{t('adminListDesc')}</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="border rounded-md divide-y">
                        {admins.length === 0 ? (
                            <div className="p-4 text-center text-gray-500">No admins found</div>
                        ) : (
                            admins.map((admin) => (
                                <div key={admin.id} className="p-4 flex justify-between items-center hover:bg-gray-50">
                                    <div>
                                        <p className="font-medium">{admin.name}</p>
                                        <p className="text-sm text-gray-500">{admin.email}</p>
                                        <p className="text-xs text-gray-400 mt-1">
                                            Created: {new Date(admin.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>

                                    {isSystemAdmin && (
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>{t('deleteAdminConfirm')}</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        {t('deleteAdminDesc')}
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>{common('cancel')}</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleDelete(admin.id)} className="bg-red-600 hover:bg-red-700">
                                                        {common('delete')}
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

function OptionManager({ type, title, placeholder }: { type: string, title: string, placeholder: string }) {
    const t = useTranslations('admin.settings')
    const common = useTranslations('common')

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [items, setItems] = useState<{ id: number, name: string, name_bn?: string }[]>([])
    const [newItem, setNewItem] = useState("")
    const [newItemBn, setNewItemBn] = useState("")
    const [loading, setLoading] = useState(false)
    const [editingId, setEditingId] = useState<number | null>(null)
    const [editName, setEditName] = useState("")
    const [editNameBn, setEditNameBn] = useState("")

    const fetchItems = async () => {
        try {
            const res = await fetch(`/api/options/${type}`)
            if (res.ok) {
                setItems(await res.json())
            }
        } catch (error) {
            console.error(error)
        }
    }

    useEffect(() => {
        fetchItems()
    }, [type])

    const handleAdd = async () => {
        if (!newItem.trim()) return

        setLoading(true)
        try {
            const res = await fetch(`/api/options/${type}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: newItem, name_bn: newItemBn })
            })

            if (res.ok) {
                toast.success(t('addSuccess'))
                setNewItem("")
                setNewItemBn("")
                fetchItems()
            } else {
                toast.error(t('addFailed'))
            }
        } catch (error) {
            toast.error(t('error'))
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (id: number) => {
        try {
            const res = await fetch(`/api/options/${type}?id=${id}`, {
                method: "DELETE"
            })

            if (res.ok) {
                toast.success(t('deleteSuccess'))
                fetchItems()
            } else {
                toast.error(t('deleteFailed'))
            }
        } catch (error) {
            toast.error(t('error'))
        }
    }

    const startEditing = (item: { id: number, name: string, name_bn?: string }) => {
        setEditingId(item.id)
        setEditName(item.name)
        setEditNameBn(item.name_bn || "")
    }

    const cancelEditing = () => {
        setEditingId(null)
        setEditName("")
        setEditNameBn("")
    }

    const saveEdit = async () => {
        if (!editName.trim() || !editingId) return

        try {
            const res = await fetch(`/api/options/${type}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: editingId, name: editName, name_bn: editNameBn })
            })

            if (res.ok) {
                toast.success(t('updateSuccess') || "Updated successfully")
                fetchItems()
                cancelEditing()
            } else {
                toast.error(t('updateFailed') || "Failed to update")
            }
        } catch (error) {
            toast.error(t('error'))
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                <CardDescription>মোট: {items.length}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex gap-2 flex-1">
                        <Input
                            value={newItem}
                            onChange={(e) => setNewItem(e.target.value)}
                            placeholder={placeholder}
                            className="flex-1"
                        />
                        <Input
                            value={newItemBn}
                            onChange={(e) => setNewItemBn(e.target.value)}
                            placeholder="বাংলা নাম"
                            className="flex-1"
                        />
                    </div>
                    <Button onClick={handleAdd} disabled={loading} className="w-full sm:w-auto bg-slate-900">
                        <Plus className="w-4 h-4 mr-2" /> {common('save')}
                    </Button>
                </div>

                <div className="border rounded-md divide-y">
                    {items.length === 0 ? (
                        <div className="p-4 text-center text-gray-500">কোনো তথ্য নেই</div>
                    ) : (
                        items.map((item) => (
                            <div key={item.id} className="p-3 flex justify-between items-center hover:bg-gray-50">
                                {editingId === item.id ? (
                                    <div className="flex-1 flex flex-col sm:flex-row gap-2 mr-2">
                                        <div className="flex flex-1 gap-2">
                                            <Input
                                                value={editName}
                                                onChange={(e) => setEditName(e.target.value)}
                                                className="h-8 flex-1 text-sm"
                                                placeholder="English Name"
                                            />
                                            <Input
                                                value={editNameBn}
                                                onChange={(e) => setEditNameBn(e.target.value)}
                                                className="h-8 flex-1 text-sm"
                                                placeholder="বাংলা নাম"
                                            />
                                        </div>
                                        <div className="flex gap-1 justify-end">
                                            <Button size="sm" onClick={saveEdit} className="h-8 w-8 p-0 bg-green-600 hover:bg-green-700 shrink-0">
                                                <Check className="h-4 w-4" />
                                            </Button>
                                            <Button size="sm" variant="ghost" onClick={cancelEditing} className="h-8 w-8 p-0 shrink-0">
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col min-w-0 flex-1 mr-2 text-left">
                                        <span className="font-medium truncate">{item.name}</span>
                                        {item.name_bn && <span className="text-sm text-gray-500 truncate">{item.name_bn}</span>}
                                    </div>
                                )}

                                <div className="flex gap-1 shrink-0">
                                    {editingId !== item.id && (
                                        <>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => startEditing(item)}
                                                className="text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                                            >
                                                <Pencil className="w-4 h-4" />
                                            </Button>

                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>{t('deleteConfirm')}</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            Are you sure you want to delete this item? This action cannot be undone.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>{common('cancel')}</AlertDialogCancel>
                                                        <AlertDialogAction onClick={() => handleDelete(item.id)} className="bg-red-600 hover:bg-red-700">
                                                            {common('delete')}
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    )
}

function ProfileManager() {
    const t = useTranslations('admin.settings')
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [currentPassword, setCurrentPassword] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [fetching, setFetching] = useState(true)

    const router = useRouter()
    const { data: session, update } = useSession()

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await fetch("/api/admin/profile")
                if (res.ok) {
                    const data = await res.json()
                    setName(data.name)
                    setEmail(data.email)
                }
            } catch (error) {
                console.error(error)
            } finally {
                setFetching(false)
            }
        }
        fetchProfile()
    }, [])

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!currentPassword) {
            toast.error(t('errorCurrentPassword'))
            return
        }

        setLoading(true)
        try {
            const res = await fetch("/api/admin/profile", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name,
                    email,
                    currentPassword,
                    newPassword
                })
            })

            const data = await res.json()

            if (res.ok) {
                toast.success(data.message)
                setCurrentPassword("")
                setNewPassword("")

                // Update session immediately
                await update({
                    name: name,
                    email: email
                })

                router.refresh() // Refresh server components
            } else {
                toast.error(data.message || t('updateFailed'))
            }
        } catch (error) {
            toast.error(t('error'))
        } finally {
            setLoading(false)
        }
    }

    if (fetching) {
        return <div className="p-4 text-center">{t('loadingProfile')}</div>
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>{t('profileTitle')}</CardTitle>
                <CardDescription>{t('profileDesc')}</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleUpdate} className="space-y-4 max-w-md">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">{t('name')}</label>
                        <Input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder={t('namePlaceholder')}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">{t('email')}</label>
                        <Input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder={t('emailPlaceholder')}
                            required
                        />
                    </div>

                    <div className="pt-4 border-t">
                        <h3 className="text-sm font-medium text-gray-900 mb-4">{t('changePassword')}</h3>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">{t('newPassword')}</label>
                                <Input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder={t('newPasswordPlaceholder')}
                                />
                                <p className="text-xs text-gray-500">{t('passwordHint')}</p>
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 border-t bg-gray-50 -mx-6 -mb-6 p-6 mt-6">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">{t('currentPassword')}</label>
                                <Input
                                    type="password"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    placeholder={t('currentPasswordPlaceholder')}
                                    required
                                />
                            </div>

                            <Button type="submit" disabled={loading} className="w-full">
                                {loading ? t('updating') : t('saveChanges')}
                            </Button>
                        </div>
                    </div>
                </form>
            </CardContent>
        </Card>
    )
}
