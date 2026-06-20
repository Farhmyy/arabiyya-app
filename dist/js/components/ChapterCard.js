/* ChapterCard — Big tile for the homepage chapter list */

function ChapterCard({
  num,
  status,
  titleAr,
  titleId,
  summary,
  progress = 0,
  onClick
}) {
  const numAr = ['١', '٢', '٣', '٤', '٥', '٦'][num - 1] || num;
  const locked = status === 'locked';
  const soon = status === 'soon';
  const avail = status === 'available';
  return /*#__PURE__*/React.createElement(Card, {
    hover: avail,
    onClick: avail ? onClick : undefined,
    padding: 0,
    radius: 20,
    style: {
      opacity: locked || soon ? 0.78 : 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 24,
      display: 'flex',
      flexDirection: 'column',
      gap: 14,
      minHeight: 240
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 64,
      height: 64,
      borderRadius: 16,
      background: avail ? 'linear-gradient(180deg, var(--color-primary-bg), var(--color-primary-hover))' : 'var(--color-bg)',
      color: avail ? '#fff' : 'var(--color-text-light)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'var(--font-arabic)',
      fontSize: 36,
      fontWeight: 700
    }
  }, numAr), avail && /*#__PURE__*/React.createElement(Badge, {
    tone: "gold"
  }, "Tersedia"), soon && /*#__PURE__*/React.createElement(Badge, {
    tone: "neutral"
  }, "Segera Hadir"), locked && /*#__PURE__*/React.createElement(Badge, {
    tone: "locked",
    icon: "lock"
  }, "Terkunci")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: 'var(--color-text-secondary)',
      fontWeight: 600,
      letterSpacing: '.04em'
    }
  }, "BAB ", num), /*#__PURE__*/React.createElement("div", {
    className: "ar-title",
    style: {
      fontSize: 30,
      color: 'var(--color-primary)',
      marginTop: 2
    }
  }, titleAr), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 16,
      fontWeight: 600,
      color: 'var(--color-text-primary)',
      marginTop: 4
    }
  }, titleId)), summary && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14,
      color: 'var(--color-text-secondary)'
    }
  }, summary), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }), avail && /*#__PURE__*/React.createElement(ProgressBar, {
    value: progress,
    label: "Progress"
  })));
}
window.ChapterCard = ChapterCard;