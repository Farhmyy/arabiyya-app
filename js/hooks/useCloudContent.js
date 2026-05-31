/* useCloudContent — generic Supabase content loader with data.js fallback */

function useCloudContent(contentId, fallback, transform) {
  const { useState, useEffect } = React;
  const [data, setData] = useState(null);

  useEffect(() => {
    sbClient.from('content').select('data').eq('id', contentId).maybeSingle()
      .then(({ data: row }) => {
        const raw = row?.data;
        if (raw && Object.keys(raw).length > 0) {
          setData(transform ? transform(raw) : raw);
        }
      })
      .catch(() => {});
  }, [contentId]);

  return data ?? fallback;
}

window.useCloudContent = useCloudContent;
