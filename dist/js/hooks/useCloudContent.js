/* useCloudContent — generic Supabase content loader with data.js fallback */

function useCloudContent(contentId, fallback, transform) {
  const {
    useState,
    useEffect
  } = React;
  const [data, setData] = useState(null);
  useEffect(() => {
    let mounted = true;
    sbClient.from('content').select('data').eq('id', contentId).maybeSingle().then(({
      data: row
    }) => {
      if (!mounted) return;
      const raw = row?.data;
      if (raw && Object.keys(raw).length > 0) {
        setData(transform ? transform(raw) : raw);
      }
    }).catch(() => {
      if (!mounted) return;
      window.showToast && window.showToast('Koneksi ke server gagal, menggunakan data bawaan.', 'error');
    });
    return () => {
      mounted = false;
    };
  }, [contentId]);
  return data ?? fallback;
}
window.useCloudContent = useCloudContent;