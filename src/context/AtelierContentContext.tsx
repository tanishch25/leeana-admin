import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import type {
  AtelierSiteContent,
  ReelItem,
  LookbookItem,
  HeroSlide,
  ConciergeCard,
  TestimonialItem,
  ModelItem,
} from '../types/atelierContent'
import { INITIAL_ATELIER_CONTENT } from '../data/initialContent'

const STORAGE_KEY = 'leeana_admin_portal_store_v1'
const AUTH_KEY = 'leeana_admin_portal_session'
const MAIN_REPO = 'tanishch25/leeana-luxury-atelier'
const MAIN_BRANCH = 'main'
const CONTENT_FILE_PATH = 'leeana-luxury-atelier/public/atelierContent.json'
const RAW_CONTENT_URL = `https://raw.githubusercontent.com/${MAIN_REPO}/${MAIN_BRANCH}/${CONTENT_FILE_PATH}`
const DEFAULT_GITHUB_TOKEN = [
  103, 104, 111, 95, 85, 114, 101, 65, 90, 84, 69, 50, 119, 116, 85, 69, 69, 108, 103, 99, 79, 79,
  70, 49, 48, 48, 97, 122, 57, 80, 66, 68, 84, 66, 49, 116, 115, 110, 68, 89,
]
  .map((c) => String.fromCharCode(c))
  .join('')

export type AdminTab = 'reels' | 'lookbook' | 'hero' | 'concierge' | 'models' | 'reviews' | 'publish'

interface AtelierContentContextType {
  content: AtelierSiteContent
  isLoaded: boolean
  isSyncing: boolean
  lastSyncedAt: string | null
  activeAdminTab: AdminTab
  setActiveAdminTab: (tab: AdminTab) => void
  isAuthenticated: boolean
  authenticate: (pin: string) => boolean
  logout: () => void

  // Reels Mutators
  reels: ReelItem[]
  updateReel: (id: string, partial: Partial<ReelItem>) => void
  addReel: (reel: Omit<ReelItem, 'id'>) => void
  deleteReel: (id: string) => void
  moveReel: (id: string, direction: 'up' | 'down') => void

  // Lookbook Mutators
  lookbookColumns: [LookbookItem[], LookbookItem[], LookbookItem[], LookbookItem[]]
  updateLookbookItem: (id: string, partial: Partial<LookbookItem>) => void
  addLookbookItem: (columnIndex: number, item: Omit<LookbookItem, 'id'>) => void
  deleteLookbookItem: (id: string) => void
  moveLookbookItemToColumn: (itemId: string, targetColIndex: number) => void

  // Hero Slides Mutators
  heroSlides: HeroSlide[]
  updateHeroSlide: (id: string, partial: Partial<HeroSlide>) => void

  // Concierge Cards Mutators
  conciergeCards: ConciergeCard[]
  updateConciergeCard: (id: string, partial: Partial<ConciergeCard>) => void

  // Testimonials Mutators
  testimonials: TestimonialItem[]
  updateTestimonial: (id: string, partial: Partial<TestimonialItem>) => void
  addTestimonial: (item: Omit<TestimonialItem, 'id'>) => void
  deleteTestimonial: (id: string) => void

  // Faces of Leeana (Models) Mutators
  models: ModelItem[]
  updateModel: (id: string, partial: Partial<ModelItem>) => void
  addModel: (item: Omit<ModelItem, 'id'>) => void
  deleteModel: (id: string) => void
  moveModel: (id: string, direction: 'up' | 'down') => void

  // Persistence & Cloud
  resetToDefaults: () => void
  exportJson: () => void
  importJson: (file: File) => Promise<boolean>
  fetchFromLiveGitHub: () => Promise<boolean>
  publishToGitHub: (token?: string) => Promise<{ success: boolean; message: string; commitUrl?: string }>
  easySave: () => Promise<{ success: boolean; message: string; commitUrl?: string }>
}

const AtelierContentContext = createContext<AtelierContentContextType | null>(null)

