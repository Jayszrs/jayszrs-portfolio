let pending;

export function loadSpotifyIframeApi() {
  if (pending) return pending;
  pending = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    const previous = window.onSpotifyIframeApiReady;
    const fail = () => { clearTimeout(timeout); script.remove(); window.onSpotifyIframeApiReady = previous; reject(new Error('Spotify unavailable')); };
    const timeout = setTimeout(fail, 18000);
    window.onSpotifyIframeApiReady = api => {
      clearTimeout(timeout);
      resolve(api);
      if (typeof previous === 'function') previous(api);
    };
    script.src = 'https://open.spotify.com/embed/iframe-api/v1';
    script.async = true;
    script.onerror = fail;
    document.body.append(script);
  }).catch(error => { pending = undefined; throw error; });
  return pending;
}
