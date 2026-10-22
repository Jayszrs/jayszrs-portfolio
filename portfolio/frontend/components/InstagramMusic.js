"use client";

import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, Loader2, Music2, Pause, Play } from 'lucide-react';
import { loadSpotifyIframeApi } from '@/frontend/lib/spotify-iframe';

function trackId(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && url.hostname === 'open.spotify.com' ? /^\/track\/([a-zA-Z0-9]{22})\/?$/.exec(url.pathname)?.[1] || '' : '';
  } catch { return ''; }
}

export default function InstagramMusic({ music }) {
  const id = trackId(music?.spotifyUrl);
  const holder = useRef(null), controller = useRef(null);
  const [status, setStatus] = useState('loading');
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (!id) return;
    let mounted = true, attempted = false, check = 0;
    const node = holder.current;
    setReady(false); setStatus('loading');
    const play = () => {
      try {
        controller.current.play(); setStatus('starting');
        clearTimeout(check);
        check = setTimeout(() => { if (mounted) setStatus(value => value === 'starting' ? 'paused' : value); }, 5000);
      } catch { setStatus('paused'); }
    };
    const timeout = setTimeout(() => { if (mounted && !attempted) setStatus('error'); }, 22000);
    loadSpotifyIframeApi().then(api => {
      if (!mounted) return;
      const target = document.createElement('div');
      node.append(target);
      api.createController(target, { url: `https://open.spotify.com/track/${id}?theme=0`, width: '100%', height: 152 }, embed => {
        if (!mounted) { embed.destroy(); return; }
        controller.current = embed;
        const frame = node.querySelector('iframe');
        if (frame) { frame.title = `${music.title} — ${music.artist}`; frame.allow = 'autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture'; }
        embed.addListener('ready', () => {
          if (!mounted || attempted) return;
          attempted = true; clearTimeout(timeout); setReady(true); setStatus('paused');
          if (!document.hidden) play();
        });
        embed.addListener('playback_started', () => { if (mounted) { if (document.hidden) { embed.pause(); return; } clearTimeout(check); setStatus('playing'); } });
        embed.addListener('playback_update', event => {
          if (!mounted) return;
          const state = event.data;
          if (!state.isPaused && document.hidden) { embed.pause(); return; }
          if (state.isPaused) setStatus('paused');
          else { clearTimeout(check); setStatus(state.isBuffering ? 'starting' : 'playing'); }
        });
      });
    }).catch(() => { if (mounted) setStatus('error'); });
    const hidden = () => { if (document.hidden) controller.current?.pause(); };
    document.addEventListener('visibilitychange', hidden);
    return () => {
      mounted = false; clearTimeout(timeout); clearTimeout(check);
      document.removeEventListener('visibilitychange', hidden);
      controller.current?.pause(); controller.current?.destroy(); controller.current = null;
      node.replaceChildren();
    };
  }, [id, music?.title, music?.artist]);
  if (!music?.title) return null;
  const active = status === 'playing' || status === 'starting';
  return <section className="profile-record" aria-label="Musik pilihan profil Instagram" data-music-state={status}>
    <div className="record-disc" aria-hidden="true"><Music2 size={19} /></div>
    <div className="min-w-0"><p className="text-xs text-muted">Musik di profil saya</p><p className="mt-1 font-semibold text-ink" data-no-translate>{music.title}</p><p className="mt-1 text-xs leading-5 text-muted" data-no-translate>{music.artist}</p></div>
    {id && <button type="button" className="record-play disabled:opacity-50" disabled={!ready} aria-label={active ? 'Jeda musik' : 'Putar musik'} onClick={() => {
      if (active) controller.current?.pause();
      else controller.current?.play();
    }}>{status === 'loading' || status === 'starting' ? <Loader2 size={17} className="animate-spin" /> : active ? <Pause size={17} fill="currentColor" /> : <Play size={17} fill="currentColor" />}</button>}
    {id && <div className="col-span-3 min-w-0">
      <div ref={holder} className="min-h-[152px] overflow-hidden rounded-xl" />
      <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs leading-5 text-muted">
        <span role="status">{status === 'playing' ? 'Sedang diputar' : status === 'loading' || status === 'starting' ? 'Menyiapkan musik…' : status === 'error' ? 'Musik belum bisa dimuat.' : 'Tekan putar jika musik belum terdengar.'}</span>
        <a href={`https://open.spotify.com/track/${id}`} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-8 items-center gap-1 underline underline-offset-4">Buka di Spotify<ArrowUpRight size={12} /></a>
      </div>
    </div>}
  </section>;
}
