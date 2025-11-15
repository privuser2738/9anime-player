let iframe = document.getElementById('iframe-embed');
  console.log('Iframe:', iframe);
  console.log('Iframe src:', iframe.src);

  // Try to access iframe content
  try {
    console.log('Iframe document:', iframe.contentDocument);
    console.log('Iframe window:', iframe.contentWindow);
  } catch(e) {
    console.log('Cannot access iframe content (CORS):', e.message);
  }
  
  
  
  function findAllVideos() {
    const videos = [];

    // Main document
    const mainVideos = document.querySelectorAll('video');
    videos.push(...mainVideos);
    console.log('Videos in main doc:', mainVideos.length);

    // All iframes
    const iframes = document.querySelectorAll('iframe');
    console.log('Total iframes:', iframes.length);

    iframes.forEach((iframe, idx) => {
      try {
        const iframeVideos = iframe.contentDocument?.querySelectorAll('video');
        if (iframeVideos?.length) {
          videos.push(...iframeVideos);
          console.log(`Videos in iframe ${idx}:`, iframeVideos.length);
        }
      } catch (e) {
        console.log(`Cannot access iframe ${idx}:`, e.message);
      }
    });

    console.log('Total videos found:', videos.length);
    return videos;
  }

  findAllVideos();
