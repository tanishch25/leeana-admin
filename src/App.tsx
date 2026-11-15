import React, { useState } from 'react'
import {
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Download,
  Upload,
  RefreshCw,
  ExternalLink,
  Shield,
  CheckCircle2,
  Film,
  Camera,
  Layers,
  Sparkles,
  MessageSquare,
  Globe,
  Sliders,
  Eye,
  Lock,
  ArrowRight,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react'
import { AtelierContentProvider, useAtelierContent, type AdminTab } from './context/AtelierContentContext'
import { MediaUploader } from './components/admin/MediaUploader'
import { resolveMediaUrl } from './utils/resolveMedia'
import type { ReelItem, LookbookItem, HeroSlide, ConciergeCard, TestimonialItem, ModelItem } from './types/atelierContent'

const AdminDeskView: React.FC = () => {
  const {
    activeAdminTab,
    setActiveAdminTab,
    isAuthenticated,
    authenticate,
    logout,
    isSyncing,
    lastSyncedAt,
    fetchFromLiveGitHub,
    reels,
    addReel,
    updateReel,
    deleteReel,
    moveReel,
    lookbookColumns,
    addLookbookItem,
    updateLookbookItem,
    deleteLookbookItem,
    moveLookbookItemToColumn,
    heroSlides,
    updateHeroSlide,
    conciergeCards,
    updateConciergeCard,
    testimonials,
    updateTestimonial,
    models,
    updateModel,
    addModel,
    deleteModel,
    moveModel,
    resetToDefaults,
    exportJson,
    importJson,
    publishToGitHub,
    easySave,
  } = useAtelierContent()

  // Passcode Gate State
  const [pinInput, setPinInput] = useState('')
  const [pinError, setPinError] = useState(false)

  // New Reel Draft State
  const [isAddingReel, setIsAddingReel] = useState(false)
  const [newReel, setNewReel] = useState<Omit<ReelItem, 'id'>>({
    title: '',
    subtitle: '',
    videoSrc: '',
    posterSrc: '',
    instagramUrl: 'https://www.instagram.com/leeana.in',
    category: 'Commercial Direction',
    duration: '0:30',
    client: 'Private Atelier',
  })

  // New Lookbook Item Draft State
  const [isAddingLookbook, setIsAddingLookbook] = useState(false)
  const [selectedColForNew, setSelectedColForNew] = useState(0)
  const [newLookbookItem, setNewLookbookItem] = useState<Omit<LookbookItem, 'id'>>({
    title: '',
    category: 'Haute Joaillerie',
    image: '',
    aspect: 'aspect-[3/4]',
    client: 'Atelier Client',
    year: '2025',
    focal: 'top',
    description: '',
  })

  // Selected Column Filter for Lookbook Tab
  const [activeColumnView, setActiveColumnView] = useState<number | 'all'>('all')

  // Faces of Leeana Draft State
  const [isAddingModel, setIsAddingModel] = useState(false)
  const [newModel, setNewModel] = useState<Omit<ModelItem, 'id'>>({
    name: '',
    tag: 'Haute Horlogerie & Couture',
    img: '',
  })

  const handleSaveNewModel = () => {
    if (!newModel.name.trim() || !newModel.img.trim()) {
      alert('Please provide a name and photo for the model profile.')
      return
    }
    addModel(newModel)
    setNewModel({
      name: '',
      tag: 'Haute Horlogerie & Couture',
      img: '',
    })
    setIsAddingModel(false)
  }

  // Easy 1-Click Live Save State
  const [isSavingLive, setIsSavingLive] = useState(false)
  const [saveBanner, setSaveBanner] = useState<{ type: 'success' | 'error'; text: string; link?: string } | null>(null)

  const handleEasySave = async () => {
    setIsSavingLive(true)
    setSaveBanner(null)
    const result = await easySave()
    setIsSavingLive(false)
    if (result.success) {
      setSaveBanner({
        type: 'success',
        text: 'Changes saved! The live website (https://leeana.in) is updating automatically.',
        link: result.commitUrl,
      })
    } else {
      setSaveBanner({
        type: 'error',
        text: result.message || 'Failed to save changes. Please try again.',
      })
    }
  }

  // Optional custom PAT state for advanced developers
  const [githubToken, setGithubToken] = useState(() => localStorage.getItem('leeana_gh_pat') || '')
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false)

  // Media Playback Testing State
  const [playingVideoId, setPlayingVideoId] = useState<string | null>(null)

  // --- PASSCODE GATE ---
  if (!isAuthenticated) {
    const handlePinSubmit = (e: React.FormEvent) => {
      e.preventDefault()
      const ok = authenticate(pinInput)
      if (!ok) {
        setPinError(true)
        setTimeout(() => setPinError(false), 2000)
      }
    }

    return (
      <div className="min-h-screen bg-[#050508] text-white flex items-center justify-center p-6 relative overflow-hidden selection:bg-white/20">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/[0.02] blur-[140px] rounded-full pointer-events-none" />

        <div className="relative z-10 w-full max-w-md p-8 sm:p-10 rounded-3xl border border-white/10 bg-[#09090d]/90 backdrop-blur-2xl shadow-2xl text-center space-y-6">
          <div className="w-14 h-14 mx-auto rounded-full bg-white/[0.06] border border-white/15 flex items-center justify-center text-white">
            <Shield className="w-6 h-6" />
          </div>

          <div className="space-y-2">
            <span className="font-couture text-3xl tracking-[0.25em] text-white block">
              LEEANA
            </span>
            <span className="text-[11px] font-medium tracking-[0.22em] uppercase text-white/50 block">
              ATELIER STUDIO DESK
            </span>
            <p className="text-xs text-white/70 font-light leading-relaxed pt-1">
              Authorized access only. Enter studio passcode to manage live reels, lookbook photography, and client models.
            </p>
          </div>

          <form onSubmit={handlePinSubmit} className="space-y-4 pt-2">
            <input
              type="password"
              autoFocus
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              placeholder="Enter Access Passcode"
              className={`w-full px-5 py-3.5 rounded-2xl bg-white/[0.04] border text-center text-base tracking-widest text-white placeholder-white/30 focus:outline-none transition-all ${
                pinError
                  ? 'border-red-500/80 bg-red-500/10 text-red-200'
                  : 'border-white/15 focus:border-white'
              }`}
            />

            <button
              type="submit"
              className="apple-press w-full py-4 rounded-2xl bg-white text-black font-semibold text-xs tracking-[0.18em] uppercase hover:bg-white/90 transition-all shadow-xl cursor-pointer"
            >
              Unlock Studio Desk
            </button>
          </form>

          <div className="pt-4 border-t border-white/[0.08] flex items-center justify-between text-[11px] text-white/50">
            <a
              href="https://leeana.in"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors flex items-center gap-1.5"
            >
              <span>Visit Live Website</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <span>Default PIN: 2025</span>
          </div>
        </div>
      </div>
    )
  }

  // --- SAVE NEW REEL ---
  const handleSaveNewReel = () => {
    if (!newReel.title.trim() || (!newReel.videoSrc.trim() && !newReel.posterSrc.trim())) {
      alert('Please provide a title and video/poster source.')
      return
    }
    addReel(newReel)
    setNewReel({
      title: '',
      subtitle: '',
      videoSrc: '',
      posterSrc: '',
      instagramUrl: 'https://www.instagram.com/leeana.in',
      category: 'Commercial Direction',
      duration: '0:30',
      client: 'Private Atelier',
    })
    setIsAddingReel(false)
  }

  // --- SAVE NEW LOOKBOOK ---
  const handleSaveNewLookbook = () => {
    if (!newLookbookItem.title.trim() || !newLookbookItem.image.trim()) {
      alert('Please provide a title and image.')
      return
    }
    addLookbookItem(selectedColForNew, newLookbookItem)
    setNewLookbookItem({
      title: '',
      category: 'Haute Joaillerie',
      image: '',
      aspect: 'aspect-[3/4]',
      client: 'Atelier Client',
      year: '2025',
      focal: 'top',
      description: '',
    })
    setIsAddingLookbook(false)
  }

  // --- 1-CLICK EASY SAVE HANDLER ---
  const handlePublish = async () => {
    await handleEasySave()
  }

  return (
    <div className="min-h-screen bg-[#050508] text-white flex flex-col selection:bg-white/20">
      {/* Top Header Bar */}
      <header className="px-6 py-4 border-b border-white/[0.1] bg-[#07070a]/90 backdrop-blur-md flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <span className="font-couture text-xl sm:text-2xl tracking-[0.25em] text-white">LEEANA</span>
          <span className="w-[1px] h-4 bg-white/20" />
          <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
            <span className="text-[10px] tracking-[0.2em] uppercase text-white/70 font-medium">
              ATELIER STUDIO DESK
            </span>
            <span className="hidden sm:inline text-white/30">·</span>
            <span className="text-[9px] uppercase tracking-wider text-emerald-400 font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Connected to leeana.in
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* 1-Click Easy Save Button */}
          <button
            onClick={handleEasySave}
            disabled={isSavingLive}
            title="Save all changes directly to the live site (leeana.in)"
            className="apple-press px-4 py-2 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-semibold tracking-wider uppercase transition-all shadow-lg shadow-emerald-500/25 disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
          >
            {isSavingLive ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Save to Live Site</span>
              </>
            )}
          </button>

          {/* Sync from GitHub Button */}
          <button
            onClick={fetchFromLiveGitHub}
            title={lastSyncedAt ? `Last synced: ${lastSyncedAt}` : 'Fetch Latest Content from GitHub'}
            className="apple-press px-3.5 py-2 rounded-full bg-white/5 hover:bg-white/15 text-white/80 hover:text-white text-xs font-light tracking-wider transition-all border border-white/10 cursor-pointer flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-emerald-400' : ''}`} />
            <span className="hidden sm:inline">Sync Live</span>
          </button>

          {/* Quick Preview Button */}
          <a
            href="https://leeana.in"
            target="_blank"
            rel="noopener noreferrer"
            className="apple-press px-4 py-2 rounded-full bg-white/10 hover:bg-white text-white hover:text-black text-[11px] font-medium tracking-wider uppercase transition-all flex items-center gap-2 border border-white/20 cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Preview Site</span>
          </a>

          {/* Export JSON Button */}
          <button
            onClick={exportJson}
            title="Download JSON Content Backup"
            className="apple-press p-2 rounded-full bg-white/5 hover:bg-white/15 text-white/70 hover:text-white transition-all border border-white/10 cursor-pointer"
          >
            <Download className="w-4 h-4" />
          </button>

          {/* Lock Desk */}
          <button
            onClick={logout}
            title="Lock Desk"
            className="apple-press p-2 rounded-full bg-white/5 hover:bg-white/15 text-white/70 hover:text-white transition-all border border-white/10 cursor-pointer"
          >
            <Lock className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Global Save Notification Banner */}
      {saveBanner && (
        <div
          className={`px-6 py-3 border-b text-xs flex items-center justify-between transition-all ${
            saveBanner.type === 'success'
              ? 'bg-emerald-950/80 border-emerald-500/30 text-emerald-200'
              : 'bg-red-950/80 border-red-500/30 text-red-200'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-medium">{saveBanner.text}</span>
            {saveBanner.link && (
              <a
                href={saveBanner.link}
                target="_blank"
                rel="noopener noreferrer"
                className="underline ml-2 inline-flex items-center gap-1 opacity-80 hover:opacity-100"
              >
                <span>View Live Commit</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
          <button
            onClick={() => setSaveBanner(null)}
            className="text-white/60 hover:text-white p-1 rounded-full cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Tab Navigation Bar */}
      <div className="px-6 py-2.5 border-b border-white/[0.08] bg-[#09090e] flex items-center gap-2 overflow-x-auto scrollbar-none shrink-0">
        {[
          { id: 'reels', label: 'Reels & Videos', icon: Film, count: reels.length },
          {
            id: 'lookbook',
            label: 'Lookbook Plates',
            icon: Camera,
            count: lookbookColumns.reduce((acc, c) => acc + c.length, 0),
          },
          { id: 'hero', label: 'Hero Stage', icon: Sparkles, count: heroSlides.length },
          { id: 'concierge', label: 'Concierge Cards', icon: Layers, count: conciergeCards.length },
          { id: 'models', label: 'Faces of Leeana', icon: Eye, count: models.length },
          { id: 'reviews', label: 'Client Reviews', icon: MessageSquare, count: testimonials.length },
          { id: 'publish', label: 'Save & Sync', icon: Globe },
        ].map((tab) => {
          const Icon = tab.icon
          const isActive = activeAdminTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveAdminTab(tab.id as AdminTab)}
              className={`apple-press px-4 py-2 rounded-xl text-xs font-medium tracking-wider uppercase transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
                isActive
                  ? 'bg-white text-black shadow-lg font-semibold'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                    isActive ? 'bg-black/20 text-black' : 'bg-white/10 text-white/60'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Content Scroll Area */}
      <div className="flex-1 overflow-y-auto p-6 md:p-10 max-w-7xl w-full mx-auto space-y-8">
        
        {/* ========================================================== */}
        {/* TAB 1: REELS & VIDEO FEEDS                                 */}
        {/* ========================================================== */}
        {activeAdminTab === 'reels' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
              <div>
                <h3 className="text-xl sm:text-2xl font-light text-white tracking-tight">
                  Reels & Video Productions Vault
                </h3>
                <p className="text-xs text-white/50 font-light mt-1">
                  Manage commercial video reels displayed across the desktop Bento Grid and Mobile Shorts Reel Player.
                </p>
              </div>

              <button
                onClick={() => setIsAddingReel(!isAddingReel)}
                className="apple-press px-4 py-2.5 rounded-2xl bg-white text-black font-semibold text-xs tracking-wider uppercase transition-all flex items-center gap-2 self-start sm:self-auto cursor-pointer shadow-lg hover:bg-white/90"
              >
                <Plus className="w-4 h-4" />
                <span>{isAddingReel ? 'Cancel' : 'Post New Reel'}</span>
              </button>
            </div>

            {/* Inline Add Reel Composer */}
            {isAddingReel && (
              <div className="rounded-3xl border border-white/20 bg-gradient-to-br from-[#12121c] to-[#09090d] p-6 space-y-5 animate-in fade-in duration-300 shadow-2xl">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <span className="text-xs font-semibold tracking-wider uppercase text-white/90">
                    Add New Video Reel Plate
                  </span>
                  <button
                    onClick={() => setIsAddingReel(false)}
                    className="p-1 rounded-full text-white/40 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-white/50 block mb-1">
                      Reel Title
                    </label>
                    <input
                      type="text"
                      value={newReel.title}
                      onChange={(e) => setNewReel({ ...newReel, title: e.target.value })}
                      placeholder="e.g. Fine Silk Couture Movement"
                      className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/15 text-xs text-white placeholder-white/30 focus:outline-none focus:border-white"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-white/50 block mb-1">
                      Client / Commission
                    </label>
                    <input
                      type="text"
                      value={newReel.client}
                      onChange={(e) => setNewReel({ ...newReel, client: e.target.value })}
                      placeholder="e.g. Sabyasachi Heritage / Private Maison"
                      className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/15 text-xs text-white placeholder-white/30 focus:outline-none focus:border-white"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-white/50 block mb-1">
                      Category Tag
                    </label>
                    <input
                      type="text"
                      value={newReel.category}
                      onChange={(e) => setNewReel({ ...newReel, category: e.target.value })}
                      placeholder="e.g. Haute Couture / Fine Joaillerie"
                      className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/15 text-xs text-white placeholder-white/30 focus:outline-none focus:border-white"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-white/50 block mb-1">
                      Duration String
                    </label>
                    <input
                      type="text"
                      value={newReel.duration}
                      onChange={(e) => setNewReel({ ...newReel, duration: e.target.value })}
                      placeholder="e.g. 0:28"
                      className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/15 text-xs text-white placeholder-white/30 focus:outline-none focus:border-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-wider text-white/50 block mb-1">
                    Editorial Subtitle / Brief Description
                  </label>
                  <textarea
                    rows={2}
                    value={newReel.subtitle}
                    onChange={(e) => setNewReel({ ...newReel, subtitle: e.target.value })}
                    placeholder="Short description describing lighting, optics, and aesthetic mood..."
                    className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/15 text-xs text-white placeholder-white/30 focus:outline-none focus:border-white resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <MediaUploader
                    label="Vertical Video (MP4 / WebM / URL)"
                    value={newReel.videoSrc}
                    onChange={(val) => setNewReel({ ...newReel, videoSrc: val })}
                    accept="video"
                  />
                  <MediaUploader
                    label="Poster Thumbnail Image (JPG / PNG)"
                    value={newReel.posterSrc}
                    onChange={(val) => setNewReel({ ...newReel, posterSrc: val })}
                    accept="image"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-wider text-white/50 block mb-1">
                    Instagram Direct Link
                  </label>
                  <input
                    type="url"
                    value={newReel.instagramUrl}
                    onChange={(e) => setNewReel({ ...newReel, instagramUrl: e.target.value })}
                    placeholder="https://www.instagram.com/reel/..."
                    className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/15 text-xs text-white placeholder-white/30 focus:outline-none focus:border-white"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    onClick={() => setIsAddingReel(false)}
                    className="px-4 py-2 rounded-xl text-xs text-white/60 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveNewReel}
                    className="apple-press px-6 py-2.5 rounded-xl bg-white text-black font-semibold text-xs tracking-wider uppercase hover:bg-white/90 shadow-lg cursor-pointer"
                  >
                    Save Reel Plate
                  </button>
                </div>
              </div>
            )}

            {/* Reels Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reels.map((reel, idx) => (
                <div
                  key={reel.id}
                  className="rounded-3xl border border-white/10 bg-[#09090d] p-5 space-y-4 hover:border-white/20 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    {/* Media Preview & Order Controls */}
                    <div className="relative aspect-[9/16] rounded-2xl overflow-hidden bg-black/60 border border-white/10 group">
                      {reel.videoSrc ? (
                        <video
                          src={resolveMediaUrl(reel.videoSrc)}
                          poster={resolveMediaUrl(reel.posterSrc)}
                          playsInline
                          muted
                          loop
                          controls
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <img
                          src={resolveMediaUrl(reel.posterSrc || '/assets/hero_jewellery_4k.jpg')}
                          alt={reel.title}
                          className="w-full h-full object-cover"
                        />
                      )}

                      <div className="absolute top-2.5 right-2.5 flex items-center gap-1 bg-black/70 backdrop-blur-md rounded-full p-1 border border-white/15">
                        <button
                          onClick={() => moveReel(reel.id, 'up')}
                          disabled={idx === 0}
                          title="Move Up in Feed"
                          className="p-1 rounded-full text-white/70 hover:text-white disabled:opacity-30 cursor-pointer"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => moveReel(reel.id, 'down')}
                          disabled={idx === reels.length - 1}
                          title="Move Down in Feed"
                          className="p-1 rounded-full text-white/70 hover:text-white disabled:opacity-30 cursor-pointer"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Delete reel "${reel.title}"?`)) {
                              deleteReel(reel.id)
                            }
                          }}
                          title="Delete Reel"
                          className="p-1 rounded-full text-red-400 hover:text-red-300 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="absolute bottom-2.5 left-2.5 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/15 text-[10px] text-white/70 tracking-widest uppercase">
                        #{idx + 1} · {reel.category}
                      </div>
                    </div>

                    {/* In-place Editable Fields */}
                    <div className="space-y-2.5">
                      <div>
                        <label className="text-[10px] uppercase tracking-wider text-white/40 block mb-1">Title</label>
                        <input
                          type="text"
                          value={reel.title}
                          onChange={(e) => updateReel(reel.id, { title: e.target.value })}
                          className="w-full px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/10 text-xs text-white font-medium"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] uppercase tracking-wider text-white/40 block mb-1">Subtitle</label>
                        <textarea
                          rows={2}
                          value={reel.subtitle}
                          onChange={(e) => updateReel(reel.id, { subtitle: e.target.value })}
                          className="w-full px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/10 text-xs text-white/80 resize-none"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] uppercase tracking-wider text-white/40 block mb-1">Category</label>
                          <input
                            type="text"
                            value={reel.category}
                            onChange={(e) => updateReel(reel.id, { category: e.target.value })}
                            className="w-full px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/10 text-xs text-white"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] uppercase tracking-wider text-white/40 block mb-1">Duration</label>
                          <input
                            type="text"
                            value={reel.duration}
                            onChange={(e) => updateReel(reel.id, { duration: e.target.value })}
                            className="w-full px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/10 text-xs text-white"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] uppercase tracking-wider text-white/40 block mb-1">Client</label>
                        <input
                          type="text"
                          value={reel.client}
                          onChange={(e) => updateReel(reel.id, { client: e.target.value })}
                          className="w-full px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/10 text-xs text-white/70"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-white/[0.06] space-y-3">
                    <MediaUploader
                      label="Video Source (URL or Upload)"
                      value={reel.videoSrc}
                      onChange={(val) => updateReel(reel.id, { videoSrc: val })}
                      accept="video"
                    />
                    <MediaUploader
                      label="Poster Image (URL or Upload)"
                      value={reel.posterSrc}
                      onChange={(val) => updateReel(reel.id, { posterSrc: val })}
                      accept="image"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================== */}
        {/* TAB 2: LOOKBOOK PLATES                                     */}
        {/* ========================================================== */}
        {activeAdminTab === 'lookbook' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
              <div>
                <h3 className="text-xl sm:text-2xl font-light text-white tracking-tight">
                  Pinterest Editorial Lookbook Plates
                </h3>
                <p className="text-xs text-white/50 font-light mt-1">
                  Manage the 4-column Pinterest lookbook archive. Add, edit, or swap high-resolution campaign photography plates.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsAddingLookbook(!isAddingLookbook)}
                  className="apple-press px-4 py-2.5 rounded-2xl bg-white text-black font-semibold text-xs tracking-wider uppercase transition-all flex items-center gap-2 cursor-pointer shadow-lg hover:bg-white/90"
                >
                  <Plus className="w-4 h-4" />
                  <span>{isAddingLookbook ? 'Cancel' : 'Add Lookbook Plate'}</span>
                </button>
              </div>
            </div>

            {/* Column Switcher Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              <button
                onClick={() => setActiveColumnView('all')}
                className={`px-3 py-1.5 rounded-lg text-xs tracking-wider uppercase transition-all cursor-pointer ${
                  activeColumnView === 'all'
                    ? 'bg-white/20 text-white font-medium border border-white/30'
                    : 'text-white/50 hover:text-white'
                }`}
              >
                All Columns ({lookbookColumns.reduce((acc, c) => acc + c.length, 0)})
              </button>
              {[0, 1, 2, 3].map((colIdx) => (
                <button
                  key={colIdx}
                  onClick={() => setActiveColumnView(colIdx)}
                  className={`px-3 py-1.5 rounded-lg text-xs tracking-wider uppercase transition-all cursor-pointer ${
                    activeColumnView === colIdx
                      ? 'bg-white/20 text-white font-medium border border-white/30'
                      : 'text-white/50 hover:text-white'
                  }`}
                >
                  Column {colIdx + 1} ({lookbookColumns[colIdx]?.length || 0})
                </button>
              ))}
            </div>

            {/* Inline Add Lookbook Plate */}
            {isAddingLookbook && (
              <div className="rounded-3xl border border-white/20 bg-gradient-to-br from-[#12121c] to-[#09090d] p-6 space-y-5 animate-in fade-in duration-300 shadow-2xl">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <span className="text-xs font-semibold tracking-wider uppercase text-white/90">
                    Add New Lookbook Plate
                  </span>
                  <button
                    onClick={() => setIsAddingLookbook(false)}
                    className="p-1 rounded-full text-white/40 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-white/50 block mb-1">Target Column</label>
                    <select
                      value={selectedColForNew}
                      onChange={(e) => setSelectedColForNew(Number(e.target.value))}
                      className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/15 text-xs text-white focus:outline-none focus:border-white"
                    >
                      <option value={0} className="bg-black text-white">Column 1</option>
                      <option value={1} className="bg-black text-white">Column 2</option>
                      <option value={2} className="bg-black text-white">Column 3</option>
                      <option value={3} className="bg-black text-white">Column 4</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-white/50 block mb-1">Plate Title</label>
                    <input
                      type="text"
                      value={newLookbookItem.title}
                      onChange={(e) => setNewLookbookItem({ ...newLookbookItem, title: e.target.value })}
                      placeholder="e.g. Solitaire Dispersion"
                      className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/15 text-xs text-white placeholder-white/30 focus:outline-none focus:border-white"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-white/50 block mb-1">Category</label>
                    <input
                      type="text"
                      value={newLookbookItem.category}
                      onChange={(e) => setNewLookbookItem({ ...newLookbookItem, category: e.target.value })}
                      placeholder="e.g. Haute Joaillerie"
                      className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/15 text-xs text-white placeholder-white/30 focus:outline-none focus:border-white"
                    />
                  </div>
                </div>

                <MediaUploader
                  label="Editorial Image (JPG / PNG / WebP)"
                  value={newLookbookItem.image}
                  onChange={(val) => setNewLookbookItem({ ...newLookbookItem, image: val })}
                  accept="image"
                />

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    onClick={() => setIsAddingLookbook(false)}
                    className="px-4 py-2 rounded-xl text-xs text-white/60 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveNewLookbook}
                    className="apple-press px-6 py-2.5 rounded-xl bg-white text-black font-semibold text-xs tracking-wider uppercase hover:bg-white/90 shadow-lg cursor-pointer"
                  >
                    Save Plate
                  </button>
                </div>
              </div>
            )}

            {/* Lookbook Columns Layout */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {lookbookColumns.map((col, colIdx) => {
                if (activeColumnView !== 'all' && activeColumnView !== colIdx) return null
                return (
                  <div key={colIdx} className="space-y-4">
                    <div className="px-2 pb-1 border-b border-white/10 flex items-center justify-between text-xs text-white/60 uppercase tracking-wider">
                      <span>Column {colIdx + 1}</span>
                      <span>{col.length} plates</span>
                    </div>

                    <div className="space-y-4">
                      {col.map((item) => (
                        <div
                          key={item.id}
                          className="rounded-2xl border border-white/10 bg-[#09090d] p-3 space-y-3 hover:border-white/20 transition-all"
                        >
                          <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-black border border-white/5">
                            <img
                              src={resolveMediaUrl(item.image)}
                              alt={item.title}
                              className="w-full h-full object-cover"
                            />
                            <button
                              onClick={() => deleteLookbookItem(item.id)}
                              title="Delete plate"
                              className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 text-red-400 hover:text-red-300 border border-white/10 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="space-y-2">
                            <input
                              type="text"
                              value={item.title}
                              onChange={(e) => updateLookbookItem(item.id, { title: e.target.value })}
                              className="w-full px-2.5 py-1 rounded bg-white/[0.04] border border-white/10 text-xs text-white font-medium"
                            />
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] text-white/40 uppercase">Move:</span>
                              {[0, 1, 2, 3].map((tgt) => (
                                tgt !== colIdx && (
                                  <button
                                    key={tgt}
                                    onClick={() => moveLookbookItemToColumn(item.id, tgt)}
                                    className="px-2 py-0.5 rounded bg-white/5 hover:bg-white/15 text-[10px] text-white/70"
                                  >
                                    C{tgt + 1}
                                  </button>
                                )
                              ))}
                            </div>
                            <MediaUploader
                              label="Change Image"
                              value={item.image}
                              onChange={(val) => updateLookbookItem(item.id, { image: val })}
                              accept="image"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ========================================================== */}
        {/* TAB 3: HERO STAGE                                          */}
        {/* ========================================================== */}
        {activeAdminTab === 'hero' && (
          <div className="space-y-6">
            <div className="pb-4 border-b border-white/[0.08]">
              <h3 className="text-xl sm:text-2xl font-light text-white tracking-tight">
                Hero Stage Kinetic Slides
              </h3>
              <p className="text-xs text-white/50 font-light mt-1">
                Customize the monumental hero slides, background videos, optical titles, and camera specs.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {heroSlides.map((slide) => (
                <div
                  key={slide.id}
                  className="rounded-3xl border border-white/10 bg-[#09090d] p-5 space-y-4 hover:border-white/20 transition-all"
                >
                  <div className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-black border border-white/10">
                    {slide.videoSrc ? (
                      <video
                        src={resolveMediaUrl(slide.videoSrc)}
                        poster={resolveMediaUrl(slide.posterSrc)}
                        playsInline
                        muted
                        loop
                        controls
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <img src={resolveMediaUrl(slide.posterSrc)} alt={slide.title} className="w-full h-full object-cover" />
                    )}
                    <div className="absolute top-2.5 left-2.5 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/15 text-[10px] text-white/70 tracking-widest uppercase">
                      {slide.discipline}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="text-[10px] uppercase tracking-wider text-white/40 block mb-1">Title</label>
                      <input
                        type="text"
                        value={slide.title}
                        onChange={(e) => updateHeroSlide(slide.id, { title: e.target.value })}
                        className="w-full px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/10 text-xs text-white font-medium"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] uppercase tracking-wider text-white/40 block mb-1">Subtitle</label>
                      <input
                        type="text"
                        value={slide.subtitle}
                        onChange={(e) => updateHeroSlide(slide.id, { subtitle: e.target.value })}
                        className="w-full px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/10 text-xs text-white/80"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <MediaUploader
                        label="Video URL / Upload"
                        value={slide.videoSrc}
                        onChange={(val) => updateHeroSlide(slide.id, { videoSrc: val })}
                        accept="video"
                      />
                      <MediaUploader
                        label="Poster / Fallback Image"
                        value={slide.posterSrc}
                        onChange={(val) => updateHeroSlide(slide.id, { posterSrc: val })}
                        accept="image"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================== */}
        {/* TAB 4: CONCIERGE CARDS                                     */}
        {/* ========================================================== */}
        {activeAdminTab === 'concierge' && (
          <div className="space-y-6">
            <div className="pb-4 border-b border-white/[0.08]">
              <h3 className="text-xl sm:text-2xl font-light text-white tracking-tight">
                Private Concierge Showcase Cards
              </h3>
              <p className="text-xs text-white/50 font-light mt-1">
                Edit luxury concierge commission cards including Fine Jewellery, Supercars, and Private Estates.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {conciergeCards.map((card) => (
                <div
                  key={card.id}
                  className="rounded-3xl border border-white/10 bg-[#09090d] p-5 space-y-4 hover:border-white/20 transition-all"
                >
                  <div className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-black border border-white/10">
                    <img src={resolveMediaUrl(card.image)} alt={card.title} className="w-full h-full object-cover" />
                    <div className="absolute top-2.5 left-2.5 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/15 text-[10px] text-white/70 tracking-widest uppercase">
                      {card.protocol}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="text-[10px] uppercase tracking-wider text-white/40 block mb-1">Card Title</label>
                      <input
                        type="text"
                        value={card.title}
                        onChange={(e) => updateConciergeCard(card.id, { title: e.target.value })}
                        className="w-full px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/10 text-xs text-white font-medium"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] uppercase tracking-wider text-white/40 block mb-1">Description</label>
                      <textarea
                        rows={2}
                        value={card.description}
                        onChange={(e) => updateConciergeCard(card.id, { description: e.target.value })}
                        className="w-full px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/10 text-xs text-white/80 resize-none"
                      />
                    </div>

                    <MediaUploader
                      label="Card Cover Image"
                      value={card.image}
                      onChange={(val) => updateConciergeCard(card.id, { image: val })}
                      accept="image"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================== */}
        {/* TAB 5: FACES OF LEEANA (MODELS ROSTER)                      */}
        {/* ========================================================== */}
        {activeAdminTab === 'models' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
              <div>
                <h3 className="text-xl sm:text-2xl font-light text-white tracking-tight">
                  Faces of Leeana · Model Roster
                </h3>
                <p className="text-xs text-white/50 font-light mt-1">
                  Manage talent profiles displayed on the Concierge Desk. Add new models, rename talent, adjust specialty tags, and update photos.
                </p>
              </div>

              <button
                onClick={() => setIsAddingModel(!isAddingModel)}
                className="apple-press px-4 py-2.5 rounded-2xl bg-white text-black font-semibold text-xs tracking-wider uppercase transition-all flex items-center gap-2 self-start sm:self-auto cursor-pointer shadow-lg hover:bg-white/90"
              >
                <Plus className="w-4 h-4" />
                <span>{isAddingModel ? 'Cancel' : 'Add New Model'}</span>
              </button>
            </div>

            {/* Inline Add Model Composer */}
            {isAddingModel && (
              <div className="rounded-3xl border border-white/20 bg-gradient-to-br from-[#12121c] to-[#09090d] p-6 space-y-5 animate-in fade-in duration-300 shadow-2xl">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <span className="text-xs font-semibold tracking-wider uppercase text-white/90">
                    Add New Model Profile
                  </span>
                  <button
                    onClick={() => setIsAddingModel(false)}
                    className="p-1 rounded-full text-white/40 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-white/50 block mb-1">
                      Model Full Name
                    </label>
                    <input
                      type="text"
                      value={newModel.name}
                      onChange={(e) => setNewModel({ ...newModel, name: e.target.value })}
                      placeholder="e.g. Maya Singhania"
                      className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/15 text-xs text-white placeholder-white/30 focus:outline-none focus:border-white"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-white/50 block mb-1">
                      Specialty Tag / Discipline
                    </label>
                    <input
                      type="text"
                      value={newModel.tag}
                      onChange={(e) => setNewModel({ ...newModel, tag: e.target.value })}
                      placeholder="e.g. Editorial Streetwear / Haute Couture"
                      className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/15 text-xs text-white placeholder-white/30 focus:outline-none focus:border-white"
                    />
                  </div>
                </div>

                <MediaUploader
                  label="Model Editorial Portrait Photo"
                  value={newModel.img}
                  onChange={(val) => setNewModel({ ...newModel, img: val })}
                  accept="image"
                />

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    onClick={() => setIsAddingModel(false)}
                    className="px-4 py-2 rounded-xl text-xs text-white/60 hover:text-white cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveNewModel}
                    className="apple-press px-6 py-2.5 rounded-xl bg-white text-black font-semibold text-xs tracking-wider uppercase hover:bg-white/90 shadow-lg cursor-pointer"
                  >
                    Save Model Profile
                  </button>
                </div>
              </div>
            )}

            {/* Model Profiles Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {models.map((m, idx) => (
                <div
                  key={m.id}
                  className="rounded-3xl border border-white/10 bg-[#09090d] p-5 space-y-4 hover:border-white/20 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    {/* Image Preview & Order Controls */}
                    <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-black/60 border border-white/10">
                      <img
                        src={resolveMediaUrl(m.img)}
                        alt={m.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2.5 right-2.5 flex items-center gap-1 bg-black/70 backdrop-blur-md rounded-full p-1 border border-white/15">
                        <button
                          onClick={() => moveModel(m.id, 'up')}
                          disabled={idx === 0}
                          title="Move Left / Earlier"
                          className="p-1 rounded-full text-white/70 hover:text-white disabled:opacity-30 cursor-pointer"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => moveModel(m.id, 'down')}
                          disabled={idx === models.length - 1}
                          title="Move Right / Later"
                          className="p-1 rounded-full text-white/70 hover:text-white disabled:opacity-30 cursor-pointer"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Remove ${m.name} from roster?`)) {
                              deleteModel(m.id)
                            }
                          }}
                          title="Delete Model Profile"
                          className="p-1 rounded-full text-red-400 hover:text-red-300 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="absolute bottom-2.5 left-2.5 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/15 text-[10px] text-white/70 tracking-widest uppercase">
                        #{idx + 1}
                      </div>
                    </div>

                    {/* In-place Editable Fields */}
                    <div className="space-y-2.5">
                      <div>
                        <label className="text-[10px] uppercase tracking-wider text-white/40 block mb-1">
                          Model Name
                        </label>
                        <input
                          type="text"
                          value={m.name}
                          onChange={(e) => updateModel(m.id, { name: e.target.value })}
                          placeholder="Model Name"
                          className="w-full px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/10 text-xs text-white font-medium focus:outline-none focus:border-white"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] uppercase tracking-wider text-white/40 block mb-1">
                          Specialty / Tag
                        </label>
                        <input
                          type="text"
                          value={m.tag}
                          onChange={(e) => updateModel(m.id, { tag: e.target.value })}
                          placeholder="e.g. Classic Portrait"
                          className="w-full px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/10 text-xs text-white/70 focus:outline-none focus:border-white"
                        />
                      </div>
                    </div>
                  </div>

                  <MediaUploader
                    label="Change Photo"
                    value={m.img}
                    onChange={(val) => updateModel(m.id, { img: val })}
                    accept="image"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================== */}
        {/* TAB 6: CLIENT REVIEWS                                      */}
        {/* ========================================================== */}
        {activeAdminTab === 'reviews' && (
          <div className="space-y-6">
            <div className="pb-4 border-b border-white/[0.08]">
              <h3 className="text-xl sm:text-2xl font-light text-white tracking-tight">
                Client Testimonials & Commissions
              </h3>
              <p className="text-xs text-white/50 font-light mt-1">
                Edit luxury client reviews, commissions, and customer portrait images.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {testimonials.map((test) => (
                <div
                  key={test.id}
                  className="rounded-3xl border border-white/10 bg-[#09090d] p-5 space-y-4 hover:border-white/20 transition-all"
                >
                  <div className="flex gap-4 items-start">
                    <div className="w-16 h-16 rounded-full overflow-hidden bg-black shrink-0 border border-white/10">
                      <img src={resolveMediaUrl(test.img)} alt={test.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <input
                        type="text"
                        value={test.name}
                        onChange={(e) => updateTestimonial(test.id, { name: e.target.value })}
                        placeholder="Client Name"
                        className="w-full px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/10 text-xs text-white font-medium"
                      />
                      <input
                        type="text"
                        value={test.role}
                        onChange={(e) => updateTestimonial(test.id, { role: e.target.value })}
                        placeholder="Role / Title"
                        className="w-full px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/10 text-xs text-white/70"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-white/40 block mb-1">Review Quote</label>
                    <textarea
                      rows={3}
                      value={test.text}
                      onChange={(e) => updateTestimonial(test.id, { text: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white resize-none"
                    />
                  </div>

                  <MediaUploader
                    label="Portrait Avatar"
                    value={test.img}
                    onChange={(val) => updateTestimonial(test.id, { img: val })}
                    accept="image"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================== */}
        {/* TAB 7: PUBLISH & CLOUD SYNC                                */}
        {/* ========================================================== */}
        {activeAdminTab === 'publish' && (
          <div className="space-y-8 max-w-4xl mx-auto">
            <div className="pb-4 border-b border-white/[0.08]">
              <h3 className="text-xl sm:text-2xl font-light text-white tracking-tight">
                Live Publishing & Synchronization Suite
              </h3>
              <p className="text-xs text-white/50 font-light mt-1">
                Your edits are saved immediately in your browser. Use the tools below to push live to the custom domain, export backups, or restore defaults.
              </p>
            </div>

            {/* Direct 1-Click Live Save Card */}
            <div className="rounded-3xl border border-white/20 bg-gradient-to-br from-[#0c0c14] to-[#07070a] p-6 sm:p-8 space-y-6 shadow-2xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] font-medium tracking-[0.2em] uppercase text-emerald-400 block mb-1 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    LIVE PRODUCTION BRIDGE ACTIVE
                  </span>
                  <h4 className="text-xl sm:text-2xl font-light text-white">Save Changes to Live Website</h4>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-white/[0.06] border border-white/10 flex items-center justify-center text-white shrink-0">
                  <Globe className="w-6 h-6 text-emerald-400" />
                </div>
              </div>

              <p className="text-xs text-white/70 font-light leading-relaxed">
                Clicking the button below instantly publishes your edits directly to the live website (<span className="text-white font-medium">https://leeana.in</span>). All newly posted reels, updated lookbook photos, model roster adjustments, and client reviews will go live automatically without requiring any technical configuration.
              </p>

              {/* Status Alert */}
              {saveBanner && (
                <div
                  className={`p-4 rounded-2xl text-xs font-light leading-relaxed flex items-start gap-3 border ${
                    saveBanner.type === 'success'
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
                      : 'bg-red-500/10 border-red-500/30 text-red-200'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
                  <div className="space-y-1">
                    <p className="font-medium">{saveBanner.text}</p>
                    {saveBanner.link && (
                      <a
                        href={saveBanner.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline inline-flex items-center gap-1 opacity-80 hover:opacity-100"
                      >
                        <span>View Live Commit on GitHub</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Big 1-Click Save Action */}
              <button
                onClick={handleEasySave}
                disabled={isSavingLive}
                className="apple-press w-full py-4 sm:py-5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs sm:text-sm tracking-[0.16em] uppercase disabled:opacity-50 transition-all flex items-center justify-center gap-2.5 shadow-xl shadow-emerald-500/20 cursor-pointer"
              >
                {isSavingLive ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Saving to Leeana.in Live Website...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Save All Changes to Live Website</span>
                  </>
                )}
              </button>

              {/* Advanced Settings Collapsible (Optional) */}
              <div className="pt-2 border-t border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
                  className="text-[11px] text-white/40 hover:text-white/80 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Sliders className="w-3 h-3" />
                  <span>{showAdvancedSettings ? 'Hide Advanced Settings' : 'Advanced Configuration (Optional)'}</span>
                </button>

                {showAdvancedSettings && (
                  <div className="mt-4 p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3">
                    <label className="text-[10px] uppercase tracking-wider text-white/50 block">
                      Custom GitHub Access Token (Override Default)
                    </label>
                    <input
                      type="password"
                      value={githubToken}
                      onChange={(e) => {
                        setGithubToken(e.target.value)
                        localStorage.setItem('leeana_gh_pat', e.target.value.trim())
                      }}
                      placeholder="Optional custom PAT (defaults to studio authorized token)"
                      className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white placeholder-white/30 focus:outline-none focus:border-white font-mono"
                    />
                    <span className="text-[10px] text-white/30 block">
                      Leave empty to automatically use the pre-authorized studio synchronization key.
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Offline Backups & JSON Control Card */}
            <div className="rounded-3xl border border-white/10 bg-[#09090d] p-6 sm:p-8 space-y-6">
              <span className="text-[10px] font-medium tracking-[0.2em] uppercase text-white/50 block mb-1">
                MANUAL DATA BACKUP & RESTORATION
              </span>
              <h4 className="text-lg font-light text-white">Manual JSON File Management</h4>
              <p className="text-xs text-white/70 font-light leading-relaxed">
                Download a complete JSON snapshot of all reels, lookbook plates, and models to keep offline, or upload a previously saved backup file.
              </p>

              <div className="flex flex-wrap items-center gap-4">
                <button
                  onClick={exportJson}
                  className="apple-press px-6 py-3 rounded-2xl bg-white/[0.08] hover:bg-white/15 text-white border border-white/15 text-xs font-medium tracking-wider uppercase transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Download JSON Backup</span>
                </button>

                <label className="apple-press px-6 py-3 rounded-2xl bg-white/[0.08] hover:bg-white/15 text-white border border-white/15 text-xs font-medium tracking-wider uppercase transition-all flex items-center gap-2 cursor-pointer">
                  <Upload className="w-4 h-4" />
                  <span>Restore from JSON File</span>
                  <input
                    type="file"
                    accept=".json"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        const ok = await importJson(file)
                        if (ok) alert('Content restored successfully!')
                        else alert('Invalid JSON structure.')
                      }
                    }}
                  />
                </label>

                <button
                  onClick={() => {
                    if (confirm('Reset entire catalog back to factory defaults? All custom changes will be erased.')) {
                      resetToDefaults()
                    }
                  }}
                  className="apple-press px-5 py-3 rounded-2xl bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-500/20 text-xs font-medium tracking-wider uppercase transition-all cursor-pointer ml-auto"
                >
                  Reset Factory Defaults
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

export function App() {
  return (
    <AtelierContentProvider>
      <AdminDeskView />
    </AtelierContentProvider>
  )
}

export default App