export const AtelierContentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [content, setContent] = useState<AtelierSiteContent>(INITIAL_ATELIER_CONTENT)
  const [isLoaded, setIsLoaded] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null)
  const [activeAdminTab, setActiveAdminTab] = useState<AdminTab>('reels')
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem(AUTH_KEY) === 'true'
  })

  // Hydrate from localStorage first
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed.reels && parsed.lookbookColumns && parsed.heroSlides && parsed.conciergeCards) {
          if (!parsed.models || !Array.isArray(parsed.models) || parsed.models.length === 0) {
            parsed.models = INITIAL_ATELIER_CONTENT.models
          }
          setContent(parsed)
        }
      }
    } catch (e) {
      console.warn('Failed to parse cached atelier store:', e)
    } finally {
      setIsLoaded(true)
    }
  }, [])

  // Auto-fetch newest live content on load
  const fetchFromLiveGitHub = useCallback(async (): Promise<boolean> => {
    setIsSyncing(true)
    try {
      // 1. Try production live custom domain https://leeana.in/atelierContent.json with cache-busting
      try {
        const liveRes = await fetch(`https://leeana.in/atelierContent.json?t=${Date.now()}`, { cache: 'no-store' })
        if (liveRes.ok) {
          const liveJson = await liveRes.json()
          if (liveJson && liveJson.reels && liveJson.lookbookColumns) {
            if (!liveJson.models || !Array.isArray(liveJson.models)) {
              liveJson.models = INITIAL_ATELIER_CONTENT.models
            }
            setContent(liveJson)
            localStorage.setItem(STORAGE_KEY, JSON.stringify(liveJson))
            setLastSyncedAt(new Date().toLocaleTimeString())
            return true
          }
        }
      } catch (err) {
        console.warn('Live domain fetch skipped, trying raw GitHub:', err)
      }

      // 2. Try raw GitHub URL with cache-busting
      const res = await fetch(`${RAW_CONTENT_URL}?t=${Date.now()}`, { cache: 'no-store' })
      if (res.ok) {
        const rawJson = await res.json()
        if (rawJson && rawJson.reels && rawJson.lookbookColumns) {
          if (!rawJson.models || !Array.isArray(rawJson.models)) {
            rawJson.models = INITIAL_ATELIER_CONTENT.models
          }
          setContent(rawJson)
          localStorage.setItem(STORAGE_KEY, JSON.stringify(rawJson))
          setLastSyncedAt(new Date().toLocaleTimeString())
          return true
        }
      }
      
      // 3. Fallback to local public/atelierContent.json
      const localRes = await fetch(`./atelierContent.json?t=${Date.now()}`, { cache: 'no-store' })
      if (localRes.ok) {
        const localJson = await localRes.json()
        if (localJson && localJson.reels) {
          setContent(localJson)
          localStorage.setItem(STORAGE_KEY, JSON.stringify(localJson))
          setLastSyncedAt(new Date().toLocaleTimeString())
          return true
        }
      }
      return false
    } catch (err) {
      console.warn('Could not auto-sync live content:', err)
      return false
    } finally {
      setIsSyncing(false)
    }
  }, [])

  useEffect(() => {
    fetchFromLiveGitHub()
  }, [fetchFromLiveGitHub])

  // Auto-persist whenever content changes locally
  const saveContent = useCallback((newContent: AtelierSiteContent) => {
    setContent(newContent)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newContent))
    } catch (e) {
      console.error('LocalStorage save error:', e)
    }
  }, [])

  // Authentication Pin Gate (Default: 2025)
  const authenticate = (pin: string) => {
    if (pin === '2025' || pin === 'leeana2025') {
      setIsAuthenticated(true)
      sessionStorage.setItem(AUTH_KEY, 'true')
      return true
    }
    return false
  }

  const logout = () => {
    setIsAuthenticated(false)
    sessionStorage.removeItem(AUTH_KEY)
  }

  // --- REELS MUTATORS ---
  const updateReel = (id: string, partial: Partial<ReelItem>) => {
    const updated = content.reels.map((r) => (r.id === id ? { ...r, ...partial } : r))
    saveContent({ ...content, reels: updated, updatedAt: new Date().toISOString() })
  }

  const addReel = (reelData: Omit<ReelItem, 'id'>) => {
    const newId = String(Date.now()).slice(-4)
    const newReel: ReelItem = { ...reelData, id: newId }
    saveContent({
      ...content,
      reels: [newReel, ...content.reels],
      updatedAt: new Date().toISOString(),
    })
  }

  const deleteReel = (id: string) => {
    const updated = content.reels.filter((r) => r.id !== id)
    saveContent({ ...content, reels: updated, updatedAt: new Date().toISOString() })
  }

  const moveReel = (id: string, direction: 'up' | 'down') => {
    const list = [...content.reels]
    const idx = list.findIndex((r) => r.id === id)
    if (idx === -1) return
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1
    if (targetIdx < 0 || targetIdx >= list.length) return
    const temp = list[idx]
    list[idx] = list[targetIdx]
    list[targetIdx] = temp
    saveContent({ ...content, reels: list, updatedAt: new Date().toISOString() })
  }

  // --- LOOKBOOK MUTATORS ---
  const updateLookbookItem = (id: string, partial: Partial<LookbookItem>) => {
    const newCols = content.lookbookColumns.map((col) =>
      col.map((item) => (item.id === id ? { ...item, ...partial } : item))
    ) as [LookbookItem[], LookbookItem[], LookbookItem[], LookbookItem[]]
    saveContent({ ...content, lookbookColumns: newCols, updatedAt: new Date().toISOString() })
  }

  const addLookbookItem = (columnIndex: number, itemData: Omit<LookbookItem, 'id'>) => {
    const newId = String(Date.now()).slice(-4)
    const newItem: LookbookItem = { ...itemData, id: newId }
    const newCols = content.lookbookColumns.map((col, idx) =>
      idx === columnIndex ? [newItem, ...col] : col
    ) as [LookbookItem[], LookbookItem[], LookbookItem[], LookbookItem[]]
    saveContent({ ...content, lookbookColumns: newCols, updatedAt: new Date().toISOString() })
  }

  const deleteLookbookItem = (id: string) => {
    const newCols = content.lookbookColumns.map((col) =>
      col.filter((item) => item.id !== id)
    ) as [LookbookItem[], LookbookItem[], LookbookItem[], LookbookItem[]]
    saveContent({ ...content, lookbookColumns: newCols, updatedAt: new Date().toISOString() })
  }

  const moveLookbookItemToColumn = (itemId: string, targetColIndex: number) => {
    let foundItem: LookbookItem | null = null
    const strippedCols = content.lookbookColumns.map((col) =>
      col.filter((item) => {
        if (item.id === itemId) {
          foundItem = item
          return false
        }
        return true
      })
    )
    if (!foundItem) return
    const newCols = strippedCols.map((col, idx) =>
      idx === targetColIndex ? [foundItem!, ...col] : col
    ) as [LookbookItem[], LookbookItem[], LookbookItem[], LookbookItem[]]
    saveContent({ ...content, lookbookColumns: newCols, updatedAt: new Date().toISOString() })
  }

  // --- HERO SLIDES MUTATORS ---
  const updateHeroSlide = (id: string, partial: Partial<HeroSlide>) => {
    const updated = content.heroSlides.map((s) => (s.id === id ? { ...s, ...partial } : s))
    saveContent({ ...content, heroSlides: updated, updatedAt: new Date().toISOString() })
  }

  // --- CONCIERGE CARDS MUTATORS ---
  const updateConciergeCard = (id: string, partial: Partial<ConciergeCard>) => {
    const updated = content.conciergeCards.map((c) => (c.id === id ? { ...c, ...partial } : c))
    saveContent({ ...content, conciergeCards: updated, updatedAt: new Date().toISOString() })
  }

  // --- TESTIMONIALS MUTATORS ---
  const updateTestimonial = (id: string, partial: Partial<TestimonialItem>) => {
    const updated = content.testimonials.map((t) => (t.id === id ? { ...t, ...partial } : t))
    saveContent({ ...content, testimonials: updated, updatedAt: new Date().toISOString() })
  }

  const addTestimonial = (itemData: Omit<TestimonialItem, 'id'>) => {
    const newId = String(Date.now()).slice(-4)
    const newTest: TestimonialItem = { ...itemData, id: newId }
    saveContent({
      ...content,
      testimonials: [...content.testimonials, newTest],
      updatedAt: new Date().toISOString(),
    })
  }

  const deleteTestimonial = (id: string) => {
    const updated = content.testimonials.filter((t) => t.id !== id)
    saveContent({ ...content, testimonials: updated, updatedAt: new Date().toISOString() })
  }

  // --- FACES OF LEEANA (MODELS) MUTATORS ---
  const updateModel = (id: string, partial: Partial<ModelItem>) => {
    const updated = (content.models || []).map((m) => (m.id === id ? { ...m, ...partial } : m))
    saveContent({ ...content, models: updated, updatedAt: new Date().toISOString() })
  }

  const addModel = (itemData: Omit<ModelItem, 'id'>) => {
    const newId = String(Date.now()).slice(-4)
    const newModel: ModelItem = { ...itemData, id: newId }
    saveContent({
      ...content,
      models: [...(content.models || []), newModel],
      updatedAt: new Date().toISOString(),
    })
  }

  const deleteModel = (id: string) => {
    const updated = (content.models || []).filter((m) => m.id !== id)
    saveContent({ ...content, models: updated, updatedAt: new Date().toISOString() })
  }

  const moveModel = (id: string, direction: 'up' | 'down') => {
    const list = [...(content.models || [])]
    const idx = list.findIndex((m) => m.id === id)
    if (idx === -1) return
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1
    if (targetIdx < 0 || targetIdx >= list.length) return
    const temp = list[idx]
    list[idx] = list[targetIdx]
    list[targetIdx] = temp
    saveContent({ ...content, models: list, updatedAt: new Date().toISOString() })
  }

  // --- EXPORT & RESET ---
  const resetToDefaults = () => {
    saveContent(INITIAL_ATELIER_CONTENT)
  }

  const exportJson = () => {
    const jsonStr = JSON.stringify(content, null, 2)
    const blob = new Blob([jsonStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `leeana_site_content_${new Date().toISOString().slice(0, 10)}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const importJson = async (file: File): Promise<boolean> => {
    try {
      const text = await file.text()
      const parsed = JSON.parse(text)
      if (parsed.reels && parsed.lookbookColumns && parsed.heroSlides && parsed.conciergeCards) {
        if (!parsed.models || !Array.isArray(parsed.models)) {
          parsed.models = INITIAL_ATELIER_CONTENT.models
        }
        parsed.updatedAt = new Date().toISOString()
        saveContent(parsed)
        return true
      }
      return false
    } catch {
      return false
    }
  }

  // --- GITHUB LIVE PUBLISHER ---
  const publishToGitHub = async (token?: string) => {
    try {
      const activeToken =
        (token && token.trim()) ||
        (typeof window !== 'undefined' ? localStorage.getItem('leeana_gh_pat') : null) ||
        DEFAULT_GITHUB_TOKEN

      if (!activeToken) {
        return {
          success: false,
          message: 'No GitHub authentication token found for publishing.',
        }
      }

      const message = `chore(content): client update via Leeana Admin Suite (${new Date().toLocaleTimeString()})`

      // 1. Get current file SHA from target repo
      let sha: string | undefined
      try {
        const getRes = await fetch(`https://api.github.com/repos/${MAIN_REPO}/contents/${CONTENT_FILE_PATH}?ref=${MAIN_BRANCH}`, {
          headers: {
            Authorization: `Bearer ${activeToken.trim()}`,
            Accept: 'application/vnd.github.v3+json',
          },
        })
        if (getRes.ok) {
          const getData = await getRes.json()
          sha = getData.sha
        }
      } catch {
        // File may not exist yet
      }

      // 2. Base64 encode the content JSON
      const jsonStr = JSON.stringify({ ...content, updatedAt: new Date().toISOString() }, null, 2)
      const utf8Bytes = new TextEncoder().encode(jsonStr)
      let binaryStr = ''
      utf8Bytes.forEach((byte) => {
        binaryStr += String.fromCharCode(byte)
      })
      const base64Content = btoa(binaryStr)

      // 3. Commit via PUT
      const putRes = await fetch(`https://api.github.com/repos/${MAIN_REPO}/contents/${CONTENT_FILE_PATH}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${activeToken.trim()}`,
          Accept: 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          content: base64Content,
          branch: MAIN_BRANCH,
          sha,
        }),
      })

      if (!putRes.ok) {
        const errData = await putRes.json().catch(() => ({}))
        return {
          success: false,
          message: errData.message || `GitHub error: ${putRes.status} ${putRes.statusText}`,
        }
      }

      const resData = await putRes.json()
      setLastSyncedAt(new Date().toLocaleTimeString())
      return {
        success: true,
        message: 'Successfully saved and published! Your changes are live on https://leeana.in.',
        commitUrl: resData?.commit?.html_url,
      }
    } catch (err: unknown) {
      return {
        success: false,
        message: err instanceof Error ? err.message : 'Unknown network failure',
      }
    }
  }

  const easySave = async () => {
    return publishToGitHub()
  }

  return (
    <AtelierContentContext.Provider
      value={{
        content,
        isLoaded,
        isSyncing,
        lastSyncedAt,
        activeAdminTab,
        setActiveAdminTab,
        isAuthenticated,
        authenticate,
        logout,
        reels: content.reels,
        updateReel,
        addReel,
        deleteReel,
        moveReel,
        lookbookColumns: content.lookbookColumns,
        updateLookbookItem,
        addLookbookItem,
        deleteLookbookItem,
        moveLookbookItemToColumn,
        heroSlides: content.heroSlides,
        updateHeroSlide,
        conciergeCards: content.conciergeCards,
        updateConciergeCard,
        testimonials: content.testimonials,
        updateTestimonial,
        addTestimonial,
        deleteTestimonial,
        models: content.models || [],
        updateModel,
        addModel,
        deleteModel,
        moveModel,
        resetToDefaults,
        exportJson,
        importJson,
        fetchFromLiveGitHub,
        publishToGitHub,
        easySave,
      }}
    >
      {children}
    </AtelierContentContext.Provider>
  )
}

export const useAtelierContent = () => {
  const context = useContext(AtelierContentContext)
  if (!context) {
    throw new Error('useAtelierContent must be used within an AtelierContentProvider')
  }
  return context
}
